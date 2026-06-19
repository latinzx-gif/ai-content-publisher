# CURRENT TASK: HR-UI-BATCH-001 — Employees List + Attendance Roster UI

## Phase

EXECUTE (plan approved 2026-06-18)

## Status

**Updated** — 2026-06-18 (user requests batched)  
**Agent:** Codex (GPT-5.5)  
**Orchestrator:** Cursor only — no source edits

**App root:** `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app/`

---

## Task A — EMP-LIST-TIME-001 (ทำก่อน — เล็ก)

**URL:** https://hr-app-two-iota.vercel.app/admin/employees

**Request:** หน้ารายชื่อพนักงาน แสดง **เวลาเข้า-ออกงาน**

### Spec

- เพิ่มคอลัมน์ **เวลาเข้า-ออก** ใน `EmployeeTable` (หลังสาขาหรือตำแหน่ง — เลือกตำแหน่งที่อ่านง่าย)
- แสดงรูปแบบ: `09:00 – 18:00` (ICT, tabular-nums)
- แหล่งข้อมูล (ลำดับ fallback):
  1. `hr_employees.default_check_in_time` + `default_check_out_time` (normalize HH:MM — ใช้ `normalizeTimeToHHMM`)
  2. ถ้าว่าง → เวลาจาก `hr_work_shifts` ที่ `work_shift_id` ชี้ (embed หรือ join — ใช้ `formatShiftTimeRange`)
  3. ถ้ายังว่าง → `—`

### Files

```
hr-app/src/features/employees/data.ts          — select fields + EmployeeRow type
hr-app/src/features/employees/EmployeeTable.tsx — column header + cell
```

### Acceptance

- [ ] `/admin/employees` แสดงเวลาเข้า-ออกทุกแถวที่มีข้อมูล
- [ ] ไม่เพิ่ม query N+1 (embed shift ใน select เดียว)

---

## Task B — ATT-ROSTER-UI-001

**URL:** https://hr-app-two-iota.vercel.app/admin/attendance (tab วันนี้)

1. รหัสพนักงานข้างชื่อ
2. Card เล็กลง สำหรับ มาสาย / ขาด / ลา / วันหยุด
3. Card แสดง: ชื่อ · รหัส · ตำแหน่ง · สาขา · เวลาเข้า-ออก + badge สถานะ

### Data

- `DailyRosterEmployee`: เพิ่ม `employeeCode`, `position`
- `getDailyRoster` select `employee_code, position`
- Sync `_shared/daily-roster.ts` + tests

### UI (`AttendanceTodayRoster.tsx`)

Compact card สำหรับ `late | absent | on_leave | off`:

```
[มาสาย]
สมชาย ใจดี (EMP-042)
พนักงานขาย • สาขาเชียงใหม่
เข้า 09:18 • ออก 18:02
```

### Acceptance

- [ ] Roster แสดงรหัส + compact cards ตาม spec
- [ ] KPI / badge มาสาย ขาด ลา วันหยุด

---

## Task C — EMP-OFF-DAYS-001 (optional same PR)

- Migration `off_days smallint[]` on `hr_employees`
- Profile checkbox วันหยุด จ–อา (เหมือน `MorningPushSettingsPanel`)
- Roster status `off` + morning-push skip

ถ้า scope บวม → ทำ A+B ก่อน, C แยก PR ได้

---

## Allowed files

```
hr-app/src/features/employees/data.ts
hr-app/src/features/employees/EmployeeTable.tsx
hr-app/src/lib/attendance/daily-roster.ts
hr-app/src/lib/attendance/daily-roster.test.ts
hr-app/supabase/functions/_shared/daily-roster.ts
hr-app/src/features/attendance/AttendanceTodayRoster.tsx
hr-app/supabase/migrations/*employee_off_days*.sql
hr-app/src/lib/employees/off-days.ts
hr-app/src/lib/employees/off-days.test.ts
hr-app/src/features/employees/profile/data.ts
hr-app/src/features/employees/profile/EmployeeProfileForm.tsx
hr-app/src/features/employees/employee-form-payload.ts
hr-app/src/app/api/employees/[id]/route.ts
hr-app/supabase/functions/morning-push/index.ts
hr-app/_agent/**
```

## Forbidden

- Payroll / inventory / FEFO / LIFF / history attendance tab
- deploy / commit (orchestrator after review)

---

## Skills to Load

- `03-claude-plan`
- `05-claude-execute`
- `12-supabase-migration` (ถ้าทำ Task C)

## Recommended Model

Codex GPT-5.5

## Verify

`npm run build && npm run typecheck && npm run lint`
