
from tax_info.adapter import AdapterMeta

class BladenNCTaxInfo(metaclass=AdapterMeta):
    @classmethod
    def get_tax_info_for_parcel(cls, pin_number):

