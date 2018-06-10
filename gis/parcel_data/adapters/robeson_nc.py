from parcel_data.adapter import AdapterMeta

class RobesonNCAdapter(metaclass=AdapterMeta):
    county = 'Robeson'
    state = 'NC'

    parcel_shapefile = 'Parcelsw_Ownership092017.shp'
    pin_field = 'PIN_NUMBER'
    
    @staticmethod
    def normalize_pin(pin):
        return pin.replace('-', '')

    @staticmethod
    def owner_name_from_parcel_fields(fields):
        return "%s %s %s" % (
            fields['OWNAM1'],
            fields['OWNAM2'],
            fields['OWNAM3']).strip()

    @staticmethod
    def acreage_from_parcel_fields(fields):
        return fields['CALCULATED']

    @staticmethod
    def street_address_from_parcel_fields(fields):
        return fields['PHYSTRADR']
