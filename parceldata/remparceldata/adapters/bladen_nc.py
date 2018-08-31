from remparceldata.adapter import AdapterMeta


class BladenNCAdapter(metaclass=AdapterMeta):
    """
    Adapter for Bladen County, NC
    """
    county = 'Bladen'
    state = 'NC'

    parcel_shapefile = 'TaxParcels.shp'
    pin_field = 'PIN'

    @staticmethod
    def normalize_pin(pin):
        return pin.replace('-', '')

    @staticmethod
    def owner_name_from_parcel_fields(fields):
        return fields['Name1']

    @staticmethod
    def acreage_from_parcel_fields(fields):
        return fields['MapAcres']

    @staticmethod
    def street_address_from_parcel_fields(fields):
        return fields['PhysStreet']
