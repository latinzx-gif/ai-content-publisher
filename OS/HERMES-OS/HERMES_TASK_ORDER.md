# HERMES_TASK_ORDER.md — ลำดับงานทั้งหมด

> **Updated: 2026-06-18**
> ไฟล์นี้คือ source of truth สำหรับ Hermes ในการจัดลำดับงาน
> อัพเดทหลังทุก session ที่มีการเปลี่ยน priority

---

## Priority Framework (ตาม HERMES.md)

```
1. Revenue generating work  ← Fastwork client work
2. Client deadlines         ← งานที่มี deadline
3. Reusable assets / SOPs   ← เครื่องมือ + template
4. Internal improvements    ← OS, tooling, infra
5. Experiments              ← ไม่ทำจน 1-4 เสร็จ
```

---

## Active Projects — Priority Order

### P1 🔴 hr-payroll-client (Revenue — Client)

| Field | Value |
|-------|-------|
| Status | Active — Phase ongoing |
| Path | `PROJECTS/hr-payroll-client/` |
| App | `PROJECTS/hr-payroll-client/hr-app/` |
| Ground Truth | `PROJECTS/hr-payroll-client/GROUND_TRUTH.md` |
| Current Task | `PROJECTS/hr-payroll-client/orchestration/CURRENT_TASK.md` |
| Review Status | `PROJECTS/hr-payroll-client/orchestration/REVIEW_STATUS.md` |
| Agent Team | Hermes 2.0 (Planner/Builder A+B/Debugger/Researcher) |
| Linear | `[HRP]` prefix |
| Hermes action | Check CURRENT_TASK → PLAN → dispatch Planner |

---

### P2 🔴 ai-assistant-support (Revenue — Client, LIVE)

| Field | Value |
|-------|-------|
| Status | Phase 1 LIVE — Phase 2 LOCKED |
| Path | `PROJECTS/ai-assistant-support/` |
| App | `PROJECTS/ai-assistant-support/support-app/` |
| Ground Truth | `PROJECTS/ai-assistant-support/GROUND_TRUTH.md` |
| Current Task | `PROJECTS/ai-assistant-support/orchestration/CURRENT_TASK.md` |
| Support Flow | `OS/HERMES-OS/workflows/WORKFLOW_SUPPORT_LINE.md` |
| Linear | `[AAS]` prefix |
| Hermes action | Monitor Linear Triage issues + cron support flow |
| Phase 2 unlock | User approval required — เพิ่ม Telegram + detectUrgency |

---

### P3 🔴 law-ai-content-os (Revenue — Client, Deployed)

| Field | Value |
|-------|-------|
| Status | Code complete — auth test pending |
| Path | `PROJECTS/law-ai-content-os/` |
| Ground Truth | `PROJECTS/law-ai-content-os/GROUND_TRUTH.md` |
| Checkpoint | `PROJECTS/law-ai-content-os/CHECKPOINT.md` |
| Backlog | `PROJECTS/law-ai-content-os/BACKLOG.md` |
| Deploy URL | https://law-content.vercel.app |
| Stack | Next.js 16, Supabase, OpenAI, Vercel |
| Hermes action | Dispatch Debugger → verify F-01 Auth AC ทั้งหมด |

---

### P4 🟡 fastwork/inventory-management-system (Revenue — Client)

| Field | Value |
|-------|-------|
| Status | Phase 1a Complete — Phase 1b (Inbound) next |
| Path | `PROJECTS/fastwork/inventory-management-system/` |
| Ground Truth | `PROJECTS/fastwork/inventory-management-system/PROJECT_STATE.md` |
| Next Task | `PROJECTS/fastwork/inventory-management-system/NEXT_CODEX_TASK.md` |
| Linear | Inventory Mgmt project |
| Hermes action | Start Phase 1b — read NEXT_CODEX_TASK → dispatch Builder B |

---

### P5 🟣 head-office-app — AI Content Publisher (Internal / Demo Ready)

| Field | Value |
|-------|-------|
| Status | Phase 1 DEMO READY — Phase 2 LOCKED |
| Path | `head-office-app/` (monorepo root) |
| Ground Truth | `orchestration/GROUND_TRUTH.md` |
| Current Task | `orchestration/CURRENT_TASK.md` |
| Phase 2 blocker | User approve Phase 2 scope |
| Hermes action | HOLD — รอ user approve Phase 2 ก่อน |

---

### P6 🟢 Agents Os — Head Office Agent Studio (Internal)

| Field | Value |
|-------|-------|
| Status | M1-M4 + M6 Done — M5 Task Board plan ready |
| Path | `PROJECTS/Agents Os/` |
| Ground Truth | `PROJECTS/Agents Os/GROUND_TRUTH.md` |
| M5 Plan | `PROJECTS/Agents Os/docs/design/2026-06-18-m5-task-board-review-loop-plan.md` |
| Latest compact | `PROJECTS/Agents Os/docs/context/MILESTONE_6_COMPACT.md` |
| Stack | SwiftUI, SwiftPM, SQLite/SwiftData |
| Build | `swift build` |
| Hermes action | Dispatch Builder B → implement M5 5-stage pipeline |

---

### P7 🟢 AGENT-TOWN (Internal — Product)

| Field | Value |
|-------|-------|
| Status | Planning / MVP scoped |
| Path | `OS/AGENT-TOWN-OS/` |
| Data | `DATA/AGENT-TOWN/` |
| Ground Truth | `OS/AGENT-TOWN-OS/00_COMMAND_CENTER/` |
| Hermes action | Review ROADMAP → เริ่มเมื่อ P1-P3 stable |

---

### P8 🟢 DATACLAW (Internal — Data Asset)

| Field | Value |
|-------|-------|
| Status | Planning / Data layer designed |
| Path | `OS/DATACLAW-OS/` |
| Data | `DATA/DATACLAW/` |
| Ground Truth | `OS/DATACLAW-OS/00_COMMAND_CENTER/` |
| Hermes action | Research pipeline เริ่มได้ parallel กับ P4+ |

---

### P9 🟢 INVESTMENT-OS (Internal — Capital)

| Field | Value |
|-------|-------|
| Status | Strategy defined |
| Path | `OS/INVESTMENT-OS/` |
| Data | `DATA/INVESTMENT/` |
| Ground Truth | `OS/INVESTMENT-OS/00_COMMAND_CENTER/` |
| Hermes action | Review OPPORTUNITY_QUEUE ทุกอาทิตย์ |

---

## Global File Map (Hermes อ่านก่อนทุก session)

| ต้องการรู้เรื่อง | อ่านที่ |
|----------------|---------|
| Global rules + Ponytail | `AGENTS.md` (root) |
| Company constitution | `COMPANY_OS.md` |
| Hermes team (9 agents) | `OS/HERMES-OS/AGENT_TEAM.md` |
| Model routing | `OS/HERMES-OS/MODEL_ROUTING.md` |
| Task order (ไฟล์นี้) | `OS/HERMES-OS/HERMES_TASK_ORDER.md` |
| Reading protocol | `OS/HERMES-OS/READING_PROTOCOL.md` |
| BUILD workflow | `OS/HERMES-OS/workflows/WORKFLOW_BUILD.md` |
| FIX workflow | `OS/HERMES-OS/workflows/WORKFLOW_FIX.md` |
| SUPPORT workflow | `OS/HERMES-OS/workflows/WORKFLOW_SUPPORT_LINE.md` |
| Morning brief | `OS/HERMES-OS/MORNING_BRIEF_SOP.md` |
| Runtime state | `OS/HERMES-OS/runtime/` |

---

## Hermes Morning Routine (ทุกวัน)

```
1. อ่าน HERMES_TASK_ORDER.md (ไฟล์นี้)
2. เช็ค Linear: [HRP] + [AAS] issues ที่ค้างอยู่
3. เช็ค runtime/pending_agent_task.md
4. ตาม priority: dispatch งาน P1 ก่อน → P2 → P3
5. Report ผ่าน Telegram (MORNING_BRIEF_SOP.md)
```

---

## Folder Ownership (who manages what)

| Folder | เจ้าของ | หมายเหตุ |
|--------|--------|----------|
| `OS/HERMES-OS/` | Hermes | Runtime, team, routing, workflows |
| `OS/FASTWORK-OS/` | Hermes + Fastwork agents | Client work SOP |
| `OS/DATACLAW-OS/` | DataClaw Director | Research pipeline |
| `OS/INVESTMENT-OS/` | Investment Director | Capital management |
| `OS/AGENT-TOWN-OS/` | Agent Town Director | Product planning |
| `PROJECTS/` | Hermes orchestrates each | Project-specific files |
| `HERMES-BRAIN/` | Hermes | Memory + decisions |
| `DATA/` | All agents (read) | Data assets, reports |
| `archive/` | Read-only | History, do not modify |
| `reports/` | Hermes + Auditor | Signoffs, reviews |

---

## Blocked / Waiting

| Project | Blocker |
|---------|--------|
| ai-assistant-support Phase 2 | User approve Telegram + cron build |
| head-office-app Phase 2 | User approve Phase 2 scope |
| Claude Code (all projects) | Anthropic API Key หรือ Extra Usage |

---

*Last updated: 2026-06-18 — Added law-ai-content-os (P3), Agents Os (P6); 9-project order finalized*
