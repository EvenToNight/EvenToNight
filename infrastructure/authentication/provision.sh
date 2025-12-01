#!/usr/bin/env bash

echo "[Provisioning] Logging in with kcadm..."
/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://keycloak:8080 \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD"
echo "[Provisioning] Login successful!"

REALM="eventonight"
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

echo "[Provisioning] Fetching service account for $CLIENT_ID..."
SERVICE_ACCOUNT_ID=$(/opt/keycloak/bin/kcadm.sh get clients/$CLIENT_UUID/service-account-user -r $REALM | grep -oP '"id"\s*:\s*"\K[^"]+')
echo "[Provisioning] SERVICE_ACCOUNT_ID = $SERVICE_ACCOUNT_ID"

echo "[Provisioning] Fetching realm-management client UUID..."
REALM_MGMT_CLIENT_UUID=$(/opt/keycloak/bin/kcadm.sh get clients -r $REALM | tr -d '\n' | grep -oP '"id"\s*:\s*"\K[0-9a-f-]+(?="\s*,\s*"clientId"\s*:\s*"realm-management")')
echo "[Provisioning] REALM_MGMT_CLIENT_UUID = $REALM_MGMT_CLIENT_UUID"

echo "[Provisioning] Fetching manage-users role ID..."
MANAGE_USERS_ROLE_ID=$(/opt/keycloak/bin/kcadm.sh get clients/$REALM_MGMT_CLIENT_UUID/roles/manage-users -r $REALM | tr -d '\n' | grep -oP '"id"\s*:\s*"\K[0-9a-f-]+')
echo "[Provisioning] MANAGE_USERS_ROLE_ID = $MANAGE_USERS_ROLE_ID"

echo "[Provisioning] Assigning manage-users role to service account..."
/opt/keycloak/bin/kcadm.sh create users/$SERVICE_ACCOUNT_ID/role-mappings/clients/$REALM_MGMT_CLIENT_UUID -r $REALM -f <(echo '[{"id":"'"$MANAGE_USERS_ROLE_ID"'","name":"manage-users"}]')
echo "[Provisioning] Role assigned successfully."

CURRENT_SECRET=$(/opt/keycloak/bin/kcadm.sh get clients/$CLIENT_UUID/client-secret -r eventonight --fields value --format csv | tail -n1 | tr -d '"')

if [ "$CURRENT_SECRET" != "$USERS_SERVICE_SECRET" ]; then
  echo "[Provisioning] Updating client '$CLIENT_ID' secret..."
  /opt/keycloak/bin/kcadm.sh update clients/$CLIENT_UUID -r eventonight -s "secret=$USERS_SERVICE_SECRET"
  echo "[Provisioning] Client secret updated."
else
  echo "[Provisioning] Client secret already up to date, skipping update."
fi
