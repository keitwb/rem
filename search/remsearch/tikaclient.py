"""
Logic for interacting with Tika, which is used to extract text from documents
"""
from contextlib import asynccontextmanager

import aiohttp


# pylint:disable=too-few-public-methods
class TikaClient:
    """
    Simple HTTP client for Tika
    """

    def __init__(self, session, host, port):
        self.session = session
        self.base_url = "http://%s:%d" % (host, port)

    async def extract_text(self, file_stream):
        """
        Does a request to tika to extract text from the give file stream.
        """
        async with self.session.put("%s/tika" % (self.base_url,), data=file_stream) as resp:
            return await resp.text()


@asynccontextmanager
async def open_tika_client(tika_loc):
    # This is used for mapping files to text through Tika
    async with aiohttp.ClientSession() as http_session:
        yield TikaClient(http_session, host=tika_loc[0], port=tika_loc[1])
