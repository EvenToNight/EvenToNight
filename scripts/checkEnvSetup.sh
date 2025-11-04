#!/usr/bin/env bash
set -euo pipefail
echo "Checking .env and .env.template for consistency..."

ENV_FILE=".env"
TEMPLATE_FILE=".env.template"
ERROR=0

extract_keys() {
  local file="$1"
  grep -E '^[[:space:]]*[A-Za-z_][A-Za-z0-9_]*[[:space:]]*=' "$file" | cut -d= -f1 | sed 's/[[:space:]]//g' | sort
}

keys_env=$(extract_keys "$ENV_FILE" || true)
keys_template=$(extract_keys "$TEMPLATE_FILE" || true)

diff_output=$(comm -3 <(echo "$keys_env" | sort) <(echo "$keys_template" | sort))
if [[ -n "$diff_output" ]]; then
  echo "❌ Mismatch found between $ENV_FILE and $TEMPLATE_FILE:"
  echo "$diff_output"
  ERROR=$((ERROR + 1))
else
  echo "✅ All keys match between $ENV_FILE and $TEMPLATE_FILE"
fi

invalid_lines_env=$(grep -v -E '^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*[[:space:]]*=[[:space:]]*[^[:space:]#]+|#)' "$ENV_FILE" || true)

if [[ -n "$invalid_lines_env" ]]; then
  echo "❌ Invalid lines found in $ENV_FILE:"
  echo "$invalid_lines_env"
  ERROR=$((ERROR + 1))
else
  echo "✅ All lines found in $ENV_FILE are valid"  
fi

if [[ $ERROR -eq 0 ]]; then
  echo "✅ All checks passed!"
else
  echo "⚠️ There were $ERROR error(s)."
  exit 1
fi