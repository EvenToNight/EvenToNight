#!/usr/bin/env bash
: '
Application Runner Script

SYNOPSIS
    ./composeApplication.sh [OPTIONS] [DOCKER_COMPOSE_COMMANDS...]

DESCRIPTION
    This script executes docker compose command
    by recursively searching for docker-compose.yaml files in ./services and in ./infrastructure folders.
    Users can optionally include docker-compose-dev.yaml files in the search and optionaly initialize the database seeding process.
    The script uses a .env file situated in the project root for environment variable configuration.

OPTIONS
    --dev
        Include docker-compose-dev.yaml files in the search.

    --init-db
        Initialize the database by running the seed service after composing the application.

    --no-deps
        Sets the TEST_DEPLOYMENT environment variable to "true" for testing deployments.
        It avoids using dependent services (e.g. stripe) during testing.

    Other arguments provided will be passed directly to the docker compose command.

EXAMPLES:
    ./composeApplication.sh up
        Runs the application.

    ./composeApplication.sh --dev up
        Runs the application with dev configuration.

    ./composeApplication.sh --init-db up
        Runs the application and initializes the database.

NOTES:
  - Requires Bash and Docker installed.
  - Changes directory to the project root before execution.
  - The docker compose project name is set to eventonight.
  - If the script start seed process if called with "-d --wait"
'
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

INIT_DB=false
DEV=""
BUILD=""
DETACHED=false
WAIT=false
FILTERED_ARGS=()
PROJECT_NAME="eventonight"
SKIP_NEXT=false
PULL=""

for arg in "$@"; do
    if [[ "$SKIP_NEXT" == true ]]; then
        PROJECT_NAME="$arg"
        SKIP_NEXT=false
        continue
    fi

    if [[ "$arg" == "--init-db" ]]; then
        INIT_DB=true
    elif [[ "$arg" == "--project-name" ]]; then
        SKIP_NEXT=true
    elif [[ "$arg" == "--dev" ]]; then
        DEV="--dev"
        FILTERED_ARGS+=("$arg")
    elif [[ "$arg" == "--build" ]]; then
        BUILD="--build"
        FILTERED_ARGS+=("$arg")
    elif [[ "$arg" == "-d" ]]; then
        DETACHED=true
        FILTERED_ARGS+=("$arg")
    elif [[ "$arg" == "--wait" ]]; then
        WAIT=true
        FILTERED_ARGS+=("$arg")
    elif [[ "$arg" == "pull" ]]; then
        PULL="pull"
        FILTERED_ARGS+=("$arg")
    elif [[ "$arg" == "--no-deps" ]]; then
        export TEST_DEPLOYMENT="true"
    else
        FILTERED_ARGS+=("$arg")
    fi
done

if [ "$INIT_DB" = true ] && [ "$PULL" != "pull" ]; then
    echo "💬 Database initialization requested. Clean all volumes"
    ./scripts/composeAll.sh --project-name "$PROJECT_NAME" -p ./services -p ./infrastructure -eP ./infrastructure/seed down -v --remove-orphans
    echo "💬 All volumes removed."
fi

if [ "$PULL" != "pull" ]; then
  echo "💬 Building the application..."
else
  echo "💬 Pulling the latest images..."
fi
./scripts/composeAll.sh --project-name "$PROJECT_NAME" -p ./services -p ./infrastructure -eP ./infrastructure/seed "${FILTERED_ARGS[@]}"
if [ "$PULL" != "pull" ]; then
  echo "💬 AApplication built successfully."
  echo "💬 Removing init containers..."
  ./scripts/composeAll.sh --project-name "$PROJECT_NAME" -p ./services -p ./infrastructure rm -fsv keycloak-provision
  echo "💬 Init containers removed."
else
  echo "💬 LLatest images pulled successfully."
fi

if [ "$INIT_DB" = true ] && [ "$PULL" != "pull" ]; then
  echo "💬 Initializing the database..."
  ./scripts/composeAll.sh ${PULL:+$PULL} --project-name $PROJECT_NAME -p ./infrastructure/seed ${DEV:+$DEV} run --rm ${BUILD:+$BUILD} seed
  echo "💬 Database initialized."
fi
if [ "$PULL" = "pull" ]; then
  ./scripts/composeAll.sh -p ./infrastructure/seed pull
  echo "💬 Latest images pulled successfully."
fi
if [ "$BUILD" = "--build" ]; then
  docker image prune -f
  echo "💬 Application built successfully."
fi