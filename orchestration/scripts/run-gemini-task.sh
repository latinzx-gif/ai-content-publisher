#!/usr/bin/env bash
# Gemini CLI — AUDIT / read-only tasks for head-office-app
# Usage:
#   ./orchestration/scripts/run-gemini-task.sh audit
#   ./orchestration/scripts/run-gemini-task.sh audit --task AUDIT-01
#   ./orchestration/scripts/run-gemini-task.sh --print "custom prompt"
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP_DIR="$ROOT/head-office-app"
AGENT_DIR="$APP_DIR/_agent"
ORCH_DIR="$ROOT/orchestration"
PATH="${HOME}/.npm-global/bin:${HOME}/.local/bin:/usr/local/bin:/opt/homebrew/bin:${PATH}"

TASK_ID="${TASK_ID:-}"
MODE="audit"
CUSTOM_PROMPT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    audit) MODE="audit" ;;
    --task) TASK_ID="$2"; shift ;;
    --print) CUSTOM_PROMPT="$2"; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
  shift
done

if [[ -z "$TASK_ID" ]]; then
  TASK_ID="$(rg -m1 '^# CURRENT TASK:' "$ORCH_DIR/CURRENT_TASK.md" 2>/dev/null | sed 's/^# CURRENT TASK: //' | sed 's/ —.*//' || echo "GEMINI-AUDIT")"
fi

if ! command -v gemini >/dev/null 2>&1; then
  echo "Error: gemini CLI not found. Install: https://google-gemini.github.io/gemini-cli/" >&2
  exit 1
fi

mkdir -p "$AGENT_DIR/logs"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG="$AGENT_DIR/logs/gemini-${TASK_ID}-${STAMP}.log"

if [[ -n "$CUSTOM_PROMPT" ]]; then
  PROMPT="$CUSTOM_PROMPT"
else
  PROMPT="$(cat <<EOF
AUDIT PHASE — read-only. Task: ${TASK_ID}

You are Gemini CLI audit agent for HEAD-OFFICE monorepo.
Read orchestration/CURRENT_TASK.md and orchestration/AGENT_TASK_ROUTING.md.

Rules:
- Do NOT create, edit, or delete application source files.
- You MAY write only: head-office-app/_agent/GEMINI_AUDIT_RESULT.md and head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
- Cite file paths; no secrets from .env files.
- End with STOP — ask user to tell Cursor: review task ${TASK_ID} — review and cleanup.

If task is E2E audit: read head-office-app/e2e/ and publisher routes.
If task is AUDIT-01: scan orchestration/, head-office-app/, archive/ for stale refs and doc drift.
EOF
)"
fi

echo "==> Gemini audit: $TASK_ID"
echo "==> Log: $LOG"

{
  echo "=== $(date -Iseconds) task=$TASK_ID ==="
  gemini --prompt "$PROMPT" --skip-trust 2>&1
} | tee "$LOG"

ln -sf "$LOG" "$AGENT_DIR/gemini-background.latest.log"
echo "done" > "$AGENT_DIR/gemini-background.status"
echo "==> Finished. Tell Cursor: review task $TASK_ID — review and cleanup"
