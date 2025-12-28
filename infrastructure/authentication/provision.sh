#!/usr/bin/env bash

REALM="eventonight"
CLIENT_ID="users-service"
LOG_PREFIX="[Provisioning][$REALM]"

echo "[Provisioning] Logging in with kcadm..."
if /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://keycloak:8080 \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD" > /dev/null 2>&1; then
  echo "[Provisioning] Login successful!"
else
  echo "[Provisioning] [ERROR] Failed to login with kcadm, aborting!"
  exit 1
fi

echo ""
echo "[Provisioning] Starting Keycloak realm provisioning for '$REALM'"
echo ""

echo "$LOG_PREFIX Disabling default Required Actions..."

REQUIRED_ACTIONS=(
  CONFIGURE_TOTP
  UPDATE_PASSWORD
  UPDATE_PROFILE
  VERIFY_EMAIL
  VERIFY_PROFILE
)

for action in "${REQUIRED_ACTIONS[@]}"; do
  echo "$LOG_PREFIX Disabling Required Action: $action..."
  if /opt/keycloak/bin/kcadm.sh update authentication/required-actions/$action \
    -r "$REALM" \
    -s enabled=false \
    -s defaultAction=false; then
    echo "$LOG_PREFIX $action disabled."
  else
    echo "$LOG_PREFIX [WARNING] Failed to disable $action. It may not exist."
  fi
done

echo "$LOG_PREFIX Required Actions configuration completed."
echo ""

EXISTING=$(/opt/keycloak/bin/kcadm.sh get clients -r "$REALM" --fields id,clientId | grep "\"clientId\" : \"$CLIENT_ID\"" || true)
if [ -z "$EXISTING" ]; then
  echo "$LOG_PREFIX Creating client '$CLIENT_ID'..."
  if /opt/keycloak/bin/kcadm.sh create clients -r "$REALM" \
    -s clientId="$CLIENT_ID" \
    -s enabled=true \
    -s protocol=openid-connect \
    -s publicClient=false \
    -s serviceAccountsEnabled=true &>/dev/null; then
    echo "$LOG_PREFIX Client '$CLIENT_ID' created successfully."
  else
    echo "$LOG_PREFIX [ERROR] Failed to create client '$CLIENT_ID', aborting!"
    exit 1
  fi
else
  echo "$LOG_PREFIX Client '$CLIENT_ID' already exists, skipping creation."
fi

echo "$LOG_PREFIX[$CLIENT_ID] Fetching client UUID..."
if ! CLIENT_UUID=$(/opt/keycloak/bin/kcadm.sh get clients -r "$REALM" --query "clientId=$CLIENT_ID" --fields id --format csv | tail -n1 | tr -d '"'); then
  echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Failed to fetch client UUID, aborting!"
  exit 1
fi
if [ -z "$CLIENT_UUID" ]; then
  echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Client UUID is empty, aborting!"
  exit 1
fi
echo "$LOG_PREFIX[$CLIENT_ID] CLIENT_UUID = $CLIENT_UUID"

echo "$LOG_PREFIX[$CLIENT_ID] Fetching service account..."
if ! SERVICE_ACCOUNT_ID=$(/opt/keycloak/bin/kcadm.sh get clients/"$CLIENT_UUID"/service-account-user -r "$REALM" | grep -oP '"id"\s*:\s*"\K[^"]+'); then
  echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Failed to fetch service account ID, aborting!"
  exit 1
fi
if [ -z "$SERVICE_ACCOUNT_ID" ]; then
  echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Service account ID is empty, aborting!"
  exit 1
fi
echo "$LOG_PREFIX[$CLIENT_ID] SERVICE_ACCOUNT_ID = $SERVICE_ACCOUNT_ID"

echo "$LOG_PREFIX Fetching realm-management client UUID..."
if ! REALM_MGMT_CLIENT_UUID=$(/opt/keycloak/bin/kcadm.sh get clients -r "$REALM" | tr -d '\n' | grep -oP '"id"\s*:\s*"\K[0-9a-f-]+(?="\s*,\s*"clientId"\s*:\s*"realm-management")'); then
  echo "$LOG_PREFIX [ERROR] Failed to fetch realm-management client UUID, aborting!"
  exit 1
fi
if [ -z "$REALM_MGMT_CLIENT_UUID" ]; then
  echo "$LOG_PREFIX [ERROR] realm-management client UUID is empty, aborting!"
  exit 1
fi
echo "$LOG_PREFIX REALM_MGMT_CLIENT_UUID = $REALM_MGMT_CLIENT_UUID"

ROLES=("manage-users" "view-realm")
echo "$LOG_PREFIX[$CLIENT_ID] Assigning roles to service account..."

for role in "${ROLES[@]}"; do
  echo "$LOG_PREFIX Fetching role '$role'…"
  if ! ROLE_ID=$(/opt/keycloak/bin/kcadm.sh get clients/"$REALM_MGMT_CLIENT_UUID"/roles/"$role" -r "$REALM" | grep -oP '"id"\s*:\s*"\K[^"]+'); then
    echo "$LOG_PREFIX [ERROR] Failed to fetch role ID for role '$role', aborting!"
    exit 1
  fi
  if [ -z "$ROLE_ID" ]; then
    echo "$LOG_PREFIX [ERROR] Role '$role' not found, aborting!"
    exit 1
  fi

  EXISTS=$(/opt/keycloak/bin/kcadm.sh get users/"$SERVICE_ACCOUNT_ID"/role-mappings/clients/"$REALM_MGMT_CLIENT_UUID" -r "$REALM" \
           | grep -oP '"id"\s*:\s*"\K[^"]+' | grep -x "$ROLE_ID" || true)
  if [[ -n "$EXISTS" ]]; then
    echo "$LOG_PREFIX[$CLIENT_ID] Role '$role' already assigned, skipping."
    continue
  fi

  echo "$LOG_PREFIX[$CLIENT_ID] Assigning role '$role'..."
  if /opt/keycloak/bin/kcadm.sh create users/"$SERVICE_ACCOUNT_ID"/role-mappings/clients/"$REALM_MGMT_CLIENT_UUID" -r "$REALM" -f <(echo '[{"id":"'"$ROLE_ID"'","name":"'"$role"'"}]'); then
    echo "$LOG_PREFIX[$CLIENT_ID] Role '$role' assigned successfully."
  else
    echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Failed to assign role '$role', aborting!"
    exit 1
  fi
done
echo "$LOG_PREFIX[$CLIENT_ID] Roles assigned."
echo ""

echo "$LOG_PREFIX[$CLIENT_ID] Fetching current client secret..."
if ! CURRENT_SECRET=$(/opt/keycloak/bin/kcadm.sh get clients/"$CLIENT_UUID"/client-secret -r "$REALM" --fields value --format csv | tail -n1 | tr -d '"'); then
  echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Failed to fetch current client secret, aborting!"
  exit 1
fi
if [ "$CURRENT_SECRET" != "$USERS_SERVICE_SECRET" ]; then
  echo "$LOG_PREFIX[$CLIENT_ID] Updating client secret..."
  if /opt/keycloak/bin/kcadm.sh update clients/"$CLIENT_UUID" -r "$REALM" -s "secret=$USERS_SERVICE_SECRET"; then
    echo "$LOG_PREFIX[$CLIENT_ID] Client secret updated successfully."
  else
    echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Failed to update client secret, aborting!"
    exit 1
  fi
else
  echo "$LOG_PREFIX[$CLIENT_ID] Client secret already up to date, skipping update."
fi

echo ""
echo "$LOG_PREFIX Configuring user profile attributes..."

CUSTOM_USER_PROFILE="/opt/keycloak/user-profile.json"
if [ ! -f "$CUSTOM_USER_PROFILE" ]; then
  echo "$LOG_PREFIX [ERROR] Custom User Profile JSON not found: $CUSTOM_USER_PROFILE, aborting!"
  exit 1
fi
 
if /opt/keycloak/bin/kcadm.sh update users/profile -r "$REALM" -f "$CUSTOM_USER_PROFILE" 2>/dev/null; then
  echo "$LOG_PREFIX Custom user profile configured successfully."
else
  echo "$LOG_PREFIX [ERROR] Failed to update user profile, aborting!"
  exit 1
fi

echo ""
MAPPER_JSON="/opt/keycloak/custom-user-id-mapper.json"
if [ ! -f "$MAPPER_JSON" ]; then
  echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Mapper JSON not found: $MAPPER_JSON, aborting!"
  exit 1
fi

MAPPER_EXISTS=$(/opt/keycloak/bin/kcadm.sh get clients/"$CLIENT_UUID"/protocol-mappers/models -r "$REALM" | grep '"name" : "custom-user-id-mapper"' || true)
if [ -z "$MAPPER_EXISTS" ]; then
  echo "$LOG_PREFIX[$CLIENT_ID] Creating protocol mapper 'custom-user-id-mapper'..."
  if /opt/keycloak/bin/kcadm.sh create clients/$CLIENT_UUID/protocol-mappers/models -r "$REALM" -f "$MAPPER_JSON" &>/dev/null; then
    echo "$LOG_PREFIX[$CLIENT_ID] Protocol mapper 'custom-user-id-mapper' created successfully."
  else
    echo "$LOG_PREFIX[$CLIENT_ID] [ERROR] Failed to create protocol mapper 'custom-user-id-mapper', aborting!"
    exit 1
  fi
else
  echo "$LOG_PREFIX[$CLIENT_ID] Protocol mapper 'custom-user-id-mapper' already exists, skipping creation."
fi

echo ""
echo "$LOG_PREFIX Provisioning completed."
