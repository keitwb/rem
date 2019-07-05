import os
from dataclasses import dataclass
from typing import Optional

from . import exceptions, util
from .shapefile import (
    get_feature_fields_as_dict,
    get_features_by_field,
    get_geometry_as_wgs84_wkt,
    load_shapefile,
)

REGISTERED_ADAPTERS = dict()
SHAPEFILE_BASE_DIR = os.environ["SHAPEFILE_BASE"]


def register(cls):
    inst = cls()
    REGISTERED_ADAPTERS[(inst.county.lower(), inst.state.lower())] = inst


class AdapterMeta(type):
    def __new__(mcs, clsname, bases, attrs):
        newclass = super(AdapterMeta, mcs).__new__(mcs, clsname, bases, attrs)
        register(newclass)
        return newclass


def county_shapefile_dir(county, state):
    return os.path.join(SHAPEFILE_BASE_DIR, state, "counties", county.title())


def shapefile_path(county, state, shapefile_name):
    return os.path.join(county_shapefile_dir(county, state), shapefile_name)


def get_county_adapter(county, state):
    adapter = REGISTERED_ADAPTERS.get((county.lower(), state.lower()))
    if not adapter:
        raise exceptions.NoAdapterError("%s County, %s not registered" % (county, state))

    return adapter


@dataclass
class ParcelData:
    pin_number: Optional[str] = None
    owner_name: Optional[str] = None
    acreage: Optional[float] = None
    street_address: Optional[str] = None
    boundary_wkt: Optional[str] = None


def get_parcel_data_by_pin(county, state, pin_number):
    adapter = get_county_adapter(county, state)

    data_source = load_shapefile(shapefile_path(adapter.county, adapter.state, adapter.parcel_shapefile))

    clean_pin = adapter.normalize_pin(pin_number)

    parcel_data = ParcelData()

    features = get_features_by_field(data_source, adapter.pin_field, clean_pin)

    wkts = []
    for feature in features:
        fields = get_feature_fields_as_dict(feature)

        parcel_data.pin_number = clean_pin
        parcel_data.owner_name = adapter.owner_name_from_parcel_fields(fields)
        parcel_data.acreage = adapter.acreage_from_parcel_fields(fields)
        parcel_data.street_address = adapter.street_address_from_parcel_fields(fields)

        wkts.append(get_geometry_as_wgs84_wkt(feature))

    parcel_data.boundary_wkt = util.merge_wkts(wkts)
    return parcel_data
