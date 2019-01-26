"""
Integration tests for the media endpoint
"""

import hashlib
import os

import aiohttp
import pytest
from bson import BSON
from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from .util import open_stream, start_test_server

TEST_FILES_DIR = os.path.join(os.path.dirname(__file__), "testfiles")


# pylint: disable=missing-docstring
@pytest.mark.asyncio
@pytest.mark.timeout(60)
async def test_do_media_upload():
    async with start_test_server() as [ws_port, mongo_client, _]:
        with open(os.path.join(TEST_FILES_DIR, "doc1.pdf"), "rb") as fd:
            content = fd.read()

        async with open_stream(ws_port, "/media-upload") as ws_client:
            _id = ObjectId()
            await ws_client.send(
                BSON.encode(
                    {
                        "id": _id,
                        "filename": "doc.pdf",
                        "content": content,
                        "metadata": {"tags": ["a"]},
                        "reqID": "a1",
                    }
                )
            )

            msg = BSON.decode(await ws_client.recv())
            assert msg["id"] == _id, "Unexpected id received"

        media_entry = await mongo_client.rem["media.files"].find_one({"_id": _id})
        assert "tags" in media_entry["metadata"], "metadata was not persisted"
        assert media_entry["md5"] == hashlib.md5(content).hexdigest(), "md5 was not populated"
        assert media_entry["filename"] == "doc.pdf", "filename was not populated"


@pytest.mark.asyncio
@pytest.mark.timeout(60)
async def test_do_media_download():
    test_doc = os.path.join(TEST_FILES_DIR, "doc1.pdf")

    async with start_test_server() as [port, mongo_client, _]:
        bucket = AsyncIOMotorGridFSBucket(mongo_client.rem, collection="media")
        with open(test_doc, "rb") as fd:
            inserted_id = await bucket.upload_from_stream(
                filename="doc1.pdf",
                source=fd,
                metadata={"author": "John Smith", "date_written": "2018-01-01"},
            )

        async with aiohttp.request("GET", f"http://127.0.0.1:{port}/media-download/{inserted_id}") as resp:
            with open(test_doc, "rb") as fd:
                assert (await resp.read()) == fd.read()
