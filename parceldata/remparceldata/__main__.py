import asyncio
import logging

from .app import app

FORMAT = "%(asctime)-15s %(levelname)s %(module)s: %(message)s"
logging.basicConfig(level=logging.INFO, format=FORMAT)

loop = asyncio.get_event_loop()
loop.run_until_complete(app.create_server(host="0.0.0.0", port=8080, return_asyncio_server=True))
loop.run_forever()
