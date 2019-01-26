"""
Adapter registration and lookup logic
"""
from typing import Callable, Dict, Tuple, Type

from remtaxinfo.util.models import AdapterProtocol

REGISTERED_ADAPTERS: Dict[Tuple[str, str], AdapterProtocol] = dict()


class AdapterNotFoundError(RuntimeError):
    """
    Indicates that an adapter could not be found for a certain locality
    """


class PinNotFoundError(RuntimeError):
    """
    Raised if the given parcel PIN is invalid or does not exist.
    """


def adapter(county, state) -> Callable[[Type[AdapterProtocol]], Type[AdapterProtocol]]:
    """
    A decorator factory that registers the target adapter class with the given locality
    """

    def decorator(cls: Type[AdapterProtocol]):
        inst = cls()
        REGISTERED_ADAPTERS[(county, state)] = inst
        return cls

    return decorator


def get(county, state) -> AdapterProtocol:
    """
    Returns the adapter for the given locality or raises AdapterNotFoundError if none is registered
    for the locality.
    """
    try:
        return REGISTERED_ADAPTERS[(county, state)]
    except KeyError:
        raise AdapterNotFoundError()
