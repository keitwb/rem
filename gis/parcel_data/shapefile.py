from osgeo import ogr, osr

from parcel_data import exceptions
from .util import single_quote_if_string

ogr.UseExceptions()

shapefile_cache = dict()

def load_shapefile(path):
    if shapefile_cache.get(path):
        return shapefile_cache[path]

    ds = ogr.Open(path)
    if ds is None:
        raise ValueError("Path %s could not be loaded" % path)

    shapefile_cache[path] = ds
    return ds


def get_features_by_field(data_source, field_name, field_value):
    layer = data_source.GetLayer()

    value = single_quote_if_string(field_value)
    # String values have to be single quoted
    layer.SetAttributeFilter("%s = %s" % (field_name,
                                          value))

    features = [f for f in layer]

    if not features:
        raise exceptions.NoFeatureError("%s = %s in data source %s" % (field_name, value,
                                                            data_source.GetName()))

    return features


def get_feature_fields_as_dict(feature):
    fields = dict()

    for i in range(0, feature.GetFieldCount()):
        definition = feature.GetFieldDefnRef(i)
        fields[definition.GetName()] = feature.GetField(i)

    return fields


wgs84_proj = osr.SpatialReference()
wgs84_proj.ImportFromEPSG(4326)

def get_geometry_as_wgs84_wkt(feature):
    geo = feature.geometry()
    source = geo.GetSpatialReference()
    wgs84_transform = osr.CoordinateTransformation(source, wgs84_proj)

    geo.Transform(wgs84_transform)

    return geo.ExportToWkt()
