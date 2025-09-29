: '
Developer Environment Runner Script

SYNOPSIS
    ./composeDevEnvironment.sh [OPTIONS] [DOCKER_COMPOSE_COMMANDS...]

DESCRIPTION
    This script executes docker compose command
    by recursively searching for docker-compose.yaml files in ./dev-environment folder.
    Users can optionally include docker-compose-dev.yaml files in the search.
    The script uses a .env file situated in the project root for environment variable configuration.
OPTIONS
    --dev
        Include docker-compose-dev.yaml files in the search.

    Other arguments provided will be passed directly to the docker compose command.

EXAMPLES:
    ./composeApplication.sh up
        Runs the application.

    ./composeApplication.sh --dev up
        Runs the application with dev configuration.

NOTES:
  - Requires Bash and Docker installed.
  - Changes directory to the project root before execution.
  - The docker compose project name is set to eventonight-dev-environment.
'
#!/bin/bash
set -e

cd "$(dirname "$0")/.." || exit 1

if [[ "$1" == "--help" || "$1" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

./scripts/composeAll.sh --project-name eventonight-dev-environment -p ./dev-environment "$@"