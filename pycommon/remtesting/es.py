"""
Logic for running a test ElasticSearch service.
"""
import asyncio
import os
from contextlib import asynccontextmanager

import elasticsearch_async

from .containers import container_ip, run_container

ES_SETUP_DIR = os.path.join(os.path.dirname(__file__), "../../datastores/es")


@asynccontextmanager
async def run_elasticsearch():
    """
    Runs ES with a simple setup and yield a client configured to talk to it
    """
    async with run_container(
        "docker.elastic.co/elasticsearch/elasticsearch-oss:7.1.1",
        environment={"discovery.type": "single-node", "ES_JAVA_OPTS": "-Xms128m -Xmx128m"},
        wait_for_port=9200,
    ) as es_cont:
        es_ip = container_ip(es_cont)
        es_client = elasticsearch_async.AsyncElasticsearch([{"host": es_ip, "port": 9200}], timeout=30)

        await es_client.cluster.health(wait_for_status="green")  # pylint: disable=unexpected-keyword-arg

        await do_setup(es_ip)

        try:
            yield es_client
        finally:
            await es_client.transport.close()


async def do_setup(es_ip):
    proc = await asyncio.create_subprocess_shell(
        f"bash {ES_SETUP_DIR}/setup-indexes.sh",
        stdin=asyncio.subprocess.DEVNULL,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env={"PATH": os.environ.get("PATH"), "ES_HOST": es_ip},
    )
    out, err = await proc.communicate()
    assert proc.returncode == 0, f"ES index failed to setup:\n{out!s}\n{err!s}"
