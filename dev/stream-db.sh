#!/bin/bash

set -euo pipefail

printf '{"action": "getByIds", "collection": "%s", "reqID": "0", "ids": ["%s"]}\n' $1 $2 | websocat ${REM_INGRESS}/stream/db | jq .
