---
name: workflow-claude-execute
description: >-
  Claude Code EXECUTE phase: verify PLAN_APPROVAL.md is APPROVED, implement
  step-by-step per TASK_PLAN.md only, verify, then write TASK_RESULT.md and STOP.
  Use when CURRENT_TASK.md Phase is EXECUTE.
---

# Skill: Claude Code — EXECUTE Phase

## When to Use

`orchestration/CURRENT_TASK.md` มี `Phase: EXECUTE`

---

## Reading Protocol (อ่านตามลำดับ)

```
1. orchestration/CURRENT_TASK.md          ← ยืนยัน Phase: EXECUTE
2. <app>/_agent/PLAN_APPROVAL.md          ← ต้องเป็น APPROVED เท่านั้น
3. <app>/_agent/TASK_PLAN.md             ← implement ตามนี้เท่านั้น
4. [Allowed Files ที่จะแก้]              ← อ่านเฉพาะ section ที่ต้องแก้จริง
```

ถ้า PLAN_APPROVAL.md ไม่ใช่ APPROVED → **STOP แจ้ง user**

---

## Implement — ทำตาม TASK_PLAN.md เท่านั้น

ทำทีละ step ตามที่เขียนไว้ใน plan:

```
✅ ทำตาม step ที่ approved
✅ ถ้าเจอ edge case ที่ไม่ได้ plan — บันทึกไว้ใน TASK_RESULT.md แล้วทำต่อ
❌ ห้าม improvise นอก plan โดยไม่บันทึก
❌ ห้ามแตะไฟล์นอก Allowed Files
❌ ห้ามแก้ไข logic ที่ไม่เกี่ยวกับ task นี้
❌ ห้าม "refactor เพิ่มนิดหน่อย" ระหว่างทาง
```

---

## Verify หลัง implement

```bash
npm run build
npm run typecheck
npm run lint

# ตรวจ acceptance criteria แต่ละข้อ
# เช่น นับ line count, ตรวจ import path, ตรวจ file exists
```

---

## เขียน TASK_RESULT.md

บันทึกที่ `<app>/_agent/TASK_RESULT.md`

```markdown
# Task Result — [TASK_ID]

## Status
DONE / PARTIAL / BLOCKED

## Summary
[2-3 ประโยค: ทำอะไรไปบ้าง]

## Files Changed
| File | Action | Details |
|------|--------|---------|
| path/file.tsx | CREATED/MODIFIED | สิ่งที่เปลี่ยน |

## Acceptance Self-Check
- [x] [criteria ที่ผ่าน]
- [ ] [criteria ที่ยังไม่ผ่าน — บอกเหตุผล]
- [x] npm run build: PASS
- [x] npm run typecheck: PASS
- [x] npm run lint: PASS

## Deviations from Plan
[ถ้าไม่มี: "None"] 
[ถ้ามี: บอกว่าทำอะไรต่างจาก plan + เหตุผล]

## Issues Found
[ถ้าพบ bug หรือปัญหาระหว่างทาง — บันทึกไว้ให้ Cursor รู้]

## Notes for Cursor
[อะไรที่ Cursor ต้องรู้ก่อน review]
```

---

## เขียน CURSOR_REVIEW_REQUEST.md

บันทึกที่ `<app>/_agent/CURSOR_REVIEW_REQUEST.md`

```markdown
# Review Request — [TASK_ID]

## Task
[TASK_ID] — [ชื่อ]

## Result
[DONE / PARTIAL / BLOCKED]

## Key Changes
- path/file — สิ่งที่เปลี่ยน

## Build Status
build: PASS | FAIL
typecheck: PASS | FAIL
lint: PASS | FAIL

## Deviations
[ถ้ามี]

## Questions / Concerns
[ถ้ามี]
```

---

## STOP

หลังเขียนทั้งสองไฟล์แล้ว → **STOP ทันที**

ห้าม:
- ❌ Start task ถัดไปเอง
- ❌ Update Taskmaster เอง
- ❌ Approve งานตัวเอง
- ❌ Cleanup หรือ archive ไฟล์ใน _agent/

บอก user: "Execute เสร็จ — รอ Cursor review ที่ `_agent/TASK_RESULT.md`"
