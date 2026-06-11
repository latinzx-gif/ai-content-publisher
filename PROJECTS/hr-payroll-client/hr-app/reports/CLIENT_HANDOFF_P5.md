# Client Handoff — Phase 5 (MVP)

**Project:** LINE OA HR & Payroll Platform  
**Date:** 2026-06-11  
**Production:** https://hr-app-two-iota.vercel.app  
**Supabase project:** `oouswalwqhojpzqwwdvs` (hr-payroll, Singapore)

---

## 1. สิ่งที่ส่งมอบ (Phase 5)

| ฟีเจอร์ | สถานะ |
|---------|--------|
| โครงสร้างสาขา / แผนก | ✅ |
| Branch Manager (BM) — อนุมัติลา + ลงเวลา + OT ในสาขา | ✅ |
| CEO Dashboard — ภาพรวมองค์กร | ✅ |
| อนุมัติ 2 ขั้น (BM → HR) ลา + สรุปวันเข้างาน | ✅ |
| SLA 48 ชม. — คำขอค้างหมดอายุอัตโนมัติ | ✅ (cron) |
| LINE แจ้ง BM เมื่อมีคิวรออนุมัติ | ✅ |
| Badge จำนวนค้างบน sidebar BM | ✅ |
| Payroll รายงานชั่วโมง (ไม่ใช่สลิปเงินเดือน) | ✅ |

รายละเอียด audit: `reports/DELIVERY_READINESS_AUDIT_P5.md`  
Security: `reports/SECURITY_REVIEW_P5_1.md`  
Smoke routes: `reports/E2E_P5_1_RESULTS.md`

---

## 2. URL สำคัญ

| จุดเข้าใช้ | URL |
|------------|-----|
| **Web login (LINE)** | https://hr-app-two-iota.vercel.app/login |
| **HR / Admin home** | https://hr-app-two-iota.vercel.app/admin |
| **CEO dashboard** | https://hr-app-two-iota.vercel.app/admin/ceo |
| **Branch Manager home** | https://hr-app-two-iota.vercel.app/admin/branch |
| BM — อนุมัติลงเวลา | `/admin/branch/attendance` |
| BM — อนุมัติลา | `/admin/branch/leaves` |
| BM — OT | `/admin/branch/overtime` |
| BM — ทีมสาขา | `/admin/branch/team` |
| จัดการสาขา (HR) | `/admin/branches` |
| LIFF — ขอลา | `/liff/leave` |
| LIFF — ยื่นสรุปวัน | `/liff/attendance` |
| LIFF — OT | `/liff/overtime` |

LINE Webhook (Messaging API):  
`https://hr-app-two-iota.vercel.app/api/line/webhook`

---

## 3. Roles & หน้าเริ่มต้นหลัง login

| Role | คำอธิบาย | Landing |
|------|----------|---------|
| `employee` | พนักงานทั่วไป — LINE / LIFF | `/liff/leave` |
| `hr` / `admin` | HR อนุมัติขั้นสุดท้าย, รายงาน, ตั้งค่า | `/admin` |
| `branch_manager` | หัวหน้าสาขา — อนุมัติในสาขา | `/admin/branch` |
| `ceo` | ภาพรวมองค์กร (จำกัด path) | `/admin/ceo` |
| `dev` | ทดสอบ — สลับมุมมอง CEO / BM / HR ได้ | `/admin/ceo` + Dev switcher |

CEO เข้าได้เฉพาะ prefix: `/admin/ceo`, `/admin/branches`, `/admin/employees`, `/admin/reports`, `/admin/organization`

---

## 4. ตั้ง Branch Manager (ขั้นตอนลูกค้า)

### 4.1 สร้าง/กำหนด role ให้พนักงาน

1. Login เป็น **HR/Admin** → `/admin/employees`
2. แก้พนักงานที่จะเป็นหัวหน้าสาขา → ตั้ง **role = `branch_manager`**
3. กำหนด **สาขา (`branch_id`)** ให้พนักงานในสาขานั้น (ถ้ามีแล้ว)

หรือใช้ script (local / server ที่มี `.env.local`):

```bash
cd hr-app
node scripts/seed-admin.mjs <LINE_USER_ID> "ชื่อ นามสกุล" branch_manager
```

### 4.2 ผูก BM กับสาขา (1 BM : 1 สาขา)

**ทาง UI:** `/admin/branches` → สร้างสาขา หรือแก้สาขา → เลือก **Manager**

**ทาง API** (HR token):

```http
POST /api/branches
Content-Type: application/json

{
  "name": "สาขาหลัก",
  "code": "MAIN",
  "managerEmployeeId": "<uuid พนักงาน role branch_manager>"
}
```

เงื่อนไข:
- Manager ต้องมี role `branch_manager` แล้ว
- 1 manager ผูกได้ 1 สาขาเท่านั้น

### 4.3 ทดสอบ

1. BM login ผ่าน LINE → ควรไป `/admin/branch`
2. ส่งคำขอลา / ยื่นสรุปวันจากพนักงานในสาขา → BM เห็นคิว + badge sidebar
3. BM อนุมัติ → คิวไป HR (ขั้นที่ 2)

---

## 5. LINE OA setup (สรุป)

ตั้งค่าใน **LINE Developers Console** (channel Messaging API + LIFF):

| รายการ | ค่า |
|--------|-----|
| Webhook URL | `https://hr-app-two-iota.vercel.app/api/line/webhook` |
| LIFF endpoint (leave) | `https://hr-app-two-iota.vercel.app/liff/leave` |
| LIFF endpoint (attendance) | `https://hr-app-two-iota.vercel.app/liff/attendance` |

**Vercel env ที่ต้องมี (Production):**

- `NEXT_PUBLIC_SUPABASE_URL` = `https://oouswalwqhojpzqwwdvs.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon / publishable จาก Supabase Dashboard
- `SUPABASE_SERVICE_ROLE_KEY` = service role (ห้าม expose ฝั่ง client)
- `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`
- `NEXT_PUBLIC_LINE_LIFF_ID` (และ LIFF แยกตาม flow ถ้ามี)
- `LINE_LOGIN_CHANNEL_ID`, `LINE_LOGIN_CHANNEL_SECRET`
- `NEXT_PUBLIC_BASE_URL` = `https://hr-app-two-iota.vercel.app`

---

## 6. Supabase & Cron

| รายการ | ค่า |
|--------|-----|
| Project ref | `oouswalwqhojpzqwwdvs` |
| Vault `project_url` | `https://oouswalwqhojpzqwwdvs.supabase.co` |
| Vault `secret_key` | service role key (สำหรับ cron ที่เรียก Edge Function) |

**Cron `approval-expiry`** — ทุกชั่วโมง (`0 * * * *`):

- หมดอายุคำขอ **ลา** และ **สรุปวันเข้างาน** ที่สถานะ `pending_manager` / `pending_hr` และเลย `expires_at` (48 ชม.)
- **Implementation:** รัน **SQL ใน Postgres โดยตรง** (ไม่เรียก Edge Function) เพราะ Edge Function ใช้ auth แบบ `sb_secret` — ถ้าจะกลับไปใช้ HTTP ต้องใส่ `sb_secret_...` ใน Vault แล้ว redeploy cron ตาม migration `20260615000000_approval_expiry_vault_align.sql`

ตรวจสอบ:

```sql
select jobname, schedule, active from cron.job where jobname = 'approval-expiry';
select name from vault.secrets where name in ('project_url', 'secret_key');
```

Cron อื่นที่ยังเรียก Edge Function (morning-push, contract-alert ฯลฯ) ใช้ Vault เดียวกัน — ถ้าได้ 401 ให้ rotate `secret_key` เป็น **sb_secret** จาก Dashboard → API Keys

---

## 7. Known gaps / ข้อจำกัด MVP

| หัวข้อ | หมายเหตุ |
|--------|----------|
| มอบหมาย BM จริง | ลูกค้าตั้ง role + ผูกสาขาเอง (ดู §4) |
| สลิปเงินเดือน / baht | **นอก scope** Phase 5 — มีแค่รายงานชั่วโมง |
| HR Admin Dashboard หน้าแรก | **locked** — ห้าม refactor โดย vendor |
| Employee profile pages | **locked** |
| Phase 6 | ยังไม่เริ่ม |
| Edge Function cron auth | บาง job อาจต้อง `sb_secret` ใน Vault (ดู §6) |
| Rotate API keys | แนะนำหลัง handoff — อย่า commit keys ลง git |

---

## 8. Support & repo

| รายการ | Path |
|--------|------|
| App root | `PROJECTS/hr-payroll-client/hr-app/` |
| Migrations | `hr-app/supabase/migrations/` |
| Orchestration task | T77 — `orchestration/CURRENT_TASK.md` |
| รัน smoke local | `node scripts/e2e/smoke-role-routes.mjs` |
| E2E Phase 5 remote | `npm run test:e2e:p5:remote` (ต้องมี `.env.e2e.local`) |

---

## 9. Sign-off checklist (ลูกค้า)

- [ ] Login LINE → role ถูกต้อง
- [ ] สร้างสาขา + ผูก BM อย่างน้อย 1 สาขา
- [ ] Flow ลา 2 ขั้น (BM → HR) ทดสอบแล้ว
- [ ] Flow สรุปวันเข้างาน + BM approve ทดสอบแล้ว
- [ ] CEO dashboard เปิดได้
- [ ] LINE webhook ตอบกลับใน production

**Contact / vendor:** HEAD-OFFICE — งานถัดไปหลัง sign-off อยู่ใน Taskmaster Phase 6 (T78+)
