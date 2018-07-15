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

## TODO
Use https://github.com/flitbit/diff to determine changes between versions of
docs.

## Development

Since there are so many services that the app needs, it is probably easiest to develop using
minikube.  I have found the `--vm-driver none` minikube deployment to be the most convenient for
this.  Follow the instructions at https://github.com/kubernetes/minikube/issues/2575 to set up
minikube on localhost only.  I use a simple script to start up minikube locally:

```sh
#!/bin/bash

export CHANGE_MINIKUBE_NONE_USER=true

mkdir -p $HOME/.kube
touch $HOME/.kube/config

export KUBECONFIG=$HOME/.kube/config

sudo -E minikube start --vm-driver=none --apiserver-ips 127.0.0.1 --apiserver-name localhost
```

When running other minikube commands you should use `sudo -E minikube ...`.

### Python

Several of the backend services are written in Python 3.  The code should be formatted using
[yapf](https://github.com/google/yapf) version 0.22.0 using the relevant configuration found in each
service's repo directory.

[Pylint 1.9.2](https://www.pylint.org/) should not report any errors for the code.  No other
linters/checkers are used at this time.
