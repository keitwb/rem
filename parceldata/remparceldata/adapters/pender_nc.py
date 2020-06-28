from remparceldata.adapter import register_adapter


@register_adapter
class PenderNCAdapter:
    county = "Pender"
    state = "NC"

    parcel_shapefile = "Parcels.shp"
    pin_field = "PIN"

    @staticmethod
    def normalize_pin(pin):
        return pin.replace("-", "").strip()

    @staticmethod
    def owner_name_from_parcel_fields(fields):
        return fields["NAME"]

    @staticmethod
    def acreage_from_parcel_fields(fields):
        return fields["CALCACRES"]

    @staticmethod
    def street_address_from_parcel_fields(fields):
        return fields["PROPERTY_A"]
