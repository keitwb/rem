"""
Integration tests for the media endpoint
"""

import hashlib
import os

import pytest
from bson import BSON
from bson.objectid import ObjectId

from .util import open_stream, start_test_server

TEST_FILES_DIR = os.path.join(os.path.dirname(__file__), "testfiles")


# pylint: disable=missing-docstring
@pytest.mark.asyncio
@pytest.mark.timeout(60)
async def test_do_media_upload():
    async with start_test_server() as [ws_port, mongo_client, _]:
        with open(os.path.join(TEST_FILES_DIR, "doc1.pdf"), "rb") as fd:
            content = fd.read()

        async with open_stream(ws_port, "/media") as ws_client:
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
