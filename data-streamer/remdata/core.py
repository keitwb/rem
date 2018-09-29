"""
The setup logic for the data streamer server
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from functools import partial as p

import elasticsearch_async
import websockets
from bson import BSON
from bson.raw_bson import RawBSONDocument
from motor.motor_asyncio import AsyncIOMotorClient

from .changestream import send_changes
from .dataaccess import handle_data_access
from .json import JSONEncoder
from .media import handle_media
from .message import SocketMessage
from .search import handle_search

logger = logging.getLogger(__name__)


@asynccontextmanager
async def start_server(mongo_loc, es_hosts, db_name="rem", port=8080):
    """
    Run the server until exit
    """
    logger.info("Starting websocket server")
    # Use a single mongo client for every connection
    mongo_client = AsyncIOMotorClient(*mongo_loc, document_class=RawBSONDocument)

    # Use a single ES client for every connection
    es_client = elasticsearch_async.AsyncElasticsearch(es_hosts, sniff_on_start=False, sniff_on_connection_fail=False,
                                                       sniffer_timeout=30, maxsize=20)

    mongo_db = mongo_client[db_name]

    async with websockets.serve(p(route_connection, mongo_db, es_client), '0.0.0.0', port) as server:
        yield server


async def route_connection(mongo_db, es_client, socket, path):
    """
    Determine which operation this should be based on the path of the websocket
    """
    logger.info(path)
    if path.endswith("/changes"):
        handler = p(send_changes, mongo_db)
        encoder = JSONEncoder
    elif path.endswith("/db"):
        handler = p(handle_data_access, mongo_db)
        encoder = JSONEncoder
    elif path.endswith("/search"):
        handler = p(handle_search, es_client)
        encoder = JSONEncoder
    elif path.endswith("/media"):
        handler = p(handle_media, mongo_db)
        encoder = BSON
    else:
        await socket.send(f"Unknown path {path}")
        return

    await handle_message(socket, handler, encoder)


async def handle_message(socket, handler, encoder):
    """
    Handles messages asynchronously that come in on the given socket by passing them off to the
    given handler.
    """
    async for raw_message in socket:
        try:
            obj = encoder.decode(raw_message)
        except ValueError as e:
            await socket.send(encoder.encode({
                "error": f"Could not decode message as JSON: {str(e)}",
            }))
            return

        message = SocketMessage(obj, socket, encoder)
        # Handle the message async and keep on handling new messages without waiting for the
        # handler for previous messages to complete.
        asyncio.create_task(handler(message))
