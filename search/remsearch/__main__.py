"""
The main logic that starts the event loop and watches mongo collections for
changes and indexes those changes in elasticsearch
"""
import asyncio
import logging
import os

from . import watch

logging.basicConfig(format="%(asctime)-15s %(levelname)-8s %(message)s", level=logging.INFO)

logger = logging.getLogger(__name__)

INSTANCE_NAME = os.environ["INSTANCE_NAME"]
logger.info("Starting search watcher for instance %s", INSTANCE_NAME)
asyncio.get_event_loop().run_until_complete(watch.watch_indexed_collections(INSTANCE_NAME))
