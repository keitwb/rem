# Real Estate Manager

This is a small app to manage relatively simple properties.  It can be run with
docker-compose using the `dc` helper script.  The backend uses Django REST
Framework and the frontend is written in Angular 4.


## Architecture

The frontend uses Angular 4.  The primary data store is MongoDB, fronted by
[RESTHeart](http://restheart.org/), so that the database can be used directly
from the browser.  [OpenResty](https://www.openresty.org/) with JWT
authentication fronts the HeartREST server and provides SSL termination.

I intend to get JWT tokens from [Auth0](https://manage.auth0.com/), which
manages the user accounts (the basic service is free for under 7000 users).
Any other JWT service could be used though, as long as the OpenResty instance
is configured with its secret.
