#!/bin/bash

set -euxo pipefail

cd /opt/dev/media
for f in $(find /opt/dev/media -type f | xargs -L 1 basename)
do
  mime_type=$(file --mime-type $f | awk '{print $2}')
  mongofiles put --host mongo:27017 --replace --prefix media --type $mime_type --db rem $f
done

mongo mongo:27017/rem /opt/dev/fixtures.js

