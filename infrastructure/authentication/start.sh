#!/usr/bin/env bash

REALM_FILE="/opt/keycloak/data/import/eventonight-realm.json"

if [ ! -f "$REALM_FILE" ]; then
    echo "[ERROR] Realm file $REALM_FILE not found. Keycloak cannot start."
    exit 1
fi

echo "Starting Keycloak..."
exec /opt/keycloak/bin/kc.sh start \
  --db=postgres \
  --db-url-host="${KC_DB_URL_HOST}" \
  --db-username="${KC_DB_USERNAME}" \
  --db-password="${KC_DB_PASSWORD}" \
  --http-enabled=true \
  --hostname="${KC_HOSTNAME}" \
  --hostname-strict=false \
  --hostname-strict-https=false \
  --import-realm
