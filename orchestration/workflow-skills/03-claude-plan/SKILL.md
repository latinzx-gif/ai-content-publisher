---
name: workflow-claude-plan
description: >-
  Claude Code PLAN phase: read context in the correct order, inspect only
  allowed files, write a precise TASK_PLAN.md and CURSOR_PLAN_REQUEST.md,
  then STOP. Use when CURRENT_TASK.md Phase is PLAN.
---

# Skill: Claude Code — PLAN Phase

## When to Use

`orchestration/CURRENT_TASK.md` มี `Phase: PLAN`

---

## Reading Protocol (อ่านตามลำดับ ห้ามข้าม)

```
1. orchestration/GROUND_TRUTH.md          ← scope + forbidden (อ่านก่อนเสมอ)
2. orchestration/REVIEW_STATUS.md         ← previous task APPROVED?
3. orchestration/CURRENT_TASK.md          ← goal + allowed files + acceptance criteria
4. head-office-app/AGENTS.md              ← codebase rules
5. [Allowed Files จาก CURRENT_TASK.md]   ← อ่านเฉพาะ section ที่เกี่ยวข้อง
6. src/features/prd/README.md             ← ถ้า task แตะ features/prd/
```

ถ้า REVIEW_STATUS.md แสดงว่า previous task ยังไม่ APPROVED → **STOP แจ้ง user**

---

## Inspect Allowed Files (อ่านแบบ focused เท่านั้น)

```bash
# หา location ก่อน
grep -n "ComponentName" src/app/page.tsx | head -5

# อ่านเฉพาะ section ที่เกี่ยวข้อง
# rtk read src/app/page.tsx 12300 12450

# ห้าม dump ทั้งไฟล์ถ้าไม่จำเป็น
```

สิ่งที่ต้องหาก่อนเขียน plan:
- exact line range ของ component/function ที่จะแตะ
- dependencies: imports, hooks, types ที่ใช้
- call sites: ที่อื่นที่ใช้ component นี้
- risks: อะไรที่อาจพัง

---

## เขียน TASK_PLAN.md

บันทึกที่ `<app>/_agent/TASK_PLAN.md`

**Format บังคับ:**

```markdown
# TASK PLAN: [TASK_ID] — [ชื่อ]

## Summary
[1-2 ประโยค: ทำอะไร ที่ไหน]

## Files to Change
| File | Action | Details |
|------|--------|---------|
| path/to/file.tsx | CREATE/MODIFY/DELETE | สิ่งที่เปลี่ยน |

## Step-by-Step

### Step 1 — [ชื่อ step]
- อ่าน: `path/file line_start–line_end`
- ทำ: [exact action — ไม่ใช่ "แก้ตามความเหมาะสม"]

### Step 2 — [ต่อไป]
...

## Expected Outcome
| Metric | Before | After |
|--------|--------|-------|
| page.tsx lines | ~13,794 | ~13,700 |
| [file] | ไม่มี | สร้างใหม่ |

## Risks
1. [อะไรที่อาจพัง + วิธีป้องกัน]

## Acceptance Self-Check
- [ ] [ข้อจาก CURRENT_TASK.md]
- [ ] npm run build pass
- [ ] npm run typecheck pass
```

---

## เขียน CURSOR_PLAN_REQUEST.md

บันทึกที่ `<app>/_agent/CURSOR_PLAN_REQUEST.md`

```markdown
# Plan Review Request — [TASK_ID]

## Task
[TASK_ID] — [ชื่อ]

## Plan Summary
[2-3 ประโยค]

## Files That Will Change
- path/file — reason

## Risks Flagged
- [risks]

## Questions for Cursor (ถ้ามี)
- [อะไรที่ไม่แน่ใจ]
```

---

## STOP

หลังเขียนทั้งสองไฟล์แล้ว → **STOP ทันที**

ห้าม:
- ❌ แก้ source code
- ❌ รัน build
- ❌ เริ่ม implement
- ❌ update CURRENT_TASK.md เอง

บอก user: "Plan เขียนแล้วที่ `_agent/TASK_PLAN.md` — รอ Cursor review"
