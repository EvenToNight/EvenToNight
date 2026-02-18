#!/usr/bin/env bash
: '
Docker Swarm Deploy Script

SYNOPSIS
    ./swarmDeploy.sh [OPTIONS]

DESCRIPTION
    Manages the EvenToNight Docker Swarm stack.
    Searches for docker-compose.yaml files in ./services and ./infrastructure (excluding ./infrastructure/seed).

OPTIONS
    --stop
        Remove the stack (docker stack rm). Does not remove volumes.

    --remove-volumes
        Remove all volumes associated with the stack.

    --stack-name <NAME>
        Set the Docker Swarm stack name.
        Default: eventonight-production

    --dev
        Include docker-compose-dev.yaml files in the search.

    --local
        Use local images instead of pulling from the registry (--resolve-image never).
        Useful for testing with locally built images.

EXAMPLES:
    ./swarmDeploy.sh
        Deploy the stack.

    ./swarmDeploy.sh --local
        Deploy the stack using local images.

    ./swarmDeploy.sh --stop
        Remove the stack.

    ./swarmDeploy.sh --stop --remove-volumes
        Remove the stack and all its volumes.

NOTES:
  - Requires Bash and Docker installed with Swarm mode initialized.
  - Uses .env file in the project root for variable substitution.
'
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

STACK_NAME="eventonight-production"
USE_DEV=false
STOP=false
REMOVE_VOLUMES=false
LOCAL=false
SKIP_NEXT=false

for arg in "$@"; do
    if [[ "$SKIP_NEXT" == true ]]; then
        STACK_NAME="$arg"
        SKIP_NEXT=false
        continue
    fi

    if [[ "$arg" == "--stop" ]]; then
        STOP=true
    elif [[ "$arg" == "--remove-volumes" ]]; then
        REMOVE_VOLUMES=true
    elif [[ "$arg" == "--dev" ]]; then
        USE_DEV=true
    elif [[ "$arg" == "--local" ]]; then
        LOCAL=true
    elif [[ "$arg" == "--stack-name" ]]; then
        SKIP_NEXT=true
    fi
done

if [[ "$STOP" == true ]]; then
    echo "💬 Removing stack '$STACK_NAME'..."
    docker stack rm "$STACK_NAME"
    echo "💬 Stack '$STACK_NAME' removed."
fi

if [[ "$REMOVE_VOLUMES" == true ]]; then
    echo "💬 Removing volumes for stack '$STACK_NAME'..."
    VOLUMES=$(docker volume ls -q --filter "label=com.docker.stack.namespace=$STACK_NAME")
    if [[ -n "$VOLUMES" ]]; then
        echo "$VOLUMES" | xargs docker volume rm
        echo "💬 Volumes removed."
    else
        echo "💬 No volumes found for stack '$STACK_NAME'."
    fi
fi

if [[ "$STOP" == true || "$REMOVE_VOLUMES" == true ]]; then
    exit 0
fi

FIND_ARGS=(-p ./services -p ./infrastructure -eP ./infrastructure/seed --swarm)
$USE_DEV && FIND_ARGS+=(--dev) || true

COMPOSE_FILES=$(./scripts/findComposeFiles.sh "${FIND_ARGS[@]}")

COMPOSE_ARGS=()
for file in $COMPOSE_FILES; do
    COMPOSE_ARGS+=(-f "$file")
done

set -o allexport
source ./.env
set +o allexport

echo "💬 Deploying stack '$STACK_NAME'..."
COMPOSE_CONFIG=$(docker compose \
    --project-name "$STACK_NAME" \
    --project-directory . \
    --env-file ./.env \
    ${COMPOSE_ARGS[@]+"${COMPOSE_ARGS[@]}"} \
    config)
echo "$COMPOSE_CONFIG"
RESOLVE_IMAGE="always"
$LOCAL && RESOLVE_IMAGE="never" || true

export COMPOSE_PROJECT_NAME="$STACK_NAME"
echo "$COMPOSE_CONFIG" \
    | sed '/^name:/d; s/published: "\([0-9]*\)"/published: \1/g' \
    | awk '/^    depends_on:/{skip=1;next} skip && /^      /{next} {skip=0;print}' \
    | docker stack deploy \
        --resolve-image "$RESOLVE_IMAGE" \
        --detach=true \
        --compose-file - \
        "$STACK_NAME"
echo "💬 Stack '$STACK_NAME' deployed successfully."
