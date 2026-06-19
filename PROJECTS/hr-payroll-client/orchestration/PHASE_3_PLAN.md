# Phase 3 Plan — CNV WorkHub

**Status:** 🔄 **KICKOFF** — T46 active 2026-06-11  
**Date:** 2026-06-11  
**PRD ref:** `docs/PRD.md` § F6 (gap), Rich Menu OT stub, admin `comingSoon` (lite)  
**Production base:** https://hr-app-two-iota.vercel.app  
**Depends on:** Phase 1 (T01–T30) + Phase 2 (T31–T45) ✅ CLOSED

---

## Goal

ปิด **ช่องว่าง PRD Phase 1** และ **stub ที่ยังเหลือ** โดยไม่ละเมิด GROUND_TRUTH §5:

| Priority | Feature | Why now |
|----------|---------|---------|
| P0 | **F10 Overtime Request** | ปุ่ม OT บน Rich Menu ยังเป็น guide stub |
| P1 | **F6 Weekly/Monthly summary** | PRD ระบุรายสัปดาห์/รายเดือน — มีแค่รายวัน |
| P2 | **Reports lite** | `/admin/reports` comingSoon + กราฟ dashboard ไม่ครบช่วงเวลา |
| P3 | **Admin ops** | Organization, Settings, ส่งไฟล์เอกสารให้พนักงาน |
| P4 | **F9 schedule + hardening** | ประกาศตั้งเวลา + security/E2E/audit P3 |

**ยังห้าม (Phase 3):** payroll calculation, salary slip, multi-company, native app, accounting integration, advanced BI pipeline

---

## Milestones

### M11: Overtime Request (F10) — ~2 weeks

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T46 | Schema `hr_overtime_requests` + RLS | Claude Code | migration |
| T47 | LINE/LIFF ขอ OT — วันที่, ช่วงเวลา, เหตุผล | Claude Code | `/liff/overtime`, API |
| T48 | Web `/admin/overtime` — คิวอนุมัติ/ปฏิเสธ | Codex | admin UI |
| T49 | Flex — ยืนยันส่งคำขอ + แจ้งผลอนุมัติ | Codex | flex + notify HR |

**Acceptance:** พนักงานขอ OT ผ่าน LINE → HR อนุมัติใน web → พนักงานได้ Flex ผลลัพธ์

---

### M12: Attendance Summary — F6 completion — ~1.5 weeks

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T50 | Cron สรุปเข้างาน **รายสัปดาห์** → LINE พนักงาน | Claude Code | edge fn |
| T51 | Cron สรุป **รายเดือน** → LINE พนักงาน | Claude Code | edge fn |
| T52 | สรุปภาพรวมรายสัปดาห์ → LINE Group HR | Claude Code | edge fn + flex |

**Acceptance:** พนักงานได้สรุปสัปดาห์/เดือน; HR group ได้ digest รายสัปดาห์

---

### M13: Reports & Analytics (lite) — ~1 week

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T53 | `/admin/reports` — attendance + leave + OT tables | Codex | แทน comingSoon |
| T54 | Dashboard กราฟ สัปดาห์/เดือน (F1 gap) | Codex | HrAdminDashboard |

**Acceptance:** HR ดูรายงานช่วงเวลา + export CSV พื้นฐาน

---

### M14: Admin Ops — ~1.5 weeks

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T55 | `/admin/organization` — แผนก/โครงสร้าง (CRUD lite) | Codex | dept management |
| T56 | `/admin/settings` — เวลาทำงาน, HR group id, health | Codex | settings UI |
| T57 | Document delivery — HR upload ไฟล์ + signed URL + LINE | Claude Code | storage + notify |

**Acceptance:** จัดการแผนกได้; HR แนบ PDF เอกสารแล้วพนักงานดาวน์โหลดได้

---

### M15: Phase 3 Hardening — ~1 week

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T58 | Scheduled announcements (send_at) | Claude Code | cron/API |
| T59 | Security review P3 + E2E OT/summary/reports | Claude Code | reports |
| T60 | Delivery audit P3 + demo script | Cursor | `DELIVERY_READINESS_AUDIT_P3.md` |

**Total Phase 3:** 15 tasks (T46–T60) / ~7 weeks

---

## Dependency Order

```
T46 → T47 → T48 → T49     (F10 OT)
T50 → T51 → T52           (F6 — ขนาน OT ได้หลัง T46 pattern)
T53 → T54                 (reports — หลัง T49/T52 มีข้อมูล OT/summary)
T55, T56, T57             (ops — ขนานกัน)
T58 → T59 → T60           (hardening)
```

---

## First Task

**T46 — Overtime Request schema**  
Phase: **PLAN** → dispatch Claude Code skill `03-claude-plan`

Skills: Supabase skill, `10-security-review` (RLS)

---

## GROUND_TRUTH updates

- §3: Phase 3 → **IN PROGRESS** (M11–M15)
- §4: Active Task **T46**
- §5: ยังห้าม payroll calc / multi-company / BI pipeline
