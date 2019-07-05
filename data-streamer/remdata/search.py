"""
Logic related to search queries against ElasticSearch from the frontend
"""

import elasticsearch


async def handle_search(es_client, message):
    """
    Handles a single search request message
    """
    index = message.get("index", "_all")
    action = message.get("action")
    try:
        if action == "search":
            body = message.get("body")
            if not body:
                await message.send_error("body not provided")

            result = await es_client.search(index=index, body=body, request_timeout=5)
        elif action == "getFields":
            mappings = await es_client.indices.get_mapping(index=index, request_timeout=5)
            result = {"fields": [k for i in mappings.values() for k in i["mappings"]["properties"].keys()]}
        else:
            result = {"error": f"Unknown search action {action}"}
        await message.send_response(result)
    except elasticsearch.exceptions.ElasticsearchException as e:
        await message.send_error(str(e))
