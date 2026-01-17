#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:9050"
EVENT_ID=${1}

echo "🚀 Creating event ticket for event $EVENT_ID"
echo "===================================="
echo ""

# Colors
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create STANDARD ticket type
echo -e "${BLUE}1. Creating STANDARD ticket type${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/ticket-types" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "STANDARD",
    "price": 29.99,
    "currency": "EUR",
    "quantity": 100,
    "creatorId": "organization_1"
  }')
echo "$RESPONSE" | jq '.'
# Create VIP ticket type
echo -e "${BLUE}2. Creating VIP ticket type${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/ticket-types" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VIP",
    "price": 59.99,
    "currency": "EUR",
    "quantity": 50,
    "creatorId": "organization_1"
  }')
echo "$RESPONSE" | jq '.'
echo "Ticket types created successfully."
echo "===================================="
echo ""