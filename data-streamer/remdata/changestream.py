"""
This module streams changes from a mongo change stream to a websocket connection.  It streams all
changes for a particular collection.

TODO: support subscriptions on specific doc ids or filters if it proves useful.
"""

import pymongo
import websockets

from .json import BSONDocForJSON


async def stream_collection_updates(mongo_db, collection, resume_after, message):
    """
    Send any changes that happen to the given collection to the socket
    """
    try:
        if collection not in await mongo_db.list_collection_names():
            await message.send_error(f"Unknown collection {collection}")
            return

        coll = mongo_db[collection]
        async with coll.watch(resume_after=resume_after, full_document="updateLookup") as stream:
            # Send a start message so that clients can know when it is safe to fetch docs without
            # missing updates when there was no resume token provided.
            await message.send_response({
                "started": True,
            })

            async for change in stream:
                try:
                    await message.send_response({"doc": BSONDocForJSON(change.raw)})
                except websockets.exceptions.ConnectionClosed:
                    return
    except pymongo.errors.PyMongoError as e:
        message.logger.error(str(e))
        await message.send_error(str(e))


async def send_changes(mongo_db, message):
    """
    This function gets called whenever there is a new message to establish a change stream.  It sets
    up the stream of changes from Mongo back to the client and blocks until an Mongo error happens
    or the websocket disconnects.
    """
    collection = message.get('collection')
    resume_after = message.get('resumeAfter')

    message.logger.info("Received change stream request for collection '%s'", collection)

    await stream_collection_updates(mongo_db, collection, resume_after, message)
    message.logger.info("Stopped change stream")
