#!/bin/bash

set -euo pipefail

usage() {
  cat <<EOH
  Usage: $0 COLLECTION

  Opens a change stream for the given collection(s).
EOH
}

collection=$1
printf '{"collection": "%s"}\n' "$collection" | websocat -n ws://localhost:8080/changes
