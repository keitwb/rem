"""
Runs the server
"""
import asyncio
import logging
import os

import uvloop

from .core import make_app

FORMAT = "%(asctime)-15s %(levelname)s %(module)s: %(message)s"
logging.basicConfig(level=logging.INFO, format=FORMAT)


async def startup():
    """
    Run the server until it is stopped
    """
    app = make_app(
        mongo_uri=os.environ.get("MONGO_URI"),
        es_hosts=[{"host": os.environ.get("ES_HOST", "es"), "port": int(os.environ.get("ES_PORT", 9200))}],
        db_name=os.environ.get("MONGO_DATABASE", "rem"),
    )

    # This will complete upon startup and this function will return
    await app.create_server(host="0.0.0.0", port=8080)


asyncio.set_event_loop(uvloop.new_event_loop())
loop = asyncio.get_event_loop()  # pylint:disable=invalid-name
loop.run_until_complete(startup())
loop.run_forever()
