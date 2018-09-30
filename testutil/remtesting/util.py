import asyncio
from functools import partial as p


def asyncify(*args, **kwargs):
    """
    Runs any normal function in an executor in the current event loop
    """
    return p(asyncio.get_event_loop().run_in_executor, None, p(*args, **kwargs))
