#!/bin/bash

gomplate < /opt/restheart.yml.tmpl > /etc/restheart.yml

exec /opt/restheart/entrypoint.sh /etc/restheart.yml
