#!/usr/bin/env bash
# Dispatch Claude in tmux session "head-office" pane 0
# Usage:
#   ./orchestration/scripts/tmux-claude.sh plan      # PLAN phase only
#   ./orchestration/scripts/tmux-claude.sh execute   # EXECUTE after plan approved
#   ./orchestration/scripts/tmux-claude.sh review    # remind user to use Cursor

set -euo pipefail

SESSION="${TMUX_SESSION:-head-office}"
PANE="${TMUX_PANE:-0.0}"
# ROOT is monorepo root (parent of orchestration)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ORCH_DIR="$ROOT/orchestration"
CLAUDE_DEFAULT_MODEL="${CLAUDE_DEFAULT_MODEL:-claude-fable-5}"

MODE="${1:-}"

get_recommended_model() {
  local phase_key="$1"
  awk -F'|' -v phase="$phase_key" '
    /^\| Phase \| Model \|/ { header=1; next }
    header && $0 ~ "^\\| " phase " \\|" {
      gsub(/^ +| +$/, "", $3)
      gsub(/`/, "", $3)
      print $3
      exit
    }
  ' "$ORCH_DIR/CURRENT_TASK.md" 2>/dev/null || echo "$CLAUDE_DEFAULT_MODEL"
}

case "$MODE" in
  plan)
    MODEL="${CLAUDE_MODEL:-$(get_recommended_model PLAN)}"
    MSG="PLAN PHASE ONLY. Recommended model: ${MODEL} (run /model ${MODEL} if needed). Default policy: claude-fable-5 (Fable 5). Read orchestration/CURRENT_TASK.md, orchestration/MODEL_ROUTING.md, orchestration/AGENT_LOOP.md. Write head-office-app/_agent/TASK_PLAN.md + head-office-app/_agent/CURSOR_PLAN_REQUEST.md. No code. STOP → Ask Cursor to review plan."
    ;;
  execute)
    MODEL="${CLAUDE_MODEL:-$(get_recommended_model EXECUTE)}"
    MSG="EXECUTE PHASE. Model: ${MODEL}. Check orchestration/CURRENT_TASK.md Subagent Policy — if enabled: safe-research-delegator skill FIRST, read-only, no file writes, report in chat. Then implement Allowed Files only (lead agent). head-office-app/_agent/PLAN_APPROVAL.md must be APPROVED. Write head-office-app/_agent/TASK_RESULT.md + head-office-app/_agent/CURSOR_REVIEW_REQUEST.md. STOP."
    ;;
  review)
    echo "Tell Cursor in chat: Review task [ID] for head-office-app — review and cleanup."
    exit 0
    ;;
  *)
    echo "Usage: $0 plan|execute|review" >&2
    exit 1
    ;;
esac

if ! tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Error: tmux session '$SESSION' not found. Start it first." >&2
  exit 1
fi

tmux send-keys -t "$SESSION:$PANE" C-c
sleep 0.5
tmux send-keys -t "$SESSION:$PANE" "$MSG" C-m

echo "==> Sent to tmux $SESSION:$PANE"
echo "==> Mode: $MODE"
echo "==> Recommended model: ${MODEL:-$CLAUDE_DEFAULT_MODEL}"
