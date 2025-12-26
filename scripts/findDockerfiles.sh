#!/bin/bash
# Find directories containing Dockerfiles
# Usage: ./scripts/findDockerfiles.sh [BASE_COMMIT] [HEAD_COMMIT]
#
# If BASE_COMMIT and/or HEAD_COMMIT are provided, tries to fetch them and use git diff
# Otherwise, uses find to search in current working directory

set -e

BASE_COMMIT="${1:-}"
HEAD_COMMIT="${2:-HEAD}"

dockerfiles=""

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
    use_git=true
else
    echo "⚠️ BASE_COMMIT not found, using find to get all files" >&2
    files=$(find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/build/*' -not -path '*/.gradle/*')
    use_git=false
fi

dockerfiles_dirs=$(echo "$files" | sed 's|^\./||' | xargs -n1 dirname 2>/dev/null | awk -F'/' '{
    if (($1 == "services" || $1 == "infrastructure") && NF >= 2) {
        print $1 "/" $2
    }
}' | sort -u)
echo "Modified directories under services/ or infrastructure/:" >&2
echo "$dockerfiles_dirs" >&2
echo "------------------------" >&2

while IFS= read -r dir; do
    if [ -n "$dir" ]; then
        if [ "$use_git" = true ]; then
            dockerfiles_in_dir=$(git ls-tree -r --name-only "$HEAD_COMMIT" "$dir/" 2>/dev/null | grep -F "${dir}/Dockerfile" || true)
        else
            dockerfiles_in_dir=$(find "$dir" -maxdepth 1 -type f -name "Dockerfile*" 2>/dev/null || true)
        fi
        if [ -n "$dockerfiles_in_dir" ]; then
            dockerfiles="$dockerfiles $dockerfiles_in_dir"
        fi
    fi
done <<< "$dockerfiles_dirs"


echo "Found Dockerfiles:" >&2
echo "$dockerfiles" >&2
echo "------------------------" >&2
echo "$dockerfiles"

