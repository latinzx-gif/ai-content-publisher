#!/usr/bin/env bash
# Dispatch Antigravity/Codex UI pane (tmux 0.1) — UI tasks
# Usage: ./orchestration/scripts/tmux-antigravity.sh ui|review
set -euo pipefail

SESSION="${TMUX_SESSION:-head-office}"
PANE="${TMUX_UI_PANE:-0.1}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ORCH_DIR="$ROOT/orchestration"

MODE="${1:-}"
TASK_ID="$(rg -m1 '^# CURRENT TASK:' "$ORCH_DIR/CURRENT_TASK.md" 2>/dev/null | sed 's/^# CURRENT TASK: //' | sed 's/ —.*//' || echo "UI-01")"

case "$MODE" in
  ui)
    MSG="UI TASK ${TASK_ID}. Visual polish only — src/app/publisher/**. No API/auth/DB. Write ANTIGRAVITY_RESULT.md + CURSOR_REVIEW_REQUEST.md in head-office-app/_agent/. STOP → Cursor review and cleanup."
    ;;
  review)
    echo "Tell Cursor: review task ${TASK_ID} — review and cleanup."
    exit 0
    ;;
  *)
    echo "Usage: $0 ui|review" >&2
    exit 1
    ;;
esac

if ! tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Error: tmux session '$SESSION' not found." >&2
  exit 1
fi

tmux send-keys -t "$SESSION:$PANE" C-c
sleep 0.5
tmux send-keys -t "$SESSION:$PANE" "$MSG" C-m
echo "==> Sent to tmux $SESSION:$PANE (ui)"
