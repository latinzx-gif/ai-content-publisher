# CURRENT TASK: ATT-ROSTER-001 — Attendance Roster + LINE Shift Summary

## Phase

REVIEW COMPLETE — 🟡 APPROVED WITH CAVEATS

## Status

**Review:** 2026-06-17 — test/build/typecheck pass; lint pre-existing FEFO blocker  
**Report:** `hr-app/_agent/archive/ATT-ROSTER-001/CURSOR_REVIEW_VERDICT.md`  
**Next:** db push migration → deploy edge → smoke → commit/deploy  
**Plan file:** `.cursor/plans/attendance_roster_+_line_ba810253.plan.md`  
**Agent:** Codex (GPT-5.5)  
**Orchestrator:** Cursor only — no source edits

**Previous:** PERF-ADMIN-001 — 🟡 APPROVED WITH CAVEATS (not yet deployed)

## Goal

HR เปิด `/admin/attendance` เห็น roster **วันนี้** (ใครมา/สาย/ขาด/ลา แยกกะ) + LINE HR Group ได้สรุปหลัง grace แต่ละกะ + EOD 18:00 พร้อมรายชื่อ

**App root:** `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app/`

**User choices:**
- LINE: push หลัง `start + grace` 1 ครั้ง/กะ/วัน + evening-summary 18:00 มีรายชื่อ
- Web: ทุกสาขา default, filter สาขา/แผนก/กะ

---

## Task breakdown (implement in order)

### Phase 1 — Shared roster engine
- `src/lib/attendance/daily-roster.ts` — `buildDailyRoster()`
- Reuse `deriveAttendanceDayStatus` from `day-status.ts`
- Bulk queries (employees, shifts, attendance today, leaves today)
- `supabase/functions/_shared/daily-roster.ts` — Deno copy for edge
- `daily-roster.test.ts` — minimal self-check

### Phase 2 — Web UI
- `page.tsx` — tabs `?view=today` (default) / `?view=history`
- `AttendanceTodayRoster.tsx` — KPI + accordion per shift + name lists
- `AttendanceTodayFilters.tsx` — date, branch, dept, shift (URL query)
- Tab ประวัติ = existing table/CSV unchanged

### Phase 3 — LINE shift summary edge
- `supabase/functions/shift-attendance-summary/index.ts`
- Cron `*/15 * * * 1-5`; due slot `[start+grace, start+grace+15min)`
- Dedupe via `hr_runtime_config` key `shift_summary_last_push_{shiftId}_{date}`
- Migration for pg_cron job

### Phase 4 — Extend evening-summary
- Add name lists (late/absent/on leave) + truncate if > ~3500 chars
- Keep existing aggregate numbers

### Phase 5 — Verify
- `npm run build && npm run typecheck && npm run lint`
- Update `docs/CRON_RUNBOOK.md`
- Note manual smoke steps in TASK_RESULT.md

---

## Allowed files

```
hr-app/src/lib/attendance/daily-roster.ts
hr-app/src/lib/attendance/daily-roster.test.ts
hr-app/src/features/attendance/AttendanceTodayRoster.tsx
hr-app/src/features/attendance/AttendanceTodayFilters.tsx
hr-app/src/features/attendance/data.ts
hr-app/src/app/admin/attendance/page.tsx
hr-app/supabase/functions/_shared/daily-roster.ts
hr-app/supabase/functions/shift-attendance-summary/**
hr-app/supabase/functions/evening-summary/index.ts
hr-app/supabase/migrations/*shift*summary*.sql
hr-app/docs/CRON_RUNBOOK.md
hr-app/_agent/**
```

Optional (only if needed for absent consistency):
```
hr-app/src/features/dashboard/data.ts
```

## Forbidden

- LIFF / LINE webhook / Rich Menu / morning-push behavior changes
- Payroll / inventory / FEFO
- `supabase db push` / Vercel deploy / git commit (orchestrator after review)
- Import `src/` from edge functions (use `_shared` copy only)

---

## Acceptance criteria

- [ ] `/admin/attendance` default tab วันนี้ — KPI + รายชื่อ สาย/ขาด/ลา
- [ ] Sections per `hr_work_shifts`; shows next shift snapshot
- [ ] Filters: branch / dept / shift on today tab
- [ ] History tab unchanged (log table, CSV, HR edit)
- [ ] `shift-attendance-summary` pushes LINE group once per shift/day after grace
- [ ] `evening-summary` 18:00 includes numbers + name lists
- [ ] build + typecheck + lint pass

---

## Skills to Load

- `05-claude-execute` (EXECUTE — plan pre-approved)
- `12-supabase-migration` (cron migration)

## Recommended Model

Codex GPT-5.5

## Prod (reference)

- Supabase: `oouswalwqhojpzqwwdvs`
- LINE group: `hr_line_group_id` in Settings / `HR_LINE_GROUP_ID`
- Shifts: Branch Day 10:00, Branch Manager 10:00, Office 11:00 (grace 10 min)
