# GROUND_TRUTH.md — AI Assistant Support

> @/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md — ทุกกฎใน COMPANY_OS.md มีผลกับ project นี้ด้วย  
> Override เฉพาะส่วนที่ระบุด้านล่างเท่านั้น

**อ่านไฟล์นี้ก่อนทุก session ก่อนตัดสินใจ scope หรือเริ่มงานใดๆ**

---

## 1. สิ่งที่กำลังสร้าง

**AI Assistant Support** — ช่องทาง LINE Support OA กลาง 1 ตัว สำหรับลูกค้า B2B หลายเจ้า  
รับแจ้ง bug / error / ร้องเรียน → เปิดคำร้องใต้ชื่อบริษัท → **Linear** แยกลูกค้า / ประเภท / ระดับ → **แจ้งกลับ LINE** เมื่อปิดงาน (Done)

```
ลูกค้า (Support OA) → LIFF เปิดคำร้อง → aas_tickets + Linear [AAS]
Owner แก้ + Done ใน Linear → webhook → LINE Flex สรุป resolution
```

- **Tech Stack:** Next.js 16, Supabase (`aas_` prefix), LINE Messaging API + LIFF + Flex, Linear API + webhook, Vercel
- **LINE OA:** Support OA **แยก** จาก CNV WorkHub employee OA
- **Linear:** Project `AI Assistant Support`, issue prefix `[AAS]`, labels `client:*`, `type:*`, `severity:P0–P3`

---

## 2. App Structure

| Surface | Path | URL (local) |
|---------|------|-------------|
| LINE Webhook | `support-app/src/app/api/line/webhook` | POST |
| Linear Webhook | `support-app/src/app/api/linear/webhook` | POST |
| LIFF — เปิดคำร้อง | `support-app/src/app/liff/ticket` | `/liff/ticket` |
| LIFF — ติดตามสถานะ | `support-app/src/app/liff/ticket/status` | `/liff/ticket/status` |
| Admin clients (Phase 1 minimal) | `support-app/src/app/admin/clients` | `/admin/clients` |

- **Project root:** `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/`
- **App root:** `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/support-app/`
- **PRD:** `docs/PRD.md`
- **Deploy:** Vercel project `ai-assistant-support` (แยกจาก hr-app)

---

## 3. Phase Status

| Phase | Status | หมายเหตุ |
|-------|--------|----------|
| **Phase 1 MVP** | ✅ **LIVE** | F1–F10 ใน PRD — intake, Linear, close-loop notify |
| **Phase 2** | 🔒 **LOCKED** | Hermes Support Automation — P0 escalation, cron triage (10 min), Fix Team dispatch, Telegram approval loop — ดู `OS/HERMES-OS/workflows/WORKFLOW_SUPPORT_LINE.md` |
| **Phase 3** | 🔒 **LOCKED** | Auto-fix จำกัด + deploy ลูกค้า (ต้อง user approve แยก) |

---

## 3b. Support Architecture (Phase 2 — LOCKED)

> ดู flow เต็ม: `OS/HERMES-OS/workflows/WORKFLOW_SUPPORT_LINE.md`

```
Customer → Rich Menu → LIFF Form → POST /api/support/intake
  └─ detectUrgency()
      ├─ P0 → createLinear(P0) + Telegram Jakarin ทันที + LINE ACK
      └─ Normal → createLinear(Triage) + LINE ACK

Hermes Cron (10 min) → poll Linear Triage → AI triage → dispatch Fix Team

Jakarin Telegram reply:
  TAKE     → Jakarin แก้เอง
  DISPATCH → Hermes ส่ง Debugger→Patcher→Verifier

Fix Team Done → updateLinear(Done) → LINE Flex แจ้งลูกค้า
```

**P0 triggers:** `severity_hint == "urgent"` | `issue_type IN [system_down, no_access, data_loss]` | keyword scan

---

## 4. ห้ามสร้าง (Project-specific)

นอกจาก Universal DO NOT DO ใน COMPANY_OS.md:

- ❌ แก้ไข / import จาก `PROJECTS/hr-payroll-client/hr-app/`
- ❌ ใช้ table prefix `hr_` หรือ `hr_complaints`
- ❌ ใช้ LINE WorkHub channel secret / webhook URL เดียวกับ employee OA
- ❌ สร้าง Linear issues ใน project `CNV WorkHub` / prefix `[HRP]`
- ❌ Auto-fix หรือ deploy repo ลูกค้าใน Phase 1
- ❌ เปิด free-text LINE chat ก่อนมี moderation (Phase 1 = Rich Menu + LIFF)
- ❌ Hard delete tickets — ใช้ status `closed` / soft archive

---

## 5. Agent Roles (Updated: 2026-06-18 — Hermes 2.0)

> ใช้ Hermes team ตาม COMPANY_OS.md — ดู: `OS/HERMES-OS/AGENT_TEAM.md`

| Agent | Runtime | Model | บทบาท |
|-------|---------|-------|--------|
| **Hermes** | — | — | Orchestrator — set task, review, Linear sync `[AAS]`, deploy |
| **Planner** | Codex CLI | `gpt-5.4-mini` | PLAN phase ทุก task |
| **Builder B** | Codex CLI | `gpt-5.3-codex-spark` | Scaffold, webhook, LIFF, Linear integration |
| **Builder A** | Antigravity | `Gemini 3.5 Flash` | UI components, browser test |
| **Debugger** | Codex CLI | `gpt-5.5` | Bug analysis, LINE/Linear integration issues |
| **Researcher** | Gemini CLI | `gemini-3.1-pro-preview` | Large codebase scan, audit |

**Ponytail mindset:** เขียนน้อยที่สุดที่ยังถูกต้อง — ดู `HEAD-OFFICE/AGENTS.md`
**⏸ Claude Code:** Paused — ต้องการ Anthropic API Key ก่อน

---

## 6. Active Task

ดู: `orchestration/CURRENT_TASK.md`

---

## 7. Key Files

| ต้องการรู้เรื่อง | อ่านที่ |
|----------------|---------|
|| Hermes briefing | `orchestration/HERMES_BRIEF.md` |
|| Agent roles & dispatch | `orchestration/AGENT_TEAM.md` |
|| Scope & phase | `GROUND_TRUTH.md` (ไฟล์นี้) |
| Feature spec | `docs/PRD.md` |
| งานปัจจุบัน | `orchestration/CURRENT_TASK.md` |
| Approval history | `orchestration/REVIEW_STATUS.md` |
| Architecture decisions | `orchestration/DECISION_LOG.md` |
| Linear sync | `orchestration/workflow-skills/linear-mcp-sync/SKILL.md` |
| Task backlog | `.taskmaster/tasks/tasks.json` |

---

## 8. Reading Protocol

**Cursor / Agent ทุกตัว — ก่อนเริ่มงาน:**

1. `/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md`
2. `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/ai-assistant-support/GROUND_TRUTH.md`
3. `orchestration/REVIEW_STATUS.md`
4. `orchestration/CURRENT_TASK.md`

---

## 9. Linear Conventions

| Field | Value |
|-------|-------|
| Project | `AI Assistant Support` |
| Title pattern | `[AAS][{client_slug}] {P0–P3} · {type} · {subject}` |
| Labels | `client:{slug}`, `type:bug|error|...`, `severity:P0|P1|P2|P3` |
| Resolution comment | ขึ้นต้น `[resolution]` — ใช้เป็นข้อความแจ้งลูกค้า |
| States | Triage → Todo → In Progress → Waiting Client → **Done** |

---

*Last updated: 2026-06-18 — Added Phase 2 Hermes Support Architecture*
