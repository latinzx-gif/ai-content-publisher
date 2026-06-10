#!/usr/bin/env bash
# Dispatch Gemini in tmux session "head-office" pane 0.2
# Usage: ./orchestration/scripts/tmux-gemini.sh audit|review
set -euo pipefail

SESSION="${TMUX_SESSION:-head-office}"
PANE="${TMUX_GEMINI_PANE:-0.2}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ORCH_DIR="$ROOT/orchestration"

MODE="${1:-}"
TASK_ID="$(rg -m1 '^# CURRENT TASK:' "$ORCH_DIR/CURRENT_TASK.md" 2>/dev/null | sed 's/^# CURRENT TASK: //' | sed 's/ —.*//' || echo "GEMINI-AUDIT")"

case "$MODE" in
  audit)
    MSG="AUDIT ONLY — Task ${TASK_ID}. Read orchestration/AGENT_TASK_ROUTING.md. Read-only: no source edits. Write head-office-app/_agent/GEMINI_AUDIT_RESULT.md + CURSOR_REVIEW_REQUEST.md. STOP → Cursor review and cleanup."
    ;;
  review)
    echo "Tell Cursor: review task ${TASK_ID} — review and cleanup."
    exit 0
    ;;
  *)
    echo "Usage: $0 audit|review" >&2
    exit 1
    ;;
esac

if ! tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Error: tmux session '$SESSION' not found. Run ./orchestration/scripts/tmux-head-office.sh" >&2
  exit 1
fi

tmux send-keys -t "$SESSION:$PANE" C-c
sleep 0.5
tmux send-keys -t "$SESSION:$PANE" "$MSG" C-m
echo "==> Sent to tmux $SESSION:$PANE (audit)"
