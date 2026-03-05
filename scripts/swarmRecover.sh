#!/usr/bin/env bash
: '
Swarm Recovery Script

SYNOPSIS
    ./swarmRecover.sh [STACK_NAME]

DESCRIPTION
    Force-updates all services in the given stack that are not fully running
    (i.e. replicas desired > replicas running), excluding one-shot services
    that have already completed.

PARAMETERS
    STACK_NAME    Optional. Defaults to eventonight-swarm.

OPTIONS
    --status
        Print a status table of all services in the stack and exit.

EXAMPLES
    ./swarmRecover.sh
        Recover the default stack.

    ./swarmRecover.sh my-stack
        Recover a custom stack.

    ./swarmRecover.sh --status
        Show service status table.
'
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

STACK_NAME="eventonight-swarm"
STATUS=false

for arg in "$@"; do
    if [[ "$arg" == "--status" ]]; then
        STATUS=true
    elif [[ "$arg" != --* ]]; then
        STACK_NAME="$arg"
    fi
done

if [[ "$STATUS" == true ]]; then
    docker stack services "$STACK_NAME" --format "table {{.Name}}\t{{.Replicas}}\t{{.Image}}" 2>&1
    echo ""
    docker stack ps "$STACK_NAME" \
        --filter "desired-state=running" \
        --format "table {{.Name}}\t{{.Node}}\t{{.CurrentState}}\t{{.Error}}" 2>&1
    exit 0
fi

echo "💬 Checking services in stack '$STACK_NAME'..."

FAILING=$(docker stack services "$STACK_NAME" \
    --format "{{.Name}}\t{{.Replicas}}" \
    | awk -F'\t' '
        {
            replicas = $2
            if (replicas ~ /completed/) next
            if (split(replicas, a, "/") == 2 && a[1]+0 < a[2]+0) print $1
        }
    ')

if [[ -z "$FAILING" ]]; then
    echo "✅ All services are running."
    exit 0
fi

echo "💬 Services to recover:"
echo "$FAILING" | sed 's/^/  /'
echo "-----------------"

while IFS= read -r svc; do
    echo "🔄 Force-updating $svc..."
    docker service update --force --detach "$svc" || echo "  ⚠️  Failed to update $svc"
done <<< "$FAILING"

echo "💬 Recovery triggered. Services are restarting in background."
