---
name: workflow-debug-session
description: >-
  Structured debugging protocol: reproduce → isolate → root cause → fix → verify.
  Use when there's a bug, unexpected behavior, build failure, or runtime error.
  Auto-trigger when task goal contains "bug", "fix", "error", or "ไม่ทำงาน".
---

# Skill: Debug Session

## Auto-Trigger
โหลด skill นี้อัตโนมัติถ้า task goal มีคำ: `bug` / `fix` / `error` / `ไม่ทำงาน` / `พัง` / `crash`

---

## Step 1 — Reproduce ก่อนเสมอ

```bash
# ระบุ exact steps ที่ reproduce ได้
# 1. ทำอะไร
# 2. เห็นอะไร  
# 3. คาดหวังอะไร

# ตรวจ console / logs
npm run dev   # ดู terminal output
# ตรวจ browser console
# ตรวจ Supabase logs (ถ้า error เกี่ยวกับ DB)
```

ถ้า reproduce ไม่ได้ → **STOP แจ้ง user ขอข้อมูลเพิ่ม**

---

## Step 2 — Isolate (อย่าแก้ก่อน isolate)

```bash
# หา error message เต็มๆ
npm run build 2>&1 | head -50
npm run typecheck 2>&1

# หา file ที่ error
grep -rn "ERROR\|error\|Error" src/ --include="*.tsx" | grep -v node_modules
```

ระบุให้ได้:
- Error เกิดที่ file + line ไหน
- เกิดตอน runtime / build time / type check
- เกิดทุกครั้งหรือบางครั้ง

---

## Step 3 — Root Cause (อ่าน code จริง)

```bash
# อ่านเฉพาะ section ที่ error
# ไม่ dump ทั้งไฟล์

grep -n "functionName\|ComponentName" src/path/file.tsx
# อ่าน ±20 บรรทัดรอบจุด error
```

ถามตัวเองก่อนแก้:
- นี่คือ root cause หรือแค่ symptom?
- แก้แล้วจะพังที่อื่นไหม?
- มี call site อื่นที่ใช้ function นี้ด้วยไหม?

---

## Step 4 — Fix (เฉพาะ minimal change)

กฎ:
```
✅ แก้เฉพาะจุดที่ root cause
✅ ถ้าแก้ > 3 files → หยุดคิดใหม่ว่า root cause ถูกไหม
❌ ห้าม refactor ระหว่าง fix
❌ ห้ามแก้ "เผื่อ" ปัญหาอื่น
```

---

## Step 5 — Verify

```bash
npm run build
npm run typecheck
npm run lint

# ทดสอบ exact scenario ที่ reproduce ได้ใน Step 1
# ตรวจ regression: ฟีเจอร์ที่ใช้ function เดิมยังทำงานได้ไหม
```

---

## Output: เขียน TASK_RESULT.md

```markdown
## Root Cause
[ระบุชัด — ไม่ใช่แค่ "มี bug"]

## Fix Applied
[file + line + สิ่งที่เปลี่ยน]

## Verified By
- [ ] reproduce scenario ไม่เกิดแล้ว
- [ ] build pass
- [ ] typecheck pass
- [ ] regression check pass

## Risks
[ถ้ามี side effect ที่ยังไม่ได้ตรวจ]
```
