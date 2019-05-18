#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -euo pipefail
set -x

echo "Setting up ES indexes..."
for f in $(echo $SCRIPT_DIR/*.json | shuf)
do
  echo "Processing $f"
  index=$(basename $f .index.json)
  index_url="http://${ES_HOST-127.0.0.1}:9200/$index"
  curl --fail -X POST $index_url/_close || true
  curl --fail -X PUT -H 'Content-Type: application/json' -d @$f $index_url
  curl --fail -X POST $index_url/_open || true
done

echo "Done"
