from parcel_data.adapter import AdapterMeta

class BladenNCAdapter(metaclass=AdapterMeta):
    county = 'Bladen'
    state = 'NC'

    parcel_shapefile = 'Tax Parcels.shp'
    pin_field = 'PIN'

    @staticmethod
    def cleanup_pin(pin):
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
