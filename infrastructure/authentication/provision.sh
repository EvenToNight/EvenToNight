#!/usr/bin/env bash

REALM="eventonight"
CLIENT_ID="users-service"

echo "[Provisioning] Logging in with kcadm..."
/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://keycloak:8080 \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD" > /dev/null 2>&1
echo "[Provisioning] Login successful!"

EXISTING=$(/opt/keycloak/bin/kcadm.sh get clients -r "$REALM" --fields id,clientId | grep "\"clientId\" : \"$CLIENT_ID\"" || true)
if [ -z "$EXISTING" ]; then
  echo "[Provisioning] Creating client '$CLIENT_ID'..."
  /opt/keycloak/bin/kcadm.sh create clients -r "$REALM" \
    -s clientId="$CLIENT_ID" \
    -s enabled=true \
    -s protocol=openid-connect \
    -s publicClient=false \
    -s serviceAccountsEnabled=true
else
  echo "[Provisioning] Client '$CLIENT_ID' already exists, skipping creation."
fi

CLIENT_UUID=$(/opt/keycloak/bin/kcadm.sh get clients -r "$REALM" --query "clientId=$CLIENT_ID" --fields id --format csv | tail -n1 | tr -d '"')
echo "[Provisioning] CLIENT_UUID = $CLIENT_UUID"

echo "[Provisioning] Fetching service account for $CLIENT_ID..."
SERVICE_ACCOUNT_ID=$(/opt/keycloak/bin/kcadm.sh get clients/"$CLIENT_UUID"/service-account-user -r "$REALM" | grep -oP '"id"\s*:\s*"\K[^"]+')
echo "[Provisioning] SERVICE_ACCOUNT_ID = $SERVICE_ACCOUNT_ID"

echo "[Provisioning] Fetching realm-management client UUID..."
REALM_MGMT_CLIENT_UUID=$(/opt/keycloak/bin/kcadm.sh get clients -r "$REALM" | tr -d '\n' | grep -oP '"id"\s*:\s*"\K[0-9a-f-]+(?="\s*,\s*"clientId"\s*:\s*"realm-management")')
echo "[Provisioning] REALM_MGMT_CLIENT_UUID = $REALM_MGMT_CLIENT_UUID"

ROLES=("manage-users" "view-realm")
echo "[Provisioning] Assigning roles to service account…"

for role in "${ROLES[@]}"; do
  echo "[Provisioning] Fetching role '$role'…"

  ROLE_ID=$(/opt/keycloak/bin/kcadm.sh get clients/"$REALM_MGMT_CLIENT_UUID"/roles/"$role" -r "$REALM" | grep -oP '"id"\s*:\s*"\K[^"]+')

  if [ -z "$ROLE_ID" ]; then
    echo "[Provisioning][ERROR] Role '$role' not found in realm-management, aborting!"
    exit 1
  fi
  echo "[Provisioning] $role id = $ROLE_ID"

  EXISTS=$(/opt/keycloak/bin/kcadm.sh get users/"$SERVICE_ACCOUNT_ID"/role-mappings/clients/"$REALM_MGMT_CLIENT_UUID" -r "$REALM" \
           | grep -oP '"id"\s*:\s*"\K[^"]+' | grep -x "$ROLE_ID" || true)
  if [[ -n "$EXISTS" ]]; then
    echo "[Provisioning] '$role' already assigned, skipping."
    continue
  fi

  echo "[Provisioning] Assigning '$role'…"
  /opt/keycloak/bin/kcadm.sh create users/"$SERVICE_ACCOUNT_ID"/role-mappings/clients/"$REALM_MGMT_CLIENT_UUID" -r "$REALM" -f <(echo '[{"id":"'"$ROLE_ID"'","name":"'"$role"'"}]') || echo "[Provisioning][ERROR] Failed to assign role '$role'"
done
echo "[Provisioning] Roles assigned."

CURRENT_SECRET=$(/opt/keycloak/bin/kcadm.sh get clients/"$CLIENT_UUID"/client-secret -r "$REALM" --fields value --format csv | tail -n1 | tr -d '"')

if [ "$CURRENT_SECRET" != "$USERS_SERVICE_SECRET" ]; then
  echo "[Provisioning] Updating client '$CLIENT_ID' secret..."
  /opt/keycloak/bin/kcadm.sh update clients/"$CLIENT_UUID" -r "$REALM" -s "secret=$USERS_SERVICE_SECRET"
  echo "[Provisioning] Client secret updated."
else
  echo "[Provisioning] Client secret already up to date, skipping update."
fi