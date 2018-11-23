"""
Runs the server
"""
import asyncio
import logging
import os
import signal

from .core import start_server

FORMAT = '%(asctime)-15s %(levelname)s %(module)s: %(message)s'
logging.basicConfig(level=logging.INFO, format=FORMAT)


async def run():
    """
    Run the server with graceful shutdown
    """
    # The stop condition is set when receiving SIGTERM.
    stop = asyncio.Future()
    asyncio.get_event_loop().add_signal_handler(signal.SIGTERM, stop.set_result, None)

    async with start_server(
            mongo_loc=(os.environ.get('MONGO_HOSTNAME', "mongo"), int(os.environ.get('MONGO_PORT', '27017'))),
            es_hosts=[{
                "host": os.environ.get("ES_HOST", "es"),
                "port": int(os.environ.get("ES_PORT", 9200)),
            }], db_name=os.environ.get("MONGO_DATABASE", "rem")):
        await stop


asyncio.get_event_loop().run_until_complete(run())
