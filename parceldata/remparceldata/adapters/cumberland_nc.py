from remparceldata.adapter import register_adapter


@register_adapter
class CumberlandNCAdapter:
    county = "Cumberland"
    state = "NC"

    parcel_shapefile = "cc_parcels.shp"
    pin_field = "NAD83_PIN"

    @staticmethod
    def normalize_pin(pin):
        pin = pin.strip()
        # Cumberland county pins have a trailing dash
        return pin + "-" if not pin.endswith("-") else pin

    @staticmethod
    def owner_name_from_parcel_fields(fields):
        return fields["OWNER_NAME"]

    @staticmethod
    def acreage_from_parcel_fields(fields):
        return fields["ACRE"]

    @staticmethod
    def street_address_from_parcel_fields(fields):
        return "%s %s %s" % (fields["SITUS_NUM"].lstrip("0"), fields["SITUS_NAME"], fields["SITUS_SUFI"])
