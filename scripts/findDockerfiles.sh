: '
Find Dockerfiles Script

SYNOPSIS
    ./findDockerfiles.sh [BASE_COMMIT] [HEAD_COMMIT]

DESCRIPTION
    This script finds Dockerfile* files placed directly in services/<name>/ and
    infrastructure/<name>/ directories (non-recursive).

    If BASE_COMMIT and HEAD_COMMIT are provided, the script uses git diff to find
    modified directories and searches for Dockerfiles in those directories.
    If BASE_COMMIT is not provided or not found, it uses find to search all files
    in the current working directory.

    The script outputs a JSON array of Dockerfile paths to stdout.
    Diagnostic messages are sent to stderr.

PARAMETERS
    BASE_COMMIT    Optional. The base commit to diff from.
    HEAD_COMMIT    Optional. The head commit to diff to. Defaults to HEAD.

EXAMPLES
    ./findDockerfiles.sh
        Find all Dockerfiles in services/ and infrastructure/ directories.

    ./findDockerfiles.sh abc123 HEAD
        Find Dockerfiles in directories modified between commits abc123 and HEAD.

NOTES:
  - Requires Bash, git, and jq installed.
  - Only finds Dockerfiles in the first level of service/infrastructure subdirectories.
  - Output is a JSON array suitable for GitHub Actions matrix strategy.
'

#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '/^: \x27$/,/^'\''$/p' "$0" | sed '1d;$d'
  exit 0
fi

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
    files=$(find . -type f \( -path './services/*' -o -path './infrastructure/*' \) -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/build/*' -not -path '*/.gradle/*')
    use_git=false
fi

dockerfiles_dirs=$(echo "$files" | sed 's|^\./||' | awk -F'/' '{
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
            dockerfiles="$dockerfiles $(echo "$dockerfiles_in_dir" | tr '\n' ' ')"
        fi
    fi
done <<< "$dockerfiles_dirs"


echo "Found Dockerfiles:" >&2
echo "$dockerfiles" >&2
echo "------------------------" >&2
dockerfiles_array=$(echo "$dockerfiles" | jq -R -s -c 'gsub("\n"; "") | split(" ") | map(select(length > 0))')
echo "$dockerfiles_array"