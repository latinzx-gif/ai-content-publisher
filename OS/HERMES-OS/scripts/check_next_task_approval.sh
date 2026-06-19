#!/usr/bin/env bash
#
# check_next_task_approval.sh — Phase 5 Next-Task Approval Handler
#
# Fetches the latest Telegram message and checks for:
#   APPROVE_NEXT — copies next_pending_agent_task.md to TODAY_AGENT_TASK.md
#   HOLD         — no task created
#   CHANGE       — no task created, user revises manually
#
# Usage:
#   bash check_next_task_approval.sh
#
# Run this AFTER complete_current_task.sh sends the completion report
# and the user replies in Telegram.
#
# Dependencies: jq, curl
#
set -euo pipefail

HEAD_OFFICE="${HOME}/HEAD-OFFICE"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HERMES_OS="${HEAD_OFFICE}/OS/HERMES-OS"
RUNTIME_DIR="${HERMES_OS}/runtime"

# ─── Load secrets ───────────────────────────────────────────────
if [ -f "${HEAD_OFFICE}/.env" ]; then
  set -a
  source "${HEAD_OFFICE}/.env"
  set +a
fi

# ─── Validate dependencies ──────────────────────────────────────
if ! command -v jq &>/dev/null; then echo "ERROR: jq required. brew install jq"; exit 1; fi
if ! command -v curl &>/dev/null; then echo "ERROR: curl required."; exit 1; fi

# ─── Check required env vars ────────────────────────────────────
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then echo "ERROR: TELEGRAM_BOT_TOKEN not set."; exit 1; fi
if [ -z "${TELEGRAM_CHAT_ID:-}" ]; then echo "ERROR: TELEGRAM_CHAT_ID not set."; exit 1; fi

mkdir -p "$RUNTIME_DIR"

# ─── Check next pending task exists ─────────────────────────────
NEXT_TASK_FILE="${RUNTIME_DIR}/next_pending_agent_task.md"
if [ ! -f "$NEXT_TASK_FILE" ]; then
  echo "WARNING: No next pending task found at $NEXT_TASK_FILE"
  echo "Run complete_current_task.sh first to generate next task."
  exit 1
fi

# ─── Fetch latest Telegram message ──────────────────────────────
echo "[$(date)] Fetching latest Telegram message..."

RESPONSE=$(curl -s \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates" \
  --data-urlencode "offset=-1" \
  --data-urlencode "limit=1" \
  --data-urlencode 'allowed_updates=["message"]' \
  2>/dev/null)

OK=$(echo "$RESPONSE" | jq -r '.ok // false' 2>/dev/null)
if [ "$OK" != "true" ]; then
  DESC=$(echo "$RESPONSE" | jq -r '.description // "Unknown error"' 2>/dev/null)
  echo "ERROR: Telegram API returned: $DESC"
  exit 1
fi

LATEST_MSG_TEXT=$(echo "$RESPONSE" | jq -r '.result[-1].message.text // ""' 2>/dev/null)
LATEST_MSG_CHAT=$(echo "$RESPONSE" | jq -r '.result[-1].message.chat.id // 0' 2>/dev/null)
MSG_DATE=$(echo "$RESPONSE" | jq -r '.result[-1].message.date // ""' 2>/dev/null)

if [ -n "$MSG_DATE" ] && [ "$MSG_DATE" != "" ]; then
  MSG_DATE_HUMAN=$(date -r "$MSG_DATE" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
else
  MSG_DATE_HUMAN="unknown"
fi

if [ -z "$LATEST_MSG_TEXT" ]; then
  echo "[$(date)] No message found in Telegram chat."
  echo "Reply with: APPROVE_NEXT, HOLD, or CHANGE"
  echo "status: no_message" > "${RUNTIME_DIR}/last_next_approval_status.md"
  echo "timestamp: $(date)" >> "${RUNTIME_DIR}/last_next_approval_status.md"
  exit 0
fi

echo "[$(date)] Latest message (${MSG_DATE_HUMAN}): $LATEST_MSG_TEXT"

# ─── Check chat ID matches ──────────────────────────────────────
if [ "$LATEST_MSG_CHAT" != "$TELEGRAM_CHAT_ID" ]; then
  echo "[$(date)] WARNING: Message from chat $LATEST_MSG_CHAT, expected $TELEGRAM_CHAT_ID"
  echo "Ignoring."
  exit 0
fi

# ─── Normalize and classify reply ───────────────────────────────
NORMALIZED=$(echo "$LATEST_MSG_TEXT" | tr '[:lower:]' '[:upper:]' | xargs)

case "$NORMALIZED" in
  APPROVE_NEXT|APPROVE_NEXT:*|"APPROVE_NEXT"*)
    REPLY="APPROVE_NEXT"
    ;;
  HOLD|HOLD:*|"HOLD"*)
    REPLY="HOLD"
    ;;
  CHANGE|CHANGE:*|"CHANGE"*)
    REPLY="CHANGE"
    ;;
  *)
    REPLY="UNKNOWN"
    echo "[$(date)] Unrecognized reply: \"$NORMALIZED\""
    echo "Expected: APPROVE_NEXT, HOLD, or CHANGE"
    exit 0
    ;;
esac

# ─── Execute action ─────────────────────────────────────────────
case "$REPLY" in
  APPROVE_NEXT)
    echo "[$(date)] APPROVE_NEXT received. Updating TODAY_AGENT_TASK.md..."

    cp "$NEXT_TASK_FILE" "${HEAD_OFFICE}/TODAY_AGENT_TASK.md"
    echo "[$(date)] Created: ${HEAD_OFFICE}/TODAY_AGENT_TASK.md"

    CONFIRM_MSG="✅ *APPROVE_NEXT received*. \`TODAY_AGENT_TASK.md\` updated. Run: \`codex exec - < TODAY_AGENT_TASK.md\`"

    echo "status: approved_next" > "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "timestamp: $(date)" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "reply: APPROVE_NEXT" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "message: TODAY_AGENT_TASK.md updated with next task" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    ;;
  HOLD)
    echo "[$(date)] HOLD received. No task created."

    CONFIRM_MSG="⏸️ *Held*. No next task created. The pending task remains in \`runtime/next_pending_agent_task.md\`."

    echo "status: held" > "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "timestamp: $(date)" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "reply: HOLD" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "message: No next task created" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    ;;
  CHANGE)
    echo "[$(date)] CHANGE received. No task created."

    CONFIRM_MSG="🔄 *Change requested*. Please revise \`runtime/next_pending_agent_task.md\` manually and copy to \`TODAY_AGENT_TASK.md\` when ready."

    echo "status: change_requested" > "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "timestamp: $(date)" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "reply: CHANGE" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    echo "message: Change requested, manually revise" >> "${RUNTIME_DIR}/last_next_approval_status.md"
    ;;
esac

# ─── Send confirmation ──────────────────────────────────────────
"${SCRIPT_DIR}/send_telegram_message.sh" \
  "${TELEGRAM_BOT_TOKEN}" \
  "${TELEGRAM_CHAT_ID}" \
  "${CONFIRM_MSG}"

echo "[$(date)] Confirmation sent to Telegram."

echo ""
echo "=== NEXT TASK APPROVAL CHECK COMPLETE ==="
echo "Reply:      $REPLY"
echo "Status:     ${RUNTIME_DIR}/last_next_approval_status.md"
echo ""