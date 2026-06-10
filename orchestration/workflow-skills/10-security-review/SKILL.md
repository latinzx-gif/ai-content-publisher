---
name: workflow-security-review
description: >-
  Pre-production security scan: RLS gaps, exposed secrets, unprotected routes,
  auth bypass risks. Run with claude-opus-4-8 before any client delivery.
  Auto-trigger before delivery-audit skill.
---

# Skill: Security Review

## When to Use
- ก่อน deploy production ทุกครั้ง
- ก่อนรัน `07-delivery-audit`
- เมื่อ task แตะ auth / RLS / API routes

**รัน skill นี้ด้วย `claude-opus-4-8`**

---

## Checklist A — Secrets & Keys

```bash
# หา hardcoded secrets
grep -rn "sk-\|Bearer \|token.*=.*['\"]" src/ --include="*.ts" --include="*.tsx"
grep -rn "SUPABASE\|OPENAI\|BUFFER" src/ --include="*.ts" --include="*.tsx" | grep -v "process.env"

# ตรวจ .env ไม่ได้อยู่ใน git
cat .gitignore | grep ".env"
git ls-files | grep ".env"
```

ผ่านถ้า: ไม่มี secret ใน source code, .env อยู่ใน .gitignore

---

## Checklist B — Supabase RLS

```sql
-- ตรวจทุก table ว่า RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- ตรวจ policies มีครบ
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

ผ่านถ้า: ทุก table มี RLS = true + มี policy ครบทั้ง SELECT/INSERT/UPDATE/DELETE

---

## Checklist C — Next.js Route Protection

```bash
# หา routes ที่ไม่มี auth check
grep -rn "export default\|export async function" src/app/ --include="*.tsx" --include="*.ts" -l
```

ตรวจแต่ละ route:
- [ ] Protected routes มี session check
- [ ] API routes มี auth validation
- [ ] `/publisher/*` routes ทุกหน้า redirect ถ้าไม่ login

---

## Checklist D — Input Validation

```bash
grep -rn "req.body\|searchParams\|params\." src/app/api/ --include="*.ts"
```

- [ ] User input ทุกจุดมี validation ก่อนส่งให้ DB / AI
- [ ] SQL injection: ใช้ parameterized queries เท่านั้น
- [ ] ไม่มี `eval()` หรือ dynamic code execution

---

## Checklist E — CORS & Headers

```bash
cat next.config.ts | grep -A 20 "headers\|cors"
```

- [ ] API routes ไม่เปิด CORS wildcard (`*`) โดยไม่จำเป็น
- [ ] Sensitive headers ไม่ leak ใน client

---

## Output: เขียน reports/SECURITY_REVIEW.md

```markdown
# Security Review — [วันที่]

## Verdict
🟢 PASS / 🔴 FAIL

## Critical Issues (ต้องแก้ก่อน deploy)
1. [ถ้ามี]

## Warnings (แก้ได้หลัง deploy)
1. [ถ้ามี]

## Checklist Results
- [ ] Secrets: PASS/FAIL
- [ ] RLS: PASS/FAIL
- [ ] Route protection: PASS/FAIL
- [ ] Input validation: PASS/FAIL
- [ ] CORS: PASS/FAIL
```
