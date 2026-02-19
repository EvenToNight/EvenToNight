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

STACK_NAME="cccc"
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
    docker stack rm "$STACK_NAME" || true
    echo "💬 Waiting for stack '$STACK_NAME' to be fully removed..."
    while docker stack ls --format "{{.Name}}" | grep -q "^${STACK_NAME}$"; do
        sleep 2
    done
    echo "💬 Waiting for stack containers to be fully removed..."
    while docker ps -a -q --filter "label=com.docker.stack.namespace=$STACK_NAME" | grep -q .; do
        sleep 2
    done
    echo "💬 Removing leftover networks..."
    docker network ls --format "{{.Name}}" \
        | grep "^${STACK_NAME}_" \
        | xargs -r docker network rm 2>/dev/null || true
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

FIRST_DEPLOY=false
docker stack ls --format "{{.Name}}" | grep -q "^${STACK_NAME}$" || FIRST_DEPLOY=true

echo "💬 Deploying stack '$STACK_NAME'..."
COMPOSE_CONFIG=$(docker compose \
    --project-name "$STACK_NAME" \
    --project-directory . \
    --env-file ./.env \
    ${COMPOSE_ARGS[@]+"${COMPOSE_ARGS[@]}"} \
    config)
echo "$COMPOSE_CONFIG"
echo "-----------------"
RESOLVE_IMAGE="always"
$LOCAL && RESOLVE_IMAGE="never" || true

echo "💬 Using image resolution strategy: $RESOLVE_IMAGE"
export COMPOSE_PROJECT_NAME="$STACK_NAME"
STACK_CONFIG=$(echo "$COMPOSE_CONFIG" \
    | sed '/^name:/d; s/published: "\([0-9]*\)"/published: \1/g; s|@sha256:[a-f0-9]*||g' \
    | awk '/^    depends_on:/{skip=1;next} skip && /^      /{next} {skip=0;print}')

if [[ "$LOCAL" == true ]]; then
    echo "💬 Pinning images to local IDs..."
    PINNED=""
    while IFS= read -r line; do
        if [[ "$line" =~ ^([[:space:]]*)image:[[:space:]]*(ghcr\.io/[^[:space:]]+)$ ]]; then
            INDENT="${BASH_REMATCH[1]}"
            IMAGE_REF="${BASH_REMATCH[2]}"
            LOCAL_ID=$(docker image inspect --format '{{.Id}}' "$IMAGE_REF" 2>/dev/null || true)
            if [[ -n "$LOCAL_ID" ]]; then
                PINNED+="${INDENT}image: ${LOCAL_ID}"$'\n'
                echo "  ✓ $IMAGE_REF → ${LOCAL_ID:7:12}"
            else
                PINNED+="$line"$'\n'
                echo "  ⚠ $IMAGE_REF → not found locally, keeping tag"
            fi
        else
            PINNED+="$line"$'\n'
        fi
    done <<< "$STACK_CONFIG"
    STACK_CONFIG="$PINNED"
fi

# Throubleshoot why --resolve-image never is not working
echo "$STACK_CONFIG" | docker stack deploy \
        --resolve-image "$RESOLVE_IMAGE" \
        --detach=false \
        --compose-file - \
        "$STACK_NAME"
echo "💬 Stack '$STACK_NAME' deployed successfully."

if [[ "$FIRST_DEPLOY" == true ]]; then
    echo "💬 First deploy detected, initializing the database..."
    EVENT_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-events" --format "{{.Names}}" | head -1)
    INTERACTION_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-interactions" --format "{{.Names}}" | head -1)
    CHAT_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-chat" --format "{{.Names}}" | head -1)
    PAYMENT_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-payments" --format "{{.Names}}" | head -1)
    NOTIFICATION_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-notifications" --format "{{.Names}}" | head -1)
    ./scripts/composeAll.sh --project-name "$STACK_NAME" -p ./infrastructure/seed --swarm run --rm \
        -e "EVENT_MONGO_URI=${EVENT_CONTAINER}" \
        -e "INTERACTION_MONGO_URI=${INTERACTION_CONTAINER}" \
        -e "CHAT_MONGO_URI=${CHAT_CONTAINER}" \
        -e "PAYMENT_MONGO_URI=${PAYMENT_CONTAINER}" \
        -e "NOTIFICATION_MONGO_URI=${NOTIFICATION_CONTAINER}" \
        seed
    echo "💬 Database initialized."
fi
