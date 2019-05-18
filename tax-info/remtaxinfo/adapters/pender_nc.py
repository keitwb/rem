"""
Pender County, NC
"""
from bs4 import BeautifulSoup
from remtaxinfo.util.adapter import PinNotFoundError, adapter
from remtaxinfo.util.models import TaxBill, TaxPropInfo


@adapter(county="Pender", state="NC")
class PenderNCTaxInfo:
    async def get_latest_property_info(self, pin_number: str, http_session) -> TaxPropInfo:
        pass

    async def get_tax_bill(self, pin_number: str, tax_year: int, http_session) -> TaxBill:
        pass
