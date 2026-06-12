# MILESTONES — LINE OA HR & Payroll Platform

**อัปเดต:** 2026-06-11  
**Production:** https://hr-app-two-iota.vercel.app  
**Release:** `hr-payroll-v1.0` (batch T77–T108) → **next:** `hr-payroll-v1.1` (M38)  
**Taskmaster:** T01–T108 closed · **T109–T114 planned** (M38)

---

## สรุปภาพรวม

| ช่วง | Milestones | Tasks | สถานะ |
|------|------------|-------|--------|
| **Phase 1–4** | M1–M20 | T01–T75 | ✅ CLOSED |
| **Phase 5 MVP** | M21–M28 | T76–T77 + ad-hoc | ✅ CLOSED |
| **Phase 5–11 Close-out** | M29–M37 | T78–T108 | ✅ CLOSED — tag `hr-payroll-v1.0` |
| **Post-v1.0 patches** | — | ad-hoc | ✅ deployed — register gate + OT 2-tier |
| **Phase 12 Go-Live** | **M38** | **T109–T114** | 🔜 **ถัดไป** |
| **Phase 9 Payroll (Baht)** | M39 | T115–T120 | 🔒 ต้อง signed CR |
| **Portal v2 (optional)** | M40 | T121–T124 | 🔒 ลูกค้าเลือก (ขัด LINE-only ปัจจุบัน) |
| **Workforce lite (optional)** | M41 | T125–T128 | 🔒 optional |
| **De-scope cleanup** | M42 | T129 | 🔒 ถ้ายืนยัน LINE-only ถาวร |

**แผนเต็ม Phase 12:** `orchestration/PHASE_12_PLAN.md`

---

## ✅ สิ่งที่ปิดแล้ว

| Phase | Milestones | Tasks | หมายเหตุ |
|-------|------------|-------|----------|
| Phase 1 | M1–M6 | T01–T30 | LINE core, dashboard, leave, alerts |
| Phase 2 | M7–M10 | T31–T45 | เอกสาร, ร้องเรียน, ประกาศ |
| Phase 3 | M11–M15 | T46–T60 | OT (v1), reports, org |
| Phase 4 | M16–M20 | T61–T75 | pg_cron, lifecycle |
| Phase 5 | M21–M28 | T76–T77 | สาขา, BM, CEO, 2-tier, payroll ชม. |
| Close-out | M29–M37 | T78–T108 | register, portal, E2E, delivery audit |
| **Post-v1.0** | — | commits `fd5607b`, `8fd4610` | HR approve register + OT employee→BM→HR |

**Handoff:** `hr-app/reports/CLIENT_HANDOFF_P5.md` · `CLIENT_HANDOFF_FINAL.md`

---

## 🔜 Phase 12 — Post-v1.0 Go-Live — M38 (~1–2 สัปดาห์)

**Goal:** ปิด delivery หลัง business rule change + client sign-off → tag `hr-payroll-v1.1`

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T109** | Docs reconciliation (OT, register, portal policy) | Cursor | handoff + MILESTONES + delivery audit |
| **T110** | E2E registration approval + OT 2-tier | Claude Code | `flow-registration-approval.mjs`, `flow-overtime-two-tier.mjs` |
| **T111** | Security review P7 | Claude Opus | `SECURITY_REVIEW_P7.md` |
| **T112** | Client UAT fix batch | Claude Code | fixes จาก checklist |
| **T113** | Ops — cron OT expiry, Vault, key rotation | Claude Code | `OPS_RUNBOOK_P12.md` |
| **T114** | Sign-off + tag `hr-payroll-v1.1` | Cursor | checklist signed, git tag |

**Acceptance:** ลูกค้า sign-off §10 ครบ; E2E pass; security ไม่มี critical; docs ไม่ขัดกัน

---

## 🔒 Phase 9 Payroll Baht — M39 (~4–6 สัปดาห์)

**Goal:** สลิปเงินเดือน / คำนวณบาท — **ต้อง signed CR ก่อน kickoff**

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T115** | Schema — payslips, payroll runs | Claude Code | migration + RLS |
| **T116** | Payroll engine — ชม. → บาท | Claude Code | engine + tests |
| **T117** | HR Payroll run UI | Codex | `/admin/payroll/runs` |
| **T118** | Payslip PDF/HTML | Claude Code | template + storage |
| **T119** | Employee ดูสลิป (LIFF) | Codex | LIFF payslip |
| **T120** | Payroll security audit | Claude Opus | `SECURITY_REVIEW_PAYROLL.md` |

*(เดิม T96–T101 — renumbered หลัง M38)*

---

## 🔒 Optional Forks (หลัง M38)

### M40 — Employee Web Portal v2

เปิด `/portal` ให้พนักงานจริง (ปัจจุบัน **LINE-only**, portal = dev เท่านั้น)

| ID | Task |
|----|------|
| T121 | Client decision + UX spec |
| T122 | Enable portal auth สำหรับ `employee` |
| T123 | Widget data + LIFF deep links |
| T124 | Mobile QA + handoff update |

### M41 — Workforce lite (real modules)

| ID | Task |
|----|------|
| T125 | Schedule / Shifts |
| T126 | Recruitment lite |
| T127 | Training lite |
| T128 | Performance lite |

### M42 — De-scope cleanup

| ID | Task |
|----|------|
| T129 | ลบ portal stub / nav ที่ไม่ใช้ + อัปเดต handoff "LINE-only permanent" |

---

## Business Rules ปัจจุบัน (production)

```
Onboarding:  LINE register → inactive → HR approve → active → LIFF/Rich Menu
Leave:       Employee → pending_manager → pending_hr → approved
Attendance:  Employee → pending_manager → (BM/HR ตาม flow) → approved
OT:          Employee → pending_manager → pending_hr → approved
Worker web:  LINE/LIFF only — ไม่มี Dashboard (ยกเว้น dev role)
Payroll:     รายงานชั่วโมงเท่านั้น — ไม่มีบาท (รอ M39)
```

---

## นิยาม "จบ Project" (อัปเดต)

| ระดับ | ครอบคลุม | สถานะ |
|-------|----------|--------|
| **v1.0** | T01–T108 batch | ✅ tag `hr-payroll-v1.0` |
| **v1.1 Stable** | M38 sign-off | 🔜 T109–T114 |
| **v2.0 Payroll** | M39 | 🔒 CR |
| **v2.x Portal** | M40 | 🔒 optional |
| **Full** | M39 + M41 | 🔒 optional |

---

## สิ่งที่ Out of Scope (ทุก Phase)

- Multi-company (multi-branch ✅)
- Native mobile app
- Accounting integration (SAP, SAGE)
- Advanced BI / data warehouse
- Full ATS / LMS / Performance 360

---

## ไฟล์อ้างอิง

| เนื้อหา | Path |
|---------|------|
| **Phase 12 แผนถัดไป** | `orchestration/PHASE_12_PLAN.md` |
| Handoff | `hr-app/reports/CLIENT_HANDOFF_P5.md` |
| Active task | `orchestration/CURRENT_TASK.md` |
| PRD | `docs/PRD.md` |

---

*อัปเดตโดย Cursor Orchestrator — 2026-06-11*
