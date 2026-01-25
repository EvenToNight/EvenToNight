#!/usr/bin/env bash
: '
Update Chat Service Script

SYNOPSIS
    ./updateChatService.sh [OPTIONS]

DESCRIPTION
    This script manages the complete Docker environment for the EvenToNight application.
    It can:
    1. Start all containers with a full rebuild (default)
    2. Rebuild and restart only the chat service

OPTIONS
    --help, -h
        Show this help message.

    --chat-only
        Only rebuild and restart the chat service (skips the full application setup).
        Useful for development when you want to quickly test changes to the chat service.

EXAMPLES:
    ./updateChatService.sh
        Starts all containers with full build and recreate.

    ./updateChatService.sh --chat-only
        Rebuilds and restarts only the chat service.

NOTES:
    - Requires Bash and Docker installed.
    - Uses the project'\''s .env file for environment configuration.
    - The full setup includes all services in ./services and ./infrastructure.
    - The chat-only option is faster for iterative development.
'

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

cd "$(dirname "$0")/../../.." || exit 1

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

CHAT_ONLY=false

if [[ "${1:-}" == "--chat-only" ]]; then
  CHAT_ONLY=true
fi

if [[ "$CHAT_ONLY" == true ]]; then
  echo -e "${BLUE}🔄 Rebuilding and restarting chat service...${RESET}"
  
  # Use composeApplication.sh to ensure all dependencies (like rabbitmq) are available
  # but only rebuild and restart the chat service
  ./scripts/composeApplication.sh --dev build chat
  ./scripts/composeApplication.sh --dev up -d --force-recreate chat
  
  echo -e "${GREEN}✅ Chat service updated successfully!${RESET}"
else
  echo -e "${BLUE}🚀 Starting all containers with full build...${RESET}"
  
  # Run the full application setup
  ./scripts/composeApplication.sh --dev up -d --build --force-recreate --wait
  
  echo -e "${GREEN}✅ All services started successfully!${RESET}"
fi

echo -e "${YELLOW}💡 Next time, use --chat-only to quickly update just the chat service${RESET}"
