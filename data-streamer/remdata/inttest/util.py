"""
Utils for the integration tests
"""
import asyncio
from contextlib import asynccontextmanager, closing
import socket

import websockets

from remdata.core import make_app
from remtesting.es import run_elasticsearch
from remtesting.mongo import run_mongo


@asynccontextmanager
async def start_test_server():
    """
    Run the update streamer with a backing mongo instance
    """
    async with run_mongo() as mongo_client:
        async with run_elasticsearch() as es_client:
            app = make_app(mongo_client.address, es_client.transport.hosts)

            started = asyncio.Event()

            async def set_started():
                started.set()

            app.add_task(set_started())

            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            with closing(sock):
                sock.bind(("127.0.0.1", 0))

                server_task = asyncio.create_task(app.create_server(sock=sock))

                assigned_port = sock.getsockname()[1]

                await started.wait()
                try:
                    yield [assigned_port, mongo_client, es_client]
                finally:
                    server_task.cancel()
                    sock.close()


@asynccontextmanager
async def open_stream(ws_port, path):
    """
    Connects to the change stream endpoint on the ws_server
    """
    async with websockets.connect("ws://127.0.0.1:%d%s" % (ws_port, path)) as ws_client:
        yield ws_client
