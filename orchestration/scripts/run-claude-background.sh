#!/usr/bin/env bash
# Run Claude Code task in background (--print). Cursor-friendly fire-and-forget.
#
# Usage:
#   ./orchestration/scripts/run-claude-background.sh plan
#   ./orchestration/scripts/run-claude-background.sh execute
#   ./orchestration/scripts/run-claude-background.sh status
#   ./orchestration/scripts/run-claude-background.sh log        # tail last 40 lines
#   ./orchestration/scripts/run-claude-background.sh follow     # tail -f
#   ./orchestration/scripts/run-claude-background.sh stop

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ORCH_DIR="$ROOT/orchestration"
APP_DIR="$ROOT/head-office-app"
AGENT_DIR="$APP_DIR/_agent"
LOG_DIR="$AGENT_DIR/logs"
RUNNER="$ORCH_DIR/scripts/run-claude-task.sh"

PID_FILE="$AGENT_DIR/claude-background.pid"
STATUS_FILE="$AGENT_DIR/claude-background.status"
LATEST_LINK="$AGENT_DIR/claude-background.latest.log"

mkdir -p "$LOG_DIR"

task_id() {
  rg -m1 '^# CURRENT TASK:' "$ORCH_DIR/CURRENT_TASK.md" 2>/dev/null \
    | sed 's/^# CURRENT TASK: //' | sed 's/ —.*//' | tr ' /' '__'
}

is_running() {
  [[ -f "$PID_FILE" ]] || return 1
  local pid
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

cmd="${1:-}"

case "$cmd" in
  plan|execute)
    if is_running; then
      echo "Claude background job already running (pid $(cat "$PID_FILE"))."
      echo "  status: $(cat "$STATUS_FILE" 2>/dev/null || echo unknown)"
      echo "  log:    $LATEST_LINK"
      exit 1
    fi

    if [[ "$cmd" == "execute" ]]; then
      if ! rg -q '(\| Decision \| APPROVED \||\*\*Status:\*\*.*APPROVED|^Decision:.*APPROVED)' \
        "$AGENT_DIR/PLAN_APPROVAL.md" 2>/dev/null; then
        echo "Error: PLAN_APPROVAL.md is not APPROVED. Run plan + Cursor review first." >&2
        exit 1
      fi
    fi

  TID="$(task_id)"
  STAMP="$(date +%Y%m%d-%H%M%S)"
  LOG_FILE="$LOG_DIR/claude-${TID}-${cmd}-${STAMP}.log"
  ln -sf "$LOG_FILE" "$LATEST_LINK"

  {
    echo "=== Claude background ${cmd} ==="
    echo "task: ${TID}"
    echo "started: $(date -Iseconds)"
    echo "log: ${LOG_FILE}"
    echo "========================================"
  } >> "$LOG_FILE"

  (
    echo "RUNNING mode=${cmd} pid=$$ started=$(date -Iseconds) log=${LOG_FILE}" > "$STATUS_FILE"
    set +e
    "$RUNNER" --print "--${cmd}" >> "$LOG_FILE" 2>&1
    code=$?
    set -e
    if [[ $code -eq 0 ]]; then
      echo "DONE mode=${cmd} exit=0 finished=$(date -Iseconds) log=${LOG_FILE}" > "$STATUS_FILE"
    else
      echo "FAILED mode=${cmd} exit=${code} finished=$(date -Iseconds) log=${LOG_FILE}" > "$STATUS_FILE"
    fi
    rm -f "$PID_FILE"
    exit $code
  ) &

  echo $! > "$PID_FILE"
  sleep 0.3

  echo "Started Claude background ${cmd}."
  echo "  pid:    $(cat "$PID_FILE")"
  echo "  status: $(cat "$STATUS_FILE")"
  echo "  log:    $LOG_FILE"
  echo ""
  echo "Watch:  ./orchestration/scripts/run-claude-background.sh follow"
  echo "When done, ask Cursor: Review task ${TID//__/ — }"
  ;;

  status)
    if is_running; then
      echo "RUNNING pid=$(cat "$PID_FILE")"
    else
      echo "NOT RUNNING"
      [[ -f "$PID_FILE" ]] && rm -f "$PID_FILE"
    fi
    if [[ -f "$STATUS_FILE" ]]; then
      echo "last: $(cat "$STATUS_FILE")"
    fi
    if [[ -L "$LATEST_LINK" ]] || [[ -f "$LATEST_LINK" ]]; then
      echo "log:  $(readlink "$LATEST_LINK" 2>/dev/null || echo "$LATEST_LINK")"
    fi
    ;;

  log)
    if [[ ! -f "$LATEST_LINK" ]]; then
      echo "No log yet. Start with: $0 plan|execute" >&2
      exit 1
    fi
    tail -n 40 "$LATEST_LINK"
    ;;

  follow)
    if [[ ! -f "$LATEST_LINK" ]]; then
      echo "No log yet. Start with: $0 plan|execute" >&2
      exit 1
    fi
    tail -f "$LATEST_LINK"
    ;;

  stop)
    if ! is_running; then
      echo "No running background job."
      rm -f "$PID_FILE"
      exit 0
    fi
    pid="$(cat "$PID_FILE")"
    kill "$pid" 2>/dev/null || true
    sleep 0.5
    kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
    echo "STOPPED pid=${pid} at $(date -Iseconds)" > "$STATUS_FILE"
    echo "Stopped pid ${pid}"
    ;;

  *)
    echo "Usage: $0 plan|execute|status|log|follow|stop" >&2
    exit 1
    ;;
esac
