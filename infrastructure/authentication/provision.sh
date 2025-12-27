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

echo ""
echo "[Provisioning][$REALM] Disabling default Required Actions..."

REQUIRED_ACTIONS=(
  CONFIGURE_TOTP
  UPDATE_PASSWORD
  UPDATE_PROFILE
  VERIFY_EMAIL
  VERIFY_PROFILE
)

for action in "${REQUIRED_ACTIONS[@]}"; do
  echo "[Provisioning] Disabling Required Action: $action..."
  if /opt/keycloak/bin/kcadm.sh update authentication/required-actions/$action \
    -r "$REALM" \
    -s enabled=false \
    -s defaultAction=false; then
    echo "[Provisioning] $action disabled."
  else
    echo "[Provisioning][WARNING] Failed to disable $action. It may not exist."
  fi
done

echo "[Provisioning][$REALM] Required Actions configuration completed."

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

echo ""
echo "[Provisioning][$REALM] Configuring user profile attributes..."

CUSTOM_USER_PROFILE="/opt/keycloak/user-profile.json"
if [ ! -f "$CUSTOM_USER_PROFILE" ]; then
  echo "[Provisioning][ERROR] Custom User Profile JSON not found: $CUSTOM_USER_PROFILE, aborting!"
  exit 1
fi
 
if /opt/keycloak/bin/kcadm.sh update users/profile -r "$REALM" -f "$CUSTOM_USER_PROFILE" 2>/dev/null; then
  echo "[Provisioning] Custom user profile configured successfully."
else
  echo "[Provisioning][WARNING] Failed to update user profile automatically."
  echo "[Provisioning] You may need to configure the desired attributes manually via Admin Console."
fi

echo ""
MAPPER_JSON="/opt/keycloak/custom-user-id-mapper.json"
if [ ! -f "$MAPPER_JSON" ]; then
  echo "[Provisioning][ERROR] Mapper JSON not found: $MAPPER_JSON, aborting!"
  exit 1
fi

MAPPER_EXISTS=$(/opt/keycloak/bin/kcadm.sh get clients/"$CLIENT_UUID"/protocol-mappers/models -r "$REALM" | grep '"name" : "custom-user-id-mapper"' || true)
if [ -z "$MAPPER_EXISTS" ]; then
  echo "[Provisioning][$REALM][$CLIENT_ID] Creating protocol mapper custom-user-id-mapper..."
  if /opt/keycloak/bin/kcadm.sh create clients/$CLIENT_UUID/protocol-mappers/models -r "$REALM" -f "$MAPPER_JSON" &>/dev/null; then
    echo "[Provisioning] Protocol mapper created successfully."
  else
    echo "[Provisioning][WARNING] Failed to create protocol mapper."
  fi
else
  echo "[Provisioning] Protocol mapper custom-user-id-mapper already exists, skipping creation."  
fi

echo ""
echo "[Provisioning] Provisioning completed."
