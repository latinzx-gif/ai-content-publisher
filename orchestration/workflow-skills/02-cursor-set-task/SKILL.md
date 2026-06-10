---
name: workflow-cursor-set-task
description: >-
  Cursor picks the next task from Taskmaster, writes a precise CURRENT_TASK.md,
  and marks the task as in-progress. Use after every completed task review,
  or when user says "next task" / "set task [ID]".
---

# Skill: Cursor — Set Next Task

## When to Use

- หลัง Cursor approve task ที่แล้วและทำ cleanup เสร็จแล้ว
- User พิมพ์ "next" หรือ "set task [ID]"

---

## Step 1 — ตรวจสอบก่อนเสมอ

```bash
# ยืนยันว่า previous task APPROVED
cat orchestration/REVIEW_STATUS.md

# ดู tasks ที่รอ
task-master list --status=pending
# หรือ MCP: mcp_taskmaster-ai_get_tasks (status: pending)
```

**ถ้า previous task ยังไม่ APPROVED → STOP บอก user ให้ review ก่อน**

---

## Step 2 — เลือก task ถัดไปจาก Taskmaster

```bash
task-master next
# หรือ task-master show <id>
# หรือ MCP: mcp_taskmaster-ai_next_task
```

ตรวจ dependencies:
- task นี้ต้องการ task ก่อนหน้า complete ไหม?
- ถ้ามี blocker → ข้ามไปหา task ถัดไปที่ไม่ blocked

ถ้า task ซับซ้อนเกิน → แตก subtasks:
```bash
task-master expand --id=<id> --num=<จำนวน>
# หรือ MCP: mcp_taskmaster-ai_expand_task
```

---

## Step 3 — เลือก Skills ที่ agent ต้องโหลด

ระบุก่อนเขียน CURRENT_TASK.md:

| เงื่อนไข | Skills ที่ต้องระบุ |
|---------|-----------------|
| ทุก task | `03-claude-plan` + `05-claude-execute` (บังคับเสมอ) |
| goal มีคำ: bug / fix / error / พัง | + `09-debug-session` |
| แตะ schema / table / RLS / migration | + `12-supabase-migration` |
| แตะ auth / API key / token / security | + `10-security-review` |
| เริ่ม project ใหม่ | + `08-prd-to-tasks` + `01-project-init` |
| งาน client ใหม่ | + `11-client-requirements` |

---

## Step 4 — เขียน CURRENT_TASK.md

เปิด `orchestration/templates/GOOD_TASK_GUIDE.md` แล้วเขียน `orchestration/CURRENT_TASK.md`:

**Checklist ก่อน commit:**
- [ ] Goal: path เต็ม + line range (ถ้าทำได้) + expected output
- [ ] Allowed Files: path เต็มทุกไฟล์ ไม่ใช่ glob กว้างๆ
- [ ] Forbidden: ชัดเจน — อะไรที่ห้ามแตะ
- [ ] Acceptance Criteria: วัดได้ (build pass, line count, file exists)
- [ ] Depends: task ก่อนหน้าที่ต้อง APPROVED
- [ ] Phase: PLAN
- [ ] Recommended Model: claude-fable-5 (default)
- [ ] **Skills to Load: ระบุครบตาม Step 3**

---

## Step 5 — Update Taskmaster

```bash
task-master set-status --id=<id> --status=in-progress
# หรือ MCP: mcp_taskmaster-ai_set_task_status
```

---

## Step 6 — Update REVIEW_STATUS.md

เพิ่ม row ใหม่ใน `orchestration/REVIEW_STATUS.md`:

```markdown
| [TASK_ID] | [ชื่อ task] | 🔄 IN PROGRESS | — | [วันที่] | — |
```

---

## Output ที่ต้องมีก่อนจบ

- [ ] CURRENT_TASK.md เขียนแล้ว Phase: PLAN
- [ ] Taskmaster task status = in-progress
- [ ] REVIEW_STATUS.md อัปเดตแล้ว
- [ ] บอก user: "Task [ID] ready — รัน Claude Code ด้วย skill `03-claude-plan`"
