#!/usr/bin/env bash
set -euo pipefail

: "${LINE_CHANNEL_ACCESS_TOKEN:?Set LINE_CHANNEL_ACCESS_TOKEN first}"

MENU_JSON="/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/docs/assets/line-rich-menu-v3.richmenu.json"
MENU_IMAGE="/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/docs/assets/line-rich-menu-v3.png"
MAX_IMAGE_BYTES=$((1024 * 1024))

if [ ! -f "$MENU_JSON" ]; then
  echo "menu json missing: $MENU_JSON"
  exit 1
fi
if [ ! -f "$MENU_IMAGE" ]; then
  echo "menu image missing: $MENU_IMAGE"
  exit 1
fi

IMAGE_BYTES=$(stat -f%z "$MENU_IMAGE")
if [ "$IMAGE_BYTES" -gt "$MAX_IMAGE_BYTES" ]; then
  echo "image too large: ${IMAGE_BYTES} bytes. LINE rich menu image must be <= ${MAX_IMAGE_BYTES} bytes (1 MB)."
  exit 1
fi

auth_header="Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}"

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

validate_out="$tmpdir/validate.json"
validate_status=$(curl -sS -o "$validate_out" -w '%{http_code}' -X POST 'https://api.line.me/v2/bot/richmenu/validate' \
  -H "$auth_header" \
  -H 'Content-Type: application/json' \
  --data @"$MENU_JSON")

if [ "$validate_status" != "200" ]; then
  echo "rich menu validate failed (HTTP $validate_status)"
  cat "$validate_out"
  exit 1
fi

echo payload validated

create_out="$tmpdir/create.json"
create_status=$(curl -sS -o "$create_out" -w '%{http_code}' -X POST 'https://api.line.me/v2/bot/richmenu' \
  -H "$auth_header" \
  -H 'Content-Type: application/json' \
  --data @"$MENU_JSON")

if [ "$create_status" != "200" ]; then
  echo "create rich menu failed (HTTP $create_status)"
  cat "$create_out"
  exit 1
fi

RICH_MENU_ID=$(jq -r '.richMenuId // empty' "$create_out")
if [ -z "$RICH_MENU_ID" ] || [ "$RICH_MENU_ID" = "null" ]; then
  echo "create response missing richMenuId"
  cat "$create_out"
  exit 1
fi

echo "created rich menu: $RICH_MENU_ID"

upload_out="$tmpdir/upload.txt"
upload_status=$(curl -sS -o "$upload_out" -w '%{http_code}' -X POST "https://api-data.line.me/v2/bot/richmenu/${RICH_MENU_ID}/content" \
  -H "$auth_header" \
  -H 'Content-Type: image/png' \
  --data-binary @"$MENU_IMAGE")

if [ "$upload_status" != "200" ] && [ "$upload_status" != "201" ]; then
  echo "upload rich menu image failed (HTTP $upload_status)"
  cat "$upload_out"
  exit 1
fi

echo image uploaded

set_default_out="$tmpdir/set_default.txt"
set_default_status=$(curl -sS -o "$set_default_out" -w '%{http_code}' -X POST "https://api.line.me/v2/bot/user/all/richmenu/${RICH_MENU_ID}" \
  -H "$auth_header" \
  -H 'Content-Length: 0' \
  -H 'Content-Type: application/json')

if [ "$set_default_status" != "200" ] && [ "$set_default_status" != "204" ]; then
  echo "set default rich menu failed (HTTP $set_default_status)"
  cat "$set_default_out"
  exit 1
fi

echo set as default

default_out="$tmpdir/default.json"
default_status=$(curl -sS -o "$default_out" -w '%{http_code}' 'https://api.line.me/v2/bot/user/all/richmenu' \
  -H "$auth_header")

if [ "$default_status" != "200" ]; then
  echo "verify default rich menu failed (HTTP $default_status)"
  cat "$default_out"
  exit 1
fi

default_id=$(jq -r '.richMenuId // empty' "$default_out")
if [ "$default_id" != "$RICH_MENU_ID" ]; then
  echo "default mismatch: expected $RICH_MENU_ID but got $default_id"
  exit 1
fi

echo "rich menu is now default: $default_id"
echo DONE
