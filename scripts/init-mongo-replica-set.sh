#!/usr/bin/env bash
set -euo pipefail

: '
MongoDB Replica Set Initialization Script

SYNOPSIS
    ./init-mongo-replica-set.sh

DESCRIPTION
    This script initializes a MongoDB replica set with dynamic member configuration.

    The script checks if the replica set is already initialized using rs.status().
    If not initialized, it creates a new replica set with the specified number of nodes.

ENVIRONMENT VARIABLES
    MONGO_HOST (required)
        The hostname of the primary MongoDB node.
        Example: mongo-service

    REPLICA_SET_NODES_NUMBER (optional, default: 1)
        Number of replica set nodes to configure.
        Example: 1, 3, 5

    REPLICA_SET_NAME (optional, default: rs0)
        Name of the replica set.
        Example: rs0, myReplicaSet

EXAMPLES
    # Single node replica set
    MONGO_HOST=mongo-payments REPLICA_SET_NODES=1 ./init-mongo-replica-set.sh

    # Three node replica set (for production)
    MONGO_HOST=mongo-payments REPLICA_SET_NODES=3 ./init-mongo-replica-set.sh

NOTES
    - This script is typically run as a Docker healthcheck or initialization script
    - The primary node (first node) is configured with priority 2
    - Secondary nodes are configured with priority 1
    - All nodes use port 27017
'

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

NUMBER_OF_NODES=${REPLICA_SET_NODES_NUMBER:-1}
REPLICA_SET_NAME=${REPLICA_SET_NAME:-rs0}


# Check if MONGO_HOST is set
if [ -z "${MONGO_HOST}" ]; then
  echo "ERROR: MONGO_HOST environment variable is not set"
  exit 1
fi

HOSTNAME="${MONGO_HOST}"

# Build members array dynamically
MEMBERS="["
for i in $(seq 0 $((NUMBER_OF_NODES-1))); do
  if [ $i -eq 0 ]; then
    HOST="${HOSTNAME}:27017"
    PRIORITY=2
  else
    HOST="${HOSTNAME}-$((i+1)):27017"
    PRIORITY=1
  fi

  MEMBERS="${MEMBERS}{_id:${i},host:'${HOST}',priority:${PRIORITY}}"

  # Add comma if not last element
  if [ $i -lt $((NUMBER_OF_NODES-1)) ]; then
    MEMBERS="${MEMBERS},"
  fi
done
MEMBERS="${MEMBERS}]"

# Execute initialization
echo "try { rs.status() } catch (err) { rs.initiate({_id:'${REPLICA_SET_NAME}',members:${MEMBERS}}) }" | mongosh --quiet
