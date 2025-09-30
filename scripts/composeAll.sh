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
#!/bin/bash
set -e

cd "$(dirname "$0")/.." || exit 1

# Default values
PROJECT_NAME="eventonight"
USE_DEV=false
SEARCH_PATHS=(".")

# Parse arguments
FILTERED_ARGS=()
SKIP_NEXT=false
SKIP_TYPE=""

if [[ "$1" == "--help" || "$1" == "-h" ]]; then
      sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
      exit 0
fi

for arg in "$@"; do
    if [[ "$SKIP_NEXT" == true ]]; then
        if [[ "$SKIP_TYPE" == "project-name" ]]; then
            PROJECT_NAME="$arg"
        elif [[ "$SKIP_TYPE" == "path" ]]; then
            SEARCH_PATHS+=("$arg")
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
    else
        FILTERED_ARGS+=("$arg")
    fi
done

COMPOSE_FILES=""
for path in "${SEARCH_PATHS[@]}"; do
    FILES=$(find "$path" -name "docker-compose.yaml" -print)
    COMPOSE_FILES="$COMPOSE_FILES $FILES"
    if [[ "$USE_DEV" == true ]]; then
        DEV_FILES=$(find "$path" -name "docker-compose-dev.yaml" -print)
        COMPOSE_FILES="$COMPOSE_FILES $DEV_FILES"
    fi
done

COMPOSE_ARGS=()
for file in $COMPOSE_FILES; do
    COMPOSE_ARGS+=(-f "$file")
done

docker compose \
    --project-name "$PROJECT_NAME" \
    --project-directory . \
    --env-file ./.env \
    "${COMPOSE_ARGS[@]}" \
    "${FILTERED_ARGS[@]}"