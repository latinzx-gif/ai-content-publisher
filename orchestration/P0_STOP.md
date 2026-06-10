# P0 STOP — ต้องการความช่วยเหลือจากคุณ

**Date:** 2026-06-10  
**Status:** ✅ **RESOLVED** (P0-VERIFY 2026-06-10) — migrations verified; schema OK

---

## Archive (resolved)

## สิ่งที่ Cursor ทำแล้ว (รอบนี้)

- เติม `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `NEXT_PUBLIC_SITE_URL=http://localhost:3001` ใน `head-office-app/.env.local`
- สร้าง `orchestration/.env.local` สำหรับ Linear sync
- ยืนยัน remote **ยังไม่มี** ตาราง `acp_posts` (HTTP 404 / PGRST205)

## Blocker #1 — Apply migrations (ต้องทำใน Supabase Dashboard)

โปรเจกต์: [ai-auto-tools (luxegqsccaodcikxhwrm)](https://supabase.com/dashboard/project/luxegqsccaodcikxhwrm)

1. เปิด **SQL Editor** → New query
2. วางและรัน **ทีละไฟล์** ตามลำดับ:
   - `head-office-app/supabase/migrations/20260609000001_acp_schema.sql`
   - `head-office-app/supabase/migrations/20260610000001_acp_rls_auth.sql`
3. ตรวจว่าได้ตาราง `acp_posts`, `acp_post_content`, `acp_audit_logs` ฯลฯ

**ทำไม Cursor ทำไม่ได้:** Supabase CLI ของเครื่องนี้ link ได้แค่ project inventory (`myqthxtxkmuwdtjjtzac`) ไม่มีสิทธิ์ `luxegqsccaodcikxhwrm` และไม่มี `DATABASE_URL` / DB password

## Blocker #2 — Auth redirect URL

ใน [Authentication → URL Configuration](https://supabase.com/dashboard/project/luxegqsccaodcikxhwrm/auth/url-configuration):

- **Site URL:** `http://localhost:3001`
- **Redirect URLs:** เพิ่ม `http://localhost:3001/publisher/auth/callback`

## Blocker #3 — Buffer (optional สำหรับ live publish)

เพิ่มใน `head-office-app/.env.local`:

```bash
BUFFER_ACCESS_TOKEN=<your-valid-buffer-token>
BUFFER_PROFILE_ID=<your-profile-id>   # optional — pinned if set
```

ถ้าไม่มี token — flow ถึง step publish จะ WARN/fail (ไม่บล็อก demo ส่วนอื่น)

---

## หลังคุณทำ Blocker #1 + #2 แล้ว

พิมพ์ **`next`** — Cursor จะ:

1. รัน verify script (`acp_posts` มีจริง)
2. Smoke test publisher บน `:3001` (12-step ถ้า login ได้)
3. อัปเดต `DEMO_READINESS_REPORT.md` → PASS ถ้าผ่าน
4. Post Linear update

## Verify เอง (optional)

```bash
cd ~/HEAD-OFFICE/head-office-app
npm run dev   # :3001
# เปิด http://localhost:3001/publisher/login
```
