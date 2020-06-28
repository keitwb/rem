import numbers

from shapely.geometry import MultiPolygon
from shapely.wkt import dumps, loads


def single_quote_if_string(val):
    """
    Puts single quotes around non-numeric vals
    """
    if not isinstance(val, numbers.Number):
        return "'%s'" % val

    return val


def merge_wkts(wkts):
    """
    Flattens multiple polygons into a multipolygon or returns whatever was given if there are less
    than two items in `wkts`.
    """
    if not wkts:
        return None
    if len(wkts) == 1:
        return wkts[0]

    polygons = []
    for wkt in wkts:
        poly = loads(wkt)
        if poly.type == "Polygon":
            polygons.append(poly)
        elif poly.type == "MultiPolygon":
            polygons.extend(poly.geoms)  # pylint:disable=no-member

    return dumps(MultiPolygon(polygons))
