import asyncio
import os

import elasticsearch_async
from motor.motor_asyncio import AsyncIOMotorClient

from remsearch.tikaclient import open_tika_client
from remsearch.watch import COLLECTIONS_TO_INDEX, index_collection

MONGO_URI = os.environ.get("MONGO_URI")
MONGO_DATABASE = os.environ.get("MONGO_DATABASE", "rem")
ES_HOSTS = [{"host": os.environ.get("ES_HOST", "es"), "port": int(os.environ.get("ES_PORT", 9200))}]
TIKA_LOC = (os.environ.get("TIKA_HOSTNAME", "tika"), int(os.environ.get("TIKA_PORT", "9998")))


async def index_all():
    mongo_client = AsyncIOMotorClient(
        MONGO_URI,
        maxPoolSize=100,
        maxIdleTimeMS=30 * 1000,
        socketTimeoutMS=15 * 1000,
        connectTimeoutMS=10 * 1000,
    )
    mongo_db = mongo_client[MONGO_DATABASE]

    # This is used for mapping files to text through Tika
    async with open_tika_client(TIKA_LOC) as tika_client:
        esclient = elasticsearch_async.AsyncElasticsearch(
            ES_HOSTS, sniff_on_start=False, sniff_on_connection_fail=False
        )

        for collection in COLLECTIONS_TO_INDEX:
            print(f"Indexing collection {collection}...")
            await index_collection(mongo_db, tika_client, esclient, collection)

        await esclient.transport.close()


asyncio.get_event_loop().run_until_complete(index_all())
