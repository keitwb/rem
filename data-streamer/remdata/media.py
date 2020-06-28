"""
Handler for transferring media files to and from the client
"""

import bson
import pymongo
from gridfs.errors import NoFile
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from sanic import response

import ujson

MEDIA_BUCKET_NAME = "media"


async def handle_media_upload(mongo_db, req):
    """
    Handles a single request for media uploads.  Updates to file metadata should be done through the
    normal collection update process.  Media upload gets a special handler because its messages are
    easier to send as JSON + multi-part file encoding.
    """
    if not req.files:
        return response.text("Media upload must include one or more files")

    file_info_by_name = ujson.loads(req.body)

    bucket = AsyncIOMotorGridFSBucket(mongo_db, MEDIA_BUCKET_NAME)

    for name, file in req.files.items():
        file_info = file_info_by_name.get(name)
        if not file_info:
            return response.text("file information must be provided", status=400)

        _id = file_info.get("id")
        if not _id:
            return response.text("id must be provided", status=400)

        metadata = file_info.get("metadata", {})

        try:
            await bucket.upload_from_stream_with_id(_id, file.name, file.type, metadata=metadata)
        except pymongo.errors.PyMongoError as e:
            return response.text(f"Could not insert gridfs file: {str(e)}", status=500)

    return response.json({"success": True})


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
