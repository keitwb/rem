#!/usr/bin/env python3

import asyncio
from bson import json_util
import json
import logging
import os
import pymongo
import websockets
from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


async def watch_collection(collection_name, resume_after, socket):
    try:
        client = AsyncIOMotorClient(os.environ['MONGO_HOSTNAME'],
                                    int(os.environ['MONGO_PORT']))

        if collection_name not in await client.rem.collection_names():
            await socket.send(json.dumps({
                "error": "Unknown collection %s" % collection_name}))
            return

        coll = client.rem[collection_name]
        async with coll.watch(resume_after=resume_after,
                              full_document="updateLookup") as stream:
            async for change in stream:
                await socket.send(json_util.dumps(change))
    except pymongo.errors.PyMongoError as e:
        logging.error(e)
        socket.send(json.dumps({
            "error": str(e),
        }))


async def send_changes(socket, path):
    logger.info("Connection initiated")
    options = json_util.loads(await socket.recv())
    collection = options['collection']
    resume_after = options.get('resumeAfter')

    logger.info("Received connection for %s collection", collection)

    await watch_collection(collection, resume_after, socket)
    logger.info("Closing connection")


start_server = websockets.serve(send_changes, '0.0.0.0', 8080)

logging.info("Starting websocket listener")
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
