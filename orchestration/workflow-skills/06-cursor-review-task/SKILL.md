---
name: workflow-cursor-review-task
description: >-
  Cursor reviews Claude's completed task: check git diff, run build/lint,
  verify acceptance criteria, cleanup _agent/ files, update Taskmaster,
  and mark task APPROVED in REVIEW_STATUS.md. Use when Claude submits CURSOR_REVIEW_REQUEST.md.
---

# Skill: Cursor — Review Completed Task

## When to Use

Claude Code เขียน `_agent/CURSOR_REVIEW_REQUEST.md` แล้ว — Cursor ต้อง review

---

## Step 1 — อ่าน result

```
1. <app>/_agent/CURSOR_REVIEW_REQUEST.md  ← summary + build status
2. <app>/_agent/TASK_RESULT.md            ← full result + deviations
3. orchestration/CURRENT_TASK.md          ← acceptance criteria
```

---

## Step 2 — Verify งาน

```bash
# ดู diff ของ files ที่เปลี่ยน
git diff HEAD -- <allowed-files>

# รัน build + checks
cd head-office-app
npm run build
npm run typecheck
npm run lint

# ตรวจ acceptance criteria แต่ละข้อ
# เช่น นับ line count, ตรวจ import path, ตรวจ file exists
wc -l src/app/page.tsx
ls -la src/features/prd/components/
```

---

## Step 3A — ถ้า APPROVE

**Update REVIEW_STATUS.md:**
```markdown
| [TASK_ID] | [ชื่อ] | ✅ APPROVED | [วันที่ approve] | [วันที่] | [หมายเหตุ] |
```

**Update Taskmaster:**
```bash
task-master set-status --id=<id> --status=done
# หรือ MCP: mcp_taskmaster-ai_set_task_status (status: done)
```

**Cleanup _agent/ files:**
```bash
# Archive ไฟล์งานเก่า (ไม่ลบ — เก็บ history)
mkdir -p _agent/archive/[TASK_ID]
mv _agent/TASK_PLAN.md _agent/archive/[TASK_ID]/
mv _agent/PLAN_APPROVAL.md _agent/archive/[TASK_ID]/
mv _agent/TASK_RESULT.md _agent/archive/[TASK_ID]/
mv _agent/CURSOR_PLAN_REQUEST.md _agent/archive/[TASK_ID]/
mv _agent/CURSOR_REVIEW_REQUEST.md _agent/archive/[TASK_ID]/
```

**Commit:**
```bash
git add -A
git commit -m "[TASK_ID] [ชื่อ task] — approved"
```

บอก user: "Task [ID] approved — รัน skill `02-cursor-set-task` เพื่อ set task ถัดไป"

---

## Step 3B — ถ้า REJECT

บอก Claude Code สิ่งที่ต้องแก้:
```
TASK_ID: [ID]
Status: REJECTED
Reason: [ระบุชัดเจน — build fail / criteria ไม่ครบ / deviation ไม่ acceptable]
Required Fix: [สิ่งที่ต้องแก้ก่อน re-submit]
```

อัปเดต REVIEW_STATUS.md:
```markdown
| [TASK_ID] | [ชื่อ] | ❌ REJECTED | — | [วันที่] | [เหตุผล] |
```

**ไม่ต้อง** update Taskmaster หรือ cleanup ไฟล์

---

## Output ที่ต้องมีก่อนจบ (กรณี APPROVE)

- [ ] REVIEW_STATUS.md: task = ✅ APPROVED
- [ ] Taskmaster: task status = done
- [ ] _agent/ files archived
- [ ] git commit แล้ว
- [ ] บอก user ขั้นตอนถัดไป
