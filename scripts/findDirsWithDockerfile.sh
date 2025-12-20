#!/bin/bash
# Find directories containing Dockerfiles
# Usage: ./scripts/find-dockerfiles.sh [BASE_COMMIT] [HEAD_COMMIT]
#
# If BASE_COMMIT is provided, tries to fetch it and use git diff
# Otherwise, uses find to get all files

set -e

BASE_COMMIT="${1:-}"
HEAD_COMMIT="${2:-HEAD}"

dirs=""

if [ -n "$BASE_COMMIT" ]; then
    if ! git cat-file -e "$BASE_COMMIT" 2>/dev/null; then
        echo "🔄 Fetching commit $BASE_COMMIT..." >&2
        git fetch origin "$BASE_COMMIT" --depth=1 2>/dev/null || echo "⚠️ Could not fetch commit" >&2
    fi
fi

if [ -n "$BASE_COMMIT" ] && git cat-file -e "$BASE_COMMIT" 2>/dev/null; then
    echo "📋 Diffing from $BASE_COMMIT to $HEAD_COMMIT" >&2
    files=$(git diff --name-only "$BASE_COMMIT" "$HEAD_COMMIT")
else
    echo "⚠️ BASE_COMMIT not found, using find to get all files" >&2
    files=$(find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*')
fi

while IFS= read -r file; do
    if [ -n "$file" ]; then
        dir=$(dirname "$file")
        if [ -f "$dir/Dockerfile" ]; then
            dirs="$dirs $dir"
        fi
    fi
done <<< "$files"

dirs=$(echo "$dirs" | tr ' ' '\n' | sed 's|^\./||' | sort -u | tr '\n' ' ')

echo "Found dirs with Dockerfiles:" >&2
echo "$dirs" >&2

echo "$dirs"
