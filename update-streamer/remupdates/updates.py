"""
This module streams changes from a mongo change stream to a websocket connection.  It streams all
changes for a particular collection.

TODO: support subscriptions on specific doc ids or filters if it proves useful.
"""

import json
import logging
from functools import partial as p

import pymongo
import websockets
from bson import json_util
from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


async def stream_collection_updates(mongo_db, collection, resume_after, socket):
    """
    Send any changes that happen to the given collection to the socket
    """
    try:
        if collection not in await mongo_db.collection_names():
            await socket.send(json.dumps({"error": f"Unknown collection {collection}"}))
            return

        coll = mongo_db[collection]
        async with coll.watch(resume_after=resume_after, full_document="updateLookup") as stream:
            # Send a start message so that clients can know when it is safe to fetch docs without
            # missing updates.
            await socket.send(json_util.dumps({
                "started": True,
            }))

            async for change in stream:
                try:
                    await socket.send(json_util.dumps(change))
                except websockets.exceptions.ConnectionClosed:
                    return
    except pymongo.errors.PyMongoError as e:
        logging.error(e)
        await socket.send(json.dumps({
            "error": str(e),
        }))


async def send_changes(mongo_db, socket, _):
    """
    This function gets called whenever there is a new connection.  It sets up the stream of updates.
    """
    logger.info("Connection initiated")
    options = json_util.loads(await socket.recv())
    collection = options['collection']
    resume_after = options.get('resumeAfter')

    logger.info("Received connection for collection: %s", collection)

    await stream_collection_updates(mongo_db, collection, resume_after, socket)
    logger.info("Closing connection")


async def start_server(mongo_loc, db_name="rem", port=8080):
    """
    Run the server until exit
    """
    print("Starting websocket server")
    mongo_client = AsyncIOMotorClient(*mongo_loc)

    mongo_db = mongo_client[db_name]
    return await websockets.serve(p(send_changes, mongo_db), '0.0.0.0', port)
