"""
Logic specific to indexing media files that have text.
"""

from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from . import es


async def index_file_change(http_session, esclient, change, mongo_db):
    """
    Index a change to a text file
    """
    doc = change["fullDocument"]
    bucket_name = change['ns']['coll'].split('.')[0]

    return index_file(http_session, esclient, doc, bucket_name, mongo_db)


async def index_file(http_session, esclient, doc, bucket_name, mongo_db):
    """
    Send the content of the file document through Tika and add any text to the
    document and index it.
    """
    text = await _get_file_text(http_session, doc["_id"], bucket_name, mongo_db)
    doc["text"] = text

    es.index_document(esclient, bucket_name, doc)


async def _get_file_text(http_session, file_id, bucket_name, mongo_db):
    gridfs_bucket = AsyncIOMotorGridFSBucket(mongo_db, bucket=bucket_name)
    file_stream = await gridfs_bucket.open_download_stream(file_id)
    async with http_session.put('http://tika:9998/tika', data=file_stream) as resp:
        return await resp.text()
