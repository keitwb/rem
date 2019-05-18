"""
Bladen County, NC
"""
from bs4 import BeautifulSoup

from remtaxinfo.util.adapter import adapter, PinNotFoundError
from remtaxinfo.util.models import TaxPropInfo, TaxBill


@adapter(county="Bladen", state="NC")
class BladenNCTaxInfo:
    """
    Main site: http://bladen.ustaxdata.com
    """

    async def get_latest_property_info(self, pin_number: str, http_session) -> TaxPropInfo:
        return TaxPropInfo()

    @staticmethod
    async def lookup_parcel_id_from_pin(pin_number: str, http_session) -> str:
        pin_stripped = pin_number.replace("-", "")
        if len(pin_stripped) < 9:
            raise PinNotFoundError(f"PIN {pin_number} is too short")

        mapnum, submap, block, parcel = [
            pin_stripped[:4],
            pin_stripped[4:6],
            pin_stripped[6:8],
            pin_stripped[8:],
        ]
        async with http_session.get(
            "http://bladen.ustaxdata.com/list.cfm?"
            f"lastName=&firstName=&businessName=&streetNumber=&StreetName=&accountNum=&parcelNum="
            f"&mapNumber={mapnum}&submapNumber={submap}&blockNumber={block}&parcelNumber={parcel}"
            "&Submit=Search"
        ) as resp:
            doc = BeautifulSoup(await resp.text(), features="lxml")

    @staticmethod
    async def fetch_property_sheet(parcel_id, tax_year, http_session):
        async with http_session.get(
            f"http://http://bladen.ustaxdata.com/print.cfm?parcelID={parcel_id}"
        ) as resp:
            return BeautifulSoup(await resp.text(), features="lxml")

    async def get_tax_bill(self, pin_number: str, tax_year: int, http_session) -> TaxBill:
        return TaxBill()
