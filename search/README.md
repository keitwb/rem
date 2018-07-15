# Search Indexer

This is a Python 3 service that watches the core Mongo collections for changes and indexes documents into
ElasticSearch (ES).  ES is the primary search service for the frontend.

The core logic of the service is in [./remsearch/watch.py](./remsearch/watch.py) where there is more
detailed documentation.

The service is designed with the ability to run with multiple instances to provide fault tolerance
and maybe quicker indexing speeds with large bursts of updates. 
