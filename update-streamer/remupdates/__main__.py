#!/usr/bin/env python3

import asyncio
import json
import logging
import os
from functools import partial as p

import pymongo
import websockets
from bson import json_util
from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


async def stream_collection_updates(mongo_db, collection, resume_after,
                                    socket):
    """
    Send any changes that happen to the given collection to the socket
    """
    try:
        if collection not in await mongo_db.collection_names():
            await socket.send(
                json.dumps({
                    "error": "Unknown collection %s" % collection
                }))
            return

        coll = mongo_db[collection]
        async with coll.watch(
                resume_after=resume_after,
                full_document="updateLookup") as stream:
            # Send a start message so that clients can know when it is safe to fetch docs without
            # missing updates.
            socket.send(json_util.dumps({
                "started": True,
            }))

            async for change in stream:
                await socket.send(json_util.dumps(change))
    except pymongo.errors.PyMongoError as e:
        logging.error(e)
        socket.send(json.dumps({
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

    logger.info("Received connection for %s collection", collection)

    await stream_collection_updates(mongo_db, collection, resume_after, socket)
    logger.info("Closing connection")


def run():
    """
    Run the server until exit
    """
    mongo_client = AsyncIOMotorClient(
        os.environ.get('MONGO_HOSTNAME', "mongo"),
        int(os.environ.get('MONGO_PORT', '27017')))

    mongo_db = mongo_client[os.environ.get("MONGO_DATABASE", "rem")]
    start_server = websockets.serve(p(send_changes, mongo_db), '0.0.0.0', 8080)

    logging.info("Starting websocket listener")
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()


run()
