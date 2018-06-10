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
import os

import elasticsearch
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo
import aiohttp

from . import claims, es, text

logger = logging.getLogger(__name__)

COLLECTIONS_TO_INDEX = [
    "properties",
    "contacts",
    "leases",
    "notes",
    "media.files",
]

async def index_change(esclient, http_session, change, mongo_db):
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
        await es.delete_from_index_by_id(esclient, index=collection, es_id=doc_id)
    elif collection == "media.files":
        await text.index_file_change(http_session, esclient, change, mongo_db)
    else:
        await es.index_document(esclient, collection, change["fullDocument"])


async def watch_collection(mongo_db, http_session, esclient, collection, instance_name):
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
        resume_token = last_claim[claims.RESUME_TOKEN_FIELD]
        last_was_completed = last_claim[claims.COMPLETED_FIELD]
    else:
        logger.info("No previous state found for collection %s", collection)
        resume_token = None

    async with mongo_db[collection].watch(
        resume_after=resume_token, full_document="updateLookup") as stream:
        # This means the last job run didn't finish successfully before this
        # instance shutdown, so rerun it.
        if resume_token and not last_was_completed:
            logger.info("Last change to collection '%s' did not complete before shutdown, "
                        "reindexing", collection)
            last_change = last_claim[claims.CHANGE_FIELD]
            assert last_change["_id"] == resume_token

            await index_change(esclient, http_session, last_change, mongo_db)
            await claims.mark_claim_completed(mongo_db, last_claim["_id"])

        await process_stream(mongo_db, http_session, esclient,
                             stream, instance_name)


async def process_stream(mongo_db, http_session, esclient, stream, instance_name):
    """
    Process each change in the given stream, trying to claim the change first
    and moving on to the next change immediately if a change cannot be claimed.
    """
    async for change in stream:
        collection = change["ns"]["coll"]
        if change["operationType"] == "invalidate":
            logger.info("Collection %s was invalidated", collection)
            # If a collection gets invalidated then wipe any prior claims
            # so it doesn't try to resume from them.
            await claims.delete_claims_for_instance(mongo_db, instance_name)
            return

        claim_id = await claims.attempt_to_claim_change(mongo_db, change, instance_name)
        if claim_id:
            logger.info("Claimed change for doc %s.%s", collection, change["documentKey"]["_id"])

            await index_change(esclient, http_session, change, mongo_db)
            logger.info("Document %s.%s indexed", collection, change["documentKey"]["_id"])

            await claims.mark_claim_completed(mongo_db, claim_id)
        else:
            logger.info("Unable to claim change for %s.%s",
                        collection, change["documentKey"]["_id"])


async def watch_collection_with_retry(mongo_db, http_session, esclient, collection, instance_name):
    """
    Watches the given collection, resetting the watch in the face of Mongo
    exceptions
    """
    while True:
        try:
            logger.info("Watching collection %s", collection)
            await watch_collection(mongo_db, http_session, esclient, collection, instance_name)
        except pymongo.errors.PyMongoError as e:
            logger.error("Error watching collection '%s': %s", collection, e)
            await asyncio.sleep(10)


async def watch_indexed_collections(instance_name):
    """
    Watches all of the configured collections for changes.  Blocks indefinitely
    """
    mongo_client = AsyncIOMotorClient(os.environ.get('MONGO_HOSTNAME', "mongo"),
                                      int(os.environ.get('MONGO_PORT', "27017")),
                                      maxPoolSize=100,
                                      maxIdleTimeMS=30*1000,
                                      socketTimeoutMS=15*1000,
                                      connectTimeoutMS=10*1000)
    mongo_db = mongo_client[os.environ.get("MONGO_DATABASE", "rem")]
    await claims.ensure_unique_index(mongo_db)

    http_session = await aiohttp.ClientSession()

    esclient = elasticsearch.Elasticsearch([{
        "host": os.environ.get("ES_HOST", "es"),
        "port": int(os.environ.get("ES_PORT", 9200))
    }], sniff_on_start=True, sniff_on_connection_fail=True, sniffer_timeout=30)

    return await asyncio.gather(
        *[watch_collection_with_retry(mongo_db, http_session, esclient, c, instance_name)
          for c in COLLECTIONS_TO_INDEX])
