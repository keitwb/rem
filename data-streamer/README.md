# Data Store

The frontend webapp needs some way of accessing the core Mongo store that acts as the canonical
source of truth.  This app acts as a _data access layer_ that mediates all queries and updates from
the frontend.  It is written for Python 3.7+ and supports as many instances as needed.

There are three paths that can be hit with a websocket connection:

## Data Access

Path: `/db`

This supports basic CRUD operations against the MongoDB primary store (technically not delete though).

After establishing a websocket connection the following JSON-encoded messages can be sent:

### Get By Id:

   ```
   {
     "action": "getByIds",
     "reqID": "abcd",
     "ids": ["id1", "id2", ...]
   }
   ```

`ids` can consist of JSON encoded ObjectIds (`{$oid: "abcdef0123456789"}`) or just the plain hex string
that is the id value.

If `n` ids are specified and `[0, n-1]` docs actually exist, only those docs that exist will be
returned -- it is up to the client to figure out what ids are missing and how to handle that.  If
there are no results, an error response will be returned.

Results are returned as separate WebSocket messages.  The order of docs is not guaranteed to match
the order of the input id list.  If you need to preserve order you should either make multiple
single id requests or sort results client-side.


### Request ID
All action requests can include the `reqID` field that will be repeated back in all subsequent
responses relating to that request to allow correlation client-side.

## Searching

Path: `/search`

For more complex queries, including full text and completion queries, ElasticSearch should be used.
This `/db` endpoint can only fetch by ids.

```
{
  "action": "search",
  "index": "properties",  // Defaults to _all if not specified
  "body": {
    "query": {
       multi_match: {
         query: "hello"
       }
    }
  }
}
```

The `body` field can be any ES query; it will be fed to the `_search` endpoint against the specified
index.


## Change Stream

Path: `/changes`

This streams updates from Mongo to a websocket connection.  It is useful for maintaining up-to-date
state in the webapp based on changes both from other users and backend services as well as from the
active user that is watching with the websocket.

## Development

See [Python](../README.md#python).
