#!/usr/bin/env bash

echo "[Provisioning] Logging in with kcadm..."
/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://keycloak:8080 \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD"
echo "[Provisioning] Login successful!"

CLIENT_ID="users-service"

EXISTING=$(/opt/keycloak/bin/kcadm.sh get clients -r eventonight --fields id,clientId | grep "\"clientId\" : \"$CLIENT_ID\"" || true)

if [ -z "$EXISTING" ]; then
  echo "[Provisioning] Creating client '$CLIENT_ID'..."
  /opt/keycloak/bin/kcadm.sh create clients -r eventonight \
    -s clientId="$CLIENT_ID" \
    -s enabled=true \
    -s protocol=openid-connect \
    -s publicClient=false \
    -s serviceAccountsEnabled=true
else
  echo "[Provisioning] Client '$CLIENT_ID' already exists, skipping creation."
fi

CLIENT_UUID=$(/opt/keycloak/bin/kcadm.sh get clients -r eventonight --query "clientId=$CLIENT_ID" --fields id --format csv | tail -n1 | tr -d '"')
echo "[Provisioning] CLIENT_UUID = $CLIENT_UUID"

CURRENT_SECRET=$(/opt/keycloak/bin/kcadm.sh get clients/$CLIENT_UUID/client-secret -r eventonight --fields value --format csv | tail -n1 | tr -d '"')

if [ "$CURRENT_SECRET" != "$USERS_SERVICE_SECRET" ]; then
  echo "[Provisioning] Updating client '$CLIENT_ID' secret..."
  /opt/keycloak/bin/kcadm.sh update clients/$CLIENT_UUID -r eventonight -s "secret=$USERS_SERVICE_SECRET"
  echo "[Provisioning] Client secret updated."
else
  echo "[Provisioning] Client secret already up to date, skipping update."
fi
