import datetime

import aiohttp
import pytest
from remcommon.models_gen import LineItem, Payment, TaxPropInfo, TaxBill

from remtaxinfo.util.adapter import PinNotFoundError
from ..cumberland_nc import CumberlandNCTaxInfo
from .fixtures import load_fixture


@pytest.mark.asyncio
async def test_property_info(aresponses):
    aresponses.add(
        "152.31.99.19",
        "/d21lib/www/SWMW200.CGI?PARCEL=123-456-7890-&TXYEAR=2018",
        "get",
        load_fixture("cumberland_nc_property_sheet.html"),
        match_querystring=True,
    )

    prop_info = await CumberlandNCTaxInfo().get_latest_property_info("123-456-7890-", aiohttp.ClientSession())

    assert prop_info == TaxPropInfo(
        owner_name="JOHN SMITH",
        owner_address="123 MAIN ST HOPE MILLS NC 28348",
        situs_address="123 OAK ST",
        tax_district="2000 HOPE MILLS",
        property_class="RESIDENTIAL",
        neighborhood="0383",
        zoning="R10  -",
        legal_description="OLD MILLER HOUSE",
        total_appraised_cents=8_370_000,
        land_appraised_cents=1_400_000,
        building_appraised_cents=6_855_300,
        misc_appraised_cents=114_700,
        assessment_date=datetime.datetime(2017, 1, 1, 0, 0),
    )


@pytest.mark.asyncio
async def test_missing_property_info(aresponses):
    aresponses.add(
        "152.31.99.19",
        "/d21lib/www/SWMW200.CGI?PARCEL=123-456-7890-&TXYEAR=2018",
        "get",
        load_fixture("cumberland_nc_missing_property_sheet.html"),
        match_querystring=True,
    )

    with pytest.raises(PinNotFoundError):
        await CumberlandNCTaxInfo().get_latest_property_info("123-456-7890-", aiohttp.ClientSession())


@pytest.mark.asyncio
async def test_tax_bill(aresponses):
    aresponses.add(
        "152.31.99.19",
        "/d21lib/www/SWMW100.CGI?TXYEAR=2018&PARCEL=123-456-7890-",
        "get",
        load_fixture("cumberland_nc_tax_bill.html"),
        match_querystring=True,
    )

    tax_bill = await CumberlandNCTaxInfo().get_tax_bill("123-456-7890-", 2018, aiohttp.ClientSession())

    print(tax_bill)
    assert tax_bill == TaxBill(
        line_items=[
            LineItem("COUNTY WIDE", 66876),
            LineItem("RECREATION", 4185),
            LineItem("HOPE MILLS", 38502),
            LineItem("HM REFUSE TX", 21600),
            LineItem("HM STRWRES", 4800),
            LineItem("SW USER FEE", 5600),
        ],
        payments=[
            Payment(amount_cents=41563, payment_date=datetime.datetime(2018, 9, 24)),
            Payment(amount_cents=50000, payment_date=datetime.datetime(2018, 10, 31)),
            Payment(amount_cents=50000, payment_date=datetime.datetime(2018, 12, 12)),
        ],
        total_assessed_cents=8_370_000,
        land_assessed_cents=0,
        building_assessed_cents=None,
        misc_assessed_cents=None,
    )
