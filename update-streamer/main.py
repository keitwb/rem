#!/usr/bin/env python3

import asyncio
from bson import json_util
from functools import partial as p
import json
import logging
import os
import pymongo
import websockets
from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


async def watch_collection(mongo_db, collection, resume_after, socket):
    try:
        if collection not in await mongo_db.collection_names():
            await socket.send(json.dumps({
                "error": "Unknown collection %s" % collection}))
            return

        coll = mongo_db[collection]
        async with coll.watch(resume_after=resume_after,
                              full_document="updateLookup") as stream:
            async for change in stream:
                await socket.send(json_util.dumps(change))
    except pymongo.errors.PyMongoError as e:
        logging.error(e)
        socket.send(json.dumps({
            "error": str(e),
        }))


async def send_changes(mongo_db, socket, path):
    logger.info("Connection initiated")
    options = json_util.loads(await socket.recv())
    collection = options['collection']
    resume_after = options.get('resumeAfter')

    logger.info("Received connection for %s collection", collection)

    await watch_collection(mongo_db, collection, resume_after, socket)
    logger.info("Closing connection")


mongo_client = AsyncIOMotorClient(os.environ.get('MONGO_HOSTNAME', "mongo"),
                                  int(os.environ.get('MONGO_PORT', '27017')))

mongo_db = mongo_client[os.environ.get("MONGO_DATABASE", "rem")]
start_server = websockets.serve(p(send_changes, mongo_db), '0.0.0.0', 8080)

logging.info("Starting websocket listener")
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
