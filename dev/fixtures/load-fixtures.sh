#!/bin/bash

# Loads a set of fixtures that can be used for development or integration testing.

set -xeuo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

MONGO_URI=${MONGO_URI-"mongodb://127.0.0.1:27017/rem"}

mongo="mongo ${MONGO_URI}"

# Load all media files using mongofiles
(
  cd $SCRIPT_DIR/media

  for f in $(find . -type f)
  do
    mime_type=$(file --mime-type $f | awk '{print $2}')
    mongofiles --uri $MONGO_URI --replace --prefix media --db ${MONGO_DATABASE-"rem"} --type $mime_type put $(basename $f)
  done
)

$mongo $SCRIPT_DIR/media.js
$mongo $SCRIPT_DIR/properties.js
$mongo $SCRIPT_DIR/leases.js
$mongo $SCRIPT_DIR/notes.js
$mongo $SCRIPT_DIR/parties.js
$mongo $SCRIPT_DIR/users.js
