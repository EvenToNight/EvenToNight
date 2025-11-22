#!/usr/bin/env bash

REALM_FILE="/opt/keycloak/data/import/eventonight-realm.json"

if [ ! -f "$REALM_FILE" ]; then
    echo "[ERROR] Realm file $REALM_FILE not found. Keycloak cannot start."
    exit 1
fi

echo "Starting Keycloak..."
exec /opt/keycloak/bin/kc.sh start-dev --import-realm
