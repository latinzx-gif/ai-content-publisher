---
name: workflow-deployment-checklist
description: >-
  Pre-production deployment gate: run before every push to production.
  Covers build, security, migrations, monitoring, and rollback readiness.
  Auto-trigger when task goal contains "deploy", "production", "launch", "go live".
---

# Skill: Deployment Checklist

## Auto-Trigger
โหลด skill นี้อัตโนมัติถ้า task มีคำ: `deploy` / `production` / `launch` / `go live` / `ส่งงาน`

---

## ❌ ห้าม deploy ถ้าข้อใดข้อหนึ่งไม่ผ่าน

---

## Gate 1 — Build & Quality

```bash
cd head-office-app

npm run build        # ต้อง 0 errors
npm run typecheck    # ต้อง 0 errors
npm run lint         # ต้อง 0 errors

# ถ้ามี tests
npm run test         # ต้อง pass ทั้งหมด
```

- [ ] build: PASS
- [ ] typecheck: PASS
- [ ] lint: PASS

---

## Gate 2 — Security (quick scan)

```bash
# ตรวจไม่มี secret ใน code
grep -rn "sk-\|Bearer \|SUPABASE_SERVICE" src/ --include="*.ts" --include="*.tsx" | grep -v "process.env"

# ตรวจ .env ไม่ได้ commit
git status | grep ".env"
git diff --cached | grep -i "token\|secret\|password\|key"
```

- [ ] ไม่มี hardcoded secrets
- [ ] .env ไม่อยู่ใน commit
- [ ] API keys ดึงจาก environment variables เท่านั้น

---

## Gate 3 — Database Migrations

```bash
# มี migration ใหม่ไหม?
ls supabase/migrations/ | tail -5

# ถ้ามี migration ใหม่:
# 1. ทดสอบ local ก่อน
supabase db reset && npm run dev
# 2. ตรวจ RLS ยังครบ
# 3. มี rollback SQL เตรียมไว้แล้ว
```

- [ ] ถ้ามี migration ใหม่ → ทดสอบ local แล้ว
- [ ] RLS ยังเปิดอยู่ทุก table
- [ ] Rollback SQL เตรียมไว้แล้ว (ถ้าต้องการ)

---

## Gate 4 — Environment Variables

ตรวจ Vercel Dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — set แล้ว
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — set แล้ว
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — set แล้ว
- [ ] `OPENAI_API_KEY` — set แล้ว
- [ ] `BUFFER_ACCESS_TOKEN` — set แล้ว (ถ้าใช้)
- [ ] ไม่มี variable ที่ยังเป็น placeholder เช่น `<your-key>`

---

## Gate 5 — Monitoring พร้อม

- [ ] Sentry ตั้งค่าแล้วและรับ errors ได้ (ตรวจ Sentry dashboard)
- [ ] UptimeRobot monitor ชี้ไปที่ production URL
- [ ] OpenAI usage dashboard เปิดไว้ (monitor cost spike)

ถ้ายังไม่มี Sentry → ตั้งก่อน deploy:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Gate 6 — Rollback Plan

ตอบให้ได้ก่อน deploy:

```
ถ้า deploy นี้พัง จะทำอะไร?

□ vercel rollback                    ← ทุก deploy ต้องทำได้
□ git revert + push                  ← ถ้า vercel rollback ไม่พอ
□ Supabase rollback SQL เตรียมไว้    ← ถ้ามี migration
□ แจ้ง user ด้วยข้อความอะไร         ← ถ้า downtime > 5 นาที
```

- [ ] รู้ว่า rollback ทำยังไง
- [ ] rollback SQL เตรียมไว้ (ถ้ามี migration)

---

## Gate 7 — Staging ผ่านแล้ว

```bash
# ทดสอบใน Vercel Preview URL ก่อนเสมอ
git push origin feature-branch   # Vercel สร้าง preview URL อัตโนมัติ

# ทดสอบ critical paths ใน preview:
# □ Login flow
# □ Core feature ที่เปลี่ยน
# □ ไม่มี console errors
```

- [ ] ทดสอบใน staging/preview แล้ว
- [ ] Critical user flow ผ่าน
- [ ] ไม่มี console errors ใหม่

---

## Deploy Command

```bash
# หลังผ่านทุก gate แล้ว
git push origin main   # Vercel auto-deploy

# หรือ manual
vercel --prod
```

---

## หลัง Deploy — Verify (5 นาที)

```bash
# ตรวจ production ทันทีหลัง deploy
# 1. เปิด production URL → โหลดได้ไหม
# 2. Login → ทำงานได้ไหม
# 3. Feature ที่เพิ่งเปลี่ยน → ทำงานได้ไหม
# 4. ตรวจ Sentry → มี error ใหม่ไหม
# 5. ตรวจ UptimeRobot → status UP
```

- [ ] Production URL โหลดได้
- [ ] Login ผ่าน
- [ ] Feature ที่เปลี่ยนทำงานได้
- [ ] Sentry ไม่มี error spike ใหม่

---

## เขียน Deployment Note

เพิ่มใน `reports/deployments/DEPLOY_[DATE].md`:

```markdown
# Deploy — [วันที่] [เวลา]

## Changes
- [task IDs + สิ่งที่เปลี่ยน]

## Gates Passed
- [ ] Build/Type/Lint
- [ ] Security scan
- [ ] Migrations
- [ ] Env vars
- [ ] Monitoring
- [ ] Staging tested

## Post-Deploy Status
- Production: ✅ UP
- Sentry: ✅ No new errors
- Notes: [ถ้ามี]
```
