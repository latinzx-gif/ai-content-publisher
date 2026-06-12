# MILESTONES — LINE OA HR & Payroll Platform

**อัปเดต:** 2026-06-10  
**Production:** https://hr-app-two-iota.vercel.app  
**Taskmaster ปัจจุบัน:** T01–T108 registered (**T78–T108** parsed 2026-06-10)

---

## สรุปภาพรวม

| ช่วง | Milestones | Tasks | สถานะ |
|------|------------|-------|--------|
| **Phase 1–4** | M1–M20 | T01–T75 | ✅ CLOSED |
| **Phase 5 MVP** | M21–M28 (logic) | T76–T77 + ad-hoc build | ⏳ T77 review — ฟีเจอร์หลัก built แล้ว |
| **Phase 5 Close-out** | M29 | T78–T80 | 🔜 ถัดไป |
| **Phase 6 — Onboarding** | M30 | T81–T83 | 📋 planned |
| **Phase 7 — Production Stable** | M31 | T84–T87 | 📋 planned |
| **Phase 8 — Employee Portal** | M32–M33 | T88–T95 | 📋 planned (mockup) |
| **Phase 9 — Payroll (Baht)** | M34–M35 | T96–T101 | 🔒 ต้อง approve scope |
| **Phase 10 — Workforce (Optional)** | M36 | T102–T105 | 🔒 optional |
| **Phase 11 — Project Close** | M37 | T106–T108 | 📋 planned |

**รวมงานที่เหลือ (ถึงจบ project แบบเต็ม):** **31 tasks** (T78–T108)  
**รวมถึง MVP + stable อย่างเดียว (ไม่รวม Payroll baht / Portal / Optional):** **10 tasks** (T78–T87)

---

## ✅ สิ่งที่ปิดแล้ว (อ้างอิง)

| Phase | Milestones | Tasks | หมายเหตุ |
|-------|------------|-------|----------|
| Phase 1 | M1–M6 | T01–T30 | LINE core, dashboard, leave, alerts, delivery |
| Phase 2 | M7–M10 | T31–T45 | เอกสาร, ร้องเรียน, ประกาศ |
| Phase 3 | M11–M15 | T46–T60 | OT, reports, org, settings |
| Phase 4 | M16–M20 | T61–T75 | pg_cron, lifecycle, audit P4 |
| Phase 5 MVP | M21–M28* | T76 + ad-hoc | สาขา, BM, CEO, 2-tier approval, payroll **ชม.**, cron |

\* แผนเดิม `PHASE_5_PLAN.md` ใช้ T76–T95 — ส่วนใหญ่ **implement แล้วใน code** แต่ยังไม่ register เป็น T78–T95 ใน Taskmaster; ปิด formal ที่ **M29**

**Delivered แล้ว (Phase 5 MVP):** ดู `hr-app/reports/CLIENT_HANDOFF_P5.md`

---

## 🔜 Phase 5 Close-out — M29 (~1 สัปดาห์)

**Goal:** ปิด Phase 5 อย่างเป็นทางการ + sync docs/taskmaster

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T78** | LINE self-registration — `/register`, HR กำหนด role ภายหลัง | Cursor / Claude | ✅ code แล้ว — review, deploy, E2E |
| **T79** | Client sign-off Phase 5 + อัปเดต handoff (§ onboarding, Phase 6 link) | Cursor | `CLIENT_HANDOFF_P5.md` v2, checklist ลูกค้า |
| **T80** | Reconcile Taskmaster + GROUND_TRUTH — ปิด Phase 5, เปิด Phase 6 | Cursor | `tasks.json`, `GROUND_TRUTH.md`, `MILESTONES.md` |

**Acceptance:** ลูกค้า sign-off §9 ครบ; T77/T78 APPROVED; เอกสารไม่ขัดกัน

---

## 📋 Phase 6 — Onboarding & Identity — M30 (~1 สัปดาห์)

**Goal:** พนักงานเข้าระบบเองได้ครบวงจร ไม่ต้อง seed manual

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T81** | HR onboarding queue — พนักงานใหม่รอ assign role/สาขา (optional UI) | Codex | badge/list ใน `/admin/employees` |
| **T82** | ปิด LIFF OT ฝั่ง employee (redirect ตาม Phase 5) + copy ภาษาไทย | Claude Code | `/liff/overtime` → ข้อความ "ติดต่อหัวหน้าสาขา" |
| **T83** | E2E onboarding — LINE ใหม่ → register → LIFF → HR promote → BM dashboard | Claude Code | `scripts/e2e/flow-onboarding.mjs` |

**Acceptance:** flow ไม่มี `not_registered` error; HR promote role แล้ว landing ถูก

---

## 📋 Phase 7 — Production Stable — M31 (~1–2 สัปดาห์)

**Goal:** production ทนของจริง — cron, security, UAT fixes

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T84** | Vault `sb_secret` + health check cron ทุก job | Claude Code | script verify + migration/doc |
| **T85** | Full regression — `run-all-p5.mjs` + smoke routes บน production | Claude Code | `E2E_P6_RESULTS.md` |
| **T86** | Security review — self-register, role PATCH, RLS | Claude Opus | `SECURITY_REVIEW_P6.md` |
| **T87** | Client UAT fix batch (จาก sign-off checklist) | Claude Code | fixes ตาม ticket |

**Acceptance:** cron ไม่ 401; E2E pass; security ไม่มี critical; UAT checklist ผ่าน

---

## 📋 Phase 8 — Employee Web Portal — M32–M33 (~3–4 สัปดาห์)

**Goal:** พอร์ทal พนักงานตาม mockup (`DASHBOARD_UI_PLAN.md`) — นอก LINE

**อ้างอิง mockup:** Employee Home 12089, Profile 12090, Schedule 12085

### M32: Portal Shell (~1.5 สัปดาห์)

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T88** | Design tokens 中国名堂 — `#E80012`, fonts Prompt/Inter | Codex | `theme.css`, brand assets |
| **T89** | `/portal` layout + auth (role=employee) | Codex | shell + middleware |
| **T90** | Portal Home — check-in status, leave balance, announcements | Codex | widgets + LIFF deep links |
| **T91** | Portal Profile — read-only จาก `hr_employees` | Codex | `/portal/profile` |

### M33: Portal Modules (~2 สัปดาห์)

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T92** | Portal Attendance — ประวัติตัวเอง | Codex | `/portal/attendance` |
| **T93** | Portal Leave — embed หรือ link LIFF | Claude Code | `/portal/leave` |
| **T94** | Portal Documents — สถานะคำขอเอกสาร | Codex | `/portal/documents` |
| **T95** | Admin reskin (non-locked pages) — Employees, Attendance, Leaves | Codex | ไม่แตะ `/admin` home locked |

**Acceptance:** employee login web → portal ใช้ได้; widget ข้อมูลจริง; mobile responsive

**หมายเหตุ:** HR Admin Dashboard หน้าแรก (`/admin`) **locked** — reskin เฉพาะหน้าย่อย

---

## 🔒 Phase 9 — Payroll (Baht) & Payslip — M34–M35 (~4–6 สัปดาห์)

**Goal:** จาก "รายงานชม." → **สลิปเงินเดือน / บาท** (ต้อง **ลูกค้า approve scope** ก่อน kickoff)

**ปัจจุบัน:** Phase 5 ส่งมอบ payroll **ชม.** เท่านั้น — baht **นอก scope**

### M34: Payroll Engine

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T96** | Schema — `hr_payslips`, `hr_payroll_runs`, deduction rules | Claude Code | migration + RLS |
| **T97** | คำนวณชม.อนุมัติ → เงิน (base salary, OT rate, หัก) | Claude Code | engine + unit tests |
| **T98** | HR Payroll run UI — สร้าง/ปิดงวด, preview | Codex | `/admin/payroll/runs` |

### M35: Payslip Delivery

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T99** | Payslip PDF/HTML generation | Claude Code | template + storage |
| **T100** | Employee ดูสลิป — Portal + LIFF + ขอผ่าน F7 | Codex | `/portal/payslip` |
| **T101** | Payroll audit + security (salary data) | Claude Opus | `SECURITY_REVIEW_PAYROLL.md` |

**Acceptance:** HR ปิดงวด → พนักงานเห็นสลิป; ไม่ leak salary cross-employee

---

## 🔒 Phase 10 — Workforce Modules (Optional) — M36 (~4 สัปดาห์)

**Goal:** ปิด stub pages + mockup ที่ยังเป็น ComingSoon — **optional จนกว่าลูกค้าจะสั่ง**

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T102** | Schedule / Shifts — `hr_shifts`, calendar | Claude Code | schema + `/portal/schedule` |
| **T103** | Recruitment lite — requisition list (ไม่ full ATS) | Codex | `/admin/recruitment` |
| **T104** | Training lite — course registry | Codex | `/admin/training` |
| **T105** | Performance lite — review cycle stub | Codex | `/admin/performance` |

**ทางเลือก:** ถ้าไม่ทำ → ลบ nav stub + ระบุ "out of scope v2" ใน handoff แทน (0 task)

---

## 📋 Phase 11 — Project Close — M37 (~1 สัปดาห์)

**Goal:** จบ project อย่างเป็นทางการ

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| **T106** | Final delivery audit (Opus) | Cursor | `DELIVERY_READINESS_FINAL.md` |
| **T107** | Client handoff vFinal + runbook + key rotation guide | Cursor | `CLIENT_HANDOFF_FINAL.md` |
| **T108** | Archive orchestration + Taskmaster 100% done + tag release | Cursor | git tag, GROUND_TRUTH CLOSED |

**Acceptance:** verdict 🟢; ลูกค้า sign-off สุดท้าย; repo clean

---

## Dependency Order (งานที่เหลือ)

```
M29:  T78 → T79 → T80
M30:  T81 → T82 → T83        (หลัง T78 deploy)
M31:  T84 → T85 → T86 → T87  (หลัง M30 หรือ parallel UAT)
M32:  T88 → T89 → T90 → T91
M33:  T92 → T93 → T94 → T95  (T95 ไม่ block portal)
M34:  T96 → T97 → T98        (ต้อง approve Phase 9)
M35:  T99 → T100 → T101
M36:  T102–T105               (optional)
M37:  T106 → T107 → T108      (หลัง scope ที่ลูกค้าเลือกครบ)
```

---

## นิยาม "จบ Project"

| ระดับ | ครอบคลุม | Tasks | ประมาณเวลา |
|-------|----------|-------|------------|
| **A — MVP Stable** | M29 + M30 + M31 | T78–T87 (10) | ~3–4 สัปดาห์ |
| **B — Product v1** | A + M32–M33 (Portal) | T78–T95 (18) | ~7–8 สัปดาห์ |
| **C — Payroll Complete** | B + M34–M35 | T78–T101 (24) | ~11–14 สัปดาห์ |
| **D — Full Vision** | C + M36 + M37 | T78–T108 (31) | ~15–18 สัปดาห์ |

**แนะนำ:** ลูกค้า sign-off **Level A** หลัง T87 → ตัดสินใจ Phase 8–9 เป็น change request หรือ phase ใหม่

---

## สิ่งที่ยัง Out of Scope (ทุก Phase)

- Multi-company (multi-branch ✅ มีแล้ว)
- Native mobile app (iOS/Android)
- Accounting integration (SAP, SAGE)
- Advanced BI / data warehouse
- Full ATS / LMS / Performance 360 (Phase 10 ทำแค่ lite ถ้าสั่ง)

---

## ไฟล์อ้างอิง

| เนื้อหา | Path |
|---------|------|
| Phase 5 แผนเดิม | `orchestration/PHASE_5_PLAN.md` |
| UI mockup roadmap | `orchestration/DASHBOARD_UI_PLAN.md` |
| Handoff ปัจจุบัน | `hr-app/reports/CLIENT_HANDOFF_P5.md` |
| Taskmaster | `.taskmaster/tasks/tasks.json` |
| PRD | `docs/PRD.md` |

---

*สร้างโดย Cursor Orchestrator — reconcile Phase 5 delivered vs mockup gaps vs project close*
