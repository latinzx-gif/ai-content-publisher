# WORKFLOW_BUILD.md — รับงานใหม่

> Hermes ใช้ไฟล์นี้ทุกครั้งที่มี task ประเภท BUILD
> Ponytail mindset: เขียนให้น้อยที่สุด แต่ยังถูกต้อง

**Last Updated:** 2026-06-18

---

## Trigger Keywords

`new feature` · `create` · `build` · `add module` · `implement` · `สร้าง` · `เพิ่ม`

---

## Flow

```
INPUT: Task description + GROUND_TRUTH.md + CURRENT_TASK.md
  │
  ▼
STEP 1 — Ponytail Check (Hermes ทำก่อน dispatch เสมอ)
  ├─ สิ่งนี้จำเป็นต้องมีจริงๆ ไหม? (YAGNI check)
  ├─ มี stdlib / platform feature / installed dep ทำได้แล้วไหม?
  └─ ถ้าใช่ → แจ้ง user แนะนำ shortcut ก่อน proceed
  │
  ▼
STEP 2 — Planner (Codex CLI / gpt-5.4-mini)
  Input:  CURRENT_TASK.md + GROUND_TRUTH.md + DO NOT BUILD list
  Output: TASK_PLAN.md
  Format:
    - Approach (1-3 บรรทัด)
    - Files ที่จะแตะ (list)
    - Files ที่ห้ามแตะ (list)
    - Ponytail decision: ใช้ shortcut ไหน? ถ้าใช่ → ระบุ
    - Estimated lines of code
  STOP ✋ รอ Hermes approve
  │
  ▼
STEP 3 — Hermes reviews TASK_PLAN.md
  ├─ APPROVE → เขียน PLAN_APPROVAL.md → dispatch Builder
  └─ REJECT  → แจ้ง Planner แก้ plan
  │
  ▼
STEP 4 — Builder (เลือกตาม task type)
  ├─ ต้องการ UI / frontend / browser test → Builder A (Antigravity / Gemini 3.5 Flash)
  └─ isolated / API / script / backend    → Builder B (Codex CLI / gpt-5.3-codex-spark)

  Input:  PLAN_APPROVAL.md + TASK_PLAN.md + GROUND_TRUTH.md
  Rules:
    - ใช้ Ponytail 6-rung ladder ก่อนเขียนทุกครั้ง
    - ใส่ `// ponytail: [ceiling] → [upgrade path]` ทุก shortcut
    - ไม่สร้างไฟล์นอก allowed list
    - รัน quality gates ก่อน STOP
  Output: code + TASK_RESULT.md
  STOP ✋ รอ Hermes review
  │
  ▼
STEP 5 — Quality Gate (Builder ทำก่อน STOP)
  npm run build      ✅
  npm run typecheck  ✅
  npm run lint       ✅ (0 errors)
  │
  ▼
STEP 6 — Hermes reviews TASK_RESULT.md + git diff
  ├─ APPROVE → archive → Taskmaster done → commit
  └─ REJECT  → แจ้ง Builder แก้
```

---

## TASK_PLAN.md Template (Planner ใช้)

```markdown
# TASK_PLAN.md

## Task
[ชื่อ task จาก CURRENT_TASK.md]

## Ponytail Decision
- [ ] YAGNI check passed: สิ่งนี้จำเป็นต้องมี
- Shortcut used: [ระบุ หรือ "none"]
- Estimated lines: [N]

## Approach
[1-3 บรรทัด — วิธีที่ minimal ที่สุดที่ทำให้ task ผ่าน]

## Files to touch
- [ ] path/to/file.ts — [เหตุผล]

## Files NOT to touch
- path/to/forbidden.ts — [เหตุผล]

## Done when
- [ ] [criteria 1]
- [ ] [criteria 2]
```

---

## TASK_RESULT.md Template (Builder ใช้)

```markdown
# TASK_RESULT.md

## Task
[ชื่อ task]

## What was done
[สรุปสั้น — max 5 บรรทัด]

## Files changed
- path/to/file.ts (+N / -N lines)

## Ponytail shortcuts used
- `// ponytail: [shortcut] → [upgrade path if needed]`

## Quality gates
- [ ] build: PASS
- [ ] typecheck: PASS
- [ ] lint: PASS (0 errors)

## Ready for Hermes review: YES
```
