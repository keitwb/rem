"""
Runs the server
"""
import asyncio
import os

from .updates import start_server

asyncio.get_event_loop().run_until_complete(
    start_server(
        mongo_loc=(os.environ.get('MONGO_HOSTNAME', "mongo"), int(os.environ.get('MONGO_PORT', '27017'))),
        db_name=os.environ.get("MONGO_DATABASE", "rem")))

asyncio.get_event_loop().run_forever()
