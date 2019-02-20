"""
Constants related to the Mongo fields and app options
"""
import os

MAX_CONCURRENT_FETCHES = int(os.environ.get("MAX_CONCURRENT_FETCHES", 100))
