: '
Docker Compose Runner Script

SYNOPSIS
    ./composeAll.sh [OPTIONS] [DOCKER_COMPOSE_COMMANDS...]

DESCRIPTION
    This script executes docker compose command
    by recursively searching for docker-compose.yaml files starting from the project root.
    Users can specify one or more paths to search for these files, and optionally include docker-compose-dev.yaml files in the search.
    The script uses a .env file situated in the project root for environment variable configuration.

OPTIONS
    -p, --path <PATH>
        Specify one or more paths to search for Compose files.
        This option can be repeated to search in multiple directories.
        Default: current directory(.)

    -eP, --exclude-path <PATH>
        Specify one or more paths to exclude from the search.
        This option can be repeated to exclude multiple directories.
        Default: none

    --project-name <NAME>
        Set the Docker Compose project name.
        Default: eventonight

    --dev
        Include docker-compose-dev.yaml files in the search.

    Other arguments provided will be passed directly to the docker compose command.

EXAMPLES:

    ./composeAll.sh up
        Searches all docker-compose.yaml file in the project and runs up.

    ./composeAll.sh -p /dir up
        Searches all docker-compose.yaml file in /dir and runs up.

    ./composeAll.sh -p /dir1 -p /dir2 up
        Searches all docker-compose.yaml file both in /dir1 and /dir2 and runs up.

    ./composeAll.sh --project-name my-project --dev up
        Uses a custom project name and includes dev compose files.

NOTES:
  - Requires Bash and Docker installed.
  - Changes directory to the project root before execution.
'
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

# Default values
PROJECT_NAME="eventonight"
USE_DEV=false
HAS_CUSTOM_PATH=false
SEARCH_PATHS=()
EXCLUDE_PATHS=()

# Parse arguments
FILTERED_ARGS=()
SKIP_NEXT=false
SKIP_TYPE=""

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
      sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
      exit 0
fi

for arg in "$@"; do
    if [[ "$SKIP_NEXT" == true ]]; then
        if [[ "$SKIP_TYPE" == "project-name" ]]; then
            PROJECT_NAME="$arg"
        elif [[ "$SKIP_TYPE" == "path" ]]; then
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
    elif [[ "$arg" == "--project-name" ]]; then
        SKIP_NEXT=true
        SKIP_TYPE="project-name"
    elif [[ "$arg" == "-p" || "$arg" == "--path" ]]; then
        SKIP_NEXT=true
        SKIP_TYPE="path"
    elif [[ "$arg" == "-eP" || "$arg" == "--exclude-path" ]]; then
        SKIP_NEXT=true
        SKIP_TYPE="exclude-path"
    else
        FILTERED_ARGS+=("$arg")
    fi
done

if [[ "$HAS_CUSTOM_PATH" == false ]]; then
    SEARCH_PATHS=(".")
fi

FILE_PATTERNS=("docker-compose.yaml")
$USE_DEV && FILE_PATTERNS+=("docker-compose-dev.yaml") || true

EXCLUDE_PATTERNS=""
if [[ ${#EXCLUDE_PATHS[@]} -gt 0 ]]; then
    for exclude in "${EXCLUDE_PATHS[@]}"; do
        EXCLUDE_PATTERNS+=$exclude"|"
    done
    EXCLUDE_PATTERNS=${EXCLUDE_PATTERNS%?}
fi

COMPOSE_FILES=""
for path in "${SEARCH_PATHS[@]}"; do
    for pattern in "${FILE_PATTERNS[@]}"; do
        FOUND_FILES=$(find "$path" -name "$pattern" -print)
        if [[ ! -z "$EXCLUDE_PATTERNS" ]]; then
            FILES_TO_USE=$(echo -e "$FOUND_FILES" | grep -vE "$EXCLUDE_PATTERNS" || true)
        else
            FILES_TO_USE="$FOUND_FILES"
        fi
        COMPOSE_FILES="$COMPOSE_FILES $FILES_TO_USE"
    done
done

COMPOSE_ARGS=()
for file in $COMPOSE_FILES; do
    COMPOSE_ARGS+=(-f "$file")
done

export COMPOSE_PROJECT_NAME="$PROJECT_NAME"
docker compose \
    --project-name "$PROJECT_NAME" \
    --project-directory . \
    --env-file ./.env \
    "${COMPOSE_ARGS[@]}" \
    "${FILTERED_ARGS[@]}"