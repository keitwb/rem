"""
Integration tests for the search websocket endpoint
"""
import pytest

import ujson

from .util import open_stream, start_test_server


# pylint: disable=missing-docstring
@pytest.mark.asyncio
@pytest.mark.timeout(60)
async def test_do_match_search():
    async with start_test_server() as [ws_port, _, es_client]:
        props_to_index = [
            ("a", {"name": "My Farm", "county": "Springfield"}),
            ("b", {"name": "Building", "county": "Washington"}),
        ]

        for _id, body in props_to_index:
            await es_client.index(index="properties", doc_type="_doc", id=_id, body=body, refresh=True)

        async with open_stream(ws_port, "/search") as ws_client:
            await ws_client.send(
                ujson.dumps(
                    {
                        "action": "search",
                        "index": "properties",
                        "body": {"query": {"match": {"name": "Building"}}},
                    }
                )
            )
            resp = ujson.loads(await ws_client.recv())
            assert resp.get("hits", {}).get("total") == 1
            assert resp["hits"]["hits"][0]["_id"] == "b"


@pytest.mark.asyncio
@pytest.mark.timeout(30)
async def test_get_field_names():
    async with start_test_server() as [ws_port, _, es_client]:
        props_to_index = [
            ("a", {"name": "My Farm", "county": "Springfield"}),
            ("b", {"name": "Building", "county": "Washington"}),
        ]

        for _id, body in props_to_index:
            await es_client.index(index="properties", doc_type="_doc", id=_id, body=body, refresh=True)

        async with open_stream(ws_port, "/search") as ws_client:
            await ws_client.send(ujson.dumps({"index": "properties", "action": "getFields"}))
            resp = ujson.loads(await ws_client.recv())

            assert set(resp.get("fields")) == set(["name", "county"])
