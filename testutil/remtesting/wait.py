"""
Logic for waiting for conditions
"""

import asyncio
import time


def wait_for(test_func, timeout_seconds=30):
    """
    Repeatedly call the given test_func and wait for it to return a truish value, at which point
    this function returns that value.  if the test_func doesn't return a truish value by the time
    timeout_seconds has passed, return False.
    """
    start = time.time()
    while True:
        if test_func():
            return True
        if time.time() - start > timeout_seconds:
            return False
        time.sleep(0.2)


async def wait_for_async(test_func, timeout_seconds=30):
    """
    This is the same as `wait_for` above except that it uses an asyncio sleep to avoid blocking the
    main event loop. test_func can be either a coroutine object or a plain func, in which case it
    will be run in an executor to avoid blocking the event loop.
    """
    start = time.time()
    while True:
        res = await test_func()
        if res:
            return res
        if time.time() - start > timeout_seconds:
            return False
        await asyncio.sleep(0.2)


async def wait_for_shutdown(task):
    """
    Cancels an asyncio.Task object and waits for it to finish.  Will block forever if the task
    swallows the CancelledError thrown by asyncio.
    """
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        return
