# GROUND_TRUTH.md — Head Office Agent Studio (Agents Os)

> @/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md — กฎทั้งหมดมีผลกับ project นี้
> Override เฉพาะส่วนที่ระบุด้านล่างเท่านั้น

**อ่านไฟล์นี้ก่อนทุก session**

---

## 1. สิ่งที่กำลังสร้าง

**Head Office Agent Studio** — Native macOS desktop app (SwiftUI)
Control room สำหรับจัดการ AI agent team, project delivery, task board, human request inbox

```
Create Project → Import PRD → Build Agent Team → Assign Runtimes
→ Task Board → Run Tasks → Review/Audit → Demo/Handoff → Close
```

- **Stack:** SwiftUI, SwiftPM, SQLite (SwiftData), macOS-only
- **Type:** Internal tool — ไม่ใช่ Fastwork client, ไม่ขาย SaaS
- **App root:** `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/Agents Os/`
- **Source:** `Sources/HeadOfficeAgentStudio/`
- **Key files:** `Models.swift`, `Services.swift`, `Views.swift`

---

## 2. Milestone Status

| Milestone | Status | หมายเหตุ |
|-----------|--------|----------|
| M1 — Shell + Navigation | ✅ Done | Sidebar, SwiftPM |
| M2 — Workspace Workflow | ✅ Done | Project/PRD/Team/Runtime |
| M3 — PRD Context Flow | ✅ Done | |
| M4 — Agent/Skill/Team Editing | ✅ Done | |
| M5 — Task Board + Review Loop | 🔄 **PLAN READY** | Hardening task pipeline 5-stage |
| M6 — Demo + Handoff | ✅ Done | Closure summary, handoff export |
| M7 — (Next) | 📋 Plan only | รอหลัง M5 |

**Next:** Implement M5 Task Board hardening ตาม `docs/design/2026-06-18-m5-task-board-review-loop-plan.md`

---

## 3. ห้ามสร้าง

นอกจาก Universal DO NOT DO ใน COMPANY_OS.md:

- ❌ Autonomous code execution / runtime launch ใน app (manual-first principle)
- ❌ Network/cloud sync — local-first เท่านั้น
- ❌ Multi-user / auth system
- ❌ SaaS features / billing / marketplace ใน V1
- ❌ แตะ `SwiftData` schema migration โดยไม่บอก (data loss risk)

---

## 4. Agent Roles (Hermes 2.0)

> Swift/macOS stack — ต่างจาก Next.js projects

| Agent | Runtime | Model | บทบาท |
|-------|---------|-------|--------|
| **Hermes** | — | — | Orchestrator |
| **Planner** | Codex CLI | `gpt-5.4-mini` | PLAN + milestone breakdown |
| **Builder B** | Codex CLI | `gpt-5.3-codex-spark` | Swift logic, Models, Services |
| **Builder A** | Antigravity | `Gemini 3.5 Flash` | SwiftUI Views |
| **Debugger** | Codex CLI | `gpt-5.5` | Swift/SwiftData bugs |
| **Researcher** | Gemini CLI | `gemini-3.1-pro-preview` | Large .swift file scan |

> ⚠️ Swift stack — ไม่มี npm/Node commands; ใช้ `swift build` แทน

---

## 5. Active Task

**M5 Task Board Hardening** — ดู plan ที่:
`docs/design/2026-06-18-m5-task-board-review-loop-plan.md`

Scope หลัก:
- 5-stage pipeline: `open → in_progress → review → audit → done`
- Gate/badge สำหรับ special states
- Review gate ผูกกับ Human Request Inbox
- Run Log เพิ่ม result_path, related_request, error_summary

---

## 6. Key Files

| ต้องการรู้เรื่อง | อ่านที่ |
|----------------|---------|
| Scope + phase | `GROUND_TRUTH.md` (ไฟล์นี้) |
| PRD | `PRD_Head_Office_Agent_Studio.md` |
| Latest context compact | `docs/context/MILESTONE_6_COMPACT.md` |
| Current milestone plan | `docs/design/2026-06-18-m5-task-board-review-loop-plan.md` |
| QA results | `docs/qa/` |
| Data models | `Sources/HeadOfficeAgentStudio/Models.swift` |
| Services | `Sources/HeadOfficeAgentStudio/Services.swift` |
| Views | `Sources/HeadOfficeAgentStudio/Views.swift` |

---

## 7. Compact Protocol

Project นี้ใช้ compact แบบ dated file ใน `docs/context/`:

- Compact เมื่อ: จบแต่ละ Milestone
- Format: `docs/context/YYYYMMDD-m[N]-[topic]-compact.md`
- Content: milestone scope, files changed, current state, next milestone

> Context compact ไฟล์ล่าสุดเสมออยู่ที่ `docs/context/` — อ่านก่อนเริ่ม session ใหม่

---

## 8. Build Command

```bash
cd "/Users/jakarinosk/HEAD-OFFICE/PROJECTS/Agents Os"
swift build
# open app:
open dist/HeadOfficeAgentStudio.app
```

---

*Last updated: 2026-06-18 — Hermes 2.0 onboarding*
