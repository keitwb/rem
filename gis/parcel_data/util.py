import numbers

from shapely.geometry import MultiPolygon
from shapely.wkt import dumps, loads

def single_quote_if_string(val):
    if not isinstance(val, numbers.Number):
        return "'%s'" % val

    return val


# Flattens multiple polygons into a multipolygon or returns whatever was given
# if there are less than two items in `wkts`.
def merge_wkts(wkts):
    if not wkts:
        return None
    if len(wkts) == 1:
        return wkts[0]

    polygons = []
    for wkt in wkts:
        p = loads(wkt)
        if p.type == 'Polygon':
            polygons.append(p)
        elif p.type == 'MultiPolygon':
            polygons.extend(p.geoms)

    return dumps(MultiPolygon(polygons))
