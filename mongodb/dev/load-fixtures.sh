#!/bin/bash

cd /opt/dev/media
for f in $(find /opt/dev/media -type f | xargs -L 1 basename)
do
  mime_type=$(file --mime-type $f | awk '{print $2}')
  mongofiles put --host mongodb:27017 --replace --prefix media --type $mime_type --db rem $f
done

mongo mongodb:27017/rem /opt/dev/fixtures.js

