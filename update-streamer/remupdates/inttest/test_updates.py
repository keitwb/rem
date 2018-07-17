"""
Tests for the update streamer
"""
import json

import pytest
import websockets
from async_generator import asynccontextmanager

from remtesting.mongo import run_mongo
from remupdates.updates import start_server


@asynccontextmanager
async def run_with_mongo():
    """
    Run the update streamer with a backing mongo instance
    """
    async with run_mongo() as mongo_client:
        ws_server = await start_server(mongo_client.address, port=0)

        try:
            port = ws_server.server.sockets[0].getsockname()[1]
            async with websockets.connect("ws://127.0.0.1:%d" % port) as ws_client:
                yield [mongo_client, ws_client]
        finally:
            ws_server.close()


# pylint: disable=missing-docstring
@pytest.mark.asyncio
@pytest.mark.timeout(30)
async def test_service_sends_all_changes():
    async with run_with_mongo() as [mongo_client, ws_client]:
        await ws_client.send(json.dumps({"collection": "properties"}))

        started_msg = json.loads(await ws_client.recv())
        assert started_msg['started'], 'did not receive first message'

        for i in range(0, 100):
            await mongo_client.rem.properties.insert_one({
                "name": f"property-{i}",
            })

        for i in range(0, 100):
            insert_msg = json.loads(await ws_client.recv())
            assert insert_msg['operationType'] == 'insert'

        await mongo_client.rem.properties.update_one({"name": "property-0"}, {"$set": {"city": "Springfield"}})

        update_msg = json.loads(await ws_client.recv())
        assert update_msg['operationType'] == 'update'

        await mongo_client.rem.properties.delete_one({"name": "property-0"})

        delete_msg = json.loads(await ws_client.recv())
        assert delete_msg['operationType'] == 'delete'

        ws_client.close()


# pylint: disable=missing-docstring
@pytest.mark.asyncio
@pytest.mark.timeout(30)
async def test_service_resumes_from_last():
    async with run_mongo() as mongo_client:
        ws_server = await start_server(mongo_client.address, port=0)

        port = ws_server.server.sockets[0].getsockname()[1]
        async with websockets.connect("ws://127.0.0.1:%d" % port) as ws_client:
            await ws_client.send(json.dumps({"collection": "properties"}))

            started_msg = json.loads(await ws_client.recv())
            assert started_msg['started'], 'did not receive first message'

            for i in range(0, 100):
                await mongo_client.rem.properties.insert_one({
                    "name": f"property-{i}",
                })

            for i in range(0, 50):
                last_msg = json.loads(await ws_client.recv())

        async with websockets.connect("ws://127.0.0.1:%d" % port) as ws_client:
            await ws_client.send(json.dumps({"collection": "properties", "resumeAfter": last_msg["_id"]}))

            started_msg = json.loads(await ws_client.recv())
            assert started_msg['started'], 'did not receive first message'

            for i in range(0, 50):
                insert_msg = json.loads(await ws_client.recv())
                assert insert_msg['operationType'] == 'insert'

        ws_server.close()
