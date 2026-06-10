---
name: workflow-incident-playbook
description: >-
  Production incident response: identify → contain → fix → verify → post-mortem.
  Use when production is broken, slow, or a service is down.
  Auto-trigger when user says "production พัง", "ลูกค้า error", "ล่ม", "down".
---

# Skill: Incident Playbook

## Auto-Trigger
โหลด skill นี้อัตโนมัติถ้ามีคำ: `production พัง` / `ลูกค้า error` / `ล่ม` / `down` / `500` / `crash`

**รัน skill นี้ด้วย `claude-opus-4-8`** — production incident ไม่ใช่เวลาประหยัด token

---

## Step 0 — Triage ก่อน (< 2 นาที)

ตอบ 3 คำถามนี้ก่อนทำอะไร:

```
1. กระทบใคร?
   □ ทุก user  □ บาง user  □ แค่ฉัน

2. อะไรพัง?
   □ ทั้ง app ขึ้นไม่ได้
   □ feature เฉพาะอย่าง
   □ performance ช้า
   □ data ผิด / หาย

3. เกิดตั้งแต่เมื่อไหร่?
   □ หลัง deploy ล่าสุด → rollback ก่อน
   □ ไม่ได้ deploy → external service down?
```

---

## Step 1 — ตรวจ External Services ก่อน

ส่วนใหญ่ไม่ใช่ bug ของเรา — ตรวจ services ก่อน:

```
Supabase:  https://status.supabase.com
OpenAI:    https://status.openai.com
Buffer:    https://status.buffer.com
Vercel:    https://www.vercel-status.com
```

ถ้า external service down → **แจ้ง user ทันที + รอ** ไม่ต้องแก้ code

---

## Step 2 — ตรวจ Logs

```bash
# Vercel logs (production)
vercel logs --prod

# Sentry (ถ้าตั้งไว้)
# เปิด Sentry dashboard → Issues → Latest

# Supabase logs
# Dashboard → Logs → API logs / DB logs

# Local reproduce
cd head-office-app
npm run dev
# ดู terminal + browser console
```

---

## Step 3 — หลัง Deploy ล่าสุด → Rollback ก่อน

```bash
# Vercel rollback
vercel rollback

# หรือ git revert
git log --oneline -5   # หา commit ก่อน deploy
git revert HEAD        # revert commit ล่าสุด
git push               # trigger redeploy
```

**Rollback ก่อนเสมอ ถ้า incident เกิดหลัง deploy ทันที**
อย่าพยายาม hotfix ใน production โดยไม่ rollback — เพิ่ม risk

---

## Step 4 — Fix (ทำใน local + staging)

```bash
# reproduce ใน local ก่อน
npm run dev

# แก้ไฟล์ที่ root cause
# ทดสอบ exact scenario ที่พัง

# ตรวจ build + typecheck
npm run build
npm run typecheck
```

---

## Step 5 — Deploy Fix + Verify

```bash
# Deploy
git push   # หรือ vercel deploy --prod

# ตรวจหลัง deploy
# - ทดสอบ scenario ที่พัง → ต้องหายแล้ว
# - ตรวจ Sentry ว่าไม่มี error ใหม่
# - ตรวจ UptimeRobot ว่า status กลับเป็น UP
```

---

## Step 6 — Post-Mortem (เขียนทันทีหลังแก้)

บันทึกที่ `reports/incidents/INCIDENT_[DATE].md`:

```markdown
# Incident Report — [วันที่] [เวลา]

## Timeline
- [เวลา] เกิด incident
- [เวลา] detect
- [เวลา] fix deployed
- [เวลา] verified resolved

## Root Cause
[1 ประโยค — ไม่ใช่แค่ symptom]

## Impact
- Users affected: [N users / all users]
- Duration: [X นาที]
- Data loss: [Yes/No]

## Fix Applied
[ไฟล์ + สิ่งที่เปลี่ยน]

## Prevention
[ทำอะไรเพื่อไม่ให้เกิดซ้ำ]
```

---

## Playbook ต่อ Service

### Supabase down
```
1. ตรวจ status.supabase.com
2. ถ้า down → app ยังใช้ได้ไหม? (ถ้ามี graceful fallback)
3. แจ้ง user: "ระบบฐานข้อมูลขัดข้องชั่วคราว กำลังติดตาม"
4. รอ Supabase fix → ไม่มีอะไรที่เราทำได้
```

### OpenAI down / quota exceeded
```
1. ตรวจ status.openai.com
2. ตรวจ usage dashboard — quota หมดไหม?
3. ถ้า quota หมด → เติม credits ทันที
4. ถ้า service down → แสดง error message ที่ดี ไม่ให้ user งง
```

### Buffer API error
```
1. ตรวจ status.buffer.com
2. ตรวจ BUFFER_ACCESS_TOKEN ยังใช้งานได้ไหม
3. ตรวจ profile ID ถูกต้องไหม
4. ทดสอบ API call ตรงๆ ก่อน blame code
```

### Build fail หลัง deploy
```
1. vercel rollback ทันที
2. ดู build logs ใน Vercel dashboard
3. reproduce locally: npm run build
4. แก้ + ทดสอบ local → deploy ใหม่
```
