#!/bin/bash

set -ex

certbot certonly --webroot \
  --domain $NGINX_HOSTNAME \
  --keep \
  --agree-tos \
  --email $LETSENCRYPT_EMAIL \
  --webroot-path /var/www
