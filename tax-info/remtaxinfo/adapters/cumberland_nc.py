"""
Cumberland County, NC
"""

import re
from datetime import datetime

from bs4 import BeautifulSoup
from remcommon.models_gen import LineItem, Payment, TaxBill, TaxPropInfo
from remtaxinfo.util.adapter import PinNotFoundError, adapter
from remtaxinfo.util.conversion import parse_currency_to_cents
from remtaxinfo.util.tables import (
    parse_2d_table,
    parse_horizontal_table,
    parse_simple_horizontal_table,
    parse_simple_vertical_table,
)


@adapter(county="Cumberland", state="NC")
class CumberlandNCTaxInfo:
    """
    Main site: http://152.31.99.19/d21lib/www/basearch.htm
    """

    async def get_latest_property_info(self, pin_number: str, http_session) -> TaxPropInfo:
        current_year = datetime.now().year - 1
        property_sheet_doc = await self.fetch_property_sheet(pin_number, current_year, http_session)

        if "REC NOT FOUN" in property_sheet_doc.text:
            raise PinNotFoundError(f"{pin_number}")

        parcel_info = parse_simple_vertical_table(
            property_sheet_doc.find(text=re.compile(r"^\s+Parcel ID:")).find_parent("table")
        )

        tax_value_table = property_sheet_doc.find(text=re.compile("Parcel Taxable Value")).find_parent(
            "table"
        )
        tax_value = parse_simple_horizontal_table(tax_value_table, skip_rows=1, skip_columns=1)

        return TaxPropInfo(
            owner_name=parcel_info.get("Owner Name(s):"),
            owner_address=parcel_info.get("Owner Address:"),
            situs_address=parcel_info.get("Situs Address:"),
            tax_district=parcel_info.get("Taxing District:"),
            property_class=parcel_info.get("Property Class:"),
            neighborhood=parcel_info.get("Neighborhood:"),
            zoning=parcel_info.get("Zoning:"),
            legal_description=parcel_info.get("Legal Description:"),
            total_appraised_cents=parse_currency_to_cents(tax_value.get("Total")),
            land_appraised_cents=parse_currency_to_cents(tax_value.get("Land")),
            building_appraised_cents=parse_currency_to_cents(tax_value.get("Building")),
            misc_appraised_cents=parse_currency_to_cents(tax_value.get("Misc.")),
            assessment_date=datetime.strptime(tax_value.get("Date") or "01/01/2017", "%m/%d/%Y"),
        )

    @staticmethod
    async def fetch_property_sheet(pin_number, tax_year, http_session):
        async with http_session.get(
            f"http://152.31.99.19/d21lib/www/SWMW200.CGI?PARCEL={pin_number}&TXYEAR={tax_year}"
        ) as resp:
            return BeautifulSoup(await resp.text(), features="lxml")

    async def get_tax_bill(self, pin_number: str, tax_year: int, http_session) -> TaxBill:
        tax_sheet_doc = await self.fetch_tax_sheet(pin_number, tax_year, http_session)

        if "PARC 00" in tax_sheet_doc.text:
            raise PinNotFoundError(f"{pin_number}")

        line_item_table = tax_sheet_doc.find(text=re.compile("Authority")).find_parent("table")

        line_items = [
            LineItem(description=li["Description"], amount_cents=parse_currency_to_cents(li["Orig Amount"]))
            for li in parse_horizontal_table(line_item_table)
            if "Orig Amount" in li and "Description" in li
        ]

        values = parse_2d_table(tax_sheet_doc.find(text=re.compile("Assessed:")).find_parent("table"))

        payments = [
            Payment(
                payment_date=datetime.strptime(r["Payment Date"], "%m/%d/%Y")
                if "Payment Date" in r
                else None,
                amount_cents=parse_currency_to_cents(r.get("Paid Amount")),
            )
            for r in parse_horizontal_table(
                tax_sheet_doc.find(text=re.compile("Receipt Type")).find_parent("table")
            )
        ]

        return TaxBill(
            line_items=line_items,
            payments=payments,
            total_assessed_cents=parse_currency_to_cents(values.get("Taxable:", {}).get("Total")),
            land_assessed_cents=parse_currency_to_cents(values.get("Taxable:", {}).get("Land")),
            building_assessed_cents=parse_currency_to_cents(values.get("Taxable:", {}).get("Building")),
            misc_assessed_cents=parse_currency_to_cents(values.get("Taxable:", {}).get("Misc.")),
            due_date=None,
        )

    @staticmethod
    async def fetch_tax_sheet(pin_number, tax_year, http_session):
        async with http_session.get(
            f"http://152.31.99.19/d21lib/www/SWMW100.CGI?TXYEAR={tax_year}&PARCEL={pin_number}"
        ) as resp:
            return BeautifulSoup(await resp.text(), features="lxml")
