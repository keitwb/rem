"""
Integration tests of the watch logic
"""
# pylint: disable=not-async-context-manager

import asyncio
from collections import namedtuple
from contextlib import asynccontextmanager
from functools import partial as p

import pytest
from remcommon import watch
from remtesting.mongo import run_mongo
from remtesting.wait import wait_for_async, wait_for_shutdown

ObservedChange = namedtuple("ObservedChange", ["instance_index", "change"])


@asynccontextmanager
async def run_watchers_with_mongo(event_loop, collection, service="test", instance_count=1):
    """
    Run a set of watchers along with a MongoDB instance
    """
    async with run_mongo() as mongo_client:
        async with run_watchers(event_loop, mongo_client, collection, service, instance_count) as [
            mongo_db,
            watcher_yields,
        ]:
            yield [mongo_db, watcher_yields]


@asynccontextmanager
async def run_watchers(event_loop, mongo_client, collection, service="test", instance_count=1):
    """
    Run a test Mongo and spin up a configurable number of instance_count of the watcher task, collecting
    yielded changes for each watcher, and ensuring that the watcher(s) are shutdown upon completion.
    """
    watcher_tasks = []
    # Holds everything in order (tuple of (instance_name, change)) as it is yielded from the watchers
    watcher_yields = []
    mongo_db = mongo_client.rem

    for i in range(0, instance_count):

        async def watch_and_append_yielded(i):
            async for change in watch.watch_collection(mongo_db, collection, service, f"instance-{i}"):
                watcher_yields.append(ObservedChange(instance_index=i, change=change))

        watcher_tasks.append(event_loop.create_task(watch_and_append_yielded(i)))

    try:
        assert await wait_for_async(
            p(watch_is_active, mongo_client, instance_count)
        ), "change streams never activated"

        yield [mongo_db, watcher_yields]
    finally:
        await asyncio.gather(*[wait_for_shutdown(t) for t in watcher_tasks], loop=event_loop)


async def watch_is_active(mongo_client, instance_count):
    """
    Returns True when the watches are all active by checking Mongo directly for change stream
    commands.  There should be one change stream op per collection per instance.
    """
    ops = await mongo_client.rem.current_op()
    change_streams = [
        ip
        for ip in ops["inprog"]
        if ip.get("originatingCommand", {}).get("pipeline")
        and "$changeStream" in ip["originatingCommand"]["pipeline"][0]
    ]
    return len(change_streams) >= instance_count


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_changes_basic_functionality(event_loop):
    async with run_watchers_with_mongo(event_loop, "properties", "test", 3) as [mongo_db, yielded_changes]:
        assert await wait_for_async(lambda: len(yielded_changes) == 1, timeout_seconds=10)
        assert yielded_changes[0].change is watch.INITIAL_LEAD_WATCHER

        res = await mongo_db.properties.insert_one({"name": "my-property"})

        assert await wait_for_async(lambda: len(yielded_changes) == 2, timeout_seconds=10)
        assert yielded_changes[1].change["fullDocument"]["name"] == "my-property"

        # Do an update in mongo and make sure it gets indexed
        await mongo_db.properties.update_one({"_id": res.inserted_id}, {"$set": {"city": "Springfield"}})
        assert await wait_for_async(lambda: len(yielded_changes) == 3, timeout_seconds=10)
        assert yielded_changes[2].change["fullDocument"]["city"] == "Springfield"

        # Do an delete in mongo and make sure it causes the ES record to be deleted
        await mongo_db.properties.delete_one({"_id": res.inserted_id})
        assert await wait_for_async(lambda: len(yielded_changes) == 4, timeout_seconds=10)
        assert yielded_changes[3].change["operationType"] == "delete"
        assert yielded_changes[3].change["documentKey"] == yielded_changes[2].change["documentKey"]


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_resumes_from_last_change_on_restart(event_loop):
    async with run_mongo() as mongo_client:
        async with run_watchers(event_loop, mongo_client, "properties", "test", instance_count=2) as [
            mongo_db,
            yielded_changes,
        ]:
            res = await mongo_db.properties.insert_one({"name": "my-property"})
            assert await wait_for_async(lambda: len(yielded_changes) == 2, timeout_seconds=10)

            assert yielded_changes[0].change == watch.INITIAL_LEAD_WATCHER
            assert yielded_changes[1].change["fullDocument"]["name"] == "my-property"

        # This is *after* the watchers are shutdown
        # Do an update in mongo and make sure it gets indexed
        await mongo_db.properties.update_one({"_id": res.inserted_id}, {"$set": {"city": "Springfield"}})

        # Start the watchers back up and make sure they pick up the change that happened while they
        # were shut down.
        async with run_watchers(event_loop, mongo_client, "properties", "test", instance_count=2) as [
            mongo_db,
            yielded_changes,
        ]:
            assert await wait_for_async(lambda: len(yielded_changes) >= 1)
            assert yielded_changes[0].change["fullDocument"]["city"] == "Springfield"


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_multiple_instances_coordinate(event_loop):
    async with run_watchers_with_mongo(event_loop, "properties", "test", instance_count=10) as [
        mongo_db,
        yielded_changes,
    ]:
        doc_count = 100
        res = await mongo_db.properties.insert_many(
            [{"name": "property-{}".format(i)} for i in range(doc_count)]
        )

        await mongo_db.properties.update_many(
            {"_id": {"$in": res.inserted_ids}}, {"$set": {"pin_number": "123234234"}}
        )

        def has_length(le):
            return len(yielded_changes) == le

        assert await wait_for_async(p(has_length, (doc_count * 2) + 1), timeout_seconds=60)

        changed_ids = [yc.change["documentKey"]["_id"] for yc in yielded_changes[1:]]

        for inserted_id in res.inserted_ids:
            assert inserted_id in changed_ids

        assert has_length((doc_count * 2) + 1), "changes came in that were unexpected"


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_changes_start_after_preexisting_docs_if_no_prior_claims(event_loop):
    async with run_mongo() as mongo_client:
        await asyncio.gather(
            mongo_client.rem.properties.insert_one({"name": "property1"}),
            mongo_client.rem.properties.insert_one({"name": "property2"}),
            mongo_client.rem.properties.insert_one({"name": "property3"}),
        )

        async with run_watchers(event_loop, mongo_client, "properties", "test", instance_count=5) as [
            mongo_db,
            yielded_changes,
        ]:
            assert await wait_for_async(lambda: len(yielded_changes) == 1)

            res = await asyncio.gather(
                mongo_db.properties.insert_one({"name": "property4"}),
                mongo_db.properties.insert_one({"name": "property5"}),
                mongo_db.properties.insert_one({"name": "property6"}),
            )

            assert await wait_for_async(lambda: len(yielded_changes) == 4)

            assert yielded_changes[0].change is watch.INITIAL_LEAD_WATCHER
            changed_ids = [yc.change["documentKey"]["_id"] for yc in yielded_changes[1:]]
            for insert_result in res:
                assert insert_result.inserted_id in changed_ids
