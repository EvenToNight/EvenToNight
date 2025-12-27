: '
Update Local Environment Script

SYNOPSIS
    ./updateLocalEnv.sh

DESCRIPTION
    This script synchronizes the .env file with .env.template.
    If a key exists in .env.template but is missing in .env, it adds the key to .env
    using the default value from .env.template (if present).
    Default values defined in .env.template overwrite existing values in .env.

NOTES:
  - Requires Bash installed.
  - Creates .env if it does not exist.
  - Uses .env.template as the source of truth for required environment variables.
  - Preserves comments and formatting in .env.
'

#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

TEMPLATE_FILE=".env.template"
ENV_FILE=".env"

touch "$ENV_FILE"
TMP_FILE=$(mktemp)

while IFS= read -r line || [ -n "$line" ]; do
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo "$line" >> "$TMP_FILE"
        continue
    fi

    key=$(echo "$line" | cut -d '=' -f 1 | xargs || echo "")
    value=$(echo "$line" | cut -d '=' -f 2- | xargs || echo "")

    if grep -q -E "^$key[[:space:]]*=" "$ENV_FILE"; then
        if [[ -n "$value" ]]; then
            echo "$key=$value" >> "$TMP_FILE"
        else
            existing=$(grep -E "^$key[[:space:]]*=" "$ENV_FILE" | head -n1 | cut -d '=' -f2- | xargs || echo "")
            echo "$key=$existing" >> "$TMP_FILE"
        fi
    else
        if [[ -n "$value" ]]; then
            echo "$key=$value" >> "$TMP_FILE"
        else
            echo "$key=" >> "$TMP_FILE"
        fi
    fi
done < "$TEMPLATE_FILE"

mv "$TMP_FILE" "$ENV_FILE"
echo ".env updated successfully."