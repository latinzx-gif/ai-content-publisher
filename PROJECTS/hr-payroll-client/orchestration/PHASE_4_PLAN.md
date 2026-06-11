# Phase 4 Plan — Production Excellence & PRD Polish

**Status:** ⏳ **PENDING REVIEW** — T61–T75 complete 2026-06-10  
**Date:** 2026-06-11  
**PRD ref:** `docs/PRD.md` § F1, F2, F5 (gaps) + production audit P3 follow-ups  
**Production base:** https://hr-app-two-iota.vercel.app  
**Depends on:** Phase 1–3 (T01–T60) ✅ CLOSED

---

## Goal

ปิด **ช่องว่าง production** และ **PRD ที่ยังไม่ครบ** ก่อน client handoff — โดยไม่ละเมิด GROUND_TRUTH §5:

| Priority | Theme | Why now |
|----------|-------|---------|
| P0 | **Production cron & LINE** | Edge functions deploy แล้วแต่ยังไม่มี pg_cron; LINE group HR ยังต้อง config manual |
| P1 | **F1 Dashboard polish** | กราฟรายเดือน, leave donut, widget ใช้ข้อมูลจริง (ลบ stub) |
| P2 | **Reports++** | CSV export + filter ช่วงเวลา (acceptance P3 ยังขาด) |
| P3 | **F5 Lifecycle** | บันทึกผลทดลองงาน, ต่อวีซ่า, แจ้งสัญญาใกล้หมด |
| P4 | **Nav cleanup + Payroll Hub** | หน้า comingSoon → hub ที่ใช้ได้ (ไม่คำนวณเงินเดือน) |
| P5 | **Hardening P4** | E2E remote, security, delivery audit |

**ยังห้าม (Phase 4):** payroll calculation, salary slip generation, multi-company, native app, accounting integration, advanced BI pipeline

---

## Milestones

### M16: Production Infrastructure — ~1 week

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T61 | pg_cron migration — schedule ทุก edge function (ICT) | Claude Code | `supabase/migrations/*_cron_schedules.sql` + runbook |
| T62 | Settings editable — `hr_runtime_config` (work hours, HR group id) | Claude Code | API + Settings UI |
| T63 | LINE production checklist + verify script | Cursor | `scripts/line-prod-check.mjs` + doc |

**Acceptance:** cron รันจริงบน remote; HR แก้ work start hour ผ่าน web ได้; script ตรวจ Rich Menu + webhook PASS

---

### M17: Dashboard PRD Polish (F1) — ~1.5 weeks

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T64 | กราฟเข้างานรายเดือน (30 วัน) บน dashboard | Codex | `AttendanceTrendBars` monthly mode |
| T65 | กราฟสัดส่วนประเภทลา (donut) จากข้อมูลจริง | Codex | widget ใช้ `leavesByStatus` |
| T66 | Dashboard widgets จริง — ประกาศล่าสุด, ลบ recruitment/ticket stub | Codex | `HrAdminDashboard` |

**Acceptance:** F1 กราฟ week + month + leave donut แสดงข้อมูล DB; ไม่มี mock recruitment counts

---

### M18: Reports & Payroll Hub — ~1 week

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T67 | Reports CSV export — attendance / leave / OT | Codex | `/api/reports/export` |
| T68 | Reports date range + department filter | Codex | reports UI |
| T69 | `/admin/payroll` Payroll Hub — ลิงก์ขอสลิปผ่าน F7 + salary read-only (no calc) | Codex | แทน AdminComingSoon |

**Acceptance:** HR ดาวน์โหลด CSV ได้; filter 30/60/90 วัน; payroll page ไม่คำนวณเงินเดือน

---

### M19: Employee Lifecycle (F5 completion) — ~1.5 weeks

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T70 | Probation outcome — pass / fail / extend บน employee profile | Claude Code | migration + UI |
| T71 | Visa / work permit renewal — อัปเดตวันหมด + note | Claude Code | profile form + history |
| T72 | Contract expiry alert cron (สัญญาใกล้สิ้นสุด) | Claude Code | edge fn `contract-alert` |

**Acceptance:** HR บันทึกผลทดลองงาน; อัปเดตวีซ่าแล้ว alert หยุด; cron แจ้งสัญญาใกล้หมด

---

### M20: Phase 4 Hardening — ~1 week

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T73 | Remote E2E harness + `run-all-p4.mjs` regression | Claude Code | scripts + report |
| T74 | Security review P4 | Claude Code Opus | `SECURITY_REVIEW_P4.md` |
| T75 | Delivery audit P4 + client handoff doc | Cursor | `DELIVERY_READINESS_AUDIT_P4.md` |

**Total Phase 4:** 15 tasks (T61–T75) / ~6 weeks

---

## Dependency Order

```
T61 → T63           (cron ก่อน LINE verify)
T62                 (ขนาน T61)
T64 → T65 → T66     (dashboard)
T67 → T68 → T69     (reports + payroll hub)
T70 → T71 → T72     (lifecycle)
T73 → T74 → T75     (hardening — หลัง feature freeze)
```

---

## First Task

**T61 — pg_cron schedules for all edge functions**  
Phase: **PLAN** → dispatch Claude Code skill `03-claude-plan`

Skills: Supabase skill, `12-supabase-migration`, `10-security-review`

---

## Out of scope → Phase 5+

- Performance / Recruitment / Training modules (full CRUD)
- Payroll calculation engine
- Multi-company

Nav items ที่ยัง `comingSoon` (Performance, Recruitment, Training) — Phase 4 อาจซ่อนจาก nav หรือแสดง "Coming in Phase 5" ตาม T69 pattern

---

## GROUND_TRUTH updates

- §3: Phase 4 → **IN PROGRESS** (M16–M20)
- §4: Active Task **T61**
- §7: เพิ่ม `orchestration/PHASE_4_PLAN.md`
