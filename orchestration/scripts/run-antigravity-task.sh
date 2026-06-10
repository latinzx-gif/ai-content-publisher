#!/usr/bin/env bash
# Antigravity CLI — UI/visual tasks (on demand)
# Usage:
#   ./orchestration/scripts/run-antigravity-task.sh ui
#   ./orchestration/scripts/run-antigravity-task.sh --print "custom prompt"
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP_DIR="$ROOT/head-office-app"
AGENT_DIR="$APP_DIR/_agent"
ORCH_DIR="$ROOT/orchestration"
PATH="${HOME}/.npm-global/bin:${HOME}/.local/bin:/usr/local/bin:/opt/homebrew/bin:${PATH}"

TASK_ID="$(rg -m1 '^# CURRENT TASK:' "$ORCH_DIR/CURRENT_TASK.md" 2>/dev/null | sed 's/^# CURRENT TASK: //' | sed 's/ —.*//' || echo "UI-01")"
MODE="ui"
CUSTOM_PROMPT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    ui) MODE="ui" ;;
    --print) CUSTOM_PROMPT="$2"; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
  shift
done

if ! command -v antigravity >/dev/null 2>&1; then
  echo "Error: antigravity CLI not in PATH." >&2
  echo "Install Antigravity CLI or assign UI-01 to Claude/Cursor per PHASE_1_1_TASK_QUEUE.md" >&2
  exit 1
fi

mkdir -p "$AGENT_DIR/logs"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG="$AGENT_DIR/logs/antigravity-${TASK_ID}-${STAMP}.log"

if [[ -n "$CUSTOM_PROMPT" ]]; then
  PROMPT="$CUSTOM_PROMPT"
else
  PROMPT="$(cat <<EOF
UI TASK — ${TASK_ID} for head-office-app.

Read orchestration/CURRENT_TASK.md and orchestration/PHASE_1_1_TASK_QUEUE.md (UI-01).
Scope: visual polish only under src/app/publisher/** and shared UI components.
Do NOT change API routes, auth, Supabase, or server actions.

Write:
- head-office-app/_agent/ANTIGRAVITY_RESULT.md (what changed, pages touched)
- head-office-app/_agent/CURSOR_REVIEW_REQUEST.md

STOP — user tells Cursor: review task ${TASK_ID} — review and cleanup.
EOF
)"
fi

echo "==> Antigravity UI: $TASK_ID"
echo "==> Log: $LOG"

{
  echo "=== $(date -Iseconds) task=$TASK_ID ==="
  antigravity --prompt "$PROMPT" 2>&1
} | tee "$LOG"

ln -sf "$LOG" "$AGENT_DIR/antigravity-background.latest.log"
echo "==> Finished. Tell Cursor: review task $TASK_ID — review and cleanup"
