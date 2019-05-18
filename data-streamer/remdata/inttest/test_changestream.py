"""
Tests for the update streamer
"""
import pytest

import ujson

from .util import open_stream, start_test_server


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_service_sends_all_changes():
    async with start_test_server() as [ws_port, mongo_client, _]:
        async with open_stream(ws_port, "/changes") as ws_client:
            await ws_client.send(ujson.dumps({"collection": "properties"}))

            started_msg = ujson.loads(await ws_client.recv())
            assert "started" in started_msg and started_msg["started"], "did not receive first message"

            for i in range(0, 100):
                await mongo_client.rem.properties.insert_one({"name": f"property-{i}"})

            for i in range(0, 100):
                insert_msg = ujson.loads(await ws_client.recv())
                assert insert_msg["doc"]["operationType"] == "insert"
                assert insert_msg["doc"]["fullDocument"]["name"].endswith(
                    f"-{i}"
                ), "Change stream came out of order"

            await mongo_client.rem.properties.update_one(
                {"name": "property-0"}, {"$set": {"city": "Springfield"}}
            )

            update_msg = ujson.loads(await ws_client.recv())
            assert update_msg["doc"]["operationType"] == "update"
            assert update_msg["doc"]["fullDocument"]["name"] == "property-0"

            await mongo_client.rem.properties.delete_one({"name": "property-0"})

            delete_msg = ujson.loads(await ws_client.recv())
            assert delete_msg["doc"]["operationType"] == "delete"

            ws_client.close()


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_service_resumes_from_last():
    async with start_test_server() as [ws_port, mongo_client, _]:
        async with open_stream(ws_port, "/changes") as ws_client:
            await ws_client.send(ujson.dumps({"collection": "properties"}))

            started_msg = ujson.loads(await ws_client.recv())
            assert "started" in started_msg and started_msg["started"], "did not receive first message"

            for i in range(0, 100):
                await mongo_client.rem.properties.insert_one({"name": f"property-{i}"})

            for i in range(0, 50):
                last_msg = ujson.loads(await ws_client.recv())
                assert last_msg["doc"]["fullDocument"]["name"].endswith(
                    f"-{i}"
                ), "Change stream came out of order"

        async with open_stream(ws_port, "/changes") as ws_client:
            await ws_client.send(
                ujson.dumps({"collection": "properties", "resumeAfter": last_msg["doc"]["_id"]})
            )

            started_msg = ujson.loads(await ws_client.recv())
            assert "started" in started_msg and started_msg["started"], "did not receive first message"

            for i in range(50, 100):
                print(f"processing {i}")
                insert_msg = ujson.loads(await ws_client.recv())
                assert insert_msg["doc"]["operationType"] == "insert"
                assert insert_msg["doc"]["fullDocument"]["name"].endswith(
                    f"-{i}"
                ), "Change stream came out of order"
