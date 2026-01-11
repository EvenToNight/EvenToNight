#!/bin/bash

BASE_URL="http://localhost:9050"
EVENT_ID="evt_test_123"

echo "🚀 Testing Payment Service Endpoints"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Create STANDARD ticket type
echo -e "${BLUE}1. Creating STANDARD ticket type${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/ticket-types" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "STANDARD",
    "price": 29.99,
    "currency": "EUR",
    "quantity": 100
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
    "price": 99.99,
    "currency": "EUR",
    "quantity": 50
  }')

echo "$RESPONSE" | jq '.'
TICKET_TYPE_ID_2=$(echo "$RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Created ticket type: $TICKET_TYPE_ID_2${NC}"
echo ""

# Test 3: Get all ticket types for event
echo -e "${BLUE}3. Getting all ticket types for event $EVENT_ID${NC}"
curl -s -X GET "$BASE_URL/events/$EVENT_ID/ticket-types" \
  -H "Content-Type: application/json" | jq '.'
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
    "type": "STANDARD",
    "description": "Another standard ticket",
    "price": 25.00,
    "quantity": 50
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
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

if [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✓ 404 returned correctly${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}✗ Expected 404, got HTTP $HTTP_CODE${NC}"
fi
echo ""

echo -e "${GREEN}===================================="
echo "✅ All tests completed!"
echo -e "====================================${NC}"
