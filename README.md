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
minikube.  Start up a minikube cluster if you don't already have one running:

`$ minikube start <options>`

This will run minikube and set your current kubectl context to that cluster.  Then install
[Helm](https://helm.sh), both locally on your machine and then inside minikube with:

`$ helm init`

Then install the chart in development mode by running:

`$ dev/helm-dev`

This will take a bit to complete.

### Python

Several of the backend services are written in Python 3.7+.  The code should be formatted using
[black](https://github.com/google/yapf) version 18.9b0 using the relevant configuration found in
each service's repo directory.

[Pylint 2.1.1](https://www.pylint.org/) should not report any errors for the code.  No other
linters/checkers are used at this time.  CI enforces both Black and Pylint.
