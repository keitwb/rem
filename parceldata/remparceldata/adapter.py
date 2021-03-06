import os

from remprotobuf import gis_pb2

from . import exceptions, util
from .shapefile import (get_feature_fields_as_dict, get_features_by_field,
                        get_geometry_as_wgs84_wkt, load_shapefile)

registered_adapters = dict()
shapefile_base_dir = os.environ['SHAPEFILE_BASE']


def register(cls):
    inst = cls()
    registered_adapters[(inst.county, inst.state)] = inst


class AdapterMeta(type):
    def __new__(mcs, clsname, bases, attrs):
        newclass = super(AdapterMeta, mcs).__new__(mcs, clsname, bases, attrs)
        register(newclass)
        return newclass


def county_shapefile_dir(county, state):
    return os.path.join(shapefile_base_dir, state, "counties", county.title())


def shapefile_path(county, state, shapefile_name):
    return os.path.join(county_shapefile_dir(county, state), shapefile_name)


def get_county_adapter(county, state):
    adapter = registered_adapters.get((county, state))
    if not adapter:
        raise exceptions.NoAdapterError(
            "%s County, %s not registered" % (county, state))

    return adapter


def get_parcel_data_by_pin(county, state, pin_number):
    adapter = get_county_adapter(county, state)

    data_source = load_shapefile(
        shapefile_path(adapter.county, adapter.state,
                       adapter.parcel_shapefile))

    clean_pin = adapter.normalize_pin(pin_number)

    pd = gis_pb2.ParcelData()

    features = get_features_by_field(data_source, adapter.pin_field, clean_pin)

    wkts = []
    for feature in features:
        fields = get_feature_fields_as_dict(feature)

        pd.pin_number = clean_pin
        pd.owner_name = adapter.owner_name_from_parcel_fields(fields)
        pd.acreage = adapter.acreage_from_parcel_fields(fields)
        pd.street_address = adapter.street_address_from_parcel_fields(fields)

        wkts.append(get_geometry_as_wgs84_wkt(feature))

    pd.boundary_wkt = util.merge_wkts(wkts)
    return pd
