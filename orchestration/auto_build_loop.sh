#!/usr/bin/env bash
set -euo pipefail

# ROOT is monorepo root (parent of orchestration)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/head-office-app"
ORCH_DIR="$ROOT/orchestration"
MAX_ROUNDS=4
LOCK_FILE="$ROOT/.auto_build_loop.lock"

if [ -f "$LOCK_FILE" ]; then
  echo "Loop lock exists: $LOCK_FILE"
  echo "If no loop is running, remove it with:"
  echo "rm -f $LOCK_FILE"
  exit 1
fi

touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

cd "$ROOT"

for ROUND in $(seq 1 "$MAX_ROUNDS"); do
  echo "========================================"
  echo "ROUND $ROUND: Hermes prepare/review only"
  echo "========================================"

  hermes -z "
You are the child Hermes reviewer/planner inside an automated build loop.

Read:
- orchestration/HERMES_LOOP_RULES.md
- orchestration/PROJECT_STATE.md
- orchestration/CURRENT_TASK.md
- head-office-app/_agent/TASK_RESULT.md if it exists
- head-office-app/_agent/BATCH_RESULT.md if it exists (check docs/runbooks/ if missing)

Your job:
1. Review the latest TASK_RESULT.md and BATCH_RESULT.md if available.
2. Decide whether the previous work passed, needs a fix, or must stop for user.
3. If passed and CURRENT_TASK.md already contains the next approved batch, keep it.
4. If passed and the next task is needed, write the next CURRENT_TASK.md into orchestration/.
5. If failed, write a fix-only CURRENT_TASK.md into orchestration/.
6. If blocked, scope drift, dependency install, schema migration, auth/RLS, secrets, deploy, OpenAI/Buffer/Supabase integration, RAG, analytics, or learning loop is needed, write orchestration/STOP_FOR_USER.md.

Hard rules:
- Do not run auto_build_loop.sh.
- Do not run Codex.
- Do not run bash scripts.
- Do not modify application code.
- Do not install packages.
- Do not commit.
- Do not push.
- Only update orchestration files such as CURRENT_TASK.md, PROJECT_STATE.md, STOP_FOR_USER.md.
- Show git status from /Users/jakarinosk/HEAD-OFFICE/head-office-app.
- Exit after writing the decision.
" chat

  if [ -f "$ORCH_DIR/STOP_FOR_USER.md" ]; then
    echo "STOP_FOR_USER.md found in orchestration/. Stopping loop."
    exit 0
  fi

  echo "========================================"
  echo "ROUND $ROUND: Codex execute CURRENT_TASK.md"
  echo "========================================"

  cd "$APP"

  codex exec \
    -s workspace-write \
    -c 'approval_policy="on-request"' \
    "Read /Users/jakarinosk/HEAD-OFFICE/orchestration/CURRENT_TASK.md.

Execute only the task described there.

Rules:
- Do not skip ahead.
- Do not add new scope.
- Do not implement Phase 2/3.
- Do not install packages unless CURRENT_TASK.md explicitly allows it.
- Do not commit.
- Do not push.
- If you need OpenAI, Buffer, Supabase schema changes, RAG, analytics, deployment, secrets, or files outside scope, stop and report.

After finishing, create or update:
- _agent/TASK_RESULT.md
- _agent/BATCH_RESULT.md if this is a batch task

Include:
- tasks completed
- files changed
- validation results
- risks/blockers
- git status

Then stop."

  cd "$ROOT"

  echo "========================================"
  echo "ROUND $ROUND complete"
  echo "========================================"
done

echo "Max rounds reached. Review manually."
