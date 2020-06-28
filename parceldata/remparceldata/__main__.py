import asyncio
import logging
import os

import uvloop

from . import watch

FORMAT = "%(asctime)-15s %(levelname)s %(module)s: %(message)s"
logging.basicConfig(level=logging.INFO, format=FORMAT)

logger = logging.getLogger(__name__)

INSTANCE_NAME = os.environ["INSTANCE_NAME"]
logger.info("Starting parceldata watcher for instance %s", INSTANCE_NAME)


asyncio.set_event_loop(uvloop.new_event_loop())
asyncio.get_event_loop().run_until_complete(
    watch.run_watch(
        INSTANCE_NAME,
        mongo_uri=os.environ.get("MONGO_URI"),
        mongo_database=os.environ.get("MONGO_DATABASE", "rem"),
    )
)
