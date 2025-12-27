: '
Check Environment Setup Script

SYNOPSIS
    ./checkEnvSetup.sh

DESCRIPTION
    This script validates the consistency between .env and .env.template files.
    It performs the following checks:
    - Verifies that both .env and .env.template exist
    - Ensures all keys match between the two files
    - Validates that all lines in .env have valid KEY=VALUE format

NOTES:
  - Requires Bash installed.
  - Both .env and .env.template must exist.
  - Reports all issues before exiting.
'

#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

echo "Checking .env and .env.template for consistency..."

ENV_FILE=".env"
TEMPLATE_FILE=".env.template"
ERROR=0

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ $ENV_FILE not found"
  ERROR=$((ERROR + 1))
fi

if [[ ! -f "$TEMPLATE_FILE" ]]; then
  echo "❌ $TEMPLATE_FILE not found"
  ERROR=$((ERROR + 1))
fi

if [[ $ERROR -gt 0 ]]; then
  echo "⚠️ Missing required file(s). Exiting."
  exit 1
fi

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