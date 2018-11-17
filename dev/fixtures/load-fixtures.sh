#!/bin/bash

# Loads a set of fixtures that can be used for development or integration testing.

set -euxo pipefail

MONGO_DB=${MONGO_DB-"rem"}
MONGO_HOST=${MONGO_HOST-"mongo"}

mongo="mongo ${MONGO_HOST}:27017/${MONGO_DB}"

while true; do
  if $mongo --eval 'db.getCollectionNames()'; then
    break;
  fi
  echo "Sleeping for 5 seconds waiting for mongo to come up" >&2
  sleep 5
done

cd /opt/dev/media
for f in $(find /opt/dev/media -type f | xargs -L 1 basename)
do
  mime_type=$(file --mime-type $f | awk '{print $2}')
  mongofiles put --host $MONGO_HOST:27017 --replace --prefix media --type $mime_type --db $MONGO_DB $f
done

cd /opt/dev
$mongo /opt/dev/media.js
$mongo /opt/dev/properties.js
$mongo /opt/dev/leases.js
$mongo /opt/dev/notes.js
$mongo /opt/dev/parties.js
$mongo /opt/dev/users.js
