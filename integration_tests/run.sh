#!/bin/bash

# Deploys the 

set -euo pipefail
set -x

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BUILD_ID=${BUILD_ID-$USER}

HELM_TIMEOUT=${HELM_TIMEOUT-300}
NAMESPACE=${NAMESPACE-"build-$BUILD_ID"}
RELEASE_NAME=remtests-${NAMESPACE}
IMAGE_TAG=${IMAGE_TAG-"build-$BUILD_ID"}
KUBE_CONTEXT=${KUBE_CONTEXT-$(kubectl config current-context)}
export INGRESS_HOST="${RELEASE_NAME}.test"

DO_BUILD=${DO_BUILD-"yes"}
[[ "$DO_BUILD" == "yes" ]] && PUSH=yes TAG=$IMAGE_TAG make -C $SCRIPT_DIR/.. images

kubectl="kubectl --context $KUBE_CONTEXT --namespace $NAMESPACE"
helm="helm --kube-context $KUBE_CONTEXT"

cleanup() {
  if [[ -z "${NO_CLEANUP-}" ]]; then
    $helm delete --purge $RELEASE_NAME
  fi
}
trap cleanup EXIT

# In case the release already existed (e.g. from a prior failed run), make sure the DB is wiped
# before restarting everything so we have a clean slate for tests.  We could also just delete the
# release and start completely from scratch if this isn't robust enough.
if $helm status $RELEASE_NAME; then
  $kubectl exec mongo-0 -- mongo rem --eval 'db.dropDatabase();'
  $kubectl exec mongo-0 -- /opt/setup/run.sh
fi

$helm upgrade \
  --install \
  --namespace $NAMESPACE \
  --values $SCRIPT_DIR/helm-values.yaml \
  --set-string defaultTag="$IMAGE_TAG" \
  --set-string ingressHost="$INGRESS_HOST" \
  --wait \
  --timeout ${HELM_TIMEOUT} \
  --recreate-pods \
  $RELEASE_NAME ../helm/rem

# Delete an old fixture container in case it got left around.
$kubectl delete pod dev-fixtures || true
$kubectl run dev-fixtures --image-pull-policy=Always --rm -i --restart=OnFailure --image quay.io/rem/mongo-dev-fixtures:$IMAGE_TAG -- /opt/dev/load-fixtures.sh

# It can take a while for the ingress to get the proper address so retry this for 2 minutes.
for i in $(seq 1 45); do
  export INGRESS_IP=${INGRESS_IP-$($kubectl get ingress frontend -o jsonpath="{.status.loadBalancer.ingress[0].ip}")}

  if [ -n "$INGRESS_IP" ]; then
    break
  fi
  sleep 3
done

if [[ -z "$INGRESS_IP" ]]; then
  echo "Could not determine K8s ingress IP address" >&2
  exit 1
fi

./node_modules/.bin/ts-mocha 'test/**/*test.ts'
