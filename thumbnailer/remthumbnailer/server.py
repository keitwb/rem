import io
import logging
from functools import partial as p

import bson
from bson.raw_bson import RawBSONDocument
from gridfs.errors import NoFile
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from sanic import Sanic, response
from sanic.exceptions import NotFound
from sanic.response import text

from .conversion import convert_image_bytes_to_thumbnail

logger = logging.getLogger(__name__)


def make_app(mongo_uri, db_name="rem"):
    """
    Run the server until exit
    """
    logger.info("Starting thumbnail server")
    # Use a single mongo client for every connection
    mongo_client = AsyncIOMotorClient(mongo_uri, document_class=RawBSONDocument)

    mongo_db = mongo_client[db_name]

    app = Sanic()
    app.add_route(make_thumbnail_request_handler(mongo_db), "/<media_id>", methods=["GET"])
    app.error_handler.add(NotFound, ignore_404s)

    return app


async def ignore_404s(_req, _):
    return text("404 page not found", status=404)


DEFAULT_WIDTH = DEFAULT_HEIGHT = 256


def make_thumbnail_request_handler(mongo_db):
    async def handle_thumbnail_request(request, media_id):
        """
        Streams a file from GridFS and generates a thumbnail for it.
        """
        bucket = AsyncIOMotorGridFSBucket(mongo_db, "media")
        try:
            stream = await bucket.open_download_stream(bson.ObjectId(media_id))
        except NoFile:
            return response.text(f"Media id '{media_id}' not found", status=404)
        except bson.errors.InvalidId:
            return response.text(f"Media id '{media_id}' in not a proper ObjectId", status=400)

        headers = {"Content-Type": "image/jpeg"}

        width = request.args.get("width", [DEFAULT_WIDTH])[0]
        height = request.args.get("height", [DEFAULT_HEIGHT])[0]

        media_bytes = await stream.read()

        thumbnail_stream = convert_image_bytes_to_thumbnail(media_bytes, width=width, height=height)

        if not thumbnail_stream:
            return response.raw("Unable to generate thumbnail", status=400)

        return response.raw(thumbnail_stream.getvalue(), status=200, headers=headers)

    return handle_thumbnail_request
