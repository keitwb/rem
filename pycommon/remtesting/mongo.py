import asyncio
import os
from contextlib import asynccontextmanager, contextmanager
from functools import partial as p

import docker
from motor.motor_asyncio import AsyncIOMotorClient

from . import PROJECT_ROOT_DIR
from .containers import build_async, container_ip, run_container
from .wait import wait_for_async

# The directory with the Dockerfile that builds the app's mongo image
MONGO_IMAGE_DIR = os.path.join(os.path.dirname(__file__), "../../datastores/mongo")


@asynccontextmanager
async def run_mongo():
    """
    Runs Mongo and calls the setup script to initialize the database.  Yields a client that is
    configured to talk to the newly created instance.
    """
    image, _ = await build_async(
        path=PROJECT_ROOT_DIR, dockerfile="datastores/mongo/Dockerfile", forcerm=True
    )

    async with run_container(image.id, wait_for_port=27017) as mongo:
        exit_code, logs = await asyncio.get_event_loop().run_in_executor(
            None, p(mongo.exec_run, "/opt/setup/run.sh")
        )
        assert exit_code == 0, "Mongo failed to setup:\n%s" % logs.decode("utf-8")

        mongo_client = AsyncIOMotorClient(container_ip(mongo), 27017)

        async def db_exists():
            return "rem" in (await mongo_client.list_database_names())

        assert await wait_for_async(db_exists, 40)

        yield mongo_client
