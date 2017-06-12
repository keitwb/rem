#!/bin/bash

set -ex

chmod +x /usr/bin/gomplate
gomplate < /opt/nginx.conf.tmpl > /etc/nginx/nginx.conf

test -n "$NO_LETSENCRYPT" || sh -e /opt/ssl.sh

cat /etc/nginx/nginx.conf

exec nginx -g "daemon off;"
