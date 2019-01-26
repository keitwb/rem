"""
Integration tests for the data access endpoint
"""

from datetime import datetime, timedelta
import pytest
from bson import json_util, objectid

import ujson

from .util import open_stream, start_test_server


# pylint: disable=missing-docstring
@pytest.mark.asyncio
@pytest.mark.timeout(60)
async def test_do_query_by_ids():
    async with start_test_server() as [ws_port, mongo_client, _]:
        ids = []
        for i in range(0, 20):
            res = await mongo_client.rem.properties.insert_one({"name": f"property-{i}"})
            # Test a mix of objectid and hex string ids in the query
            if i > 10:
                ids.append(str(res.inserted_id))
            else:
                ids.append(res.inserted_id)

        async with open_stream(ws_port, "/db") as ws_client:
            await ws_client.send(
                json_util.dumps({"action": "getByIds", "collection": "properties", "ids": ids, "reqID": "a1"})
            )

            for i in range(0, 19):
                msg = ujson.loads(await ws_client.recv())
                assert msg["doc"]["name"].endswith(f"-{i}"), "Unexpected document received"
                assert msg["reqID"] == "a1"
                assert msg["hasMore"]

            msg = ujson.loads(await ws_client.recv())
            assert msg["doc"]["name"].endswith("-19"), "Unexpected document received"
            assert msg["reqID"] == "a1"
            assert not msg["hasMore"]


@pytest.mark.asyncio
@pytest.mark.timeout(60)
async def test_do_insert():
    async with start_test_server() as [ws_port, mongo_client, _]:
        async with open_stream(ws_port, "/db") as ws_client:
            ids = []
            for i in range(0, 20):
                new_id = objectid.ObjectId()
                ids.append(new_id)

                await ws_client.send(
                    json_util.dumps(
                        {
                            "action": "upsert",
                            "collection": "properties",
                            "id": new_id,
                            "updates": {"$set": {"count": i}},
                            "reqID": f"{i}",
                        }
                    )
                )

                msg = json_util.loads(await ws_client.recv())
                assert msg["modifiedCount"] == 0
                assert msg["upsertedId"] == new_id
                assert not msg["hasMore"]

            for i, _id in enumerate(ids):
                doc = await mongo_client.rem.properties.find_one({"_id": _id})

                assert doc["count"] == i
                assert doc["modifiedDate"] - datetime.now() <= timedelta(seconds=60)
                assert doc["createdDate"] - datetime.now() <= timedelta(seconds=60)


@pytest.mark.asyncio
@pytest.mark.timeout(60)
async def test_do_update():
    async with start_test_server() as [ws_port, mongo_client, _]:

        async with open_stream(ws_port, "/db") as ws_client:
            ids = []
            for i in range(0, 20):
                res = await mongo_client.rem.properties.insert_one({"name": f"property-{i}"})
                ids.append(res.inserted_id)

                await ws_client.send(
                    json_util.dumps(
                        {
                            "action": "upsert",
                            "collection": "properties",
                            "id": res.inserted_id,
                            "updates": {"$set": {"count": i}},
                            "reqID": f"{i}",
                        }
                    )
                )

                msg = json_util.loads(await ws_client.recv())
                assert msg["modifiedCount"] == 1
                assert msg["upsertedId"] == res.inserted_id
                assert not msg["hasMore"]

            for i, _id in enumerate(ids):
                doc = await mongo_client.rem.properties.find_one({"_id": _id})

                assert doc["count"] == i
                assert doc["modifiedDate"] - datetime.now() <= timedelta(seconds=60)
