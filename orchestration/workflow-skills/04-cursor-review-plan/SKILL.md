---
name: workflow-cursor-review-plan
description: >-
  Cursor reviews Claude's TASK_PLAN.md: check scope, check forbidden files,
  approve or reject, then write PLAN_APPROVAL.md and set Phase to EXECUTE.
  Use when Claude has submitted CURSOR_PLAN_REQUEST.md.
---

# Skill: Cursor — Review Plan

## When to Use

Claude Code เขียน `_agent/CURSOR_PLAN_REQUEST.md` แล้ว — Cursor ต้อง review

---

## Step 1 — อ่าน plan

```
1. <app>/_agent/CURSOR_PLAN_REQUEST.md   ← summary + risks + questions
2. <app>/_agent/TASK_PLAN.md             ← full plan
3. orchestration/CURRENT_TASK.md         ← acceptance criteria + allowed files
4. orchestration/GROUND_TRUTH.md         ← forbidden list
```

---

## Step 2 — ตรวจ checklist

**Scope check:**
- [ ] ทุก file ใน "Files to Change" อยู่ใน Allowed Files ของ CURRENT_TASK.md?
- [ ] ไม่มีไฟล์ใน DO NOT BUILD list ของ GROUND_TRUTH.md?
- [ ] ไม่มี Phase 2+ features ซ่อนอยู่ใน plan?

**Quality check:**
- [ ] แต่ละ step ระบุ exact action (ไม่ใช่ "แก้ตามความเหมาะสม")?
- [ ] มี Expected Outcome ที่วัดได้?
- [ ] มี Risks section?
- [ ] Acceptance Self-Check ครอบคลุม criteria ใน CURRENT_TASK.md?

---

## Step 3A — ถ้า APPROVE

เขียน `<app>/_agent/PLAN_APPROVAL.md`:

```markdown
# Plan Approval — [TASK_ID]

## Status
APPROVED

## Approved By
Cursor — [วันที่]

## Notes
[ถ้ามี: ข้อสังเกต หรือ constraint เพิ่มเติม]

## Next Step
Claude Code รัน skill `05-claude-execute`
```

แก้ `orchestration/CURRENT_TASK.md`:
```markdown
## Phase
EXECUTE
```

บอก user: "Plan approved — รัน Claude Code ด้วย skill `05-claude-execute`"

---

## Step 3B — ถ้า REJECT

เขียน `<app>/_agent/PLAN_APPROVAL.md`:

```markdown
# Plan Approval — [TASK_ID]

## Status
REJECTED

## Reason
[ระบุชัดเจน: ไฟล์นอก scope / step ไม่ชัด / forbidden item]

## Required Changes
1. [สิ่งที่ต้องแก้]
2. ...

## Next Step
Claude Code แก้ TASK_PLAN.md แล้วส่ง CURSOR_PLAN_REQUEST.md ใหม่
```

บอก user: "Plan rejected — แจ้ง Claude Code ให้แก้แล้วส่งใหม่"

---

## Output ที่ต้องมีก่อนจบ

- [ ] `_agent/PLAN_APPROVAL.md` เขียนแล้ว (APPROVED หรือ REJECTED)
- [ ] ถ้า APPROVED: CURRENT_TASK.md Phase = EXECUTE
- [ ] บอก user ขั้นตอนถัดไปชัดเจน
