#!/usr/bin/env bash
set -e

TEMPLATE_FILE=".env.template"
ENV_FILE=".env"

touch "$ENV_FILE"
TMP_FILE=$(mktemp)

while IFS= read -r line || [ -n "$line" ]; do
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo "$line" >> "$TMP_FILE"
        continue
    fi

    key=$(echo "$line" | cut -d '=' -f 1 | xargs)
    value=$(echo "$line" | cut -d '=' -f 2- | xargs)

    if grep -q -E "^$key[[:space:]]*=" "$ENV_FILE"; then
        if [[ -n "$value" ]]; then
            echo "$key=$value" >> "$TMP_FILE"
        else
            existing=$(grep -E "^$key[[:space:]]*=" "$ENV_FILE" | head -n1 | cut -d '=' -f2- | xargs)
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