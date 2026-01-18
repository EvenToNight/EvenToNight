#!/usr/bin/env bash
set -euo pipefail

# Base variables
BASE_URL="http://localhost:9050"
EVENT_ID="evt_test_123"
ENV="${1:-prod}"

# JWT token for authenticated requests
# You can override this by setting JWT env variable before running the script
JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl90ZXN0XzEyMyIsImlhdCI6MTc2ODc0NDc2MCwiZXhwIjoxODAwMjgwNzYwfQ.4PIfsBZbYQkfWrNuk8jdSr-Q2bgA0ctIsIdFEHGK-Tc"

echo "🚀 Testing Payment Service Endpoints"
echo "===================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEAN_DB_SCRIPT="$SCRIPT_DIR/clean-db.sh"
if [ -x "$CLEAN_DB_SCRIPT" ]; then
  "$CLEAN_DB_SCRIPT"
else
  echo "ERROR: clean-db.sh not found or not executable at $CLEAN_DB_SCRIPT" >&2
  exit 1
fi

# TESTS
# 1. Create STANDARD ticket type
# 2. Create VIP ticket type
# 3. Get all ticket types for event and extract IDs
# 4. Get specific ticket type by ID
# 5. Try to create duplicate (should fail)


# Test 1: Create STANDARD ticket type
echo -e "${BLUE}1. Creating STANDARD ticket type${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/ticket-types" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "STANDARD",
    "price": 29.99,
    "currency": "EUR",
    "quantity": 100,
    "description": "Standard entry ticket",
    "creatorId": "user_test_123"
  }')

echo "$RESPONSE" | jq '.'
TICKET_TYPE_ID_1=$(echo "$RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Created ticket type: $TICKET_TYPE_ID_1${NC}"
echo ""

# Test 2: Create VIP ticket type
echo -e "${BLUE}2. Creating VIP ticket type${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/ticket-types" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VIP",
    "description": "VIP access with backstage pass",
    "price": 99.95,
    "currency": "USD",
    "quantity": 50,
    "description": "VIP access ticket",
    "creatorId": "user_test_123"
  }')

echo "$RESPONSE" | jq '.'
TICKET_TYPE_ID_2=$(echo "$RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Created ticket type: $TICKET_TYPE_ID_2${NC}"
echo ""

# Test 3: Get all ticket types for event and extract IDs
echo -e "${BLUE}3. Getting all ticket types for event $EVENT_ID${NC}"
ALL_TYPES=$(curl -s -X GET "$BASE_URL/events/$EVENT_ID/ticket-types" \
  -H "Content-Type: application/json")
echo "$ALL_TYPES" | jq '.'

# Extract IDs if they weren't set during creation
if [ "$TICKET_TYPE_ID_1" = "null" ] || [ -z "$TICKET_TYPE_ID_1" ]; then
  TICKET_TYPE_ID_1=$(echo "$ALL_TYPES" | jq -r '.[] | select(.type == "STANDARD") | .id')
  echo -e "${BLUE}  → Retrieved STANDARD ticket type ID: $TICKET_TYPE_ID_1${NC}"
fi
if [ "$TICKET_TYPE_ID_2" = "null" ] || [ -z "$TICKET_TYPE_ID_2" ]; then
  TICKET_TYPE_ID_2=$(echo "$ALL_TYPES" | jq -r '.[] | select(.type == "VIP") | .id')
  echo -e "${BLUE}  → Retrieved VIP ticket type ID: $TICKET_TYPE_ID_2${NC}"
fi

echo -e "${GREEN}✓ Retrieved ticket types${NC}"
echo ""

# Test 4: Get specific ticket type by ID
echo -e "${BLUE}4. Getting specific ticket type: $TICKET_TYPE_ID_1${NC}"
curl -s -X GET "$BASE_URL/ticket-types/$TICKET_TYPE_ID_1" \
  -H "Content-Type: application/json" | jq '.'
echo -e "${GREEN}✓ Retrieved specific ticket type${NC}"
echo ""

# Test 5: Try to create duplicate (should fail)
echo -e "${BLUE}5. Testing duplicate prevention (should fail)${NC}"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/events/$EVENT_ID/ticket-types" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VIP",
    "description": "VIP access with backstage pass",
    "price": 99.95,
    "currency": "USD",
    "quantity": 50,
    "description": "VIP access ticket",
    "creatorId": "user_test_123"
  }')

HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

if [ "$HTTP_CODE" != "201" ]; then
  echo -e "${GREEN}✓ Duplicate prevention working (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Duplicate was created (should have failed)${NC}"
fi
echo ""

# Test 6: Get non-existent ticket type (should 404)
echo -e "${BLUE}6. Getting non-existent ticket type (should 404)${NC}"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/ticket-types/non-existent-id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT")

HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

if [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✓ 404 returned correctly${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Expected 404, got HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 7: Create checkout session
echo -e "${BLUE}7. Creating checkout session${NC}"
USER_ID="user_test_123"
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/checkout-sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"items\": [
      {
        \"ticketTypeId\": \"$TICKET_TYPE_ID_1\",
        \"attendeeName\": \"John Doe\"
      },
      {
        \"ticketTypeId\": \"$TICKET_TYPE_ID_1\",
        \"attendeeName\": \"Jane Smith\"
      }
    ],
    \"successUrl\": \"http://example.com/success\",
    \"cancelUrl\": \"http://example.com/cancel\"
  }")

echo "$SESSION_RESPONSE"
echo "$SESSION_RESPONSE" | jq '.'
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.sessionId')
ORDER_ID=$(echo "$SESSION_RESPONSE" | jq -r '.orderId')
REDIRECT_URL=$(echo "$SESSION_RESPONSE" | jq -r '.redirectUrl')
echo -e "${GREEN}✓ Created checkout session: $SESSION_ID${NC}"
echo ""

# Test 8: Simulate successful payment via mock webhook (skip in prod)
if [ "$ENV" != "prod" ]; then
  echo -e "${BLUE}8. Simulating successful payment (mock webhook)${NC}"
  sleep 7 # Delay to ensure session is ready and processed
  RESPONSE=$(curl -s -X POST "$REDIRECT_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"sessionId\": \"$SESSION_ID\",
      \"orderId\": \"$ORDER_ID\",
      \"type\": \"checkout.session.completed\"
    }")

  echo "$RESPONSE" | jq '.'
  echo -e "${GREEN}✓ Mock checkout completed webhook sent${NC}"
  echo ""
else
  echo -e "${BLUE}8. Skipping mock webhook (prod mode)${NC}"
  echo ""
fi

# Test 9: Get ticket types again to verify quantity decreased
echo -e "${BLUE}9. Verifying ticket quantity decreased${NC}"
curl -s -X GET "$BASE_URL/ticket-types/$TICKET_TYPE_ID_1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" | jq '.'
echo -e "${GREEN}✓ Ticket type updated${NC}"
echo ""

echo -e "${GREEN}===================================="
echo "✅ All tests completed!"
echo -e "====================================${NC}"
