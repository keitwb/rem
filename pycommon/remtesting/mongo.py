from contextlib import asynccontextmanager
from functools import partial as p
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient

from .containers import container_ip, docker_client, run_container
from .wait import wait_for_async

# The directory with the Dockerfile that builds the app's mongo image
MONGO_SETUP_DIR = (Path(__file__).parent / "../../datastores/mongo").resolve()


@asynccontextmanager
async def run_mongo(version="4.1"):
    """
    Runs Mongo and calls the setup script to initialize the database.  Yields a client that is
    configured to talk to the newly created instance.
    """
    async with run_container(
        "mongo:" + version,
        command=["mongod", "--bind_ip", "0.0.0.0", "--replSet", "rem"],
        wait_for_port=27017,
    ) as mongo:
        mongo_ip = container_ip(mongo)
        exit_code, out = mongo.exec_run(["mongo", "--eval", "rs.initiate()"])
        assert exit_code == 0, f"Failed initiating mongo replica set: {out}"

        mongo_client = AsyncIOMotorClient(mongo_ip, 27017)

        async def db_exists(name):
            dbs = await mongo_client.list_database_names()
            return name in dbs

        # Config database appears after replica set is initialized
        assert await wait_for_async(p(db_exists, "config"), 40)

        await do_setup(mongo_ip)

        assert await wait_for_async(p(db_exists, "rem"), 40)

        yield mongo_client


async def do_setup(mongo_ip):
    client = docker_client()
    setup_image, _ = client.images.build(path=str(MONGO_SETUP_DIR))
    container = client.containers.run(
        setup_image.id,
        command=["mongo", f"{mongo_ip}/rem", "/opt/setup.js"],
        working_dir="/opt",
        stderr=True,
        detach=True,
    )
    exit_code = container.wait()
    logs = container.logs()
    container.remove(force=True)
    assert exit_code["StatusCode"] == 0, f"mongo setup failed with exit code {exit_code}: {logs}"


async def collection_watches(mongo_client):
    """
    Returns a list of collections being watched by a change stream by a mongo client.  Multiple
    instances of the same collection indicate multiple change streams open on it.  Works with mongo
    4.1.1.
    """
    ops = await mongo_client.rem.current_op()
    change_stream_collections = [
        ip["cursor"]["originatingCommand"]["aggregate"]
        for ip in ops["inprog"]
        if ip.get("cursor", {}).get("originatingCommand", {}).get("pipeline")
        and "$changeStream" in ip["cursor"]["originatingCommand"]["pipeline"][0]
    ]
    return change_stream_collections
