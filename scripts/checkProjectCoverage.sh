: '
Check Project Coverage Script

SYNOPSIS
    ./checkProjectCoverage.sh COMMIT_SHA [TARGET] [THRESHOLD]

DESCRIPTION
    Fetches the aggregate (project-level) line coverage that Codecov computed
    for COMMIT_SHA and fails if it is below the effective minimum.

    Replicates the Codecov "project" status semantics:
        pass if coverage >= TARGET - THRESHOLD

    Coverage reporting is available on the Codecov free plan, so this gate works
    without the Pro-only project status check. It only needs the upload for
    COMMIT_SHA to have been processed (state == "complete").

PARAMETERS
    COMMIT_SHA   Required. The commit Codecov received the coverage upload for
                 (on a PR this is the PR head SHA, not the merge commit).
    TARGET       Optional. Target coverage percentage.
                 Default: coverage.status.project.default.target from .codecov.yml.
    THRESHOLD    Optional. Allowed drop below target.
                 Default: coverage.status.project.default.threshold from .codecov.yml.
                 If a value is neither passed nor found in .codecov.yml, the script errors out.

NOTES:
  - Requires curl and jq.
  - Public repo: the Codecov API is queried without a token.
'

#!/usr/bin/env bash
set -euo pipefail

SHA="${1:?usage: checkProjectCoverage.sh <commit-sha> [target] [threshold]}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CODECOV_YML="${SCRIPT_DIR}/../.codecov.yml"

# Read a key (target|threshold) from the project.default block of .codecov.yml.
read_project() {
    [ -f "$CODECOV_YML" ] || return 0
    awk -v key="$1" '
        /^    project:/ { inproj=1; next }
        /^    [a-z]/    { inproj=0 }
        inproj && $1 == key":" { v=$2; gsub(/[%",]/, "", v); print v; exit }
    ' "$CODECOV_YML"
}

TARGET="${2:-$(read_project target)}"
THRESHOLD="${3:-$(read_project threshold)}"

if [ -z "$TARGET" ] || [ -z "$THRESHOLD" ]; then
    echo "::error::Could not read target/threshold from ${CODECOV_YML} (and none passed as args)"
    exit 1
fi

OWNER="eventonight"
REPO="EvenToNight"
API="https://api.codecov.io/api/v2/github/${OWNER}/repos/${REPO}/commits/${SHA}"

FLOOR=$(awk "BEGIN{print $TARGET - $THRESHOLD}")
echo "🎯 Project coverage gate: target ${TARGET}% − threshold ${THRESHOLD}% → effective minimum ${FLOOR}%"
echo "🔎 Commit: ${SHA}"

coverage=""
for i in $(seq 1 20); do
    resp=$(curl -fsS "$API" 2>/dev/null || echo '{}')
    state=$(printf '%s' "$resp" | jq -r '.state // empty')
    coverage=$(printf '%s' "$resp" | jq -r '.totals.coverage // empty')
    if [ "$state" = "complete" ] && [ -n "$coverage" ]; then
        break
    fi
    echo "⏳ Codecov is still processing (state=${state:-none})… attempt ${i}/20"
    sleep 15
    coverage=""
done

if [ -z "$coverage" ]; then
    echo "::error::Could not fetch project coverage from Codecov within the timeout"
    exit 1
fi

echo "📊 Project coverage: ${coverage}%"
if awk "BEGIN{exit !(($coverage) + 0 >= ($FLOOR) + 0)}"; then
    echo "✅ OK: ${coverage}% ≥ ${FLOOR}%"
else
    echo "::error::Project coverage ${coverage}% below the minimum ${FLOOR}% (target ${TARGET}% − threshold ${THRESHOLD}%)"
    exit 1
fi
