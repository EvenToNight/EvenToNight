#!/usr/bin/env bash
set -euo pipefail

DOCKER_CONTAINER=${DOCKER_CONTAINER:-eventonight-dev-environment-mongo-1}
MONGO_DB=${MONGO_DB:-eventonight-payments}

echo "Dropping database $MONGO_DB of $DOCKER_CONTAINER..."
docker exec "$DOCKER_CONTAINER" mongosh "$MONGO_DB" --quiet --eval "db.dropDatabase()"
echo "Database dropped and fully cleaned."