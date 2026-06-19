# RUNBOOK — AI Assistant Support

> Project: `ai-assistant-support`
> App: `support-app/`
> Deploy: Vercel `ai-assistant-support`

---

## Production Reference

Use these values for the live Support OA rollout.

| Item | Live Value |
|------|------------|
| Production app URL | `https://support-app-brown.vercel.app` |
| LINE webhook URL | `https://support-app-brown.vercel.app/api/line/webhook` |
| Linear webhook URL | `https://support-app-brown.vercel.app/api/linear/webhook` |
| LIFF ID | `2010416723-q3dOdIyS` |
| LIFF base URL | `https://liff.line.me/2010416723-q3dOdIyS` |
| Ticket intake URL | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket` |
| Ticket status URL | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket/status` |

Note:
- The repo expects Phase 1 entry via Rich Menu + LIFF.
- `support-app/src/lib/line/handler.ts` still documents logical action keys `open_ticket` and `track_status`.
- For fastest live setup in LINE OA, use direct URI actions pointing to the LIFF URLs above.

---

## Prerequisites

Before first run, set these up:

| Service | What to Create | Reference |
|---------|---------------|-----------|
| LINE OA | Messaging API channel (Support OA แยกจาก WorkHub) | https://developers.line.biz/ |
| Supabase | Project (แนะนำ project ใหม่) | https://supabase.com |
| Linear | Team + project `AI Assistant Support` + labels | https://linear.app |
| Vercel | Project `ai-assistant-support` | https://vercel.com |

---

## Local Development

```bash
cd support-app
cp .env.example .env.local
npm run dev
npm run build
npm run typecheck
npm run lint
```

---

## Deploy

1. Push to git remote
2. Vercel: Import repo → set env vars → deploy
3. Set LINE webhook URL to `https://support-app-brown.vercel.app/api/line/webhook`
4. Set Linear webhook URL to `https://support-app-brown.vercel.app/api/linear/webhook`
5. Verify Vercel env vars match the LIFF / LINE values below

---

## Required Environment Variables

| Variable | Source | Required | Example / Notes |
|----------|--------|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | ✅ | project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | ✅ | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | ✅ | service role key |
| `LINE_CHANNEL_SECRET` | LINE Developers Console | ✅ | Messaging API channel secret |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers Console | ✅ | Long-lived channel access token |
| `NEXT_PUBLIC_LIFF_ID` | LINE Developers Console | ✅ | `2010416723-q3dOdIyS` |
| `NEXT_PUBLIC_LIFF_ENDPOINT` | LINE LIFF URL base | ✅ | `https://liff.line.me/{LIFF_ID}` |
| `LINEAR_API_KEY` | Linear Settings → API | ✅ | personal/team API key |
| `LINEAR_TEAM_ID` | Linear Team Settings | ✅ | target team id |

Important:
- In this project, `NEXT_PUBLIC_LIFF_ENDPOINT` is used as the LIFF base URL, not the plain Vercel domain.
- If the LIFF app ID changes, update both `NEXT_PUBLIC_LIFF_ID` and `NEXT_PUBLIC_LIFF_ENDPOINT` together.

---

## LINE OA Setup Manual

### 1) Messaging API channel

1. Open LINE Developers Console
2. Select the Support OA channel
3. Confirm the channel is the dedicated Support OA, not the HR/WorkHub channel
4. Confirm channel secret and channel access token exist

### 2) Webhook settings

1. Go to Messaging API settings
2. Set Webhook URL to:
   `https://support-app-brown.vercel.app/api/line/webhook`
3. Enable webhook usage
4. Run Verify / Test from LINE Developers Console
5. Expected result: webhook verification succeeds

### 3) LIFF app settings

1. Open LIFF tab in LINE Developers Console
2. Confirm LIFF app ID is `2010416723-q3dOdIyS`
3. Confirm the LIFF app points to the production environment intended for this Support OA rollout
4. If you rotate or recreate the LIFF app, update Vercel env vars:
   - `NEXT_PUBLIC_LIFF_ID`
   - `NEXT_PUBLIC_LIFF_ENDPOINT=https://liff.line.me/{new_liff_id}`

### 4) Create the Rich Menu

Recommended for go-live now: configure two URI actions directly in LINE OA.

| Slot | Label | Action Type | Target |
|------|-------|-------------|--------|
| Left | แจ้งปัญหา / เปิดคำร้อง | URI | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket` |
| Right | ติดตามสถานะ | URI | `https://liff.line.me/2010416723-q3dOdIyS/liff/ticket/status` |

Suggested operator steps:
1. Open LINE Official Account Manager or the Rich Menu area connected to this OA
2. Create a new Rich Menu with 2 tap areas
3. Put the ticket intake action on the left
4. Put the status lookup action on the right
5. Upload the desired menu artwork if the OA uses custom artwork
6. Save the menu
7. Set it as the default Rich Menu

Implementation note:
- Internal logical action names in the repo are `open_ticket` and `track_status`.
- If you later move this setup to an API-created Rich Menu, keep those action meanings aligned with the same two destinations.

### 5) Real-device verification

Use a real LINE client account that follows the Support OA.

1. Open the OA chat
2. Confirm the Rich Menu appears
3. Tap “แจ้งปัญหา / เปิดคำร้อง”
4. Expected result: LIFF opens the ticket intake flow
5. Tap “ติดตามสถานะ”
6. Expected result: LIFF opens the ticket status flow
7. Submit one non-production-safe test ticket if needed
8. Confirm the ticket is created and the confirmation message is received

### 6) After Rich Menu is live

When all checks pass:
1. Mark Rich Menu configured live = complete
2. Mark Rich Menu tap verification = complete
3. Update `GROUND_TRUTH.md` / taskmaster F10 only after real-device proof exists

---

## Smoke Checklist (Post-Deploy + Rich Menu)

- [ ] LINE webhook verifies successfully from LINE Developers Console
- [ ] LIFF ID is correct for the Support OA
- [ ] `NEXT_PUBLIC_LIFF_ID` and `NEXT_PUBLIC_LIFF_ENDPOINT` match the active LIFF app
- [ ] Rich Menu exists in the live OA
- [ ] Rich Menu is assigned as default
- [ ] Tap: ticket intake opens `/liff/ticket`
- [ ] Tap: status lookup opens `/liff/ticket/status`
- [ ] Submit creates `aas_tickets` row
- [ ] Submit creates Linear issue `[AAS]` with correct labels
- [ ] LINE confirm Flex message received
- [ ] Mark Done in Linear → LINE Flex resolution sent
- [ ] Ticket status lookup works for a real ticket

---

## Evidence to Capture

For release confidence, capture:
- Screenshot of Rich Menu visible in OA chat
- Screenshot/video of tap → LIFF ticket intake
- Screenshot/video of tap → LIFF status lookup
- One successful test ticket code
- One matching Linear issue URL
