"""
Utils for setting up tests and doing assertions
"""
# pylint: disable=not-async-context-manager

import asyncio
from contextlib import asynccontextmanager

import elasticsearch

from remsearch import watch
from remtesting.containers import container_ip, run_container
from remtesting.es import run_elasticsearch
from remtesting.mongo import collection_watches, run_mongo
from remtesting.wait import wait_for_async, wait_for_shutdown

TIKA_IMAGE = "logicalspark/docker-tikaserver:1.18"


async def get_es_doc(es_client, index, doc_id):
    """
    Returns True if the document in the given index exists in ES
    """
    try:
        return await es_client.get(doc_type="_doc", index=index, id=str(doc_id))
    except (elasticsearch.NotFoundError, elasticsearch.exceptions.TransportError):
        return False


async def get_es_indexing_stats(index_name, es_client):
    """
    Returns indexing stats about a particular index
    """
    index_props = await es_client.indices.stats(index=index_name, metric="indexing")
    return index_props["indices"][f"{index_name}-1"]["total"]["indexing"]


@asynccontextmanager
async def run_watchers(event_loop, mongo_client, es_client, tika_container=None, instances=1):
    """
    Run a test Mongo and ES instance as well as the search index watch routines for all collections
    and yield, ensuring that the watcher(s) are shutdown upon completion.
    """
    tika_host = container_ip(tika_container) if tika_container else ""

    watcher_tasks = [
        event_loop.create_task(
            watch.watch_indexed_collections(
                "test-%d" % i,
                mongo_uri="mongodb://%s:%d" % mongo_client.address,
                es_hosts=es_client.transport.hosts,
                tika_loc=(tika_host, 9998),
            )
        )
        for i in range(0, instances)
    ]

    try:

        async def watches_active():
            return len(await collection_watches(mongo_client)) >= instances * len(watch.COLLECTIONS_TO_INDEX)

        assert await wait_for_async(watches_active), "change streams never activated"

        yield
    finally:
        await asyncio.gather(*[wait_for_shutdown(t) for t in watcher_tasks], loop=event_loop)


@asynccontextmanager
async def run_watchers_with_services(event_loop, instances=1):
    """
    Run the necessary storage services and then start the watchers configured with them.
    """
    async with run_mongo() as mongo_client, run_elasticsearch() as es_client, run_container(
        TIKA_IMAGE, wait_for_port=9998
    ) as tika_container:
        async with run_watchers(event_loop, mongo_client, es_client, tika_container, instances):
            yield [mongo_client, es_client]
