"""
Logic to modify Mongo documents before inserting them into Elasticsearch
"""

from copy import deepcopy
from datetime import datetime
from typing import Any

from bson.objectid import ObjectId

from remcommon import fieldnames_gen as fieldnames
from remcommon.models_gen import CollectionName


def transform(index: str, doc: Any) -> Any:
    transformer = TRANSFORMERS_BY_INDEX.get(index)

    doc_copy = deepcopy(doc)
    doc_copy = convert_types(doc_copy)

    if not transformer:
        return doc_copy
    # Transformers are expected to return the value to use in indexing.  They are free to mutate the
    # input instance if desired.
    return transformer(doc_copy)


def convert_types(doc: Any) -> Any:
    if isinstance(doc, list):
        return [convert_types(v) for v in doc]

    if isinstance(doc, dict):
        return dict({k: convert_types(v) for k, v in doc.items()})

    if isinstance(doc, ObjectId):
        return str(doc)

    if isinstance(doc, datetime):
        return doc.isoformat()

    return doc


def prepare_property_for_es(prop: Any) -> Any:
    prop[fieldnames.PROPERTY_PARCEL_DATA] = list(prop.get(fieldnames.PROPERTY_PARCEL_DATA, {}).values())
    return prop


TRANSFORMERS_BY_INDEX = {CollectionName.PROPERTIES.value: prepare_property_for_es}
