#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -euo pipefail

echo "Setting up ES indexes..."
for f in $SCRIPT_DIR/*.json
do
  echo "Processing $f"
  curl --fail -X PUT -H 'Content-Type: application/json' -d @$f http://${ES_HOST-127.0.0.1}:9200/$(basename $f .index.json)
done

echo "Done"
