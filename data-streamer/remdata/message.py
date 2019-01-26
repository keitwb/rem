"""
Logic for creating a standard message protocol that can be used for all messages in and out of the
websocket server.
"""

import logging

from remcommon.log import FieldLogger

logger = logging.getLogger(__name__)


class SocketMessage:
    """
    Wrapper for a websocket message that has been received
    """

    __slots__ = ["message", "socket", "encoder"]

    def __init__(self, message, socket, encoder):
        self.message = message
        self.socket = socket
        self.encoder = encoder

    @property
    def req_id(self):
        """
        The request id of the original message.  This can be used to correlate response messages.
        """
        return self.message.get("reqID")

    async def send_response(self, message, last_message=True):
        """
        Sends a response with the appropriate request id back to the client
        """
        message["reqID"] = self.req_id
        message["hasMore"] = not last_message
        await self.socket.send(self.encoder.encode(message))
        self.logger.info("Completed request")

    async def send_error(self, error_msg, **extra):
        """
        Sends an error message and optional additional info back to the client
        """
        extra["error"] = error_msg
        await self.send_response(extra, True)

    def get(self, key, default=None):
        """
        Returns a key from the original message
        """
        return self.message.get(key, default)

    @property
    def logger(self):
        """
        Returns a logger that will include the request id in the log output
        """
        return FieldLogger(logger, {"reqID": self.req_id})
