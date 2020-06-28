"""
Support for converting PyMongo objects to and from JSON for sending through websockets
"""
import ujson

import bsonjs
from bson import json_util
from bson.objectid import ObjectId


class BSONDocForJSON:
    """
    This wraps a BSON doc from PyMongo and makes it automatically encoded to JSON when used in a
    larger JSON document.
    """

    __slots__ = ["raw_doc"]

    def __init__(self, raw_doc: bytes):
        self.raw_doc = raw_doc

    def __json__(self):
        return bsonjs.dumps(self.raw_doc)


def maybe_convert_to_object_id(oid):
    """
    Converts a plain hex string or dict of the form {"$oid": "id"} to a formal ObjectId.
    """
    if isinstance(oid, str):
        return ObjectId(oid)

    if isinstance(oid, dict) and "$oid" in oid:
        return ObjectId(oid["$oid"])

    return oid


class JSONEncoder:
    """
    Makes JSON encoding/decoding match the interface for bson
    """

    @staticmethod
    def encode(obj):
        """
        Encodes an object to JSON.  Any elements that contain BSON classes should be wrapped in
        BSONDocForJSON above.
        """
        return ujson.dumps(obj)

    @staticmethod
    def decode(data):
        """
        Decodes a JSON string using the Mongo extended JSON decoder (to handle things like $oid
        fields)
        """
        return json_util.loads(data)
