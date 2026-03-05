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

EXAMPLES
    ./swarmRecover.sh
        Recover the default stack.

    ./swarmRecover.sh my-stack
        Recover a custom stack.
'
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

STACK_NAME="${1:-eventonight-swarm}"

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
