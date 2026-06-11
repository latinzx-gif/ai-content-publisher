# MILESTONES — LINE OA HR & Payroll Platform

---

## M1: Foundation & Setup (Week 1)
**Goal:** ระบบ skeleton ทำงานได้ก่อน build features

| Task | Description | Agent |
|------|-------------|-------|
| T01 | Next.js 16 + Supabase + Tailwind + shadcn/ui setup | Codex |
| T02 | Database schema: employees, attendance, leaves, alerts, documents | Claude Code |
| T03 | LINE OA setup: Webhook endpoint, Rich Menu, LIFF config | Claude Code |
| T04 | Auth: LINE Login + Role-based (employee/hr/admin) | Claude Code |
| T05 | Layout + routing: Web Dashboard shell | Codex |

---

## M2: LINE OA Core — Check-in/Check-out (Week 2)
**Goal:** พนักงานเช็คอิน-เอาท์ผ่าน LINE ได้

| Task | Description | Agent |
|------|-------------|-------|
| T06 | Rich Menu: ปุ่ม 5 ตัว (เช็คอิน, ลา, เอกสาร, ร้องเรียน, ประกาศ) | Codex |
| T07 | Check-in: บันทึก timestamp + Geo Location | Claude Code |
| T08 | Check-out: สรุปชั่วโมงทำงาน, ตรวจสาย | Claude Code |
| T09 | Flex Message: ยืนยันเช็คอิน, แจ้งสาย, สรุปรายวัน | Codex |
| T10 | Push Notification: แจ้งเตือนเช้าถ้ายังไม่เช็คอิน | Claude Code |
| T11 | QR Code check-in support | Codex |

---

## M3: Web Dashboard — Overview & Employees (Week 3)
**Goal:** HR เห็น dashboard + ข้อมูลพนักงานครบ

| Task | Description | Agent |
|------|-------------|-------|
| T12 | System Dashboard: Overview cards (มา/ขาด/ลา/สาย/คำร้อง) | Codex |
| T13 | System Dashboard: กราฟ attendance รายวัน/สัปดาห์/เดือน | Codex |
| T14 | Employee List: ตาราง ค้นหา กรอง เรียงลำดับ | Codex |
| T15 | Employee Profile: ข้อมูลส่วนตัว, สัญญา, เงินเดือน, วีซ่า | Claude Code |
| T16 | Time & Attendance: ประวัติเช็คอิน-เอาท์ใน Web | Codex |

---

## M4: Leave Management (Week 4)
**Goal:** ขอลา-อนุมัติผ่าน LINE+Web ได้ครบ

| Task | Description | Agent |
|------|-------------|-------|
| T17 | LIFF: แบบฟอร์มขอลา (ประเภท, วันที่, เหตุผล, แนบไฟล์) | Claude Code |
| T18 | Leave request: แสดงยอดวันลาคงเหลือ, ส่ง LINE → DB | Claude Code |
| T19 | Web: รายการคำขอลา อนุมัติ/ไม่อนุมัติ พร้อมเหตุผล | Codex |
| T20 | หัก/คืนยอดวันลาอัตโนมัติ + Flex Message แจ้งผล | Claude Code |
| T21 | ปฏิทินวันลา + รายงานสถิติ + ยอดวันลาคงเหลือ | Codex |

---

## M5: Alerts & Attendance Summary (Week 5)
**Goal:** ระบบแจ้งเตือนอัตโนมัติทำงานได้

| Task | Description | Agent |
|------|-------------|-------|
| T22 | Cron job: Probation alert (30/14/7/1 วัน) | Claude Code |
| T23 | Cron job: Visa/Work Permit alert (60/30/14/7/1 วัน) | Claude Code |
| T24 | Web: Dashboard แสดงรายชื่อ Visa ใกล้หมด + บันทึกผลทดลองงาน | Codex |
| T25 | Cron job: สรุปเข้างานรายวัน → ส่ง LINE พนักงาน ตอนเย็น | Claude Code |
| T26 | สรุปภาพรวมรายวัน → ส่ง LINE Group HR | Claude Code |

---

## M6: Delivery (Week 6-7)
**Goal:** พร้อม demo ลูกค้า

| Task | Description | Agent |
|------|-------------|-------|
| T27 | Security review: RLS, LINE webhook verification, auth bypass | Claude Code (Opus) |
| T28 | E2E test: check-in flow, leave flow, alert flow | Claude Code |
| T29 | Deployment checklist + production deploy | Cursor |
| T30 | Demo prep: script + known issues + fallback plan | Cursor |

---

## Phase 2 — Support Features (Planned 2026-06-11)

| Milestone | Tasks | Features |
|-----------|-------|----------|
| M7: Document Request | T31–T34 | F7 |
| M8: Complaint | T35–T38 | F8 |
| M9: Announcements | T39–T42 | F9 |
| M10: P2 Hardening | T43–T45 | Security + E2E + audit |

Detail: `orchestration/PHASE_2_PLAN.md`

---

## Summary

| Milestone | Tasks | Weeks | Priority |
|-----------|-------|-------|----------|
| M1: Foundation | T01–T05 | Week 1 | P1 |
| M2: Check-in/Check-out | T06–T11 | Week 2 | P1 |
| M3: Web Dashboard | T12–T16 | Week 3 | P1 |
| M4: Leave Management | T17–T21 | Week 4 | P1 |
| M5: Alerts & Summary | T22–T26 | Week 5 | P1 |
| M6: Delivery | T27–T30 | Week 6-7 | P1 |
| Phase 2 | T31–T45 | ~6 weeks | P2 📋 PLANNED |

**Total Phase 1:** 30 tasks / 6-7 weeks
