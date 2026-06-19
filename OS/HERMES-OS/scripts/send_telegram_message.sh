#!/usr/bin/env bash
#
# send_telegram_message.sh
#
# Sends a message to Telegram via the Bot API.
#
# Usage:
#   send_telegram_message.sh <BOT_TOKEN> <CHAT_ID> "Message text"
#
# Security:
#   - Token is passed as argument (not hardcoded), sourced from env
#   - No secrets are logged
#   - Message text is URL-encoded before sending
#
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <BOT_TOKEN> <CHAT_ID> \"Message text\""
  exit 1
fi

BOT_TOKEN="$1"
CHAT_ID="$2"
MESSAGE="$3"

# Validate token format (basic sanity check)
if [ ${#BOT_TOKEN} -lt 20 ]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN looks too short."
  exit 1
fi

# Validate chat ID
if [ -z "$CHAT_ID" ]; then
  echo "ERROR: TELEGRAM_CHAT_ID is empty."
  exit 1
fi

# URL-encode the message using curl's --data-urlencode
# We send via POST using curl's -d with --data-urlencode to handle special chars
RESPONSE=$(curl -s -X POST \
  "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${CHAT_ID}" \
  --data-urlencode "text=${MESSAGE}" \
  --data-urlencode "parse_mode=Markdown" \
  --data-urlencode "disable_web_page_preview=true" \
  -w "\n%{http_code}" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Telegram API returned HTTP $HTTP_CODE"
  echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('API Error:', d.get('description','unknown'))" 2>/dev/null || echo "$BODY"
  exit 1
fi

echo "Telegram message sent successfully."
exit 0