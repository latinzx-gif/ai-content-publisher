#!/usr/bin/env bash
#
# check_telegram_approval.sh — Phase 2–3 Approval Handler
#
# Fetches the latest message from the Telegram chat and checks for
# an approval command reply. Then executes the corresponding action.
#
# Usage:
#   bash check_telegram_approval.sh
#
# Flow:
#   1. Fetch latest message via getUpdates
#   2. Check if message contains APPROVE, HOLD, or CHANGE
#   3. Execute action based on reply
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
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required. Install with: brew install jq"
  exit 1
fi

if ! command -v curl &>/dev/null; then
  echo "ERROR: curl is required."
  exit 1
fi

# ─── Check required env vars ────────────────────────────────────
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN is not set."
  exit 1
fi

if [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "ERROR: TELEGRAM_CHAT_ID is not set."
  exit 1
fi

# ─── Check pending task exists ──────────────────────────────────
if [ ! -f "${RUNTIME_DIR}/pending_agent_task.md" ]; then
  echo "WARNING: No pending task found at ${RUNTIME_DIR}/pending_agent_task.md"
  echo "Run hermes_morning_brief.sh first to generate a briefing."
  exit 1
fi

# ─── Ensure runtime directory ───────────────────────────────────
mkdir -p "$RUNTIME_DIR"

# ─── Fetch latest Telegram message ──────────────────────────────
echo "[$(date)] Fetching latest Telegram message..."

RESPONSE=$(curl -s \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates" \
  --data-urlencode "offset=-1" \
  --data-urlencode "limit=1" \
  --data-urlencode "allowed_updates=[\"message\"]" \
  2>/dev/null)

# Check for API error
OK=$(echo "$RESPONSE" | jq -r '.ok // false' 2>/dev/null)
if [ "$OK" != "true" ]; then
  DESC=$(echo "$RESPONSE" | jq -r '.description // "Unknown error"' 2>/dev/null)
  echo "ERROR: Telegram API returned: $DESC"
  exit 1
fi

# ─── Extract latest message text ────────────────────────────────
LATEST_MSG_TEXT=$(echo "$RESPONSE" | jq -r '.result[-1].message.text // ""' 2>/dev/null)
LATEST_MSG_CHAT=$(echo "$RESPONSE" | jq -r '.result[-1].message.chat.id // 0' 2>/dev/null)
MSG_DATE=$(echo "$RESPONSE" | jq -r '.result[-1].message.date // ""' 2>/dev/null)

# Convert Unix timestamp to readable (macOS compatible)
if [ -n "$MSG_DATE" ] && [ "$MSG_DATE" != "" ]; then
  MSG_DATE_HUMAN=$(date -r "$MSG_DATE" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
else
  MSG_DATE_HUMAN="unknown"
fi

if [ -z "$LATEST_MSG_TEXT" ]; then
  echo "[$(date)] No message found in Telegram chat."
  echo "Send a message to the bot with: APPROVE, HOLD, or CHANGE"
  echo ""

  # Save status
  echo "status: no_message" > "${RUNTIME_DIR}/last_approval_status.md"
  echo "timestamp: $(date)" >> "${RUNTIME_DIR}/last_approval_status.md"
  echo "message: No Telegram message found" >> "${RUNTIME_DIR}/last_approval_status.md"
  exit 0
fi

echo "[$(date)] Latest message (${MSG_DATE_HUMAN}): $LATEST_MSG_TEXT"

# ─── Check chat ID matches ──────────────────────────────────────
if [ "$LATEST_MSG_CHAT" != "$TELEGRAM_CHAT_ID" ]; then
  echo "[$(date)] WARNING: Message from chat $LATEST_MSG_CHAT, expected $TELEGRAM_CHAT_ID"
  echo "Ignoring message from unexpected chat."
  exit 0
fi

# ─── Normalize and classify reply ───────────────────────────────
NORMALIZED=$(echo "$LATEST_MSG_TEXT" | tr '[:lower:]' '[:upper:]' | xargs)

case "$NORMALIZED" in
  APPROVE|APPROVE:*|APPROVED|"APPROVE"*)
    REPLY="APPROVE"
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
    echo "Expected one of: APPROVE, HOLD, CHANGE"
    exit 0
    ;;
esac

# ─── Execute action based on reply ──────────────────────────────
case "$REPLY" in
  APPROVE)
    echo "[$(date)] APPROVE received. Creating TODAY_AGENT_TASK.md..."

    cp "${RUNTIME_DIR}/pending_agent_task.md" "${HEAD_OFFICE}/TODAY_AGENT_TASK.md"
    echo "[$(date)] Created: ${HEAD_OFFICE}/TODAY_AGENT_TASK.md"

    CONFIRM_MSG="✅ *APPROVED*. \`TODAY_AGENT_TASK.md\` created. Run: \`codex run TODAY_AGENT_TASK.md\`"

    # Save status
    echo "status: approved" > "${RUNTIME_DIR}/last_approval_status.md"
    echo "timestamp: $(date)" >> "${RUNTIME_DIR}/last_approval_status.md"
    echo "reply: APPROVE" >> "${RUNTIME_DIR}/last_approval_status.md"
    echo "message: TODAY_AGENT_TASK.md created" >> "${RUNTIME_DIR}/last_approval_status.md"
    ;;
  HOLD)
    echo "[$(date)] HOLD received. No task created."

    CONFIRM_MSG="⏸️ *HELD*. No task created. The pending task remains in \`runtime/pending_agent_task.md\`."

    # Save status
    echo "status: held" > "${RUNTIME_DIR}/last_approval_status.md"
    echo "timestamp: $(date)" >> "${RUNTIME_DIR}/last_approval_status.md"
    echo "reply: HOLD" >> "${RUNTIME_DIR}/last_approval_status.md"
    echo "message: No task created" >> "${RUNTIME_DIR}/last_approval_status.md"
    ;;
  CHANGE)
    echo "[$(date)] CHANGE received. No task created."

    CONFIRM_MSG="🔄 *CHANGE requested*. Please revise task manually in \`runtime/pending_agent_task.md\` and copy to \`TODAY_AGENT_TASK.md\` when ready."

    # Save status
    echo "status: change_requested" > "${RUNTIME_DIR}/last_approval_status.md"
    echo "timestamp: $(date)" >> "${RUNTIME_DIR}/last_approval_status.md"
    echo "reply: CHANGE" >> "${RUNTIME_DIR}/last_approval_status.md"
    echo "message: Change requested, manually revise" >> "${RUNTIME_DIR}/last_approval_status.md"
    ;;
esac

# ─── Send confirmation message ──────────────────────────────────
"${SCRIPT_DIR}/send_telegram_message.sh" \
  "${TELEGRAM_BOT_TOKEN}" \
  "${TELEGRAM_CHAT_ID}" \
  "${CONFIRM_MSG}"

echo "[$(date)] Confirmation sent to Telegram."

echo ""
echo "=== APPROVAL CHECK COMPLETE ==="
echo "Reply:      $REPLY"
echo "Confirmed:  $CONFIRM_MSG"
echo "Status:     ${RUNTIME_DIR}/last_approval_status.md"
echo ""