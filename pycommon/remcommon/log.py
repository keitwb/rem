"""
Support for better logging
"""
import logging


class FieldLogger(logging.LoggerAdapter):
    """
    Basic logging adapter that adds the extra fields after the log message in square brackets
    """

    def process(self, msg, kwargs):
        suffix = " [" + "; ".join([f"{k}={v}" for k, v in self.extra.items()]) + "]"

        return msg + suffix, kwargs

    def copy(self, **kwargs):
        new_extra = self.extra.copy()
        new_extra.update(kwargs)
        return FieldLogger(self.logger, new_extra)
