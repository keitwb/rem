"""
Watch the Mongo change stream for changes to documents in collections that we
want to make available for searching and index them in ElasticSearch.  In
order for this to be scalable beyond one instance, each worker claims a
change event before processing it by creating a claim document in a special
collection in Mongo (search_index_claims).  This special collection has a
unique index on the collection name and the change id so that only one
instance can successfully make a claim.  Once it is successfully processed,
it marks the claim as completed.

To make error handling simpler, each instance of this service must have a
unique and stable identity that gets reused upon restart.  Each claim has a
field with that instance identity.  That way, if an instance crashes, upon
startup the worker for each collection checks whether a previous run of the
instance has any incomplete jobs, and if so, processes them and continues.
An instance should never process a change in the change stream until it has
successfully processed all the previous changes it has claimed.
"""

import asyncio
import logging
from concurrent.futures import CancelledError
from functools import partial as p

import aiohttp
import elasticsearch_async
import pymongo
from motor.motor_asyncio import AsyncIOMotorClient

from . import claims, es, text
from .tikaclient import TikaClient

logger = logging.getLogger(__name__)

COLLECTIONS_TO_INDEX = ["properties", "contacts", "leases", "notes", "media.files"]

MAX_ES_INDEX_TASKS = 10


async def watch_indexed_collections(instance_name, mongo_loc, es_hosts, tika_loc, mongo_database="rem"):
    """
    Watches all of the configured collections for changes.  Blocks indefinitely
    """
    mongo_client = AsyncIOMotorClient(
        mongo_loc[0],
        mongo_loc[1],
        maxPoolSize=100,
        maxIdleTimeMS=30 * 1000,
        socketTimeoutMS=15 * 1000,
        connectTimeoutMS=10 * 1000,
    )
    mongo_db = mongo_client[mongo_database]

    await claims.ensure_unique_index(mongo_db)

    # This is used for mapping files to text through Tika
    async with aiohttp.ClientSession() as http_session:
        esclient = elasticsearch_async.AsyncElasticsearch(
            es_hosts, sniff_on_start=False, sniff_on_connection_fail=False
        )

        tika_client = TikaClient(http_session, host=tika_loc[0], port=tika_loc[1])

        try:
            await asyncio.gather(
                *[
                    watch_collection_with_retry(mongo_db, tika_client, esclient, c, instance_name)
                    for c in COLLECTIONS_TO_INDEX
                ]
            )
        except asyncio.CancelledError:
            logger.info("Shutting down watchers")
            raise
        finally:
            await esclient.transport.close()


async def watch_collection_with_retry(mongo_db, tika_client, esclient, collection, instance_name):
    """
    Watches the given collection, resetting the watch in the face of Mongo
    exceptions
    """
    while True:
        try:
            logger.info("Watching collection %s", collection)
            await watch_collection(mongo_db, tika_client, esclient, collection, instance_name)
        except pymongo.errors.PyMongoError as e:
            logger.error("Error watching collection '%s': %s", collection, e)
            await asyncio.sleep(10)


async def watch_collection(mongo_db, tika_client, esclient, collection, instance_name):
    """
    Watch a single collection for changes using the Mongo change stream.  It
    first checks for a previous claim for this instance so that it can get the
    resume token to use if picking back up from a previous run.  It also
    completes the previously claimed change if the previous watcher crashed.
    """
    last_claim = await claims.get_previous_claim(mongo_db, collection, instance_name)

    last_was_completed = False
    if last_claim:
        logger.info("Resuming on collection %s", collection)
        resume_token = last_claim[claims.CHANGE_FIELD]["_id"]
        last_was_completed = last_claim[claims.COMPLETED_FIELD]
    else:
        logger.info("No previous state found for collection %s", collection)
        resume_token = None

    async with mongo_db[collection].watch(resume_after=resume_token, full_document="updateLookup") as stream:
        # This means the last job run didn't finish successfully before this
        # instance shutdown, so rerun it.
        if resume_token and not last_was_completed:
            logger.info(
                "Last change to collection '%s' did not complete before shutdown, reindexing", collection
            )
            last_change = last_claim[claims.CHANGE_FIELD]
            assert last_change["_id"] == resume_token

            await index_change(esclient, tika_client, last_change, mongo_db)
            await claims.mark_claim_completed(mongo_db, last_claim["_id"])
        # This covers the cases where we need to consider an initial indexing, whenever there are no
        # claims or the last claim didn't have a resume token because it is an initial indexing
        # claim that didn't complete.
        elif (not resume_token or not last_claim) and not last_was_completed:
            claim_id = await claims.attempt_to_claim_initial_indexing(mongo_db, collection, instance_name)
            if claim_id:
                logger.info("got claim, reindexing all docs in %s", collection)
                await index_collection(mongo_db, tika_client, esclient, collection)
                await claims.mark_claim_completed(mongo_db, claim_id)
            else:
                logger.info("Waiting for another instance to reindex everything")
                await claims.wait_for_initial_indexing_complete(mongo_db, collection)

        await process_stream(mongo_db, collection, tika_client, esclient, stream, instance_name)


# pylint: disable=too-many-arguments
async def process_stream(mongo_db, collection, tika_client, esclient, stream, instance_name):
    """
    Process each change in the given stream, trying to claim the change first
    and moving on to the next change immediately if a change cannot be claimed.
    """
    logger.info("Starting to watch change stream for %s", collection)
    async for change in stream:
        assert collection == change["ns"]["coll"], "collections did not match up"

        if change["operationType"] == "invalidate":
            logger.info("Collection %s was invalidated", collection)
            # If a collection gets invalidated then wipe any prior claims
            # so it doesn't try to resume from them.
            await claims.delete_claims_for_instance(mongo_db, instance_name)
            return

        logger.info("Saw change on collection %s.%s", collection, change["documentKey"]["_id"])

        claim_id = await claims.attempt_to_claim_change(mongo_db, change, instance_name)
        if claim_id:
            logger.info("Claimed change for doc %s.%s", collection, change["documentKey"]["_id"])

            try:
                await index_change(esclient, tika_client, change, mongo_db)
                logger.info("Document %s.%s indexed", collection, change["documentKey"]["_id"])
            except CancelledError:
                await claims.mark_claim_completed(mongo_db, claim_id)
                raise

            await claims.mark_claim_completed(mongo_db, claim_id)
        else:
            logger.info("Unable to claim change for %s.%s", collection, change["documentKey"]["_id"])


def is_gridfs_collection(collection):
    """
    Returns True if the collection name indicates that it is a GridFS collection
    """
    return collection.endswith(".files")


async def index_change(esclient, tika_client, change, mongo_db):
    """
    Put the content of a change document into ElasticSearch
    """
    op = change["operationType"]
    if op not in ["update", "replace", "insert", "delete"]:
        logger.error("Unknown Mongo change operation: %s", op)
        return

    collection = change["ns"]["coll"]
    doc_id = change["documentKey"]["_id"]

    if op == "delete":
        await es.delete_from_index_by_id(esclient, index=collection, es_id=str(doc_id))
    elif is_gridfs_collection(collection):
        await text.index_file_change(tika_client, esclient, change, mongo_db)
    else:
        await es.index_document(esclient, collection, change["fullDocument"])


async def index_collection(mongo_db, tika_client, esclient, collection):
    """
    Index all the docs in a collection.  This should be called when there is no prior indexing
    activity on record.  It should be called after the watch stream has already started but before
    changes are actually being processed, so that nothing is missed.
    """
    if is_gridfs_collection(collection):
        index_func = p(
            text.index_gridfs_file,
            tika_client=tika_client,
            esclient=esclient,
            mongo_db=mongo_db,
            collection=collection,
        )
    else:
        index_func = p(es.index_document, esclient=esclient, index=collection)

    index_tasks = []

    # TODO: Make this use the ES bulk API
    async for doc in mongo_db[collection].find():
        index_tasks.append(asyncio.ensure_future(index_func(mongo_doc=doc)))

        if len(index_tasks) >= MAX_ES_INDEX_TASKS:
            await asyncio.gather(*index_tasks)
            index_tasks.clear()

    if index_tasks:
        await asyncio.gather(*index_tasks)
