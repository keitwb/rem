"""
Logic specific to indexing media files that have text.
"""

import io

from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from . import es


async def index_file_change(tika_client, esclient, change, mongo_db):
    """
    Index a change to a text file
    """
    return await index_gridfs_file(
        tika_client, esclient, mongo_db, mongo_doc=change["fullDocument"], collection=change["ns"]["coll"])


async def index_gridfs_file(tika_client, esclient, mongo_db, mongo_doc, collection):
    """
    Send the content of the file document through Tika and add any text to the
    document and index it.

    :param collection: The name of the GridFS file metadata collection
    """
    if '.' not in collection:
        raise ValueError("'%s' is not a proper GridFS collection name" % collection)

    bucket_name = collection.split('.')[0]

    # TODO: Either implement a cache (maybe Redis or Memcached) that reuses extracted text from tika
    # based on hashsums or else somehow reuse the data already in ES if only the file metadata is
    # updated on a change.
    text = await _get_file_text(tika_client, mongo_doc["_id"], bucket_name, mongo_db)
    mongo_doc["text"] = text

    for k, v in mongo_doc["metadata"].items():
        mongo_doc[k] = v
    del mongo_doc["metadata"]

    await es.index_document(esclient, bucket_name, mongo_doc)


async def _get_file_text(tika_client, file_id, bucket_name, mongo_db):
    gridfs_bucket = AsyncIOMotorGridFSBucket(mongo_db, collection=bucket_name)
    # The AsyncIOMotorGridOut object returned by open_download_stream doesn't work with aiohttp.
    # TODO: Figure out a way to stream chunks incrementally instead of reading the whole file into
    # memory.
    buf = io.BytesIO()
    await gridfs_bucket.download_to_stream(file_id, buf)
    buf.seek(0)
    return await tika_client.extract_text(buf)
