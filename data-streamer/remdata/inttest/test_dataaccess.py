"""
Integration tests for the data access endpoint
"""

import pytest
from bson import json_util

import ujson

from .util import open_stream, start_test_server


# pylint: disable=missing-docstring
@pytest.mark.asyncio
@pytest.mark.timeout(60)
async def test_do_query_by_ids():
    async with start_test_server() as [ws_port, mongo_client, _]:
        ids = []
        for i in range(0, 20):
            res = await mongo_client.rem.properties.insert_one({
                "name": f"property-{i}",
            })
            # Test a mix of objectid and hex string ids in the query
            if i > 10:
                ids.append(str(res.inserted_id))
            else:
                ids.append(res.inserted_id)

        async with open_stream(ws_port, "/db") as ws_client:
            await ws_client.send(
                json_util.dumps({
                    "action": "getByIds",
                    "collection": "properties",
                    "ids": ids,
                    "reqID": "a1",
                }))

            for i in range(0, 19):
                msg = ujson.loads(await ws_client.recv())
                assert msg["doc"]["name"].endswith(f"-{i}"), "Unexpected document received"
                assert msg["reqID"] == "a1"
                assert msg["hasMore"]

            msg = ujson.loads(await ws_client.recv())
            assert msg["doc"]["name"].endswith("-19"), "Unexpected document received"
            assert msg["reqID"] == "a1"
            assert not msg["hasMore"]
