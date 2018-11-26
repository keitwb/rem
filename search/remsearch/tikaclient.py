"""
Logic for interacting with Tika, which is used to extract text from documents
"""


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
