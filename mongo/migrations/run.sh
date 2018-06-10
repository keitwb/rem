#!/bin/bash

set -euo pipefail

# Runs mongo in the background and then sets it up.  This is meant to be called
# before the actual mongo instance starts to get it ready.

mongod --bind_ip 127.0.0.1 --replSet rs0 &

max_tries=15

exit_code=1
# Try for 15 seconds and then give up
for i in $(seq 0 $max_tries); do
  if mongo 127.0.0.1:27017/rem /opt/migrations/setup.js; then
    exit_code=0
    break
  fi
  sleep 1
done

kill %1
wait %1

exit $exit_code
