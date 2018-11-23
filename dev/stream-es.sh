#!/bin/bash

set -euo pipefail
set -x

printf '{"index": "%s", "searchBody": %s,"reqID":"0"}\n' "$1" "$2" | websocat ${REM_INGRESS}/stream/search | jq .
