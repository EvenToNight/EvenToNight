#!/usr/bin/env bash
set -euo pipefail

ENV=${ENV:-prod}
EXCHANGE="eventonight"
VHOST="/"

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
if [[ -f "$ROOT_DIR/.env" ]]; then
  export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
fi

if [ "$ENV" == "prod" ] && [ -n "${RABBITMQ_USER:-}" ] && [ -n "${RABBITMQ_PASS:-}" ]; then
  USER="$RABBITMQ_USER"
  PASS="$RABBITMQ_PASS"
else
  USER="guest"
  PASS="guest"
fi

USER_CREATED='{"eventType": "user.created", "occurredAt": "2026-01-17T12:00:00Z", "payload": {"id": "1", "username": "federico", "name": "Federico Rossi", "email": "federico@example.com", "avatar": "avatar.png", "bio": "Scala dev", "interests": ["music", "coding"], "language": "it", "role": "admin"}}'
USER_UPDATED='{"eventType": "user.updated", "occurredAt": "2026-01-17T12:05:00Z", "payload": {"id": "1", "username": "federico", "name": "Federico Rossi", "email": "federico.new@example.com", "avatar": "avatar.png", "bio": "Scala dev", "interests": ["music", "coding", "reading"], "language": "en", "role": "admin"}}'
USER_DELETED='{"eventType": "user.deleted", "occurredAt": "2026-01-17T12:10:00Z", "payload": {"id": "1"}}'

function send_event() {
  local key=$1
  local payload=$2
  echo -e "\nPress ENTER to send $key..."
  read -r
  rabbitmqadmin -u "$USER" -p "$PASS" -V "$VHOST" publish \
    exchange="$EXCHANGE" \
    routing_key="$key" \
    payload="$payload"
}

send_event user.created   "$USER_CREATED"
send_event user.updated   "$USER_UPDATED"
send_event user.deleted   "$USER_DELETED"

echo -e "\nAll messages have been sent."
