#!/bin/bash
# Find directories containing Dockerfiles
# Usage: ./scripts/find-dockerfiles.sh [BASE_COMMIT] [HEAD_COMMIT]
#
# If BASE_COMMIT is provided, tries to fetch it and use git diff
# Otherwise, uses find to get all files

set -e

BASE_COMMIT="${1:-}"
HEAD_COMMIT="${2:-HEAD}"

docker_dirs=""

if [ -n "$BASE_COMMIT" ]; then
    if ! git cat-file -e "$BASE_COMMIT" 2>/dev/null; then
        echo "🔄 Fetching commit $BASE_COMMIT..." >&2
        git fetch origin "$BASE_COMMIT" --depth=1 2>/dev/null || echo "⚠️ Could not fetch commit" >&2
    fi
fi

if [ -n "$HEAD_COMMIT" ]; then
    if ! git cat-file -e "$HEAD_COMMIT" 2>/dev/null; then
        echo "🔄 Fetching commit $HEAD_COMMIT..." >&2
        git fetch origin "$HEAD_COMMIT" --depth=1 2>/dev/null || echo "⚠️ Could not fetch commit" >&2
    fi
fi

if [ -n "$BASE_COMMIT" ] && git cat-file -e "$BASE_COMMIT" 2>/dev/null; then
    echo "📋 Diffing from $BASE_COMMIT to $HEAD_COMMIT" >&2
    files=$(git diff --name-only "$BASE_COMMIT" "$HEAD_COMMIT")
else
    echo "⚠️ BASE_COMMIT not found, using find to get all files" >&2
    files=$(find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*')
fi

unique_dirs=$(echo "$files" | xargs -n1 dirname 2>/dev/null | sort -u)

while IFS= read -r dir; do
    if [ -n "$dir" ]; then
        dockerfiles=$(git ls-tree -r --name-only "$HEAD_COMMIT" "$dir/" 2>/dev/null | grep -F "${dir}/Dockerfile" || true)
        if [ -n "$dockerfiles" ]; then
            docker_dirs="$docker_dirs $dockerfiles"
        fi
    fi
done <<< "$unique_dirs"

docker_dirs=$(echo "$docker_dirs" | tr ' ' '\n' | sed 's|^\./||' | sort -u | tr '\n' ' ')

echo "Found docker_dirs with Dockerfiles:" >&2
echo "$docker_dirs" >&2
echo "$docker_dirs"