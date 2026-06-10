# Agent Workflow Framework — Multi-Project Template

**3 Agents: Cursor + Codex (GPT-5.5) + Claude Code**

---

## Agent Roles

| Agent | หน้าที่ | ห้าม |
|-------|---------|------|
| **Cursor** | Orchestrator — set task, route, review, approve | แตะ source code |
| **Codex (GPT-5.5)** | Primary implementer — new files, isolated features | Self-approve, แตะ logic ที่ซับซ้อน |
| **Claude Code** | Complex implementer — integration, bug, refactor | Self-approve, start next task เอง |
| **Claude Opus 4.8** | Audit only — pre-delivery scan | Implement |

---

## Routing Rule (Cursor ใช้ตัดสินใจ)

```
Task ต้องสร้างไฟล์ใหม่ทั้งหมด?          → Codex
Task isolated ไม่แตะ existing logic?     → Codex
Task ต้องแก้ code เดิม หลายไฟล์?        → Claude Code
Task มี bug / integration / debug?       → Claude Code
Task ไม่แน่ใจ?                           → Claude Code (safe default)
```

---

## Folder Structure (ทุกโปรเจกต์)

```
project-root/
├── orchestration/
│   ├── GROUND_TRUTH.md          ← North Star (อ่านก่อนเสมอ)
│   ├── CURRENT_TASK.md          ← active task + Phase
│   ├── REVIEW_STATUS.md         ← task approval history
│   ├── AGENT_LOOP.md            ← loop rules
│   ├── templates/
│   │   └── GOOD_TASK_GUIDE.md   ← template สำหรับ task + plan
│   └── workflow-skills/         ← skills แต่ละขั้นตอน
├── <app-name>/
│   └── _agent/
│       ├── TASK_PLAN.md
│       ├── PLAN_APPROVAL.md
│       ├── TASK_RESULT.md
│       ├── CURSOR_PLAN_REQUEST.md
│       ├── CURSOR_REVIEW_REQUEST.md
│       └── archive/             ← completed task files
└── reports/
    └── DELIVERY_READINESS_AUDIT.md
```

---

## Task Loop (ทำซ้ำทุก task)

```
1. Cursor อ่าน Taskmaster → เลือก task → เขียน CURRENT_TASK.md (Phase: PLAN)
   └─ Taskmaster: set status = in-progress

2. Cursor routing decision:
   ├─ Route A → ส่ง CURRENT_TASK.md ให้ Codex
   └─ Route B → ส่ง CURRENT_TASK.md ให้ Claude Code

3. [Agent] อ่าน context → เขียน TASK_PLAN.md + CURSOR_PLAN_REQUEST.md → STOP

4. Cursor review plan:
   ├─ APPROVE → เขียน PLAN_APPROVAL.md, Phase: EXECUTE
   └─ REJECT  → แจ้ง agent ให้แก้ plan

5. [Agent] อ่าน PLAN_APPROVAL.md → implement ตาม plan → เขียน TASK_RESULT.md + CURSOR_REVIEW_REQUEST.md → STOP

6. Cursor review result:
   ├─ APPROVE → archive _agent/, update Taskmaster (done), git commit → ไปข้อ 1
   └─ REJECT  → แจ้ง agent ให้แก้
```

---

## Context ที่ต้องส่งให้ Codex ทุกครั้ง

Codex ไม่ได้อ่าน GROUND_TRUTH.md เอง — Cursor ต้องแนบ context นี้ทุกครั้ง:

```
[CONTEXT]
Tech stack: [stack]
Forbidden: [DO NOT BUILD list]
Allowed files: [จาก CURRENT_TASK.md]

[TASK]
(เนื้อหา CURRENT_TASK.md)
```

---

## Reading Protocol สำหรับ Claude Code

```
1. orchestration/GROUND_TRUTH.md
2. orchestration/REVIEW_STATUS.md   ← previous task APPROVED?
3. orchestration/CURRENT_TASK.md
4. <app>/AGENTS.md
5. [Allowed Files — เฉพาะ section ที่เกี่ยวข้อง]
```

---

## GROUND_TRUTH.md Template (สำหรับโปรเจกต์ใหม่)

```markdown
# GROUND_TRUTH.md — [Project Name]

## 1. สิ่งที่กำลังสร้าง
[product + tech stack + flow หลัก]

## 2. App Structure
[paths + URL mapping]

## 3. Phase Status
| Phase | Status |
|-------|--------|
| Phase 1 | 🔄 IN PROGRESS |
| Phase 2+ | 🔒 LOCKED |

## 4. ห้ามสร้าง
- [Phase 2+ features]

## 5. Agent Roles
Cursor → Orchestrator
Codex (GPT-5.5) → Primary implementer
Claude Code → Complex implementer

## 6. Loop
[ดู workflow-skills/WORKFLOW_FRAMEWORK.md]

## 7. Reading Protocol
[ดู workflow-skills/03-claude-plan/SKILL.md]
```

---

## Taskmaster Commands

```bash
task-master init
task-master parse-prd --input=docs/PRD.md
task-master list
task-master next
task-master set-status --id=<id> --status=<in-progress|done|blocked>
task-master expand --id=<id>   # แตก subtasks ถ้า task ใหญ่เกิน
```

---

## Delivery Audit

ก่อน demo ทุกครั้ง — รัน skill `07-delivery-audit` ด้วย `claude-opus-4-8`

Verdict: 🟢 READY / 🟡 CAVEATS / 🔴 NOT READY

---

## กฎเหล็ก

1. ไม่มี agent ไหน self-approve
2. ไม่มี agent ไหน start task ถัดไปเอง
3. ทุก task ผ่าน PLAN → APPROVE → EXECUTE → REVIEW เสมอ
4. Codex ต้องได้รับ context จาก Cursor ทุกครั้ง (ไม่อ่านไฟล์เองตาม protocol)
5. ถ้า task ไม่ชัดว่าให้ใคร → Claude Code (safe default)
