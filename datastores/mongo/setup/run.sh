#!/bin/bash

set -euo pipefail

# Connects to the mongo host given as the first argument to this script and initializes it.  This
# script assumes a single-node mongo cluster.

MONGO_HOST=${1-"127.0.0.1"}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR

max_tries=15

exit_code=1
# Try for 15 seconds and then give up
for i in $(seq 0 $max_tries); do
  if mongo $MONGO_HOST:27017/rem $SCRIPT_DIR/setup.js; then
    if [[ -n ${STAY_UP-} ]]; then
      sleep infinity
    fi
    exit_code=0
    break
  fi
  sleep 3
done

exit $exit_code
