import os
from typing import Any, Dict, Tuple, Type

from typing_extensions import Protocol

from remcommon.models_gen import ParcelDatum

from . import exceptions, util
from .shapefile import (
    get_feature_fields_as_dict,
    get_features_by_field,
    get_geometry_as_wgs84_wkt,
    load_shapefile,
)

REGISTERED_ADAPTERS = dict()
SHAPEFILE_BASE_DIR = os.environ["SHAPEFILE_BASE"]


class Adapter(Protocol):
    county: str
    state: str
    parcel_shapefile: str
    pin_field: str

    @staticmethod
    def normalize_pin(pin_number: str) -> str:
        ...

    @staticmethod
    def owner_name_from_parcel_fields(fields: Dict[Any, Any]) -> str:
        ...

    @staticmethod
    def acreage_from_parcel_fields(fields: Dict[Any, Any]) -> float:
        ...

    @staticmethod
    def street_address_from_parcel_fields(fields: Dict[Any, Any]) -> str:
        ...


def register(cls):
    inst = cls()
    REGISTERED_ADAPTERS[(inst.county.lower(), inst.state.lower())] = inst


def register_adapter(adapter: Type[Adapter]):
    register(adapter)
    return adapter


def county_shapefile_dir(county, state):
    return os.path.join(SHAPEFILE_BASE_DIR, state, "counties", county.title())


def shapefile_path(county, state, shapefile_name):
    return os.path.join(county_shapefile_dir(county, state), shapefile_name)


def get_county_adapter(county: str, state: str) -> Adapter:
    adapter = REGISTERED_ADAPTERS.get((county.lower(), state.lower()))
    if not adapter:
        raise exceptions.NoAdapterError("%s County, %s not registered" % (county, state))

    return adapter


def get_parcel_data_by_pin(county: str, state: str, pin_number: str) -> Tuple[str, ParcelDatum]:
    adapter = get_county_adapter(county, state)

    data_source = load_shapefile(shapefile_path(adapter.county, adapter.state, adapter.parcel_shapefile))

    clean_pin = adapter.normalize_pin(pin_number)

    parcel_data = ParcelDatum()

    features = get_features_by_field(data_source, adapter.pin_field, clean_pin)

    wkts = []
    for feature in features:
        fields = get_feature_fields_as_dict(feature)

        parcel_data.owner_name = adapter.owner_name_from_parcel_fields(fields)
        parcel_data.acreage = adapter.acreage_from_parcel_fields(fields)
        parcel_data.street_address = adapter.street_address_from_parcel_fields(fields)

        wkts.append(get_geometry_as_wgs84_wkt(feature))

    parcel_data.boundary_wkt = util.merge_wkts(wkts)
    return (clean_pin, parcel_data)
