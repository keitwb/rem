"""
Handler for transferring media files to and from the client
"""

import pymongo
from motor.motor_asyncio import AsyncIOMotorGridFSBucket


async def handle_media(mongo_db, message):
    """
    Handles a single request for media uploads.  Updates to file metadata should be done through the
    normal collection update process.  Media upload gets a special handler because its messages are
    easier to send as pure BSON.
    """
    _id = message.get("id")
    if not _id:
        await message.send_error("id must be provided")
        return

    filename = message.get("filename")
    if not filename:
        await message.send_error("filename must be provided")
        return

    bucket_name = message.get("bucketName", "media")
    content = message.get("content")
    if not content:
        await message.send_error("file content must be provided")
        return

    metadata = message.get("metadata")

    bucket = AsyncIOMotorGridFSBucket(mongo_db, bucket_name)

    try:
        await bucket.upload_from_stream_with_id(_id, filename, content, metadata=metadata)
    except pymongo.errors.PyMongoError as e:
        await message.send_error(f"Could not insert gridfs file: {str(e)}")
        return

    await message.send_response({
        "id": _id,
    })
