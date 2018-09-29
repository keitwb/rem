"""
Utils for the integration tests
"""
from contextlib import asynccontextmanager

import websockets

from remdata.core import start_server
from remtesting.es import run_elasticsearch
from remtesting.mongo import run_mongo


@asynccontextmanager
async def start_test_server():
    """
    Run the update streamer with a backing mongo instance
    """
    async with run_mongo() as mongo_client:
        async with run_elasticsearch() as es_client:
            async with start_server(mongo_client.address, es_client.transport.hosts, port=0) as server:
                assigned_port = server.server.sockets[0].getsockname()[1]
                yield [assigned_port, mongo_client, es_client]


@asynccontextmanager
async def open_stream(ws_port, path):
    """
    Connects to the change stream endpoint on the ws_server
    """
    async with websockets.connect("ws://127.0.0.1:%d/%s" % (ws_port, path)) as ws_client:
        yield ws_client
