#!/usr/bin/env bash
set -euo pipefail

# ---------------- CONFIG ----------------
FORWARD_URL="localhost:9050/webhooks/stripe"
ENV_KEY="STRIPE_WEBHOOK_SECRET"
ENV_FILE=".env"
# ----------------------------------------
cd "$(dirname "$0")/../../.." || exit 1

get_secret() {
  stripe listen --print-secret --forward-to "$FORWARD_URL" 2>/dev/null | grep -oE 'whsec_[a-zA-Z0-9]+'
}

SECRET=$(get_secret) || {
  echo "🔐 Not logged in. Running stripe login..."
  stripe login
  SECRET=$(get_secret)
}

if [ -z "$SECRET" ]; then
  echo "❌ Could not extract Stripe webhook secret"
  exit 1
fi

echo "✅ Webhook secret found: $SECRET"
sed -i "" "/^$ENV_KEY=/d" "$ENV_FILE"
echo "$ENV_KEY=$SECRET" >> "$ENV_FILE"
echo "✅ Saved $ENV_KEY to $ENV_FILE"

# 3️⃣ Avvia stripe listen in foreground
echo "👂 Listening for Stripe webhooks at $FORWARD_URL..."
exec stripe listen --forward-to "$FORWARD_URL"