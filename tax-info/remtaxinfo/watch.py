"""
Watch Mongo for changes to property documents and apply tax information to them if it is not already
present.  This uses the watch helper in pycommon that distributes watching a collection across
multiple instances with stable identities.
"""
import asyncio
import logging
from typing import List

import aiohttp
import pymongo
from motor.motor_asyncio import AsyncIOMotorClient

from remcommon import fieldnames_gen as fields, watch
from remcommon.models_gen import Property

from . import constants
from .fetch import remove_stale_pin_info, update_tax_info

logger = logging.getLogger(__name__)


async def run_watch(instance_name, mongo_uri, mongo_database="rem"):
    """
    Watches all of the configured collections for changes.  Blocks indefinitely
    """
    mongo_client = AsyncIOMotorClient(
        mongo_uri,
        maxPoolSize=100,
        maxIdleTimeMS=30 * 1000,
        socketTimeoutMS=15 * 1000,
        connectTimeoutMS=10 * 1000,
    )
    mongo_db = mongo_client[mongo_database]

    # This is used for mapping files to text through Tika
    async with aiohttp.ClientSession() as http_session:
        try:
            await watch_properties_with_retry(mongo_db, http_session, instance_name)
        except asyncio.CancelledError:
            logger.info("Shutting down watchers")
            raise


async def watch_properties_with_retry(mongo_db, http_session, instance_name):
    """
    Watches the properties collection, resetting the watch in the face of Mongo
    exceptions
    """
    while True:
        try:
            logger.info("Watching properties")
            await watch_properties(mongo_db, http_session, instance_name)
        except pymongo.errors.PyMongoError as e:
            logger.error("Error watching properties: %s", e)
            await asyncio.sleep(5)


async def watch_properties(mongo_db, http_session, instance_name):
    """
    Watch a single collection for changes using the Mongo change stream.  It
    first checks for a previous claim for this instance so that it can get the
    resume token to use if picking back up from a previous run.  It also
    completes the previously claimed change if the previous watcher crashed.
    """
    async for change in watch.watch_collection(mongo_db, "properties", "taxinfo", instance_name):
        if change is watch.INITIAL_LEAD_WATCHER:
            await index_all_properties(mongo_db, http_session)
        else:
            await process_change(change, mongo_db, http_session)


async def process_change(change, mongo_db, http_session):
    """
    Fetch the tax info for the changed doc and put it back on the doc
    """
    op = change["operationType"]
    if op not in ["update", "replace", "insert", "delete"]:
        logger.error("Unknown Mongo change operation: %s", op)
        return

    if op == "delete":  # Nothing to do on a delete
        return

    updated_fields = change.get("updateDescription", {}).get("updatedFields", {})

    pin_updated = fields.PROPERTY_PIN_NUMBERS in updated_fields
    update_requested = change["fullDocument"].get(fields.PROPERTY_TAX_REFRESH_REQUESTED, False)
    county_updated = fields.PROPERTY_COUNTY in updated_fields
    state_updated = fields.PROPERTY_STATE in updated_fields

    if not (
        op in ["create", "replace"] or pin_updated or county_updated or update_requested or state_updated
    ):
        logger.info("No relevant field changed, skipping change %s", change["_id"])
        return

    prop: Property = Property.from_dict(change["fullDocument"])
    await update_tax_info(prop, mongo_db, http_session)
    await remove_stale_pin_info(prop, mongo_db)

    if update_requested:
        logger.info("Unsetting %s field on property %s", fields.PROPERTY_TAX_REFRESH_REQUESTED, prop.id)
        await mongo_db.properties.update_one(
            {"_id": prop.id}, {"$set": {fields.PROPERTY_TAX_REFRESH_REQUESTED: False}}
        )


async def gather_and_log_task_exceptions(tasks: List[asyncio.Task]):
    """
    Waits for all tasks to be done and logs any exceptions encountered in them.
    """
    for res in await asyncio.gather(*tasks, return_exceptions=True):
        if isinstance(res, Exception):
            logger.error("Error in task", exc_info=res)


async def index_all_properties(mongo_db, http_session):
    """
    Fetch tax info on all the properties in the collection.  This should be called when there is no
    prior indexing activity on record.  It should be called after the watch stream has already
    started but before changes are actually being processed, so that nothing is missed.
    """
    index_tasks = []

    async for doc in mongo_db.properties.find():
        index_tasks.append(
            asyncio.create_task(update_tax_info(Property.from_dict(doc), mongo_db, http_session))
        )

        if len(index_tasks) >= constants.MAX_CONCURRENT_FETCHES:
            await gather_and_log_task_exceptions(index_tasks)
            index_tasks.clear()

    if index_tasks:
        await gather_and_log_task_exceptions(index_tasks)
