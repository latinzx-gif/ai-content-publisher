#!/usr/bin/env bash
# Wrapper: post task status to Linear. See orchestration/LINEAR_TASK_SYNC.md
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec node "$ROOT/orchestration/scripts/linear-task-update.mjs" "$@"
