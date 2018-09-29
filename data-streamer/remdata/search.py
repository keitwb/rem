"""
Logic related to search queries against ElasticSearch from the frontend
"""

import elasticsearch


async def handle_search(es_client, message):
    """
    Handles a single search request message
    """
    index = message.get("index", "_all")
    body = message.get("query")
    try:
        result = await es_client.search(index=index, body={"query": body})
        await message.send_response(result)
    except elasticsearch.exceptions.RequestError as e:
        await message.send_error(str(e))
