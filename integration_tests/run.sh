#!/bin/bash

# Deploys the app using Helm to a pre-configured K8s cluster.

set -euo pipefail
set -x

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BUILD_ID=${BUILD_ID-$USER}

if [[ -z "${MONGO_URI-}" ]]; then
  echo "MONGO_URI must be set" >&2
fi

HELM_TIMEOUT=${HELM_TIMEOUT-300}
NAMESPACE=${NAMESPACE-"build-$BUILD_ID"}
RELEASE_NAME=remtests-${NAMESPACE}
IMAGE_TAG=${IMAGE_TAG-"build-$BUILD_ID"}
KUBE_CONTEXT=${KUBE_CONTEXT-$(kubectl config current-context)}
INGRESS_HOST="${RELEASE_NAME}.test"
TEST_DB="$NAMESPACE"
MONGO_URI="$MONGO_URI/$TEST_DB"

DO_BUILD=${DO_BUILD-"yes"}
if [[ "$DO_BUILD" == "yes" ]]; then
  PUSH=yes TAG=$IMAGE_TAG make -C $SCRIPT_DIR/.. images
fi

kubectl="kubectl --context $KUBE_CONTEXT --namespace $NAMESPACE"
helm="helm --kube-context $KUBE_CONTEXT"

cleanup() {
    $helm delete --purge $RELEASE_NAME
    mongo $MONGO_URI --eval 'db.dropDatabase();'
}
if [[ "${DO_CLEANUP-yes}" == "yes" ]]; then
  trap cleanup EXIT
fi

$kubectl delete all --all --grace-period=3
$kubectl create namespace $NAMESPACE || true

# Clean up any pre-existing db in case it wasn't deleted properly
mongo $MONGO_URI --eval 'db.dropDatabase();' || true
(cd $SCRIPT_DIR/../datastores/mongo && mongo $MONGO_URI setup.js)

wait_pod_ready() {
  pod="$1"
  for i in $(seq 1 10); do
    $kubectl wait --for=condition=Ready pod/$pod && break || true
    sleep 2
  done
  $kubectl wait --for=condition=Ready pod/$pod
}

setup_es() {
  # Start up a single-node ES cluster in k8s
  echo 'Deploying ES cluster...'
  $kubectl apply -f $SCRIPT_DIR/es-k8s.yaml
  wait_pod_ready es-0

  echo "Setting up indexes in ES"
  $kubectl cp $SCRIPT_DIR/../datastores/es es-0:/opt
  $kubectl exec es-0 -- bash /opt/es/setup-indexes.sh
}
setup_es

$helm upgrade \
  --install \
  --namespace $NAMESPACE \
  --values $SCRIPT_DIR/helm-values.yaml \
  --set-string defaultTag="$IMAGE_TAG" \
  --set-string ingressHost="$INGRESS_HOST" \
  --set-string mongoUri="$MONGO_URI" \
  --set-string mongoDatabase="$TEST_DB" \
  --set-string esHost="es" \
  --wait \
  --timeout ${HELM_TIMEOUT} \
  --recreate-pods \
  $RELEASE_NAME $SCRIPT_DIR/../helm/rem

# Install dev fixtures after the app starts up to flush out any races or bugs in initialization
# logic of watchers.
MONGO_URI="$MONGO_URI" $SCRIPT_DIR/../dev/fixtures/load-fixtures.sh

# It can take a while for the ingress to get the proper address so retry this for 2 minutes.
for i in $(seq 1 45); do
  INGRESS_IP=${INGRESS_IP:-$($kubectl get ingress frontend -o jsonpath="{.status.loadBalancer.ingress[0].ip}")}

  if [ -n "$INGRESS_IP" ]; then
    echo "Got ingress IP $INGRESS_IP"
    break
  fi
  echo "Trying to get ingress IP..."
  sleep 3
done

if [[ -z "$INGRESS_IP" ]]; then
  echo "Could not determine K8s ingress IP address" >&2
  exit 1
fi

if [[ "${SETUP_ONLY-}" == "yes" ]]; then
  echo "Done setting up, skipping tests"
  exit 1
fi

cd $SCRIPT_DIR
INGRESS_HOST="$INGRESS_HOST" INGRESS_IP="$INGRESS_IP" $SCRIPT_DIR/node_modules/.bin/ts-mocha "$SCRIPT_DIR/test/**/*test.ts"
