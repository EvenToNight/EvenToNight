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
        Default: eventonight-swarm

    --dev
        Include docker-compose-dev.yaml files in the search.

    --local
        Use local images instead of pulling from the registry (--resolve-image never).
        Useful for testing with locally built images.

    --build
        Build and push images to Docker Hub (multi-arch). Without --local, exits after build without deploying.

    --remove-local-images
        Delete all :local tagged images from Docker Hub (pushed via --local).

    --auto-labels
        Automatically assign missing node.labels constraints found in swarm compose files to swarm nodes, balancing the distribution across available nodes.


EXAMPLES:
    ./swarmDeploy.sh
        Deploy the stack using registry images.

    ./swarmDeploy.sh --auto-labels
        Deploy the stack, auto-assigning missing node labels before deploying.

    ./swarmDeploy.sh --local
        Deploy using already-pushed local images (no build).

    ./swarmDeploy.sh --build
        Build and push images only (no deploy).

    ./swarmDeploy.sh --local --build
        Build, push, and deploy using local images.

    ./swarmDeploy.sh --local --build --auto-labels
        Build, push, auto-assign labels, and deploy.

    ./swarmDeploy.sh --stop
        Remove the stack (volumes are preserved).

    ./swarmDeploy.sh --stop --remove-volumes
        Remove the stack and all its volumes.

    ./swarmDeploy.sh --remove-local-images
        Delete all :local images pushed to Docker Hub for this stack.

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
BUILD=false
AUTO_LABELS=false
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
    elif [[ "$arg" == "--build" ]]; then
        BUILD=true
    elif [[ "$arg" == "--auto-labels" ]]; then
        AUTO_LABELS=true
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
    echo "💬 Waiting for stack tasks to be fully removed on all nodes..."
    while docker node ls -q 2>/dev/null | xargs -I{} docker node ps {} --format "{{.Name}}" --filter "desired-state=shutdown" 2>/dev/null | grep -q "^${STACK_NAME}_"; do
        sleep 2
    done
    echo "💬 Removing leftover networks..."
    docker network ls --format "{{.Name}}" \
        | grep "^${STACK_NAME}_" \
        | xargs -r docker network rm 2>/dev/null || true
    echo "💬 Stack '$STACK_NAME' removed."
fi

if [[ "$REMOVE_VOLUMES" == true ]]; then
    echo "💬 Removing volumes for stack '$STACK_NAME' on all nodes..."
    docker service create --detach \
        --name "${STACK_NAME}-volume-cleanup" \
        --mode global \
        --restart-condition none \
        --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
        docker:cli sh -c "
            while docker ps -q --filter 'label=com.docker.stack.namespace=${STACK_NAME}' 2>/dev/null | grep -q .; do
                echo 'Waiting for stack containers to stop...'
                sleep 3
            done
            VOLUMES=\$(docker volume ls -q --filter \"label=com.docker.stack.namespace=${STACK_NAME}\" 2>/dev/null)
            VOLUMES_BY_NAME=\$(docker volume ls -q 2>/dev/null | grep \"^${STACK_NAME}_\" || true)
            ALL=\$(printf '%s\n%s' \"\$VOLUMES\" \"\$VOLUMES_BY_NAME\" | sort -u | sed '/^$/d')
            if [ -n \"\$ALL\" ]; then
                echo \"\$ALL\" | xargs docker volume rm
            else
                echo 'No volumes found.'
            fi
        " > /dev/null
    echo "💬 Waiting for cleanup to complete..."
    NODE_COUNT=$(docker node ls -q 2>/dev/null | wc -l | tr -d ' ')
    while true; do
        COMPLETED=$(docker service ps "${STACK_NAME}-volume-cleanup" --format "{{.CurrentState}}" 2>/dev/null | grep -ci "complete" || true)
        [[ "$COMPLETED" -ge "$NODE_COUNT" ]] && break
        sleep 2
    done
    docker service logs "${STACK_NAME}-volume-cleanup" 2>/dev/null || true
    docker service rm "${STACK_NAME}-volume-cleanup" > /dev/null 2>&1 || true
    echo "💬 Volumes removed."
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

if [[ "$BUILD" == true ]]; then
    docker login
    DOCKER_USER=$(docker login 2>&1 | sed -n 's/.*\[Username: \([^]]*\)\].*/\1/p; s/.*[Ll]ogged in as \([^ ]*\).*/\1/p' | head -1 || true)
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
    echo "💬 Building and pushing to Docker Hub (multi-arch: linux/amd64,linux/arm64)..."
    if ! docker buildx inspect multiarch &>/dev/null; then
        docker buildx create --name multiarch --driver docker-container
        docker buildx inspect --builder multiarch --bootstrap
    fi
    BUILD_PIDS=()
    BUILD_NAMES=()
    while IFS= read -r dockerfile; do
        dir=$(dirname "$dockerfile")
        file=$(basename "$dockerfile")
        dir_name=$(basename "$dir")
        [[ "$file" == "Dockerfile" ]] && IMAGE_NAME="$dir_name" || IMAGE_NAME="${dir_name}-${file#Dockerfile-}"
        HUB_TAG="${DOCKER_USER}/${STACK_NAME}-${IMAGE_NAME}:local"
        echo "  🔨 Building ${IMAGE_NAME}..."
        docker buildx build --builder multiarch --platform linux/amd64,linux/arm64 --push -t "$HUB_TAG" -f "$dockerfile" . &
        BUILD_PIDS+=($!)
        BUILD_NAMES+=("$IMAGE_NAME")
    done <<< "$DOCKERFILES"
    BUILD_FAILED=false
    for i in "${!BUILD_PIDS[@]}"; do
        if wait "${BUILD_PIDS[$i]}"; then
            echo "  ✓ ${BUILD_NAMES[$i]}"
        else
            echo "  ❌ ${BUILD_NAMES[$i]} failed"
            BUILD_FAILED=true
        fi
    done
    [[ "$BUILD_FAILED" == true ]] && exit 1
    docker buildx stop multiarch
    echo "💬 Build complete."
    [[ "$LOCAL" == false ]] && exit 0
fi

if ! docker node ls &>/dev/null; then
    echo "❌ Not in a Docker Swarm. Run 'docker swarm init' or join a swarm as a manager first."
    exit 1
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

COMPOSE_DEFAULT=$(grep -oh 'RABBITMQ_REPLICAS:-[0-9]*' infrastructure/message-broker/docker-compose-swarm.yaml 2>/dev/null \
    | sed 's/RABBITMQ_REPLICAS:-//' | head -1)
DESIRED="${RABBITMQ_REPLICAS:-${COMPOSE_DEFAULT:-1}}"
NODE_COUNT=$(docker node ls --format "{{.ID}}" 2>/dev/null | wc -l | tr -d ' ')
[[ "$NODE_COUNT" -lt "$DESIRED" ]] && export RABBITMQ_REPLICAS=1 || export RABBITMQ_REPLICAS="$DESIRED"

FIRST_DEPLOY=false
docker stack ls --format "{{.Name}}" | grep -q "^${STACK_NAME}$" || FIRST_DEPLOY=true

echo "💬 Deploying stack '$STACK_NAME'..."
COMPOSE_CONFIG=$(docker compose \
    --project-name "$STACK_NAME" \
    --project-directory . \
    --env-file ./.env \
    ${COMPOSE_ARGS[@]+"${COMPOSE_ARGS[@]}"} \
    config)
#echo "$COMPOSE_CONFIG"
echo "-----------------"
export COMPOSE_PROJECT_NAME="$STACK_NAME"
STACK_CONFIG=$(echo "$COMPOSE_CONFIG" \
    | sed '/^name:/d; s/published: "\([0-9]*\)"/published: \1/g; s|@sha256:[a-f0-9]*||g' \
    | awk '/^    depends_on:/{skip=1;next} skip && /^      /{next} {skip=0;print}')

if [[ "$LOCAL" == true ]]; then
    if [[ -z "${DOCKER_USER:-}" ]]; then
        docker login
        DOCKER_USER=$(docker login 2>&1 | sed -n 's/.*\[Username: \([^]]*\)\].*/\1/p; s/.*[Ll]ogged in as \([^ ]*\).*/\1/p' | head -1 || true)
        if [[ -z "$DOCKER_USER" ]]; then
            echo "❌ Could not determine Docker Hub username."
            exit 1
        fi
    fi
    echo "💬 Using local images from Docker Hub user: ${DOCKER_USER}"
    STACK_CONFIG=$(echo "$STACK_CONFIG" \
        | sed "s|ghcr\.io/eventonight/eventonight/\([^:]*\):latest|${DOCKER_USER}/${STACK_NAME}-\1:local|g")
fi

# Check and optionally assign node.labels placement constraints
REQUIRED_LABELS=$(grep -rh 'node\.labels\.' services/ infrastructure/ --include="*swarm*" 2>/dev/null \
    | grep -oE 'node\.labels\.[^[:space:]]+[[:space:]]*==[[:space:]]*[^[:space:]]+' \
    | sed 's/node\.labels\.//' \
    | sed 's/[[:space:]]*==[[:space:]]*/=/' \
    | sort -u || true)

if [[ -n "$REQUIRED_LABELS" ]]; then
    echo "💬 Checking node labels..."
    MISSING_LABELS=""
    while IFS= read -r label_pair; do
        LABEL_NAME="${label_pair%%=*}"
        LABEL_VALUE="${label_pair#*=}"
        LABELED_NODE=""
        while IFS= read -r node; do
            if docker node inspect "$node" --format "{{json .Spec.Labels}}" 2>/dev/null | grep -q "\"${LABEL_NAME}\":\"${LABEL_VALUE}\""; then
                LABELED_NODE="$node"
                break
            fi
        done < <(docker node ls -q 2>/dev/null)
        if [[ -n "$LABELED_NODE" ]]; then
            HOSTNAME=$(docker node inspect "$LABELED_NODE" --format "{{.Description.Hostname}}" 2>/dev/null)
            echo "  ✓ $LABEL_NAME=$LABEL_VALUE → $HOSTNAME ($LABELED_NODE)"
        else
            echo "  ✗ $LABEL_NAME=$LABEL_VALUE → not assigned"
            MISSING_LABELS="${MISSING_LABELS}"$'\n'"${label_pair}"
        fi
    done <<< "$REQUIRED_LABELS"
    MISSING_LABELS="${MISSING_LABELS#$'\n'}"

    if [[ -n "$MISSING_LABELS" && "$AUTO_LABELS" == true ]]; then
        echo "💬 Assigning missing labels..."
        while IFS= read -r label_pair; do
            LABEL_NAME="${label_pair%%=*}"
            LABEL_VALUE="${label_pair#*=}"
            BEST_NODE=""
            BEST_COUNT=999
            while IFS= read -r node; do
                COUNT=$(docker node inspect "$node" --format "{{json .Spec.Labels}}" 2>/dev/null | (grep -o '"[^"]*":' || true) | wc -l | tr -d ' ')
                if [[ "$COUNT" -lt "$BEST_COUNT" ]]; then
                    BEST_COUNT=$COUNT
                    BEST_NODE=$node
                fi
            done < <(docker node ls -q 2>/dev/null)
            if [[ -n "$BEST_NODE" ]]; then
                HOSTNAME=$(docker node inspect "$BEST_NODE" --format "{{.Description.Hostname}}" 2>/dev/null)
                docker node update --label-add "${LABEL_NAME}=${LABEL_VALUE}" "$BEST_NODE" > /dev/null
                echo "  ✓ $LABEL_NAME=$LABEL_VALUE → $HOSTNAME ($BEST_NODE)"
            fi
        done <<< "$MISSING_LABELS"
    elif [[ -n "$MISSING_LABELS" ]]; then
        echo "  ⚠️  Use --auto-labels to assign missing labels automatically"
    fi
fi

DEPLOY_ARGS=(--detach=false --compose-file -)
[[ "$LOCAL" == true ]] && DEPLOY_ARGS+=(--with-registry-auth)
echo "$STACK_CONFIG" | docker stack deploy \
        "${DEPLOY_ARGS[@]}" \
        "$STACK_NAME"
echo "💬 Stack '$STACK_NAME' deployed successfully."

if [[ "$FIRST_DEPLOY" == true ]]; then
    echo "💬 First deploy detected, initializing the database..."
    SEED_FIND_ARGS=(-p ./infrastructure/seed --swarm)
    SEED_COMPOSE_FILES=$(./scripts/findComposeFiles.sh "${SEED_FIND_ARGS[@]}")
    SEED_COMPOSE_ARGS=()
    for file in $SEED_COMPOSE_FILES; do
        SEED_COMPOSE_ARGS+=(-f "$file")
    done
    SEED_CONFIG=$(docker compose --project-name "$STACK_NAME" --project-directory . --env-file ./.env "${SEED_COMPOSE_ARGS[@]}" config)
    if [[ "$LOCAL" == true ]]; then
        SEED_CONFIG=$(echo "$SEED_CONFIG" \
            | sed "s|ghcr\.io/eventonight/eventonight/\([^:]*\):latest|${DOCKER_USER}/${STACK_NAME}-\1:local|g")
    fi
    echo "$SEED_CONFIG" | docker compose --project-name "$STACK_NAME" --project-directory . -f - run --rm seed
    echo "💬 Database initialized."
fi
