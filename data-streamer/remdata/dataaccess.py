"""
Logic related to altering the main Mongo store
"""
import logging
from datetime import datetime

import pymongo

from remcommon import fieldnames_gen as fields
from remcommon.models_gen import CollectionName

from .json import BSONDocForJSON, maybe_convert_to_object_id

logger = logging.getLogger(__name__)

ALLOWED_COLLECTIONS = [
    CollectionName.PROPERTIES.value,
    CollectionName.NOTES.value,
    CollectionName.LEASES.value,
    CollectionName.MEDIA_FILES.value,
    CollectionName.USERS.value,
    CollectionName.PARTIES.value,
    CollectionName.INSURANCE_POLICIES.value,
]


async def handle_data_access(mongo_db, message):
    """
    Process a single message from the client
    """
    coll_name = message.get("collection")
    if coll_name not in ALLOWED_COLLECTIONS:
        await message.send_error(f"Access to collection '{coll_name}' not supported")
        return

    collection = mongo_db[coll_name]

    action = message.get("action")
    if not action:
        await message.send_error("You must specify an action")
        return

    error = None
    if action == "getByIds":
        error = await do_get_by_id(collection, message)
    elif action == "upsert":
        error = await do_upsert(collection, message)
    else:
        error = f"Unknown action: {action}"

    if error:
        message.logger.error(error)
        await message.send_error(error)


async def do_get_by_id(collection, message):
    """
    Get the documents reqested in the message and push them back to the client.
    """
    logger.info("Finding by ids: %s", message.get("ids"))
    cursor = collection.find(
        {"_id": {"$in": [maybe_convert_to_object_id(oid) for oid in message.get("ids", [])]}}
    )
    cursor.max_time_ms(5000)
    cursor.max_await_time_ms(5000)

    try:
        prev_doc = None
        logger.debug("Preparing to iterate cursor")
        async for doc in cursor:
            logger.debug("Got doc in cursor: %s", doc["_id"])
            if prev_doc:
                await message.send_response({"doc": BSONDocForJSON(prev_doc.raw)}, last_message=False)
            prev_doc = doc

        if prev_doc:
            await message.send_response({"doc": BSONDocForJSON(prev_doc.raw)}, last_message=True)
        else:
            await message.send_error("No results found")
    except pymongo.errors.PyMongoError as e:
        return f"Error querying Mongo: {str(e)}"
    finally:
        await cursor.close()


async def do_upsert(collection: pymongo.collection.Collection, message):
    """
    Update a doc in Mongo or creates it if not present.
    """
    _filter = message.get("filter", {})
    _id = message.get("id")
    if _id is None and not _filter:
        return "id or filter must be provided"

    if _id:
        _filter["_id"] = _id

    updates = message.get("updates", {})

    now = datetime.now()
    if fields.MONGO_DOC_CREATED_DATE not in updates.get("$set", {}):
        updates["$setOnInsert"] = updates.get("$setOnInsert", {})
        updates["$setOnInsert"][fields.MONGO_DOC_CREATED_DATE] = now

    if fields.MONGO_DOC_MODIFIED_DATE not in updates.get("$set", {}):
        updates["$set"] = updates.get("$set", {})
        updates["$set"][fields.MONGO_DOC_MODIFIED_DATE] = now

    try:
        message.logger.debug(f"Updating {_id} with {updates}")
        res = await collection.update_one(_filter, updates, upsert=True)
        message.logger.debug(f"Result of update: {str(res)}")
    except (TypeError, pymongo.errors.PyMongoError) as e:
        return f"Could not upsert doc: {str(e)}"

    await message.send_response(
        {"modifiedCount": res.modified_count, "upsertedId": {"$oid": str(res.upserted_id or _id)}}
    )
