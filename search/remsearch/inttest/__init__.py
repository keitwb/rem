"""
Integration tests for the search indexer service
"""
import os

# This is essential for testing a large number of instances in parallel.  Each instance of the
# updater uses at least 5 worker threads since Motor basically just calls PyMongo methods in
# separate threads and does not really use async sockets.
os.environ["MOTOR_MAX_WORKERS"] = "200"
