"""
Integration tests of the indexer
"""
# pylint: disable=not-async-context-manager

import asyncio
from functools import partial as p

import pytest

from remtesting.es import run_elasticsearch
from remtesting.mongo import run_mongo
from remtesting.wait import wait_for_async

from .util import get_es_doc, get_es_indexing_stats, run_watchers, run_watchers_with_services


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_changes_get_indexed_in_es(event_loop):
    async with run_watchers_with_services(event_loop) as [mongo_client, es_client]:
        res = await mongo_client.rem.properties.insert_one({"name": "my-property"})

        es_doc = await wait_for_async(
            p(get_es_doc, es_client, index="properties", doc_id=res.inserted_id), timeout_seconds=10
        )
        assert es_doc, "property was not indexed"

        assert es_doc["_source"]["name"] == "my-property", "property did not have name field"
        assert es_doc["_id"] == str(res.inserted_id), "property did not have correct id"

        # Do an update in mongo and make sure it gets indexed
        await mongo_client.rem.properties.update_one(
            {"_id": res.inserted_id}, {"$set": {"city": "Springfield"}}
        )

        async def has_new_field_in_es():
            es_doc = await get_es_doc(es_client, index="properties", doc_id=res.inserted_id)
            return es_doc["_source"].get("city") == "Springfield"

        assert await wait_for_async(has_new_field_in_es), "updated city field did not get indexed"

        # Do an delete in mongo and make sure it causes the ES record to be deleted
        await mongo_client.rem.properties.delete_one({"_id": res.inserted_id})

        async def is_gone_from_es():
            return not await get_es_doc(es_client, index="properties", doc_id=res.inserted_id)

        assert await wait_for_async(is_gone_from_es), "document did not get removed from ES"


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_resumes_from_last_change_on_restart(event_loop):
    async with run_mongo() as mongo_client, run_elasticsearch() as es_client:
        async with run_watchers(event_loop, mongo_client, es_client, instances=2):
            res = await mongo_client.rem.properties.insert_one({"name": "my-property"})

            es_doc = await wait_for_async(
                p(get_es_doc, es_client, index="properties", doc_id=res.inserted_id), timeout_seconds=10
            )
            assert es_doc, "property was not indexed"

            assert es_doc["_source"]["name"] == "my-property", "property did not have name field"
            assert es_doc["_id"] == str(res.inserted_id), "property did not have correct id"

        # Do an update in mongo and make sure it gets indexed
        await mongo_client.rem.properties.update_one(
            {"_id": res.inserted_id}, {"$set": {"city": "Springfield"}}
        )

        # Start the watchers back up and make sure they pick up the change that happened while they
        # were shut down.
        async with run_watchers(event_loop, mongo_client, es_client, instances=2):

            async def has_new_field_in_es():
                es_doc = await get_es_doc(es_client, index="properties", doc_id=res.inserted_id)
                return es_doc["_source"].get("city") == "Springfield"

            assert await wait_for_async(has_new_field_in_es), "updated city field did not get indexed"

        # 3 can happen if claim isn't finalized before first watcher is shut down
        assert (await get_es_indexing_stats("properties", es_client))["index_total"] in [
            2,
            3,
        ], "Only 2 or 3 indexing operations should happen"


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_multiple_instances_coordinate(event_loop):
    async with run_watchers_with_services(event_loop, instances=10) as [mongo_client, es_client]:

        doc_count = 100
        res = await mongo_client.rem.properties.insert_many(
            [{"name": "property-{}".format(i)} for i in range(doc_count)]
        )

        await mongo_client.rem.properties.update_many(
            {"_id": {"$in": res.inserted_ids}}, {"$set": {"pin_number": "123234234"}}
        )

        async def has_field_in_es(es_id):
            es_doc = await get_es_doc(es_client, index="properties", doc_id=es_id)
            if not es_doc:
                return False
            return es_doc["_source"].get("pin_number") == "123234234"

        for doc_id in res.inserted_ids:
            assert await wait_for_async(p(has_field_in_es, es_id=str(doc_id)), timeout_seconds=20)

        # Get statistics on how many indexing commands have been issues to ensure that the watchers
        # are not duplicating work.
        assert (await get_es_indexing_stats("properties", es_client))[
            "index_total"
        ] == doc_count * 2, "Only 2 indexing operations per document should happen"


# pylint: disable=missing-docstring
@pytest.mark.asyncio
async def test_preexisting_docs_get_indexed_once_if_no_prior_claims(event_loop):
    async with run_mongo() as mongo_client, run_elasticsearch() as es_client:
        res = await asyncio.gather(
            mongo_client.rem.properties.insert_one({"name": "property1"}),
            mongo_client.rem.properties.insert_one({"name": "property2"}),
            mongo_client.rem.properties.insert_one({"name": "property3"}),
        )

        async with run_watchers(event_loop, mongo_client, es_client, instances=5):
            for insert_result in res:
                assert await wait_for_async(
                    p(get_es_doc, es_client, index="properties", doc_id=insert_result.inserted_id),
                    timeout_seconds=10,
                )

            res = await asyncio.gather(
                mongo_client.rem.properties.insert_one({"name": "property4"}),
                mongo_client.rem.properties.insert_one({"name": "property5"}),
                mongo_client.rem.properties.insert_one({"name": "property6"}),
            )

            for insert_result in res:
                assert await wait_for_async(
                    p(get_es_doc, es_client, index="properties", doc_id=insert_result.inserted_id),
                    timeout_seconds=10,
                )
