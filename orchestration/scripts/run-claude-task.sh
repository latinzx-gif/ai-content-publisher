#!/usr/bin/env bash
# Run Claude Code on CURRENT_TASK.md for head-office-app
# Usage:
#   ./orchestration/scripts/run-claude-task.sh --plan      # PLAN only (no code)
#   ./orchestration/scripts/run-claude-task.sh --execute   # EXECUTE after plan approved
#   ./orchestration/scripts/run-claude-task.sh --print     # non-interactive (uses CURRENT_TASK phase)
#   ./orchestration/scripts/run-claude-task.sh             # interactive — reads Phase from CURRENT_TASK.md

set -euo pipefail

# ROOT is the monorepo root (parent of orchestration)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP_DIR="$ROOT/head-office-app"
AGENT_DIR="$APP_DIR/_agent"
ORCH_DIR="$ROOT/orchestration"
# Default Claude Code model (user policy: Fable 5 for all orchestration work)
CLAUDE_DEFAULT_MODEL="${CLAUDE_DEFAULT_MODEL:-claude-fable-5}"

cd "$ROOT"

if ! command -v claude >/dev/null 2>&1; then
  echo "Error: claude CLI not found. Install Claude Code first." >&2
  exit 1
fi

if [[ ! -f "$ORCH_DIR/CURRENT_TASK.md" ]]; then
  echo "Error: CURRENT_TASK.md not found at $ORCH_DIR" >&2
  exit 1
fi

TASK_ID="$(rg -m1 '^# CURRENT TASK:' "$ORCH_DIR/CURRENT_TASK.md" | sed 's/^# CURRENT TASK: //' | sed 's/ —.*//')"
TASK_PHASE="$(awk '/^## Phase$/{getline; gsub(/^ +| +$/,""); print; exit}' "$ORCH_DIR/CURRENT_TASK.md" 2>/dev/null || echo "PLAN")"

get_recommended_model() {
  local phase_key="$1"
  local model=""
  model="$(awk -F'|' -v phase="$phase_key" '
    /^\| Phase \| Model \|/ { header=1; next }
    header && $0 ~ "^\\| " phase " \\|" {
      gsub(/^ +| +$/, "", $3)
      gsub(/`/, "", $3)
      print $3
      exit
    }
  ' "$ORCH_DIR/CURRENT_TASK.md" 2>/dev/null || true)"
  if [[ -z "$model" ]]; then
    model="$CLAUDE_DEFAULT_MODEL"
  fi
  echo "$model"
}

MODE="${1:-}"
PRINT_MODE=false

for arg in "$@"; do
  case "$arg" in
    --print|-p) PRINT_MODE=true ;;
    --plan) MODE="plan" ;;
    --execute) MODE="execute" ;;
  esac
done

if [[ -z "$MODE" ]]; then
  if [[ "$TASK_PHASE" == "EXECUTE" ]]; then
    MODE="execute"
  else
    MODE="plan"
  fi
fi

PHASE_KEY="$(echo "$MODE" | tr '[:lower:]' '[:upper:]')"
RECOMMENDED_MODEL="${CLAUDE_MODEL:-$(get_recommended_model "$PHASE_KEY")}"

if [[ "$MODE" == "execute" ]]; then
  if ! rg -q '(\| Decision \| APPROVED \||\*\*Status:\*\*.*APPROVED|^Decision:.*APPROVED)' "$AGENT_DIR/PLAN_APPROVAL.md" 2>/dev/null; then
    echo "Error: PLAN_APPROVAL.md is not APPROVED. Run --plan first, then Cursor plan review." >&2
    exit 1
  fi
  PROMPT="$(cat <<EOF
EXECUTE PHASE for AI Content Publisher.

Task: ${TASK_ID}
Recommended model (this session): ${RECOMMENDED_MODEL}
Read orchestration/AGENT_LOOP.md, orchestration/MODEL_ROUTING.md, orchestration/SUBAGENT_ROUTING.md, orchestration/CURRENT_TASK.md, head-office-app/_agent/TASK_PLAN.md (approved), head-office-app/_agent/PLAN_APPROVAL.md, head-office-app/AGENTS.md.

If your session model differs from Recommended Model, tell the user to run /model ${RECOMMENDED_MODEL} before continuing.

If CURRENT_TASK.md Subagent Policy Enabled is yes or optional: load skill safe-research-delegator, run read-only research pass FIRST (no Write/Edit/Delete), report in chat only, then implement.

Implement ONLY what the approved TASK_PLAN.md specifies.
Respect Allowed/Forbidden files in CURRENT_TASK.md.

After completion:
1. Write head-office-app/_agent/TASK_RESULT.md
2. Write head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
3. Run: cd head-office-app && npm run build && npm run typecheck && npm run lint
4. STOP — do not start next task

Tell user: "Execute complete. Ask Cursor: Review task ${TASK_ID} — review and cleanup."
EOF
)"
else
  PROMPT="$(cat <<EOF
PLAN PHASE ONLY for AI Content Publisher. Do NOT write or edit code.

Task: ${TASK_ID}
Recommended model (this session): ${RECOMMENDED_MODEL}
Read orchestration/AGENT_LOOP.md, orchestration/MODEL_ROUTING.md, orchestration/SUBAGENT_ROUTING.md, orchestration/CURRENT_TASK.md, orchestration/CLOSURE_TASK_QUEUE.md, head-office-app/CLAUDE.md, orchestration/REVIEW_STATUS.md.

If scope is complex (6+ files, migrations, auth/RLS, cross-layer), note in CURSOR_PLAN_REQUEST.md:
  Model recommendation: bump EXECUTE to claude-fable-5 (or keep current) — because …
  Subagent recommendation: Enabled yes + skills (read-only) — because …

Write:
1. head-office-app/_agent/TASK_PLAN.md (use orchestration/TASK_PLAN_TEMPLATE.md)
2. head-office-app/_agent/CURSOR_PLAN_REQUEST.md

STOP. No packages. No migrations. No src/ changes.

Tell user: "Plan ready. Ask Cursor: Review plan for ${TASK_ID}."
EOF
)"
fi

CLAUDE_ARGS=(
  --permission-mode acceptEdits
  --model "$RECOMMENDED_MODEL"
  --add-dir "$ROOT"
  --add-dir "$APP_DIR"
)

if $PRINT_MODE; then
  CLAUDE_ARGS+=(--dangerously-skip-permissions)
fi

echo "==> Task: ${TASK_ID}"
echo "==> Mode: ${MODE}"
echo "==> Model: ${RECOMMENDED_MODEL}"
echo "==> Repo: ${ROOT}"
echo ""

if $PRINT_MODE; then
  exec claude -p "$PROMPT" "${CLAUDE_ARGS[@]}"
else
  echo "Starting interactive Claude Code (${MODE})..."
  echo "(Type /exit or Ctrl+C to quit)"
  echo ""
  exec claude "$PROMPT" "${CLAUDE_ARGS[@]}"
fi
