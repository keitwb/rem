"""
Watch the Mongo change stream for changes to documents in collections that we want to make available
for searching and index them in ElasticSearch.  This uses the watch helper in pycommon that
distributes watching a collection across multiple instances with stable identities.
"""

import asyncio
import logging
from functools import partial as p

import aiohttp
import elasticsearch_async
import pymongo
from motor.motor_asyncio import AsyncIOMotorClient

from remcommon import watch
from remcommon.models_gen import CollectionName

from . import es, text
from .tikaclient import TikaClient

logger = logging.getLogger(__name__)

COLLECTIONS_TO_INDEX = [
    CollectionName.PROPERTIES.value,
    CollectionName.PARTIES.value,
    CollectionName.LEASES.value,
    CollectionName.NOTES.value,
    CollectionName.MEDIA_FILES.value,
    CollectionName.PARTIES.value,
]

MAX_ES_INDEX_TASKS = 10
SERVICE_NAME = "search_indexer"


async def watch_indexed_collections(instance_name, mongo_uri, es_hosts, tika_loc, mongo_database="rem"):
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
    async for change in watch.watch_collection(mongo_db, collection, SERVICE_NAME, instance_name):
        if change is watch.INITIAL_LEAD_WATCHER:
            await index_collection(mongo_db, tika_client, esclient, collection)
        else:
            await index_change(esclient, tika_client, change, mongo_db)


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
