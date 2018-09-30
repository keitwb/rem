# Data Store

The frontend webapp needs some way of accessing the core Mongo store that acts as the canonical
source of truth.  This app acts as a "data access layer" that mediates all queries and updates from
the frontend.

There are two paths that can be hit with a websocket connection:

## Data Access

Path: `/db`

This supports basic CRUD operations (technically not delete though).

After establishing a websocket connection the following JSON-encoded messages can be sent:

### Get By Id:

   ```
   {
     "action": "getByIds",
     "reqID": "abcd",
     "ids": ["id1", "id2", ...]
   }
   ```

`ids` can consist of formal ObjectIds (`{$oid: "abcdef0123456789"}`) or just the plain hex string
that is traditionally used to encode the id.


### Request ID
All action requests can include the `reqID` field that will be repeated back in all subsequent
responses relating to that request to allow correlation client-side.

### Searching

Path: `/search`

For more complex queries, ElasticSearch should be used.  This `/db` endpoint can only fetch by ids.

``` 
{
  "index": "properties"  // Defaults to _all if not specified
  "query": {
     multi_match: {
       query: "hello",
     },
  }
}
```

The `query` field can be any ES query.


## Change Stream

Path: `/changes`

This streams updates from Mongo to a websocket connection.  It is useful for maintaining up-to-date
state in the webapp based on changes both from other users and backend services as well as from the
active user that is watching with the websocket.

It is written for Python 3.7+ and supports as many instances as needed.

## Development

See [Python](../README.md#python).
