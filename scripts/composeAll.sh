#!/bin/bash
set -e

cd "$(dirname "$0")/.." || exit 1

COMPOSE_FILE_NAME="docker-compose.yaml"

COMPOSE_FILES=$(find . -name "$COMPOSE_FILE_NAME" -print)

FILTERED_ARGS=()
for arg in "$@"; do
    if [[ "$arg" == "dev" ]]; then
        COMPOSE_FILE_NAME="docker-compose-dev.yaml"
        COMPOSE_DEV_FILES=$(find . -name "$COMPOSE_FILE_NAME" -print)
        COMPOSE_FILES="$COMPOSE_FILES $COMPOSE_DEV_FILES"
    else
        FILTERED_ARGS+=("$arg")
    fi
done

COMPOSE_ARGS=()
for file in $COMPOSE_FILES; do
    COMPOSE_ARGS+=(-f "$file")
done

echo "=== Final merged Docker Compose configuration ==="
docker compose --project-name microservices-example --project-directory . --env-file ./.env "${COMPOSE_ARGS[@]}" config

docker compose \
    --project-name eventonight \
    --project-directory . \
    --env-file ./.env \
    "${COMPOSE_ARGS[@]}" \
    "${FILTERED_ARGS[@]}"