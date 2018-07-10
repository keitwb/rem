#!/bin/bash

set -euo pipefail

# Connects to the mongo host given as the first argument to this script and initializes it.

MONGO_HOST=${1-"127.0.0.1"}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

max_tries=15

exit_code=1
# Try for 15 seconds and then give up
for i in $(seq 0 $max_tries); do
  if mongo $MONGO_HOST:27017/rem $SCRIPT_DIR/setup.js; then
    exit_code=0
    break
  fi
  sleep 1
done

exit $exit_code
