---
name: workflow-project-init
description: >-
  Initialize a new project from scratch: create GROUND_TRUTH.md, AGENT_ROLES.md,
  reading protocol, and set up Taskmaster to manage the task backlog from a PRD.
  Use at the very start of any new project before writing any code.
---

# Skill: Project Init — GROUND_TRUTH + Taskmaster

## When to Use

โปรเจกต์ใหม่ที่ยังไม่มี orchestration structure — ใช้ก่อนเขียน code บรรทัดแรก

---

## Step 1 — รับ brief จาก user

ถาม / รับข้อมูล:
- Product คืออะไร (1-3 ประโยค)
- Tech stack หลัก
- Phase 1 scope: อะไรทำ, อะไรไม่ทำ
- Agents ที่จะใช้ (เลือกแค่ที่จำเป็น — default: Cursor + Claude Code)

---

## Step 2 — สร้าง folder structure

```bash
mkdir -p orchestration/templates
mkdir -p orchestration/workflow-skills
mkdir -p reports
mkdir -p <app-name>/_agent
```

---

## Step 3 — Init Taskmaster

```bash
# ถ้าใช้ CLI
cd <project-root>
task-master init

# Parse PRD เป็น tasks
task-master parse-prd --input=docs/PRD.md

# ดู tasks ที่ได้
task-master list
```

```
# ถ้าใช้ MCP
mcp_taskmaster-ai_initialize_project
mcp_taskmaster-ai_parse_prd  (พร้อม prd content)
mcp_taskmaster-ai_get_tasks  (ตรวจ tasks ที่ได้)
```

ตรวจ tasks ที่ parse ได้:
- มี dependencies ถูกต้องไหม?
- Phase 2+ tasks ต้อง mark `status: blocked` ก่อน

---

## Step 4 — สร้าง GROUND_TRUTH.md

เขียน `orchestration/GROUND_TRUTH.md` ให้ครบ 5 ส่วน:

```markdown
## 1. สิ่งที่กำลังสร้าง
[product + tech stack + flow หลัก]

## 2. App Structure
[paths หลัก + URL mapping]

## 3. Phase Status
[Phase 1: IN PROGRESS | Phase 2+: LOCKED]

## 4. ห้ามสร้าง (DO NOT BUILD)
[รายการ Phase 2+ features ที่ lock ไว้]

## 5. Agent Roles
[Cursor: Orchestrator | Claude Code: Implementer]

## 6. Loop สำหรับทุก Task
[CURRENT_TASK → PLAN → EXECUTE → REVIEW loop]

## 7. Reading Protocol
[ลำดับการอ่านไฟล์สำหรับแต่ละ role]
```

---

## Step 5 — สร้าง CURRENT_TASK.md task แรก

```bash
task-master next   # หรือ task-master show 1
```

เขียน `orchestration/CURRENT_TASK.md` ตาม format ใน `orchestration/templates/GOOD_TASK_GUIDE.md`

ตั้ง `Phase: PLAN`

Update Taskmaster:
```bash
task-master set-status --id=1 --status=in-progress
```

---

## Output ที่ต้องมีก่อนจบ

- [ ] `orchestration/GROUND_TRUTH.md` ครบ 7 sections
- [ ] Taskmaster initialized + tasks parsed จาก PRD
- [ ] `orchestration/CURRENT_TASK.md` task แรก Phase: PLAN
- [ ] Taskmaster task 1 status = in-progress
- [ ] บอก user: "พร้อมแล้ว — รัน skill `03-claude-plan` ได้เลย"
