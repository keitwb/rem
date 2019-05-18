"""
Common protocols
"""
from typing import Optional

from remcommon.models_gen import TaxBill, TaxPropInfo
from typing_extensions import Protocol


# pylint:disable=all
class AdapterProtocol(Protocol):
    async def get_latest_property_info(self, pin_number: str, http_session) -> TaxPropInfo:
        ...

    async def get_tax_bill(self, pin_number: str, tax_year: int, http_session) -> TaxBill:
        ...
