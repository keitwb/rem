#!/usr/bin/env python3

import asyncio
import json
import os
import websockets
from motor.motor_asyncio import AsyncIOMotorClient

async def watch_collection(collection_name, resume_after, websocket):
    client = AsyncIOMotorClient(os.environ['MONGO_HOSTNAME'], os.environ['MONGO_PORT'])
    try:
        async with client.rem[collection_name].watch(resume_after=resume_after) as stream:
            async for change in stream:
                await websocket.send(json.dumps(change))
    except pymongo.errors.PyMongoError as e:
        websocket.send(json.dumps(e))
        return


async def send_changes(websocket, path):
    options = json.loads(await websocket.recv())
    collection = options['collection']
    auth = options['auth']
    resume_after = options.get('resume_after')
    await watch_collection(collection, resume_after, websocket)

start_server = websockets.serve(send_changes, '0.0.0.0', 8080)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
