"""
Bladen County, NC
"""
from remtaxinfo.util.adapter import adapter
from remtaxinfo.util.models import TaxPropInfo, TaxBill


@adapter(county="Bladen", state="NC")
class BladenNCTaxInfo:
    """
    Main site: http://bladen.ustaxdata.com
    """

    async def get_latest_property_info(self, pin_number: str, http_session) -> TaxPropInfo:
        return TaxPropInfo()

    async def get_tax_bill(self, pin_number: str, tax_year: int, http_session) -> TaxBill:
        return TaxBill()
