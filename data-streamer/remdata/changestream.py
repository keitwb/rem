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
        # TODO: Add restrictions on which collections can be watched
        coll = mongo_db[collection]
        async with coll.watch(resume_after=resume_after, full_document="updateLookup") as stream:
            # Hackiness to make sure the watch is actually started so that our "started" message
            # below is accurate.  Normally Motor doesn't start the watch until you actually try and
            # get the first change item.
            def init_stream():
                stream.delegate = stream._target.delegate.watch(  # pylint:disable=protected-access
                    **stream._kwargs  # pylint:disable=protected-access
                )

            await stream._framework.run_on_executor(  # pylint:disable=protected-access
                stream.get_io_loop(), init_stream
            )

            # Send a start message so that clients can know when it is safe to fetch docs without
            # missing updates when there was no resume token provided.
            await message.send_response({"started": True})

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
    collection = message.get("collection")
    resume_after = message.get("resumeAfter")

    message.logger.info(
        f"Received change stream request for collection '{collection}', resuming from {resume_after}"
    )

    await stream_collection_updates(mongo_db, collection, resume_after, message)
    message.logger.info("Stopped change stream")
