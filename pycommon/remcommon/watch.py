"""
Logic around claiming MongoDB change events so that only one instance tries to process it.  Also
handles ensuring that no two instances try and process distinct changes for the same document
concurrently.

This watches the Mongo change stream for changes to documents in collections.  In order for this to
be scalable beyond one instance, each worker claims a change event before processing it by creating
a claim document in a special collection in Mongo (watch_claims).  This special collection has a
unique index on the collection name, service name, and the change id so that only one instance per
service can successfully make a claim.  Once it is successfully processed, it marks the claim as
completed.

To make error handling simpler, each instance of this service must have a unique and stable identity
that gets reused upon restart.  Each claim has a field with that instance identity.  That way, if an
instance crashes, upon startup the worker for each collection checks whether a previous run of the
instance has any incomplete jobs, and if so, processes them and continues. An instance should never
process a change in the change stream until it has successfully processed all the previous changes
it has claimed since the restart logic only handles a single failed job.
"""

import asyncio
import logging
from concurrent.futures import CancelledError

import pymongo
from bson.objectid import ObjectId

from .log import FieldLogger

logger = logging.getLogger(__name__)

COMPLETED_FIELD = "completed"
INSTANCE_FIELD = "instance"
CHANGE_FIELD = "change"
COLLECTION_FIELD = "change.ns.coll"
DOC_ID_FIELD = "change.documentKey._id"
RESUME_TOKEN_FIELD = "change._id"
TIMESTAMP_FIELD = "timestamp"
SERVICE_FIELD = "service"

# A special flag that indicates that there is no claim history for this collection, and that this
# current watcher instance has won election to do whatever it wants, unmolested, to the collection.
INITIAL_LEAD_WATCHER = type("INITIAL_LEAD_WATCHER", (), {})  # pylint:disable=invalid-name


def claim_coll(db):
    """
    Returns the collection within the given db that is used for watch
    claims
    """
    return db.watch_claims


async def ensure_unique_index(mongo_db):
    """
    This is what prevents more than one instance per collection/service from claiming a given change.
    """
    # Only let a change id (resume token) be inserted once
    await claim_coll(mongo_db).create_index(
        [
            (COLLECTION_FIELD, pymongo.ASCENDING),
            (SERVICE_FIELD, pymongo.ASCENDING),
            (RESUME_TOKEN_FIELD, pymongo.ASCENDING),
        ],
        unique=True,
    )

    # Make sorting by timestamp able to use an index.
    await claim_coll(mongo_db).create_index(
        [
            (COLLECTION_FIELD, pymongo.ASCENDING),
            (SERVICE_FIELD, pymongo.ASCENDING),
            (RESUME_TOKEN_FIELD, pymongo.ASCENDING),
            (TIMESTAMP_FIELD, pymongo.DESCENDING),
        ]
    )

    # Ensure changes for a given document are not processed by different instances at the same time
    # to avoid races and version conflicts.
    await claim_coll(mongo_db).create_index(
        [
            (COLLECTION_FIELD, pymongo.ASCENDING),
            (SERVICE_FIELD, pymongo.ASCENDING),
            (DOC_ID_FIELD, pymongo.ASCENDING),
        ],
        partialFilterExpression={COMPLETED_FIELD: False},
        unique=True,
    )


async def attempt_to_claim_change(mongo_db, change, service, instance_name):
    """
    Attempt to claim the given change by this instance.  If the claim has
    already been claimed, this will return None, otherwise it will return the
    claim id, which should be passed to mark_claim_completed once the change
    has been fully processed.
    """
    try:
        update_res = await claim_coll(mongo_db).update_one(
            {"_id": ObjectId()},
            {
                "$set": {
                    INSTANCE_FIELD: instance_name,
                    SERVICE_FIELD: service,
                    CHANGE_FIELD: change,
                    COMPLETED_FIELD: False,
                },
                "$currentDate": {TIMESTAMP_FIELD: {"$type": "timestamp"}},
            },
            upsert=True,
        )

        return update_res.upserted_id
    except pymongo.errors.DuplicateKeyError:
        # We would get this exception if we are trying to claim a change id
        # that has already been claimed or a change with a doc id that is
        # curently being processed by another instance.  In the latter case,
        # that other instance should be able to later successfully claim that
        # change.
        return None


async def attempt_to_claim_initial_watch(mongo_db, collection, service, instance_name):
    """
    Attempts to get a lock to do some initialization of a collection without missing new changes.
    Returns None if another instance already claimed it, or the id of the claim that should be
    marked completed after indexing is complete.
    """

    # Get a prior claim that wasn't completed in case the instance crashed before finishing the
    # indexing.
    prior_claim = await claim_coll(mongo_db).find_one(
        {
            RESUME_TOKEN_FIELD: None,
            INSTANCE_FIELD: instance_name,
            SERVICE_FIELD: service,
            COMPLETED_FIELD: False,
        }
    )
    if prior_claim:
        return prior_claim["_id"]

    return await attempt_to_claim_change(
        mongo_db, {"_id": None, "ns": {"coll": collection}}, service, instance_name
    )


async def wait_for_initial_watch_complete(mongo_db, service, collection):
    """
    Polls the initial indexing claim until it reaches a completed state and then returns
    """
    while True:
        prior_claim = await claim_coll(mongo_db).find_one(
            {COLLECTION_FIELD: collection, SERVICE_FIELD: service, RESUME_TOKEN_FIELD: None}
        )
        if prior_claim[COMPLETED_FIELD]:
            return

        await asyncio.sleep(0.5)


async def mark_claim_completed(mongo_db, claim_id):
    """
    Sets the `completed` field on the claim that corresponds to the given id.
    This should only be called after the change associated with this claim is
    fully processed.
    """
    return await claim_coll(mongo_db).update_one({"_id": claim_id}, {"$set": {COMPLETED_FIELD: True}})


async def delete_claim(mongo_db, claim_id):
    """
    Delete a single claim by id
    """
    return await claim_coll(mongo_db).delete_one({"_id": claim_id})


async def delete_claims_for_instance(mongo_db, service, instance_name):
    """
    Delete all of the current and historical claims by this instance.
    """
    return await claim_coll(mongo_db).delete_many({SERVICE_FIELD: service, INSTANCE_FIELD: instance_name})


async def get_previous_claim(mongo_db, collection, service, instance_name):
    """
    Returns the most recent claim for this instance for the given collection.  This can include the
    initial indexing claim, which will have a resume token that is None.
    """
    return await claim_coll(mongo_db).find_one(
        {COLLECTION_FIELD: collection, SERVICE_FIELD: service, INSTANCE_FIELD: instance_name},
        sort=[(TIMESTAMP_FIELD, pymongo.DESCENDING)],
    )


async def watch_collection(mongo_db, collection, service, instance_name):
    """
    Watch a single collection for changes using the Mongo change stream.  It
    first checks for a previous claim for this instance so that it can get the
    resume token to use if picking back up from a previous run.  It also
    completes the previously claimed change if the previous watcher crashed.

    :param service: A common name for a set of instances that are all watching together.  For a
      given service name, instance_name *MUST* be unique across all instances.  Specifying service
      allows multiple apps watching the same collections completely independently.
    """
    watch_logger = FieldLogger(
        logger, {"collection": collection, "service": service, "instance_name": instance_name}
    )

    await ensure_unique_index(mongo_db)

    last_claim = await get_previous_claim(mongo_db, collection, service, instance_name)

    last_was_completed = False
    if last_claim:
        watch_logger.info("Resuming watch")
        resume_token = last_claim[CHANGE_FIELD]["_id"]
        last_was_completed = last_claim[COMPLETED_FIELD]
    else:
        watch_logger.info("No previous state found")
        resume_token = None

    async with mongo_db[collection].watch(resume_after=resume_token, full_document="updateLookup") as stream:
        # This means the last job run didn't finish successfully before this
        # instance shutdown, so rerun it.
        if resume_token and not last_was_completed:
            watch_logger.info("Last change did not complete before shutdown, reindexing")
            last_change = last_claim[CHANGE_FIELD]
            assert last_change["_id"] == resume_token

            yield last_change
            await mark_claim_completed(mongo_db, last_claim["_id"])
        # This covers the cases where we need to consider an initial indexing, whenever there are no
        # claims or the last claim didn't have a resume token because it is an initial indexing
        # claim that didn't complete.
        elif (not resume_token or not last_claim) and not last_was_completed:
            claim_id = await attempt_to_claim_initial_watch(mongo_db, collection, service, instance_name)
            if claim_id:
                watch_logger.info("got claim, is now initial lead watcher")
                yield INITIAL_LEAD_WATCHER
                await mark_claim_completed(mongo_db, claim_id)
            else:
                watch_logger.info("Waiting for another instance to complete lead watch initialization")
                await wait_for_initial_watch_complete(mongo_db, service, collection)

        async for change in process_stream(
            mongo_db, collection, stream, service, instance_name, watch_logger
        ):
            yield change


# pylint:disable=too-many-arguments
async def process_stream(mongo_db, collection, stream, service, instance_name, watch_logger):
    """
    Process each change in the given stream, trying to claim the change first
    and moving on to the next change immediately if a change cannot be claimed.
    """
    logger.info("Starting to watch change stream for %s", collection)
    async for change in stream:
        assert collection == change["ns"]["coll"], "collections did not match up"

        if change["operationType"] == "invalidate":
            watch_logger.info("Collection was invalidated")
            # If a collection gets invalidated then wipe any prior claims
            # so it doesn't try to resume from them.
            await delete_claims_for_instance(mongo_db, service, instance_name)
            return

        watch_logger.info("Saw change on doc %s", change["documentKey"]["_id"])

        claim_id = await attempt_to_claim_change(mongo_db, change, service, instance_name)
        if claim_id:
            watch_logger.info("Claimed change for doc %s", change["documentKey"]["_id"])

            try:
                yield change
                watch_logger.info("Document %s processed", change["documentKey"]["_id"])
            except CancelledError:
                await mark_claim_completed(mongo_db, claim_id)
                raise

            await mark_claim_completed(mongo_db, claim_id)
        else:
            watch_logger.info("Unable to claim change for %s", change["documentKey"]["_id"])
