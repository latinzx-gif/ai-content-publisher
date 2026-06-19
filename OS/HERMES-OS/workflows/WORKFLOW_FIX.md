# WORKFLOW_FIX.md — แก้ไขงาน / บัก

> Hermes ใช้ไฟล์นี้ทุกครั้งที่มี task ประเภท FIX
> Ponytail mindset: แก้ให้น้อยที่สุด ห้าม refactor นอก scope

**Last Updated:** 2026-06-18

---

## Trigger Keywords

`bug` · `error` · `fix` · `broken` · `not working` · `fail` · `แก้` · `พัง` · `error`

---

## Flow

```
INPUT: Bug report / error log / task description
  │
  ▼
STEP 1 — Ponytail Check (Hermes ทำก่อน dispatch)
  └─ แก้ bug นี้ต้องเขียนโค้ดเพิ่มไหม?
     ├─ ไม่ต้อง → ลบ / config / env fix → Patcher โดยตรง (ข้าม Debugger)
     └─ ต้อง   → ไป STEP 2
  │
  ▼
STEP 2 — Debugger (Codex CLI / gpt-5.5)
  Input:  error log + stack trace + relevant files + GROUND_TRUTH.md
  Goal:   หา root cause เท่านั้น — ไม่แก้เอง
  Output: BUG_ANALYSIS.md
  Format:
    - Root cause (1-2 บรรทัด)
    - Minimal fix (เปลี่ยนอะไร ที่ไหน)
    - Ponytail decision: แก้กี่บรรทัด? มีทางแก้ที่สั้นกว่าไหม?
    - Files ที่ต้องแตะ (list — ให้น้อยที่สุด)
    - ห้ามแตะ (list)
  STOP ✋ รอ Hermes approve
  │
  ▼
STEP 3 — Hermes reviews BUG_ANALYSIS.md
  ├─ APPROVE → เขียน FIX_APPROVAL.md → dispatch Patcher
  └─ REJECT  → แจ้ง Debugger วิเคราะห์ใหม่
  │
  ▼
STEP 4 — Patcher (Codex CLI / gpt-5.3-codex-spark)
  Input:  BUG_ANALYSIS.md + FIX_APPROVAL.md + GROUND_TRUTH.md
  Rules:
    - แก้เฉพาะ files ที่ Debugger ชี้เป้า
    - ห้าม refactor นอก scope ของ bug
    - ห้ามเพิ่ม abstraction ใหม่
    - ใส่ `// ponytail: fixed [bug ref]` ที่จุดที่แก้
    - รัน quality gates ก่อน STOP
  Output: code fix + TASK_RESULT.md
  STOP ✋ รอ Hermes + Verifier
  │
  ▼
STEP 5 — Quality Gate (Patcher ทำก่อน STOP)
  npm run build      ✅
  npm run typecheck  ✅
  npm run lint       ✅ (0 errors)
  │
  ▼
STEP 6 — Verifier (Antigravity / Gemini 3.5 Flash)
  Input:  TASK_RESULT.md + URL ที่ต้องทดสอบ
  Goal:   ยืนยันว่า bug หายแล้ว ไม่ทำให้ feature อื่นพัง
  Output: VERIFY_RESULT.md
  Format:
    - Bug fixed: YES / NO
    - Regression check: PASS / FAIL (ระบุถ้า FAIL)
    - Browser screenshot path (ถ้ามี)
  STOP ✋ รอ Hermes approve
  │
  ▼
STEP 7 — Hermes final review
  ├─ Verifier PASS → archive → commit
  └─ Verifier FAIL → กลับ STEP 2 (ระบุ regression ใหม่)
```

---

## BUG_ANALYSIS.md Template (Debugger ใช้)

```markdown
# BUG_ANALYSIS.md

## Bug
[สรุปปัญหา 1 บรรทัด]

## Root Cause
[อธิบาย 1-2 บรรทัด — ทำไมถึงพัง]

## Minimal Fix
[เปลี่ยนอะไร ที่ไหน — Ponytail style]

## Ponytail Decision
- Lines to change: [N]
- Shorter path exists: [YES/NO — ถ้า YES ระบุ]
- New code needed: [YES/NO]

## Files to touch
- [ ] path/to/file.ts — line N: [what to change]

## Files NOT to touch
- [list]

## Done when
- [ ] [test criteria]
```
