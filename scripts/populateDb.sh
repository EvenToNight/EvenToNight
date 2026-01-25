: '
Application Runner Script

SYNOPSIS
    ./populateDb.sh

DESCRIPTION
    This script build seed service to populate database with initial data.
    The script uses a .env file situated in the project root for environment variable configuration.

NOTES:
  - Requires Bash and Docker installed.
  - Changes directory to the project root before execution.
  - The docker compose project name is set to eventonight-seed.
'

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

./scripts/composeAll.sh --project-name eventonight-seed -p ./infrastructure/seed "$@"