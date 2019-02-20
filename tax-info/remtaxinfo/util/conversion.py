"""
Utilities to help converting data from external sites to our desired target format.
"""
from typing import Optional


def parse_currency_to_cents(amount: Optional[str]) -> Optional[int]:
    """
    Takes a string amount of currency (e.g. "10456.54") and converts it to cents (e.g. 1045654). It
    should also handle strings with commas separating the thousands.
    """
    if amount is None:
        return None

    try:
        return int(round(float(amount.replace(",", "")) * 100))
    except ValueError:
        return None
