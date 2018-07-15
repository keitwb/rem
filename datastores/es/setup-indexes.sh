#!/bin/bash

ES_HOST=${ES_HOST-}

set -euo pipefail

echo "Setting up ES indexes..."
for $f in *.json
do
  echo "Processing $f"
  curl -X POST -H 'Content-Type: application/json' -d @$f http://${ES_HOST}:9200/
done

echo "Done"
