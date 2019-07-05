#!/bin/bash

# Loads a set of fixtures that can be used for development or integration testing.
# MONGO_URI should include the database name if provided at all.

set -xeuo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

MONGO_URI=${MONGO_URI-"mongodb://127.0.0.1:27017/${MONGO_DATABASE-rem}"}

mongo="mongo ${MONGO_URI}"

# Load all media files using mongofiles
(
  cd $SCRIPT_DIR/media

  for f in $(find . -type f)
  do
    mime_type=$(file --mime-type $f | awk '{print $2}')
    mongofiles --db "${MONGO_DATABASE-${MONGO_URI##*/}}" --uri $MONGO_URI --replace --prefix media --type $mime_type put $(basename $f)
  done
)

cd $SCRIPT_DIR
$mongo $SCRIPT_DIR/media.js
$mongo $SCRIPT_DIR/properties.js
$mongo $SCRIPT_DIR/leases.js
$mongo $SCRIPT_DIR/notes.js
$mongo $SCRIPT_DIR/parties.js
$mongo $SCRIPT_DIR/users.js
