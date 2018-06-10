"""
ElasticSearch indexing logic for the Mongo changes.
"""

from functools import partial as p
import asyncio
import logging

import elasticsearch

logger = logging.getLogger(__name__)


async def index_document(esclient, index, mongo_doc):
    """
    Index a mongo document in ElasticSearch
    We shouldn't proceed with processing changes until this change was
    successful, so just retry the change indefinitely until it succeeds.  If
    there are legitimate reasons for failure that shouldn't be retried, they
    should either be ignored by using the `ignore` kwarg to the ES client
    methods, or this logic augmented to handle those cases.
    """
    await _do_op_with_retry(p(esclient, index=index, es_id=mongo_doc["_id"], body=mongo_doc))


async def delete_from_index_by_id(esclient, index, es_id):
    """
    Do a delete of a specific document from the given index.  It will retry
    indefinitely if any error other than a 404 is encountered.
    """
    func = p(esclient.delete, index=index, id=es_id, ignore=404)
    await _do_op_with_retry(func)


async def _do_op_with_retry(index_func):
    while True:
        try:
            resp = await asyncio.get_event_loop().run_in_executor(None, index_func)
            logger.debug("Response from ES: %s", resp)
            return
        except elasticsearch.ElasticsearchException as e:
            logger.error("Error running index function %s: %s", index_func, e)
        # TODO: implement binary backoff with max wait?
        await asyncio.sleep(5)
