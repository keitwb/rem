"""
Handler for transferring media files to and from the client
"""

import bson
import pymongo
from gridfs.errors import NoFile
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from sanic import response

MEDIA_BUCKET_NAME = "media"


async def handle_media_upload(mongo_db, message):
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

    bucket_name = message.get("bucketName", MEDIA_BUCKET_NAME)
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

    await message.send_response({"id": _id})


async def handle_media_download(mongo_db, _, media_id):
    """
    Streams a file from GridFS by id using chunked encoding
    """
    bucket = AsyncIOMotorGridFSBucket(mongo_db, "media")
    try:
        stream = await bucket.open_download_stream(bson.ObjectId(media_id))
    except NoFile:
        return response.text(f"Media id '{media_id}' not found", status=404)
    except bson.errors.InvalidId:
        return response.text(f"Media id '{media_id}' in not a proper ObjectId", status=400)

    headers = {
        "Content-Disposition": f'attachment; filename="{stream.filename}"',
        "Content-Type": stream.content_type,
    }

    async def stream_file(resp):
        chunk = await stream.readchunk()
        while chunk:
            await resp.write(chunk)
            chunk = await stream.readchunk()

    return response.stream(stream_file, status=200, headers=headers)
