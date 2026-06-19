# Paid Hours + LINE/LIFF Checkout Copy + Office/Branch Shift Plan

Goal: ปรับการคำนวณและข้อความหลังเลิกงานให้ตรง policy ล่าสุด:
1. LINE/LIFF แจ้งแค่ “บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว”
2. ไม่แจ้งชั่วโมงเกิน / ไม่แจ้งว่าเกินมาตรฐานเท่าไหร่
3. พนักงาน hourly สาขา คิดชั่วโมงจ่ายจริงเฉพาะในกรอบกะ
4. Office 11:00–20:00 เป็นเงินเดือน ไม่ต้องแจ้งชั่วโมงใน LINE/LIFF
5. Branch Night ต้องเป็น 14:00–02:00 และรองรับข้ามวันถูกต้อง

## Current findings

- `src/lib/attendance/check-out.ts` ตอนนี้คำนวณ `work_hours` จากเวลาจริง check-in → check-out ทั้งหมด
- `src/lib/line/flex/checkout.ts` ตอนนี้มี footer `line.checkout.footerOt` ถ้า overtimeMinutes > 0
- `src/lib/i18n/messages.ts` มีข้อความ “เกินเวลามาตรฐาน {duration} — หากต้องการขอ OT ให้ใช้เมนูขอ OT”
- `FINAL_CLEAN_START.sql` มี Branch Night แล้ว: `BRANCH_NIGHT`, `14:00–02:00`, `crosses_midnight = true`
- แต่ `standard_hours` ของ Branch Day / Branch Night ใน seed เป็น `10.00`; ตาม policy ล่าสุด ไม่ควรใช้ค่านี้เป็น cap ในรอบนี้ ให้คิดจากช่วงเวลา start/end จริงก่อน

## Business policy to implement

### A. Hourly branch employees — Branch Day และ Branch Night

Branch Day และ Branch Night ใช้ rule เดียวกัน และต้องแจ้ง/แสดงชั่วโมงทำงานที่จ่ายจริงเหมือนกัน

Regular paid hours = overlap ระหว่าง:
- actual interval: `[check_in_at, check_out_at]`
- shift interval: `[shift_start, shift_end]`

Rules:
- เข้าเร็วกว่า shift_start → ไม่คิดเพิ่ม
- ออกช้ากว่า shift_end → ไม่คิดเพิ่ม
- ออกก่อนเวลา → คิดถึงเวลาออกจริง
- เข้าสาย → คิดจากเวลาเข้าจริง
- OT ไม่เกิดจาก checkout หลังเวลาอัตโนมัติ ต้องใช้ approved OT request เท่านั้น
- LINE/LIFF สำหรับ Branch Day และ Branch Night แสดง “รวมเวลา” เป็น paid hours ที่คำนวณได้จริงในกรอบกะ

Examples:
- Branch Day 10:00–22:00, actual 09:50–22:10 → paid/display 12.00 ชม.
- Branch Day 10:00–22:00, actual 10:55–22:05 → paid/display 11.08 ชม.
- Shift 11:00–22:00, actual 10:55–22:05 → paid/display 11.00 ชม.
- Branch Night 14:00–02:00, actual 13:50–02:10 → paid/display 12.00 ชม.
- Branch Night 14:00–02:00, actual 15:00–01:30 → paid/display 10.50 ชม.

### B. Office/monthly employees

- Shift display: Office 11:00–20:00
- pay_type = monthly
- LINE/LIFF checkout should NOT show “รวมเวลา X ชม.”
- Message should show only check-in/check-out status and footer:
  “บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว”
- Payroll monthly still uses salary; regular hourly ledger is not needed for salary calculation. To minimize risk, do not change monthly payroll formula in this task.

### C. LINE/LIFF checkout copy

Exact Thai copy:
“บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว”

Do not show:
- “เกินเวลามาตรฐาน ...”
- “หากต้องการขอ OT ...”
- OT duration from checkout

For hourly branch employees, if showing total is still useful, row can show paid hours only. But requested copy implies keep the footer simple. Recommended:
- Hourly branch: show row “รวมเวลา” = paid hours
- Office/monthly: hide row “รวมเวลา” entirely
- Footer always = “บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว”

## Proposed implementation

### Task 1 — Add paid time helper

Create:
- `hr-app/src/lib/attendance/paid-work-time.ts`
- `hr-app/src/lib/attendance/paid-work-time.test.ts`

Helper API draft:

```ts
export type PaidWorkShiftWindow = {
  start_hour: number
  start_minute: number
  end_hour: number
  end_minute: number
  crosses_midnight: boolean
}

export function computePaidWorkMinutes(input: {
  workDate: string
  checkInAt: Date
  checkOutAt: Date
  shift: PaidWorkShiftWindow | null
  defaultCheckInTime?: string | null
  defaultCheckOutTime?: string | null
}): {
  rawMinutes: number
  paidMinutes: number
  paidHours: number
  hasPayWindow: boolean
}
```

Rules:
- If shift exists, build schedule window from `workDate + shift start/end`
- If `crosses_midnight = true`, end is next day
- If no shift but employee has both default_check_in_time/default_check_out_time, use those as window
- If no window, fallback to raw minutes so unassigned employees are not broken
- `paidMinutes = max(0, min(actualOut, windowEnd) - max(actualIn, windowStart))`
- `paidHours = round((paidMinutes / 60) * 100) / 100`

Tests:
1. Branch Day 10:00–22:00, actual 09:50–22:10 → 720 min / 12.00
2. Branch Day 10:00–22:00, actual 10:55–22:05 → 665 min / 11.08
3. 11:00–22:00, actual 10:55–22:05 → 660 min / 11.00
4. Branch Night 14:00–02:00, actual 13:50–02:10 → 720 min / 12.00
5. Branch Night 14:00–02:00, actual 15:00–01:30 → 630 min / 10.50
6. No shift/default → fallback raw duration

### Task 2 — Normal LINE checkout uses paid hours

Modify:
- `hr-app/src/lib/attendance/check-out.ts`

Changes:
- Load employee fields:
  - `pay_type`
  - `work_shift_id`
  - `default_check_in_time`
  - `default_check_out_time`
  - `branch_id`
- Load active `hr_work_shifts` if employee has work_shift_id:
  - start_hour/start_minute/end_hour/end_minute/crosses_midnight
- Replace current raw `workHours` calculation with helper result
- Store `work_hours = paidHours` in `hr_attendance`
- Call `finalizeAttendanceRecord(... workHours: paidHours)`
- Return `workMinutes = paidMinutes` for hourly display
- Add result flag/type, e.g. `showWorkDuration: employee.pay_type !== "monthly"`
- Remove or set `overtimeMinutes = 0`

Important:
- Do not change approved OT flow (`overtime-decide.ts`)
- Do not use `standard_hours` as cap in this task

### Task 3 — Manual LIFF attendance uses same paid hours

Modify:
- `hr-app/src/lib/attendance/manual.ts`
- `hr-app/src/app/api/attendance/manual/route.ts` only if response copy needs to be simplified

Changes:
- Load `pay_type`, `default_check_out_time` with employee row
- Use paid helper for `finalWorkHours`
- `finalizeAttendanceRecord` receives paid hours
- API success message can remain simple, or standardize to:
  “บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว” when checkout/full completed

### Task 4 — HR manual attendance uses same helper when workHours is blank

Modify:
- `hr-app/src/lib/attendance/hr-manage.ts`

Rules:
- If HR manually enters `workHours`, keep HR override
- If `workHours` blank and check_out exists, compute paid hours by helper
- Include cross-midnight shift support

### Task 5 — Update checkout Flex message

Modify:
- `hr-app/src/lib/line/flex/checkout.ts`
- `hr-app/src/lib/line/handlers/message.ts`
- `hr-app/src/lib/i18n/messages.ts`
- other locale files: `en-employee.ts`, `zh-employee.ts`, `my-employee.ts` if present/required

UI behavior:
- `checkoutSummaryFlex` accepts `showWorkDuration?: boolean`
- For Branch Day / Branch Night / hourly branch employees: render the “รวมเวลา” row using paid hours only
- For Office/monthly employees: do not render the “รวมเวลา” row
- Footer always uses `line.checkout.footer`
- Set Thai `line.checkout.footer` to exactly:
  “บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว”
- Stop using `line.checkout.footerOt`

Result:
- Office/monthly: no hours shown, footer only
- Branch Day/hourly: paid hours shown, no over-time warning
- Branch Night/hourly: paid hours shown exactly the same pattern as Branch Day, no over-time warning

### Task 6 — Confirm Branch Night seed/runtime data

Files to inspect/update if needed:
- migrations containing `hr_work_shifts`
- any seed/data insert scripts

Expected Branch Night:
- code: `BRANCH_NIGHT`
- name: `Branch Night 14:00–02:00`
- start_hour: 14
- start_minute: 0
- end_hour: 2
- end_minute: 0
- crosses_midnight: true

If production DB has old/incorrect Branch Night, prepare separate SQL migration/update, but do not run production DB write without approval.

Potential migration file:
- `hr-app/supabase/migrations/YYYYMMDDHHMMSS_fix_branch_night_shift.sql`

SQL draft:
```sql
update public.hr_work_shifts
set
  name = 'Branch Night 14:00–02:00',
  start_hour = 14,
  start_minute = 0,
  end_hour = 2,
  end_minute = 0,
  crosses_midnight = true,
  updated_at = now()
where code = 'BRANCH_NIGHT';
```

Note: `standard_hours` decision should be separate. If policy says Branch Night 14:00–02:00 = 12 ชม., standard_hours should become 12.00 later, but helper will calculate from start/end regardless.

## Acceptance criteria

1. Branch Day 10:00–22:00
   - actual 09:50–22:10 → payroll regular 12.00
   - actual 10:55–22:05 → payroll regular 11.08

2. Branch Night 14:00–02:00
   - actual 13:50–02:10 → payroll regular 12.00
   - actual 15:00–01:30 → payroll regular 10.50

3. Office 11:00–20:00 / monthly
   - LINE/LIFF checkout does not show “รวมเวลา X ชม.”
   - Footer says exactly “บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว”

4. LINE checkout no longer shows:
   - “เกินเวลามาตรฐาน ...”
   - “หากต้องการขอ OT ...”

5. Approved OT request still creates overtime ledger as before.

6. No production DB mutation without explicit approval.

## Verification commands

Run from `hr-app`:

```bash
npm run typecheck
npm run build
```

Targeted tests depending on project test runner:
```bash
node --test src/lib/attendance/paid-work-time.test.ts
node --test src/lib/attendance/late.test.ts
node --test src/lib/attendance/retro-limit.test.ts
```

If TS node tests require project-specific runner, use existing package scripts or project-local binaries instead of pnpm if Node/pnpm mismatch appears.

## Execution recommendation

Use agy per user preference for code edits:

```bash
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app
~/.local/bin/agy --prompt --dangerously-skip-permissions < /tmp/paid-hours-line-liff-office-branch-night.md
```

Do not commit/push until:
- typecheck passes
- build passes
- git diff reviewed
- user approves commit/push
