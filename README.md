# Real Estate Manager

This is a monorepo that contains all of the code for a real estate property management app.

## Architecture

The [frontend](./webapp) is built React and Redux.  The primary data store is MongoDB which is
accessed from the front-end via the [data-streamer](./data-streamer) service.

App search is provided by ElasticSearch, which is kept in sync with the Mongo datastore via the [search
indexer service](./search).

App authentication is still undecided but ideally it would involve some kind of OAuth system that is
checked initially at the ingress server and then again at each individual service that is exposed to
the frontend.  Right now, the only service exposed to the front-end is the data-streamer.

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

Several of the backend services are written in Python 3.7+.  The code should be formatted using
[yapf](https://github.com/google/yapf) version 0.24.0 using the relevant configuration found in each
service's repo directory.

[Pylint 2.1.1](https://www.pylint.org/) should not report any errors for the code.  No other
linters/checkers are used at this time.
