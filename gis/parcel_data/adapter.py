import os

from .shapefile import (
    get_feature_fields_as_dict,
    get_feature_by_field,
    get_geometry_as_wgs84_wkt,
    load_shapefile,
)
from . import exceptions

import gis_pb2

registered_adapters = dict()
shapefile_base_dir = os.environ['SHAPEFILE_BASE']

def register(cls):
    inst = cls()
    registered_adapters[(inst.county, inst.state)] = inst


class AdapterMeta(type):
    def __new__(cls, clsname, bases, attrs):
        newclass = super(AdapterMeta, cls).__new__(cls, clsname, bases, attrs)
        register(newclass)
        return newclass


def county_shapefile_dir(county, state):
    return os.path.join(shapefile_base_dir, state, "counties", county.title())

def shapefile_path(county, state, shapefile_name):
    return os.path.join(county_shapefile_dir(county, state), shapefile_name)

def get_county_adapter(county, state):
    adapter = registered_adapters.get((county, state)) 
    if not adapter:
        raise exceptions.NoAdapterError("%s County, %s not registered" % (county, state))

    return adapter

def get_parcel_data_by_pin(county, state, pin_number):
    adapter = get_county_adapter(county, state)

    data_source = load_shapefile(shapefile_path(
        adapter.county, adapter.state, adapter.parcel_shapefile))

    clean_pin = adapter.cleanup_pin(pin_number)
    feature = get_feature_by_field(data_source, adapter.pin_field, clean_pin)

    fields = get_feature_fields_as_dict(feature)

    parcel_data = gis_pb2.ParcelData()

    parcel_data.pin_number = clean_pin
    parcel_data.owner_name = adapter.owner_name_from_parcel_fields(fields)
    parcel_data.acreage = adapter.acreage_from_parcel_fields(fields)
    parcel_data.street_address = adapter.street_address_from_parcel_fields(fields)
    parcel_data.boundary_polygon_wkt = get_geometry_as_wgs84_wkt(feature)

    return parcel_data
