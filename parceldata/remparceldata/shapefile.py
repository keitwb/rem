from typing import Any, Dict

from osgeo import ogr, osr

from . import exceptions
from .util import single_quote_if_string

ogr.UseExceptions()

SHAPEFILE_CACHE: Dict[str, Any] = dict()


def load_shapefile(path):
    """
    Loads a shapefile into memory, if not already, and returns the object representing it.
    """
    if path in SHAPEFILE_CACHE:
        return SHAPEFILE_CACHE[path]

    ds = ogr.Open(path)
    if ds is None:
        raise ValueError("Path %s could not be loaded" % path)

    SHAPEFILE_CACHE[path] = ds
    return ds


def get_features_by_field(data_source, field_name, field_value):
    """
    Get features by a field name/value query.
    """
    layer = data_source.GetLayer()

    value = single_quote_if_string(field_value)
    # String values have to be single quoted
    layer.SetAttributeFilter("%s = %s" % (field_name, value))

    features = [f for f in layer]

    if not features:
        raise exceptions.NoFeatureError(
            "%s = %s in data source %s" % (field_name, value, data_source.GetName())
        )

    return features


def get_feature_fields_as_dict(feature):
    """
    Convert a feature's fields to a dictionary so it is more convenient to use.
    """
    fields = dict()

    for i in range(0, feature.GetFieldCount()):
        definition = feature.GetFieldDefnRef(i)
        fields[definition.GetName()] = feature.GetField(i)

    return fields


WGS84_PROJ = osr.SpatialReference()
WGS84_PROJ.ImportFromEPSG(4326)


def get_geometry_as_wgs84_wkt(feature):
    """
    Returns a feature's geometry as WKT using lat/long coordinates (WGS84).
    """
    geo = feature.geometry()
    source = geo.GetSpatialReference()
    wgs84_transform = osr.CoordinateTransformation(source, WGS84_PROJ)

    geo.Transform(wgs84_transform)

    return geo.ExportToWkt()
