"""
Support for better logging
"""
import logging


class FieldLogger(logging.LoggerAdapter):
    """
    Basic logging adapter that adds the extra fields after the log message in square brackets
    """

    def process(self, msg, kwargs):
        prefix = "["
        for k, v in self.extra.items():
            prefix += f"{k}={v}"
        prefix += "] "

        return prefix + msg, kwargs
