"""
Logic for running a test ElasticSearch service.
"""
import os

import elasticsearch_async
from async_generator import asynccontextmanager

from .containers import build_async, container_ip, run_container

ES_IMAGE_DIR = os.path.join(os.path.dirname(__file__), '../../datastores/es')


@asynccontextmanager
async def run_elasticsearch():
    """
    Runs ES with a simple setup and yield a client configured to talk to it
    """
    image, _ = await build_async(path=ES_IMAGE_DIR, forcerm=True)
    async with run_container(\
            image.id, environment={"discovery.type": "single-node"}, wait_for_port=9200) as es_cont:

        es_client = elasticsearch_async.AsyncElasticsearch([{
            "host": container_ip(es_cont),
            "port": 9200,
        }])

        await es_client.cluster.health(wait_for_status='green')  #pylint: disable=unexpected-keyword-arg

        try:
            yield es_client
        finally:
            await es_client.transport.close()
