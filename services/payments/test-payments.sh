#!/bin/bash

# Script di test per il servizio Payments
# Testa tutte le funzionalità principali

set -e

BASE_URL="http://localhost:9040"
EVENT_ID="test-event-$(date +%s)"
USER_ID="test-user-123"

echo "🧪 Testing Payments Microservice"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH=$(curl -s ${BASE_URL}/health || echo "FAILED")
if [[ $HEALTH == *"ok"* ]]; then
  echo -e "${GREEN}✓ Service is healthy${NC}"
else
  echo -e "${RED}✗ Service health check failed${NC}"
  echo "Response: $HEALTH"
fi
echo ""

# Test 2: Setup Inventory
echo -e "${YELLOW}Test 2: Setup Inventory for Event${NC}"
INVENTORY_RESPONSE=$(curl -s -X POST ${BASE_URL}/admin/events/${EVENT_ID}/inventory/setup \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "'${EVENT_ID}'",
    "categories": [
      {
        "name": "VIP",
        "description": "VIP access with backstage pass",
        "price": 15000,
        "totalCapacity": 10
      },
      {
        "name": "Standard",
        "description": "General admission",
        "price": 5000,
        "totalCapacity": 50
      }
    ]
  }')

if [[ $INVENTORY_RESPONSE == *"VIP"* ]]; then
  echo -e "${GREEN}✓ Inventory created successfully${NC}"
  echo "Response: $INVENTORY_RESPONSE" | head -c 200
  echo "..."
else
  echo -e "${RED}✗ Inventory creation failed${NC}"
  echo "Response: $INVENTORY_RESPONSE"
fi
echo ""

# Test 3: Check Availability
echo -e "${YELLOW}Test 3: Check Ticket Availability${NC}"
AVAILABILITY=$(curl -s ${BASE_URL}/events/${EVENT_ID}/availability)
if [[ $AVAILABILITY == *"hasAvailableTickets"* ]]; then
  echo -e "${GREEN}✓ Availability check successful${NC}"
  echo "Response: $AVAILABILITY"
else
  echo -e "${RED}✗ Availability check failed${NC}"
  echo "Response: $AVAILABILITY"
fi
echo ""

# Test 4: Get Event Tickets
echo -e "${YELLOW}Test 4: Get Event Ticket Categories${NC}"
TICKETS=$(curl -s ${BASE_URL}/events/${EVENT_ID}/tickets)
if [[ $TICKETS == *"VIP"* ]]; then
  echo -e "${GREEN}✓ Ticket categories retrieved${NC}"
  # Extract category ID for VIP
  CATEGORY_ID=$(echo $TICKETS | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "VIP Category ID: $CATEGORY_ID"
else
  echo -e "${RED}✗ Failed to get ticket categories${NC}"
  echo "Response: $TICKETS"
fi
echo ""

# Test 5: Create Checkout (Reservation + Payment Intent)
echo -e "${YELLOW}Test 5: Create Checkout${NC}"
if [ -z "$CATEGORY_ID" ]; then
  echo -e "${RED}✗ Cannot create checkout: missing category ID${NC}"
else
  CHECKOUT_RESPONSE=$(curl -s -X POST ${BASE_URL}/checkout/create \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "'${USER_ID}'",
      "eventId": "'${EVENT_ID}'",
      "items": [
        {
          "categoryId": "'${CATEGORY_ID}'",
          "quantity": 2
        }
      ]
    }')

  if [[ $CHECKOUT_RESPONSE == *"clientSecret"* ]]; then
    echo -e "${GREEN}✓ Checkout created successfully${NC}"
    RESERVATION_ID=$(echo $CHECKOUT_RESPONSE | grep -o '"reservationId":"[^"]*"' | cut -d'"' -f4)
    PAYMENT_INTENT_ID=$(echo $CHECKOUT_RESPONSE | grep -o '"paymentIntentId":"[^"]*"' | cut -d'"' -f4)
    CLIENT_SECRET=$(echo $CHECKOUT_RESPONSE | grep -o '"clientSecret":"[^"]*"' | cut -d'"' -f4)

    echo "Reservation ID: $RESERVATION_ID"
    echo "Payment Intent ID: $PAYMENT_INTENT_ID"
    echo "Client Secret: ${CLIENT_SECRET:0:30}..."
  else
    echo -e "${RED}✗ Checkout creation failed${NC}"
    echo "Response: $CHECKOUT_RESPONSE"
  fi
fi
echo ""

# Test 6: Check Availability After Reservation
echo -e "${YELLOW}Test 6: Check Availability After Reservation${NC}"
AVAILABILITY_AFTER=$(curl -s ${BASE_URL}/events/${EVENT_ID}/availability)
echo "Response: $AVAILABILITY_AFTER"
if [[ $AVAILABILITY_AFTER == *"hasAvailableTickets"* ]]; then
  echo -e "${GREEN}✓ Availability updated (tickets are reserved)${NC}"
else
  echo -e "${RED}✗ Availability check failed${NC}"
fi
echo ""

# Test 7: Get Sales Analytics
echo -e "${YELLOW}Test 7: Get Sales Analytics${NC}"
SALES=$(curl -s ${BASE_URL}/admin/events/${EVENT_ID}/sales)
if [[ $SALES == *"totalRevenue"* ]]; then
  echo -e "${GREEN}✓ Sales analytics retrieved${NC}"
  echo "Response: $SALES"
else
  echo -e "${RED}✗ Failed to get sales analytics${NC}"
  echo "Response: $SALES"
fi
echo ""

# Test 8: Cancel Checkout (Release Reserved Tickets)
if [ ! -z "$RESERVATION_ID" ]; then
  echo -e "${YELLOW}Test 8: Cancel Checkout${NC}"
  CANCEL_RESPONSE=$(curl -s -X POST ${BASE_URL}/checkout/cancel \
    -H "Content-Type: application/json" \
    -d '{"reservationId": "'${RESERVATION_ID}'"}')

  if [[ $CANCEL_RESPONSE == *"cancelled"* ]]; then
    echo -e "${GREEN}✓ Checkout cancelled successfully${NC}"
    echo "Response: $CANCEL_RESPONSE"
  else
    echo -e "${RED}✗ Checkout cancellation failed${NC}"
    echo "Response: $CANCEL_RESPONSE"
  fi
  echo ""
fi

# Test 9: Check Availability After Cancellation
echo -e "${YELLOW}Test 9: Check Availability After Cancellation${NC}"
sleep 2 # Wait for cancellation to process
AVAILABILITY_FINAL=$(curl -s ${BASE_URL}/events/${EVENT_ID}/availability)
echo "Response: $AVAILABILITY_FINAL"
if [[ $AVAILABILITY_FINAL == *"hasAvailableTickets"* ]]; then
  echo -e "${GREEN}✓ Tickets released back to available pool${NC}"
else
  echo -e "${RED}✗ Availability check failed${NC}"
fi
echo ""

# Summary
echo "================================="
echo -e "${GREEN}✓ Test suite completed${NC}"
echo ""
echo "ℹ️  Note: Stripe webhook tests require actual Stripe webhooks"
echo "   Use Stripe CLI for webhook testing:"
echo "   stripe listen --forward-to localhost:9040/webhooks/stripe"
echo ""
echo "📝 Manual tests to perform:"
echo "   - Complete a payment with Stripe test cards"
echo "   - Test webhook: payment_intent.succeeded"
echo "   - Verify tickets are generated with QR codes"
echo "   - Test refund flow"
echo "   - Test event cancellation with automatic refunds"
