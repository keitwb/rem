"""
Common protocols
"""
from typing import Optional
from typing_extensions import Protocol

from remcommon.models_gen import TaxPropInfo, TaxBill


# pylint:disable=all
class AdapterProtocol(Protocol):
    async def get_latest_property_info(self, pin_number: str, http_session) -> TaxPropInfo:
        ...

    async def get_tax_bill(self, pin_number: str, tax_year: int, http_session) -> TaxBill:
        ...
