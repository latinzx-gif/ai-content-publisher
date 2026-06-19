# 🧠 HERMES BRIEF — AI Assistant Support

> **Orchestrator:** Hermes Agent
> **Project:** AI Assistant Support (LINE Support OA)
> **Last Updated:** 2026-06-16
> **Status:** ✅ **LIVE** — app, LIFF, webhooks, cron, and Rich Menu are configured live

---

## 📌 1. PROJECT OVERVIEW

LINE Support OA กลาง สำหรับลูกค้า B2B (ChineseVibe, CNV WorkHub)
รับแจ้ง bug/error → สร้าง Linear issue `[AAS]` → แจ้งกลับ LINE เมื่อ Done

```
ลูกค้า → Support OA → LIFF เปิด ticket → aas_tickets + Linear [AAS]
Owner แก้ → Linear Done → webhook → LINE Flex สรุป resolution
```

หมายเหตุสำคัญ: entry point ผ่าน LINE OA Rich Menu ถูกตั้งค่า live แล้วใน session นี้ (default Rich Menu ID `richmenu-cf569ac22e493111e6a36411071dd088`) และ LIFF URLs ตอบ 200

---

## ✅ 2. WHAT'S DONE (Code complete T1–T11)

| Task | Status | สิ่งที่สร้าง |
|------|--------|------------|
| T1 Scaffold + DB | ✅ | `support-app/` Next.js 16 + migrations `aas_*` + seed |
| T2 Client Registry | ✅ | `/admin/clients`, `/api/liff/clients` |
| T3 Contact Binding | ✅ | `/liff/bind`, `/api/liff/bind`, `/api/liff/me` |
| T4 LINE Webhook | ✅ | `POST /api/line/webhook` + signature verify + Rich Menu routing code |
| T5 LIFF Ticket Intake | ✅ | `/liff/ticket` form + AAS-XXXXXX code generation |
| T6 Linear Issue | ✅ | Linear API client, create issue with `[AAS][slug]` title + labels |
| T7 LINE Confirm | ✅ | Flex message push to LINE user after submit |
| T8 Linear Webhook | ✅ | `POST /api/linear/webhook` + `[resolution]` comment → close-loop notify |
| T9 Status Follow-up | ✅ | `/liff/ticket/status` + color-coded badges |
| **T10 Deploy** | ✅ | Deployed + env + webhooks + cron complete; Rich Menu live + default assigned |
| **T11 Incident Ingestion API** | ✅ | `POST /api/internal/incidents` with header secret + payload validation + `createOrBumpIncident` orchestration |
| **T12 Watcher Relay** | ✅ | `support-app/scripts/queue-monitor-relay.ts` posts simulated monitor alerts into `/api/internal/incidents` |

**Build + Typecheck: PASS** — 14 routes registered
**Production URL:** https://support-app-brown.vercel.app
**LIFF ID:** `2010416723-q3dOdIyS`

---

## ✅ 3. T10 STATUS — LIVE

### 🔴 ฟาเดลทำ (Manual)

- [x] SQL migrations → ✅ ตารางมีข้อมูลแล้ว (ChineseVibe + CNV WorkHub)
- [x] Create LIFF app → ✅ LIFF ID `2010416723-q3dOdIyS`
- [x] Set LINE webhook → ✅ `https://support-app-brown.vercel.app/api/line/webhook` (active)
- [x] Create Linear webhook → ✅ ID `dfaf8b10-12f6-4dc6-b402-f2a269a72947`
- [x] Create / assign LINE Rich Menu as default menu for Support OA → ✅ `richmenu-cf569ac22e493111e6a36411071dd088`
- [x] Verify Rich Menu entrypoint path → ✅ default Rich Menu API verified + LIFF URLs `/liff/ticket` and `/liff/ticket/status` return HTTP 200

### 🟡 Hermes ทำ

- [x] Deploy to Vercel → ✅ `support-app-brown.vercel.app`
- [x] Set env vars on Vercel (Supabase, LINE, LIFF, Linear)
- [x] Verify app/webhook endpoints → ✅ endpoints ตอบ 200/401 ตามคาด
- [x] Setup cron jobs:
  - 📥 Queue Monitor (ทุก 1 ชม.)
  - 🔄 Notify Retry (ทุก 30 นาที)
  - 📊 Daily Summary (ทุก 8:00 น.)
- [x] Rich Menu postback handling code ready in app
- [x] Rich Menu channel configuration live in LINE OA

---

## 🧠 4. AGENT TEAM

| Agent | Status | บทบาท | คำสั่งเรียก |
|-------|--------|-------|-----------|
| **Claude Code** | ✅ Logged in | Integration, LINE, Linear, webhook | `claude -p "..."` |
| **Codex CLI** | ❌ ต้อง login | Scaffold, DB, migration | `codex exec -s workspace-write "..."` |
| **agy** | ✅ ใช้ได้ | UI, Flex, styling | `agy --prompt "..." --dangerously-skip-permissions` |
| **Gemini CLI** | ✅ Logged in | DB query, backend, backup | `gemini --prompt "..." --skip-trust` |
| **Hermes** | — | Orchestrator, verify, cron, deploy | จัดการทั้งหมด |

**Full details:** `orchestration/AGENT_TEAM.md`

---

## 🗂️ 5. KEY FILES

| File | Path |
|------|------|
| PRD | `docs/PRD.md` |
| North Star | `GROUND_TRUTH.md` |
| Current State | `orchestration/CURRENT_TASK.md` |
| Agent Team | `orchestration/AGENT_TEAM.md` |
| Review Status | `orchestration/REVIEW_STATUS.md` |
| Task Master | `.taskmaster/tasks/tasks.json` |
| Env Example | `support-app/.env.example` |
| App Root | `support-app/` |

---

## 🔧 6. QUICK COMMANDS

```bash
# Dev
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/support-app
npm run dev          # local server
npm run build        # production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run watcher:queue  # dry-run queue monitor relay payload

# Test watcher relay + API route
npx tsx --test scripts/queue-monitor-relay.test.ts src/app/api/internal/incidents/route.test.ts
vercel --prod        # deploy to production

# Check state
cat orchestration/CURRENT_TASK.md
cat orchestration/REVIEW_STATUS.md
```

---

## 🚀 7. NEXT ACTION

1. ✅ `docs/INCIDENT_TO_LINEAR_IMPLEMENTATION_MAP.md` complete
2. ✅ Task 1 complete — shared ticket/incident Linear builder extracted
3. ✅ Task 2 complete — `aas_incidents` migration + generated DB types + shared incident contract
4. ✅ Task 3 complete — fingerprint/create-or-bump incident service + Linear comment/update helpers
5. ✅ Task 4 complete — secure incident ingestion API
6. ✅ Task 5 complete — watcher relay posts simulated alerts to `/api/internal/incidents`
7. Keep Phase 2 locked until ฟาเดล approves
