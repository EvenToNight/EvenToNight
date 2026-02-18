#!/usr/bin/env bash
: '
Find Compose Files Script

SYNOPSIS
    ./findComposeFiles.sh [OPTIONS]

DESCRIPTION
    Recursively searches for docker-compose.yaml files in the specified paths
    and prints them to stdout (one per line).

OPTIONS
    -p, --path <PATH>
        Specify one or more paths to search for Compose files.
        This option can be repeated to search in multiple directories.
        Default: current directory (.)

    -eP, --exclude-path <PATH>
        Specify one or more paths to exclude from the search.
        This option can be repeated to exclude multiple directories.
        Default: none

    --dev
        Include docker-compose-dev.yaml files in the search.

    --swarm
        Include docker-compose-swarm.yaml files in the search.

EXAMPLES:
    ./findComposeFiles.sh -p ./services -p ./infrastructure -eP ./infrastructure/seed
        Prints all docker-compose.yaml files in ./services and ./infrastructure,
        excluding ./infrastructure/seed.

    ./findComposeFiles.sh -p ./services --dev
        Prints all docker-compose.yaml and docker-compose-dev.yaml files in ./services.
'
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

USE_DEV=false
USE_SWARM=false
HAS_CUSTOM_PATH=false
SEARCH_PATHS=()
EXCLUDE_PATHS=()
SKIP_NEXT=false
SKIP_TYPE=""

for arg in "$@"; do
    if [[ "$SKIP_NEXT" == true ]]; then
        if [[ "$SKIP_TYPE" == "path" ]]; then
            HAS_CUSTOM_PATH=true
            SEARCH_PATHS+=("$arg")
        elif [[ "$SKIP_TYPE" == "exclude-path" ]]; then
            EXCLUDE_PATHS+=("$arg")
        fi
        SKIP_NEXT=false
        SKIP_TYPE=""
        continue
    fi

    if [[ "$arg" == "--dev" ]]; then
        USE_DEV=true
    elif [[ "$arg" == "--swarm" ]]; then
        USE_SWARM=true
    elif [[ "$arg" == "-p" || "$arg" == "--path" ]]; then
        SKIP_NEXT=true
        SKIP_TYPE="path"
    elif [[ "$arg" == "-eP" || "$arg" == "--exclude-path" ]]; then
        SKIP_NEXT=true
        SKIP_TYPE="exclude-path"
    fi
done

if [[ "$HAS_CUSTOM_PATH" == false ]]; then
    SEARCH_PATHS=(".")
fi

FILE_PATTERNS=("docker-compose.yaml")
$USE_DEV && FILE_PATTERNS+=("docker-compose-dev.yaml") || true
$USE_SWARM && FILE_PATTERNS+=("docker-compose-swarm.yaml") || true

EXCLUDE_PATTERNS=""
if [[ ${#EXCLUDE_PATHS[@]} -gt 0 ]]; then
    for exclude in "${EXCLUDE_PATHS[@]}"; do
        EXCLUDE_PATTERNS+="$exclude|"
    done
    EXCLUDE_PATTERNS=${EXCLUDE_PATTERNS%?}
fi

for path in "${SEARCH_PATHS[@]}"; do
    for pattern in "${FILE_PATTERNS[@]}"; do
        FOUND_FILES=$(find "$path" -name "$pattern" -print)
        if [[ -n "$EXCLUDE_PATTERNS" ]]; then
            echo -e "$FOUND_FILES" | grep -vE "$EXCLUDE_PATTERNS" || true
        else
            echo -e "$FOUND_FILES"
        fi
    done
done
