# LINE Rich Menu API Spec — v3

Purpose: create, upload, assign, and verify the AI Assistant Support Rich Menu by API.

## Files

- Rich Menu image:
  `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/docs/assets/line-rich-menu-v3.png`
- Rich Menu JSON payload:
  `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/docs/assets/line-rich-menu-v3.richmenu.json`

## Live values

| Item | Value |
|------|-------|
| LIFF ID | `2010416723-q3dOdIyS` |
| Ticket URL | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket` |
| Status URL | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket/status` |
| Image size | `2500 x 1686` |
| Chat bar text | `Support Menu` |

## API endpoints used

Verified from LINE Messaging API reference:
- `POST /v2/bot/richmenu/validate`
- `POST /v2/bot/richmenu`
- `POST /v2/bot/richmenu/{richMenuId}/content`
- `GET /v2/bot/richmenu/list`
- `POST /v2/bot/user/all/richmenu/{richMenuId}`
- `GET /v2/bot/user/all/richmenu`
- `DELETE /v2/bot/user/all/richmenu`
- `DELETE /v2/bot/richmenu/{richMenuId}`

Base URLs:
- `https://api.line.me` — validate, create, assign, list, get default, and delete Rich Menus
- `https://api-data.line.me` — upload and download Rich Menu image content

## 0) Export variables

```bash
export LINE_CHANNEL_ACCESS_TOKEN='PUT_YOUR_CHANNEL_ACCESS_TOKEN_HERE'
export MENU_JSON='/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/docs/assets/line-rich-menu-v3.richmenu.json'
export MENU_IMAGE='/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/docs/assets/line-rich-menu-v3.png'
```

If you prefer not to paste the token inline:

```bash
read -s LINE_CHANNEL_ACCESS_TOKEN
export LINE_CHANNEL_ACCESS_TOKEN
```

## 1) Validate payload

```bash
curl -sS -X POST 'https://api.line.me/v2/bot/richmenu/validate' \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data @"${MENU_JSON}"
```

Expected result:
- success = empty body or HTTP 200
- failure = JSON error response

## 2) Create the Rich Menu object

```bash
RICH_MENU_ID=$(curl -sS -X POST 'https://api.line.me/v2/bot/richmenu' \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data @"${MENU_JSON}" | jq -r '.richMenuId')

echo "$RICH_MENU_ID"
```

Expected result:
- prints a non-empty Rich Menu ID

## 3) Upload the v3 image

```bash
curl -sS -X POST "https://api-data.line.me/v2/bot/richmenu/${RICH_MENU_ID}/content" \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Type: image/png' \
  --data-binary @"${MENU_IMAGE}"
```

Expected result:
- success = empty body or HTTP 200

## 4) Assign as default Rich Menu

```bash
curl -sS -X POST "https://api.line.me/v2/bot/user/all/richmenu/${RICH_MENU_ID}" \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Length: 0'
```

Expected result:
- success = empty body or HTTP 200

## 5) Verify what is live now

### List all Rich Menus

```bash
curl -sS 'https://api.line.me/v2/bot/richmenu/list' \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" | jq
```

### Get current default Rich Menu ID

```bash
curl -sS 'https://api.line.me/v2/bot/user/all/richmenu' \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" | jq
```

Expected result:
- `richMenuId` matches `${RICH_MENU_ID}`

## 6) One-shot script block

Use this if you want the whole flow in one go:

```bash
set -euo pipefail

export LINE_CHANNEL_ACCESS_TOKEN='PUT_YOUR_CHANNEL_ACCESS_TOKEN_HERE'
export MENU_JSON='/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/docs/assets/line-rich-menu-v3.richmenu.json'
export MENU_IMAGE='/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/docs/assets/line-rich-menu-v3.png'

curl -sS -X POST 'https://api.line.me/v2/bot/richmenu/validate' \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data @"${MENU_JSON}"

echo 'payload validated'

RICH_MENU_ID=$(curl -sS -X POST 'https://api.line.me/v2/bot/richmenu' \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data @"${MENU_JSON}" | jq -r '.richMenuId')

echo "created rich menu: ${RICH_MENU_ID}"

curl -sS -X POST "https://api-data.line.me/v2/bot/richmenu/${RICH_MENU_ID}/content" \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Type: image/png' \
  --data-binary @"${MENU_IMAGE}"

echo 'image uploaded'

curl -sS -X POST "https://api.line.me/v2/bot/user/all/richmenu/${RICH_MENU_ID}" \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Length: 0'

echo 'set as default'

curl -sS 'https://api.line.me/v2/bot/user/all/richmenu' \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" | jq
```

## 7) Troubleshooting — why it still does not show in LINE OA

If the image still does not appear in the chat after API success, check these in order:

1. `GET /v2/bot/user/all/richmenu` returns the same `richMenuId` you just created
2. The image upload step returned success for the same `richMenuId`
3. The OA/chat being tested is the same channel tied to this channel access token
4. The LINE user has already friended the OA
5. Close/reopen the chat in the LINE mobile app
6. Wait a short propagation window, then re-open chat
7. If an older default menu exists, clear and reassign

## 8) Clear old default and reassign

### Clear current default

```bash
curl -sS -X DELETE 'https://api.line.me/v2/bot/user/all/richmenu' \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}"
```

### Reassign the new one

```bash
curl -sS -X POST "https://api.line.me/v2/bot/user/all/richmenu/${RICH_MENU_ID}" \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}" \
  -H 'Content-Length: 0'
```

## 9) Delete a wrong/old Rich Menu

```bash
curl -sS -X DELETE "https://api.line.me/v2/bot/richmenu/${RICH_MENU_ID}" \
  -H "Authorization: Bearer ${LINE_CHANNEL_ACCESS_TOKEN}"
```

Warning:
- only delete after confirming it is not the one currently needed

## 10) Payload summary

Current v3 payload behavior:
- left half (`0..1249`) → ticket intake
- right half (`1250..2499`) → status lookup
- direct URI actions to LIFF URLs
- no postback dependency for go-live
