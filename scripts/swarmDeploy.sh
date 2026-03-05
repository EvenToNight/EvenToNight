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

    --remove-local-images
        Delete all :local tagged images from Docker Hub (pushed via --local).

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

STACK_NAME="eventonight-swarm"
USE_DEV=false
STOP=false
REMOVE_VOLUMES=false
REMOVE_LOCAL_IMAGES=false
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
    elif [[ "$arg" == "--remove-local-images" ]]; then
        REMOVE_LOCAL_IMAGES=true
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

if [[ "$REMOVE_LOCAL_IMAGES" == true ]]; then
    echo "💬 Deleting :local images from Docker Hub..."
    docker login
    DOCKER_USER=$(docker login 2>&1 | sed -n 's/.*\[Username: \([^]]*\)\].*/\1/p; s/.*[Ll]ogged in as \([^ ]*\).*/\1/p' | head -1 || true)
    if [[ -z "$DOCKER_USER" ]]; then
        echo "❌ Could not determine Docker Hub username."
        exit 1
    fi
    CREDS_STORE=$(jq -r '.credsStore // empty' ~/.docker/config.json 2>/dev/null || true)
    if [[ -n "$CREDS_STORE" ]]; then
        DOCKER_PASS=$(echo "https://index.docker.io/v1/" | "docker-credential-${CREDS_STORE}" get 2>/dev/null | jq -r '.Secret // empty' || true)
    else
        DOCKER_PASS=$(jq -r '.auths["https://index.docker.io/v1/"].auth // empty' ~/.docker/config.json 2>/dev/null | base64 -d 2>/dev/null | cut -d: -f2 || true)
    fi
    HUB_TOKEN=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"${DOCKER_USER}\", \"password\": \"${DOCKER_PASS}\"}" \
        "https://hub.docker.com/v2/users/login" | jq -r '.token // empty')
    if [[ -z "$HUB_TOKEN" ]]; then
        echo "❌ Could not authenticate with Docker Hub API."
        exit 1
    fi
    DOCKERFILES=$(./scripts/findDockerfiles.sh 2>/dev/null | jq -r '.[]')
    while IFS= read -r dockerfile; do
        dir=$(dirname "$dockerfile")
        file=$(basename "$dockerfile")
        dir_name=$(basename "$dir")
        [[ "$file" == "Dockerfile" ]] && IMAGE_NAME="$dir_name" || IMAGE_NAME="${dir_name}-${file#Dockerfile-}"
        echo "  🗑️  Deleting ${DOCKER_USER}/${STACK_NAME}-${IMAGE_NAME}:local..."
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
            -H "Authorization: JWT ${HUB_TOKEN}" \
            "https://hub.docker.com/v2/repositories/${DOCKER_USER}/${STACK_NAME}-${IMAGE_NAME}/")
        if [[ "$STATUS" == "202" ]]; then
            echo "  ✓ Deleted"
        elif [[ "$STATUS" == "404" ]]; then
            echo "  ⚠️  Not found or already deleted"
        else
            echo "  ❌ Failed (HTTP $STATUS)"
        fi
    done <<< "$DOCKERFILES"
    echo "💬 Done."
fi

if [[ "$STOP" == true || "$REMOVE_VOLUMES" == true || "$REMOVE_LOCAL_IMAGES" == true ]]; then
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

#TODO: improve reading from env
NODE_COUNT=$(docker node ls --format "{{.ID}}" 2>/dev/null | wc -l)
[[ "$NODE_COUNT" -lt 3 ]] && export RABBITMQ_REPLICAS=1 || export RABBITMQ_REPLICAS=3

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
export COMPOSE_PROJECT_NAME="$STACK_NAME"
STACK_CONFIG=$(echo "$COMPOSE_CONFIG" \
    | sed '/^name:/d; s/published: "\([0-9]*\)"/published: \1/g; s|@sha256:[a-f0-9]*||g' \
    | awk '/^    depends_on:/{skip=1;next} skip && /^      /{next} {skip=0;print}')

if [[ "$LOCAL" == true ]]; then
    docker login
    DOCKER_USER=$(docker login 2>&1 | sed -n 's/.*\[Username: \([^]]*\)\].*/\1/p; s/.*[Ll]ogged in as \([^ ]*\).*/\1/p' | head -1 || true)
    echo "💬 Using local images from Docker Hub user: ${DOCKER_USER}"
    if [[ -z "$DOCKER_USER" ]]; then
        echo "❌ Could not determine Docker Hub username."
        exit 1
    fi
    DOCKERFILES=$(./scripts/findDockerfiles.sh 2>/dev/null | jq -r '.[]')
    echo "💬 Build plan (Docker Hub: ${DOCKER_USER}):"
    while IFS= read -r dockerfile; do
        dir=$(dirname "$dockerfile")
        file=$(basename "$dockerfile")
        dir_name=$(basename "$dir")
        [[ "$file" == "Dockerfile" ]] && IMAGE_NAME="$dir_name" || IMAGE_NAME="${dir_name}-${file#Dockerfile-}"
        echo "  ${dockerfile} → ${DOCKER_USER}/${STACK_NAME}-${IMAGE_NAME}:local"
    done <<< "$DOCKERFILES"
    echo "-----------------"
    echo "💬 Building and pushing to Docker Hub..."
    while IFS= read -r dockerfile; do
        dir=$(dirname "$dockerfile")
        file=$(basename "$dockerfile")
        dir_name=$(basename "$dir")
        [[ "$file" == "Dockerfile" ]] && IMAGE_NAME="$dir_name" || IMAGE_NAME="${dir_name}-${file#Dockerfile-}"
        HUB_TAG="${DOCKER_USER}/${STACK_NAME}-${IMAGE_NAME}:local"
        echo "  🔨 Building ${IMAGE_NAME}..."
        docker build -t "$HUB_TAG" -f "$dockerfile" .
        docker push "$HUB_TAG"
        echo "  ✓ ${IMAGE_NAME} → ${HUB_TAG}"
    done <<< "$DOCKERFILES"
    STACK_CONFIG=$(echo "$STACK_CONFIG" \
        | sed "s|ghcr\.io/eventonight/eventonight/\([^:]*\):latest|${DOCKER_USER}/${STACK_NAME}-\1:local|g")
fi

echo "$STACK_CONFIG" | docker stack deploy \
        --detach=false \
        --compose-file - \
        "$STACK_NAME"
echo "💬 Stack '$STACK_NAME' deployed successfully."

if [[ "$FIRST_DEPLOY" == true ]]; then
    echo "💬 First deploy detected, initializing the database..."
    EVENT_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-events" --format "{{.Names}}" | head -1)
    INTERACTION_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-interactions" --format "{{.Names}}" | head -1)
    CHAT_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-chat" --format "{{.Names}}" | head -1)
    TICKETING_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-ticketing" --format "{{.Names}}" | head -1)
    NOTIFICATION_CONTAINER=$(docker ps --filter "name=${STACK_NAME}_mongo-notifications" --format "{{.Names}}" | head -1)
    ./scripts/composeAll.sh --project-name "$STACK_NAME" -p ./infrastructure/seed --swarm run --rm \
        -e "EVENT_MONGO_URI=${EVENT_CONTAINER}" \
        -e "INTERACTION_MONGO_URI=${INTERACTION_CONTAINER}" \
        -e "CHAT_MONGO_URI=${CHAT_CONTAINER}" \
        -e "PAYMENT_MONGO_URI=${TICKETING_CONTAINER}" \
        -e "NOTIFICATION_MONGO_URI=${NOTIFICATION_CONTAINER}" \
        seed
    echo "💬 Database initialized."
fi
