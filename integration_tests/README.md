# Integration Tests

## Running
Set `KUBECONFIG` or the current kubectl context to an available Kubernetes cluster where the tests
can be run (e.g. minikube).  Then:

`./run.sh`

which will build and push the latest Docker images, deploy them to a private namespace in the
cluster, and run the test with Mocha.  The mocha setup script will start up a Selenium container
locally if none is specified with the `SELENIUM_REMOTE_URL` envvar.

### Single Test
To run an individual test first set everything up with:

`SETUP_ONLY=yes ./run.sh`

then do:

`node_modules/.bin/ts-mocha test/<test_module_to_run>`

