# pylint: disable=not-async-context-manager

import os
from functools import partial as p

import pytest
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from remtesting.wait import wait_for_async

from .util import get_es_doc, get_es_indexing_stats, run_watchers_with_services

TEST_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "testdata"))


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_file_contents_get_indexed_in_es(event_loop):
    async with run_watchers_with_services(event_loop) as [mongo_client, es_client]:
        bucket = AsyncIOMotorGridFSBucket(mongo_client.rem, collection="media")
        with open(os.path.join(TEST_DATA_DIR, "doc1.pdf"), 'rb') as fd:
            inserted_id = await bucket.upload_from_stream(
                filename="doc1.pdf", source=fd, metadata={
                    "author": "John Smith",
                    "date_written": "2018-01-01",
                })

        es_doc = await wait_for_async(p(get_es_doc, es_client, index="media", doc_id=inserted_id), timeout_seconds=15)
        assert es_doc, 'media file was not indexed'

        assert es_doc["_id"] == str(inserted_id), 'media did not have correct id'
        assert es_doc["_source"]["author"] == "John Smith"
        assert es_doc["_source"]["date_written"] == "2018-01-01"
        assert es_doc["_source"]["text"].strip() == "This is a test"

        # Do an update in mongo and make sure it gets indexed
        await mongo_client.rem["media.files"].update_one({
            "_id": inserted_id
        }, {"$set": {
            "metadata.city": "Springfield"
        }})

        async def has_new_field_in_es():
            es_doc = await wait_for_async(
                p(get_es_doc, es_client, index="media", doc_id=inserted_id), timeout_seconds=10)
            return es_doc["_source"].get("city") == "Springfield"

        assert await wait_for_async(has_new_field_in_es), 'updated city metadata field did not get indexed'

        assert (await get_es_indexing_stats("media", es_client))["index_total"] == 2, \
                'Only 2 indexing operations should happen'
