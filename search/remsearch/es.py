"""
ElasticSearch indexing logic for the Mongo changes.
"""

import asyncio
import logging
from functools import partial as p

import elasticsearch
from bson.json_util import dumps

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
    es_id = str(mongo_doc["_id"])
    del mongo_doc["_id"]
    await _do_op_with_retry(p(esclient.index, index=index, doc_type="_doc", id=es_id, body=dumps(mongo_doc)))


async def delete_from_index_by_id(esclient, index, es_id):
    """
    Do a delete of a specific document from the given index.  It will retry
    indefinitely if any error other than a 404 is encountered.
    """
    func = p(esclient.delete, doc_type="_doc", index=index, id=es_id, ignore=404)
    await _do_op_with_retry(func)


async def _do_op_with_retry(op_func):
    while True:
        try:
            resp = await op_func()
            logger.debug("Response from ES: %s", resp)
            return resp
        except elasticsearch.ElasticsearchException as e:
            logger.error("Error running index function %s: %s", op_func, e)
        # TODO: implement binary backoff with max wait?
        await asyncio.sleep(5)


async def check_reindex_needed(esclient, index):
    """
    Returns True if we need to reindex everything in ElasticSearch.  This can happen upon initial
    deployment of the app or if ES happens to lose all its data.
    """
    return (
        await _do_op_with_retry(
            p(esclient.get, index="initialization", doc_type="_doc", id=index, ignore=404)
        )
        is None
    )
