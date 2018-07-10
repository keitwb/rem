"""
Logic around claiming MongoDB change events so that only one instance tries to
process it.  Also handles ensuring that no two instances try and process a
change for the same document concurrently.
"""

import asyncio
import logging

import pymongo
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

COMPLETED_FIELD = "completed"
INSTANCE_FIELD = "instance"
CHANGE_FIELD = "change"
COLLECTION_FIELD = "change.ns.coll"
DOC_ID_FIELD = "change.documentKey._id"
RESUME_TOKEN_FIELD = "change._id"
TIMESTAMP_FIELD = "timestamp"


def claim_coll(db):
    """
    Returns the collection within the given db that is used for search indexing
    claims
    """
    return db.search_index_claims


async def ensure_unique_index(mongo_db):
    """
    This is what prevents more than one instance from claiming a given change.
    """
    # Only let a change id (resume token) be inserted once
    await claim_coll(mongo_db).create_index([\
            (COLLECTION_FIELD, pymongo.ASCENDING),
            (RESUME_TOKEN_FIELD, pymongo.ASCENDING)
        ], unique=True)

    # Make sorting by timestamp able to use an index.
    await claim_coll(mongo_db).create_index([\
            (COLLECTION_FIELD, pymongo.ASCENDING),
            (RESUME_TOKEN_FIELD, pymongo.ASCENDING),
            (TIMESTAMP_FIELD, pymongo.DESCENDING)])

    # Ensure changes for a given document are not processed by different instances at the same time
    # to avoid races and version conflicts.
    await claim_coll(mongo_db).create_index([\
            (COLLECTION_FIELD, pymongo.ASCENDING),
            (DOC_ID_FIELD, pymongo.ASCENDING)
            ], partialFilterExpression={COMPLETED_FIELD: False}, unique=True)


async def attempt_to_claim_change(mongo_db, change, instance_name):
    """
    Attempt to claim the given change by this instance.  If the claim has
    already been claimed, this will return None, otherwise it will return the
    claim id, which should be passed to mark_claim_completed once the change
    has been fully processed.
    """
    try:
        update_res = await claim_coll(mongo_db).update_one(
            {
                "_id": ObjectId()
            }, {
                "$set": {
                    INSTANCE_FIELD: instance_name,
                    CHANGE_FIELD: change,
                    COMPLETED_FIELD: False,
                },
                "$currentDate": {
                    TIMESTAMP_FIELD: {
                        "$type": "timestamp"
                    },
                },
            },
            upsert=True)

        return update_res.upserted_id
    except pymongo.errors.DuplicateKeyError:
        # We would get this exception if we are trying to claim a change id
        # that has already been claimed or a change with a doc id that is
        # curently being processed by another instance.  In the latter case,
        # that other instance should be able to later successfully claim that
        # change.
        return None


async def attempt_to_claim_initial_indexing(mongo_db, collection, instance_name):
    """
    Attempts to get a lock to do the initial indexing of a collection.  Returns None if another
    instance already claimed it, or the id of the claim that should be marked completed after
    indexing is complete.
    """

    # Get a prior claim that wasn't completed in case the instance crashed before finishing the
    # indexing.
    prior_claim = await claim_coll(mongo_db).find_one({
        RESUME_TOKEN_FIELD: None,
        INSTANCE_FIELD: instance_name,
        COMPLETED_FIELD: False,
    })
    if prior_claim:
        return prior_claim["_id"]

    return await attempt_to_claim_change(mongo_db, {"_id": None, "ns": {"coll": collection}}, instance_name)


async def wait_for_initial_indexing_complete(mongo_db, collection):
    """
    Polls the initial indexing claim until it reaches a completed state and then returns
    """
    while True:
        prior_claim = await claim_coll(mongo_db).find_one({
            COLLECTION_FIELD: collection,
            RESUME_TOKEN_FIELD: None,
        })
        if prior_claim[COMPLETED_FIELD]:
            return

        await asyncio.sleep(0.5)


async def mark_claim_completed(mongo_db, claim_id):
    """
    Sets the `completed` field on the claim that corresponds to the given id.
    This should only be called after the change associated with this claim is
    fully processed.
    """
    return await claim_coll(mongo_db).update({
        "_id": claim_id
    }, {"$set": {
        COMPLETED_FIELD: True,
    }})


async def delete_claim(mongo_db, claim_id):
    """
    Delete a single claim by id
    """
    return await claim_coll(mongo_db).delete_one({"_id": claim_id})


async def delete_claims_for_instance(mongo_db, instance_name):
    """
    Delete all of the current and historical claims by this instance.
    """
    return await claim_coll(mongo_db).delete_many({INSTANCE_FIELD: instance_name})


async def get_previous_claim(mongo_db, collection, instance_name):
    """
    Returns the most recent claim for this instance for the given collection.  This can include the
    initial indexing claim, which will have a resume token that is None.
    """
    return await claim_coll(mongo_db).find_one(
        {
            COLLECTION_FIELD: collection,
            INSTANCE_FIELD: instance_name,
        }, sort=[(TIMESTAMP_FIELD, pymongo.DESCENDING)])
