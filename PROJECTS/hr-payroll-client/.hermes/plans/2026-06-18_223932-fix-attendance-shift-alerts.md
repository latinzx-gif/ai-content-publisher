# Fix Attendance Shift Alerts Plan

**Goal:** ทำให้ระบบเตือน/รายงาน attendance รายกะทำงานจริงใน production โดยเฉพาะ Branch Day 10:00–22:00 และกะอื่นๆ พร้อมยืนยันได้ว่า HR group ได้รับสรุปจำนวนเข้างาน/มาสาย/ขาด/ลา

**Current Context / Evidence:**
- Code มี `shift-attendance-summary` edge function แล้ว: `hr-app/supabase/functions/shift-attendance-summary/index.ts`
- Function deploy แล้วใน Supabase project `oouswalwqhojpzqwwdvs`
- Migration สำหรับ cron มีแล้ว:
  - `hr-app/supabase/migrations/20260618170000_shift_attendance_summary_cron.sql`
  - `hr-app/supabase/migrations/20260719120000_shift_attendance_summary_cron.sql`
- Production `cron.job` ยังไม่พบ job `shift-attendance-summary`
- Production `net._http_response` ล่าสุดเป็น `401 Invalid credentials` สำหรับ cron-triggered functions
- `evening-summary` มี cron 18:00 ICT แล้ว แต่เป็นสรุปรวมทั้งวัน ไม่ใช่รายกะ
- `morning-push` cron ถูกตั้งเป็น `*/15 * * * *` และ function ภายในตัดสินใจเองว่าถึงเวลาส่งหรือไม่

**Non-goals / Forbidden:**
- ไม่แตะ payroll baht / salary slip
- ไม่เปลี่ยน LINE OA rich menu
- ไม่เปลี่ยน UI layout ถ้าไม่ได้ขอ
- ไม่ hard delete ข้อมูล
- ไม่ commit / deploy โดยไม่ขออนุมัติ
- ไม่ส่ง LINE จริงระหว่างทดสอบถ้ายังไม่ได้แยก dry-run หรือยืนยันผลกระทบ

---

## Proposed Approach

แก้เป็น 2 ชั้น:

1. **Auth + Cron infrastructure** — ทำให้ pg_cron เรียก Edge Functions ได้จริง ไม่ใช่ได้แค่ enqueue แล้วจบที่ 401
2. **Business behavior verification** — ตรวจว่า `shift-attendance-summary` ส่งสรุปตามกะจริง โดยเฉพาะ Branch Day 10:00–22:00 และกะอื่นๆ

แนวทางแก้หลักที่ปลอดภัย:
- ตรวจ `verify_jwt` ของ functions ที่ cron เรียก
- ปรับ header ที่ pg_net ส่งให้ถูกกับ `withSupabase({ auth: ["secret"] })`
- ตั้ง cron `shift-attendance-summary` กลับเข้า production
- เพิ่ม/ใช้ dry-run path ถ้าจำเป็น เพื่อ test โดยไม่ push LINE จริง
- ตรวจ `net._http_response.status_code = 200`
- ตรวจ cron history + output payload

---

## Step-by-step Plan

### Task 1 — Audit current production cron/auth state (read-only)

**Objective:** ยืนยันสภาพจริงก่อนแก้ เพื่อไม่แก้ผิดจุด

**Files touched:** none

**Commands:**
```bash
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app
npx supabase db query --linked -o json "
select jobid, jobname, schedule, active,
  case
    when command like '%shift-attendance-summary%' then 'shift-attendance-summary'
    when command like '%morning-push%' then 'morning-push'
    when command like '%evening-summary%' then 'evening-summary'
    else left(command, 100)
  end as target
from cron.job
order by jobid;
"
```

```bash
npx supabase db query --linked -o json "
select status_code, count(*)
from net._http_response
where created > now() - interval '2 hours'
group by status_code
order by status_code;
"
```

**Expected before fix:**
- ไม่มี `shift-attendance-summary` ใน `cron.job`
- พบ `401` ใน `net._http_response`

**Deliverable:** short audit note with VERIFIED / NOT VERIFIED / UNKNOWN

---

### Task 2 — Inspect Edge Function auth configuration

**Objective:** ระบุว่า 401 มาจาก header mismatch หรือ verify_jwt mismatch

**Files likely involved:**
- `hr-app/supabase/functions/shift-attendance-summary/index.ts`
- `hr-app/supabase/functions/evening-summary/index.ts`
- `hr-app/supabase/functions/morning-push/index.ts`
- `hr-app/supabase/config.toml`
- migrations that create cron jobs

**Checks:**
```bash
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app
npx supabase functions list --project-ref oouswalwqhojpzqwwdvs --output json
```

Verify:
- `shift-attendance-summary` is ACTIVE
- `verify_jwt` value
- `evening-summary` verify_jwt value
- `morning-push` verify_jwt value

**Likely issue found:**
- Cron sends header `apiKey`
- Some deployed functions show `verify_jwt: true`
- `withSupabase({ auth: ["secret"] })` expects supported secret auth path; existing cron may not match deployed function auth/JWT requirement

**Decision point:** choose one fix path:
- Option A: deploy functions with `verify_jwt=false` and keep `apiKey` secret auth handled by function wrapper
- Option B: change cron headers to include `Authorization: Bearer <secret>` plus `apikey`

**Preferred:** Option B if compatible with Supabase Edge expectations, because it is explicit and works with JWT gateway checks.

---

### Task 3 — Prepare minimal SQL patch for cron headers + missing job

**Objective:** Create a single idempotent migration/SQL patch that:
1. unschedules stale `shift-attendance-summary` if exists
2. schedules it every 15 minutes Mon–Fri
3. uses correct auth headers
4. does not affect unrelated jobs

**Files likely to create/modify:**
- Create new migration only, e.g.
  `hr-app/supabase/migrations/YYYYMMDDHHMMSS_fix_shift_attendance_summary_cron_auth.sql`

**SQL pattern:**
- `create extension if not exists pg_cron;`
- `create extension if not exists pg_net;`
- read Vault secrets `project_url`, `secret_key`
- `cron.unschedule('shift-attendance-summary')` if exists
- `cron.schedule('shift-attendance-summary', '*/15 * * * 1-5', ...)`
- `net.http_post` to `/functions/v1/shift-attendance-summary`
- headers should include:
  - `Content-Type: application/json`
  - `apikey: v_key`
  - `Authorization: 'Bearer ' || v_key`

**Important:** Do not apply to production yet until user approves, because it changes production cron behavior.

---

### Task 4 — Review `shift-attendance-summary` business behavior

**Objective:** Confirm message content matches requirement: Branch Day 10:00–22:00 and other shifts show checked-in + late + absent + leave

**File:**
- `hr-app/supabase/functions/shift-attendance-summary/index.ts`

**Current expected behavior:**
- Runs only weekdays
- Builds roster for today
- Finds groups where `now` is within 15 minutes after `graceAt`
- Sends one HR message per due shift
- Message includes:
  - shift name + time range
  - checked-in count / total
  - late list + count
  - absent list + count
  - leave list + count
- Dedupes by `hr_runtime_config.shift_summary_last_push_<shift_id>_<today>`

**Acceptance criteria:**
- Branch Day 10:00–22:00 with 10-minute grace sends around 10:10–10:25 ICT when cron runs every 15 minutes
- Office 11:00–20:00 sends around 11:10–11:25 ICT
- Branch Night 14:00–02:00 sends around 14:10–14:25 ICT
- Duplicate cron runs same day do not resend same shift

**Risk to verify:**
- If cron only Mon–Fri, weekend Branch Day will not send even if employees work weekends
- Current code skips weekends entirely with `ictWeekday(now)` check

**Decision point for user:**
- ถ้าสาขาทำงานเสาร์-อาทิตย์ ต้องเปลี่ยน schedule จาก `1-5` เป็นทุกวัน และเอา weekend skip ออก/ทำตาม config วันทำงาน

---

### Task 5 — Add dry-run/manual verification path if needed

**Objective:** ทดสอบ function โดยไม่ส่ง LINE จริง

**Possible minimal approach:**
- Add request JSON support: `{ "dryRun": true, "now": "..." }`
- When dry-run, return message payloads instead of calling LINE API
- Keep production cron sending `{}` unchanged

**Files likely to modify:**
- `hr-app/supabase/functions/shift-attendance-summary/index.ts`
- Add/adjust Deno test if existing test harness supports it

**Acceptance:**
- Manual invoke with dry-run returns JSON containing due shift summaries
- No LINE API call made during dry-run

**Note:** This is optional but recommended before enabling production cron, to avoid spamming HR group during tests.

---

### Task 6 — Apply production SQL only after approval

**Objective:** Enable real production cron after review

**Precondition:** User approval required because this changes production scheduled automation.

**Command options:**
```bash
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app
npx supabase db push
```

or apply only the reviewed SQL via:
```bash
npx supabase db query --linked --file supabase/migrations/<new_migration>.sql
```

**Expected:**
- `shift-attendance-summary` appears in `cron.job`
- `active = true`
- schedule = `*/15 * * * 1-5` or agreed schedule

---

### Task 7 — Verify production after enabling

**Objective:** Prove cron is not just scheduled but actually accepted by Edge Function

**Commands:**
```bash
npx supabase db query --linked -o json "
select jobid, jobname, schedule, active
from cron.job
where jobname = 'shift-attendance-summary';
"
```

```bash
npx supabase db query --linked -o json "
select status_code, left(content, 500) as content, created
from net._http_response
where created > now() - interval '30 minutes'
order by created desc
limit 20;
"
```

**Acceptance:**
- `shift-attendance-summary` job exists and active
- related http response status is 200 or expected non-401 skip response
- no `Invalid credentials`

---

### Task 8 — Verify report counts by shift

**Objective:** Confirm branch day and other shifts count correctly

**Read-only SQL:**
```sql
with params as (
  select (now() at time zone 'Asia/Bangkok')::date as ict_date
), active as (
  select e.id, e.work_shift_id
  from public.hr_employees e
  where e.status='active'
), att as (
  select
    a.employee_id,
    a.work_shift_id,
    a.check_in_at,
    a.is_late,
    coalesce(a.shift_date, (a.check_in_at at time zone 'Asia/Bangkok')::date) as work_date
  from public.hr_attendance a, params p
  where coalesce(a.shift_date, (a.check_in_at at time zone 'Asia/Bangkok')::date)=p.ict_date
)
select
  s.code,
  s.name,
  lpad(s.start_hour::text,2,'0')||':'||lpad(s.start_minute::text,2,'0')||'–'||lpad(s.end_hour::text,2,'0')||':'||lpad(s.end_minute::text,2,'0') as time_range,
  count(distinct active.id) as assigned_active,
  count(distinct att.employee_id) as checked_in,
  count(distinct att.employee_id) filter (where att.is_late) as late
from public.hr_work_shifts s
left join active on active.work_shift_id=s.id
left join att on att.employee_id=active.id
group by s.id
order by s.start_hour, s.start_minute, s.name;
```

**Acceptance:**
- Branch Day 10:00–22:00 has visible counts
- Office and Branch Night have counts
- Numbers match `/admin/attendance` roster totals for same date

---

## Files Likely to Change

Minimum path:
- Create: `hr-app/supabase/migrations/YYYYMMDDHHMMSS_fix_shift_attendance_summary_cron_auth.sql`

Possible if dry-run/test is approved:
- Modify: `hr-app/supabase/functions/shift-attendance-summary/index.ts`
- Possibly modify/deploy function config if verify_jwt mismatch is confirmed

Docs update after fix:
- Modify: `hr-app/docs/CRON_RUNBOOK.md`

---

## Validation Gates

Run before any commit:
```bash
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app
npm run build
npm run typecheck
npm run lint
```

If only SQL migration changes, still run at least:
```bash
npx supabase db lint
```
if available locally; otherwise document why unavailable.

Production verification:
- `cron.job` has `shift-attendance-summary`
- `net._http_response` no longer returns 401 for this function
- Function response returns expected JSON / skip reason
- If live sending is enabled: HR group receives one summary per due shift, no duplicates

---

## Risks / Tradeoffs

1. **LINE spam risk**
   - Mitigation: dry-run/manual invoke first, use dedupe, test outside due windows carefully

2. **Weekend branch work**
   - Current function skips Sat/Sun; if branches work daily, current behavior is incomplete
   - Need user decision: Mon–Fri only or every day?

3. **Auth mismatch across functions**
   - Fixing only shift summary may leave `morning-push` / `evening-summary` still 401
   - Recommended follow-up: apply same auth header fix to all cron-triggered edge functions

4. **Migration state mismatch**
   - Existing migration says job should exist but live job is missing
   - New idempotent repair migration is safer than editing old migration

---

## Recommendation

ทำเป็น 2 PR/commit แยก:

1. **fix: repair shift attendance summary cron auth**
   - new migration only
   - docs update
   - production verification

2. **chore: normalize cron auth for all edge jobs**
   - morning-push / evening-summary / weekly / monthly / announcement if needed
   - optional dry-run improvements

ลำดับนี้ลดความเสี่ยง และแก้ requirement หลักก่อน: รายงานสรุป Branch Day 10:00–22:00 และกะอื่นๆ
