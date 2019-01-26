"""
The setup logic for the data streamer server
"""
import asyncio
import logging
from functools import partial as p

import elasticsearch_async
from bson import BSON
from bson.raw_bson import RawBSONDocument
from motor.motor_asyncio import AsyncIOMotorClient
from sanic import Sanic

from .changestream import send_changes
from .dataaccess import handle_data_access
from .json import JSONEncoder
from .media import handle_media_upload, handle_media_download
from .message import SocketMessage
from .search import handle_search

logger = logging.getLogger(__name__)


def make_app(mongo_loc, es_hosts, db_name="rem"):
    """
    Run the server until exit
    """
    logger.info("Starting websocket server")
    # Use a single mongo client for every connection
    mongo_client = AsyncIOMotorClient(*mongo_loc, document_class=RawBSONDocument)

    # Use a single ES client for every connection
    es_client = elasticsearch_async.AsyncElasticsearch(es_hosts, maxsize=20)

    mongo_db = mongo_client[db_name]

    app = Sanic()
    setup_routes(app, mongo_db, es_client)

    return app


def setup_routes(app, mongo_db, es_client):
    """
    Adds the route handlers to the app
    """
    app.add_websocket_route(make_ws_handler(p(send_changes, mongo_db), JSONEncoder), "/changes")
    app.add_websocket_route(make_ws_handler(p(handle_data_access, mongo_db), JSONEncoder), "/db")
    app.add_websocket_route(make_ws_handler(p(handle_search, es_client), JSONEncoder), "/search")
    app.add_websocket_route(make_ws_handler(p(handle_media_upload, mongo_db), BSON), "/media-upload")
    app.add_route(p(handle_media_download, mongo_db), "/media-download/<media_id>", methods=["GET"])


def make_ws_handler(handler, encoder):
    """
    Handles messages asynchronously that come in on the given socket by passing them off to the
    given handler.
    """

    async def ws_handler(_, ws):
        async for raw_message in ws:
            try:
                obj = encoder.decode(raw_message)
            except ValueError as e:
                await ws.send(encoder.encode({"error": f"Could not decode message as JSON: {str(e)}"}))
                return

            message = SocketMessage(obj, ws, encoder)
            # Handle the message async and keep on handling new messages without waiting for the
            # handler for previous messages to complete.
            asyncio.create_task(handler(message))

    return ws_handler
