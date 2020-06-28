"""
Watch the Mongo change stream for changes to properties and update their parcel data if needed.
This uses the watch helper in pycommon that distributes watching a collection across multiple
instances with stable identities.
"""

import asyncio
import logging

import pymongo
from motor.motor_asyncio import AsyncIOMotorClient

from remcommon import fieldnames_gen as fields
from remcommon import watch
from remcommon.models_gen import CollectionName, ParcelDatum, Property

from .adapter import get_parcel_data_by_pin
from .exceptions import ParcelDataError

logger = logging.getLogger(__name__)

SERVICE_NAME = "parceldata"


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

    try:
        while True:
            try:
                logger.info("Watching properties")
                async for change in watch.watch_collection(
                    mongo_db, CollectionName.PROPERTIES.value, SERVICE_NAME, instance_name
                ):
                    if change is watch.INITIAL_LEAD_WATCHER:
                        pass
                    else:
                        await apply_parcel_data_if_needed(change, mongo_db)
            except pymongo.errors.PyMongoError as e:
                logger.error("Error watching properties: %s", e)
                await asyncio.sleep(10)
    except asyncio.CancelledError:
        logger.info("Shutting down watcher")
        raise


async def apply_parcel_data_if_needed(change, mongo_db):
    op = change["operationType"]
    if op not in ["update", "replace", "insert", "delete"]:
        logger.error("Unknown Mongo change operation: %s", op)
        return

    doc_id = change["documentKey"]["_id"]
    logger.info("Processing '%s' change for property %s", op, str(doc_id))

    if op == "delete":
        return

    prop = Property.from_dict(change.get("fullDocument"))

    if prop.parcel_data_refresh_requested:
        await mongo_db.properties.update_one(
            {"_id": doc_id}, {"$set": {f"{fields.PROPERTY_PARCEL_DATA_REFRESH_REQUESTED}": False}}
        )

    # If the refresh was requested, don't worry about checking for updated fields.
    if op == "update" and not prop.parcel_data_refresh_requested:
        updated_fields = change.get("updateDescription", {}).get("updatedFields", {})

        pin_updated = fields.PROPERTY_PIN_NUMBERS in updated_fields
        county_updated = fields.PROPERTY_COUNTY in updated_fields
        state_updated = fields.PROPERTY_STATE in updated_fields

        if not pin_updated and not county_updated and not state_updated:
            logger.debug("Property did not have updated on county, state, or pin_number")
            return

    if not prop.county.strip() or not prop.state.strip() or not prop.pin_numbers:
        logger.debug("Property was missing county, state, and/or pin_numbers")
        return

    for pin in prop.pin_numbers:
        try:
            [clean_pin, parcel_data] = get_parcel_data_by_pin(prop.county, prop.state, pin)
            set_op = {f"{fields.PROPERTY_PARCEL_DATA}.{clean_pin}": ParcelDatum.to_dict(parcel_data)}
        except ParcelDataError as e:
            logger.error("Error fetching parcel data", exc_info=e)
            set_op = {f"{fields.PROPERTY_PARCEL_DATA}.{clean_pin}.error": repr(e)}

        await mongo_db.properties.update_one({"_id": doc_id}, {"$set": set_op})
