# Phase 12 Plan — Post-v1.0 Go-Live & Client Sign-off (M38)

**Status:** 📋 **PLANNED** — kickoff หลัง business-rule changes (2026-06-11)  
**Date:** 2026-06-11  
**Depends on:** T77–T108 CLOSED + tag `hr-payroll-v1.0` + post-v1.0 patches deployed  
**Production:** https://hr-app-two-iota.vercel.app  
**Target tag:** `hr-payroll-v1.1`

---

## ทำไมต้องมี Phase 12

หลังปิด batch T77–T108 และ tag v1.0 มี **business rule เปลี่ยน** ที่ยังไม่ผ่าน client sign-off อย่างเป็นทางการ:

| หัวข้อ | v1.0 (แผนเดิม) | ปัจจุบัน (deployed) |
|--------|----------------|---------------------|
| **OT** | BM ยื่นแทนพนักงาน (R5 ใน `PHASE_5_PLAN.md`) | **พนักงานยื่นเอง** → BM → HR → approved |
| **Onboarding** | Self-register แล้วใช้ LIFF ได้ | **inactive** จน HR กด **อนุมัติเข้าใช้งาน** |
| **Employee web** | `/portal` สร้างแล้ว (T88–T95) | **พนักงานใช้ LINE เท่านั้น** — `/portal` = `dev` role เท่านั้น |

Phase 12 ไม่ใช่ feature ใหญ่ — คือ **ปิดวงจร delivery** หลัง rule change + ให้ลูกค้า sign-off ก่อนเปิด scope ถัดไป (Payroll baht / Portal)

---

## Goal

1. เอกสาร handoff / milestone **ไม่ขัดกัน** กับ production จริง  
2. E2E ครอบคลุม flow ใหม่ (register → approve → OT 2-tier)  
3. Security review รอบใหม่ (registration gate + OT RLS)  
4. ลูกค้า UAT + sign-off checklist ครบ  
5. Tag **`hr-payroll-v1.1`** = production-stable หลัง rule change

---

## Tasks (T109–T114)

| ID | Task | Agent | Deliverables | ประมาณ |
|----|------|-------|--------------|--------|
| **T109** | Docs reconciliation — MILESTONES, handoff, delivery audit, HTML | Cursor | `MILESTONES.md`, `CLIENT_HANDOFF_P5.md` §8/§10, `CLIENT_HANDOFF_FINAL.md`, `DELIVERY_READINESS_FINAL.md`, `CLIENT_HANDOFF_P5.html` | 0.5 สัปดาห์ |
| **T110** | E2E — registration approval + OT 2-tier บน production | Claude Code | `scripts/e2e/flow-registration-approval.mjs`, `scripts/e2e/flow-overtime-two-tier.mjs`, `E2E_P12_RESULTS.md` | 0.5 สัปดาห์ |
| **T111** | Security review P7 — inactive gate, self-register, OT RLS | Claude Opus | `SECURITY_REVIEW_P7.md` | 2–3 วัน |
| **T112** | Client UAT fix batch — จาก checklist §10 + feedback ลูกค้า | Claude Code | fixes ตาม ticket | 0.5–1 สัปดาห์ |
| **T113** | Ops hardening — cron OT expiry, Vault `sb_secret`, key rotation runbook | Claude Code | verify SQL + `OPS_RUNBOOK_P12.md` | 2–3 วัน |
| **T114** | Formal sign-off + tag `hr-payroll-v1.1` | Cursor | signed checklist, git tag, Linear sync | 1 วัน |

### T109 — รายละเอียด docs ที่ต้องแก้

- `MILESTONES.md` — ปิด M29–M37 จริง, เพิ่ม M38, แก้ OT rule (employee self-submit)
- `CLIENT_HANDOFF_P5.md` §7 — cron รวม **OT** ใน approval-expiry
- `CLIENT_HANDOFF_P5.md` §10 — เพิ่ม checklist: OT 2-tier, HR อนุมัติ register
- `CLIENT_HANDOFF_FINAL.md` — ลบข้อความ "/portal สำหรับพนักงาน" (LINE-only)
- `DELIVERY_READINESS_FINAL.md` — แก้ "LIFF OT closed" → OT 2-tier active
- `orchestration/PHASE_5_PLAN.md` — annotate R5 superseded by Phase 12

### T110 — E2E scenarios

```
Scenario A — Registration gate
  LINE login (new) → /register → inactive → /register/pending
  → HR approve → active → LIFF leave/checkin ใช้ได้

Scenario B — OT 2-tier
  Employee LIFF /liff/overtime → pending_manager
  → BM /admin/branch/overtime approve → pending_hr
  → HR /admin/overtime approve → approved + payroll hours
```

### T112 — ขึ้นกับลูกค้า

รัน UAT checklist §10 ก่อน — ถ้าผ่านหมด T112 อาจเป็น no-op (0 fix)

---

## Acceptance Criteria (M38)

| # | เกณฑ์ |
|---|--------|
| AC1 | เอกสาร handoff ทุกไฟล์สอดคล้อง production (ไม่มีข้อความขัดกัน OT / portal / register) |
| AC2 | E2E A + B pass บน production (หรือ remote Supabase + deployed app) |
| AC3 | `SECURITY_REVIEW_P7.md` — ไม่มี critical; inactive users ไม่ bypass LIFF |
| AC4 | Client sign-off §10 ครบทุกข้อ (รวม OT + register approval) |
| AC5 | Cron `approval-expiry` ครอบคลุม leave + attendance + **OT** |
| AC6 | Tag `hr-payroll-v1.1` pushed |

---

## สิ่งที่ลูกค้าต้องทำ (parallel)

| ลำดับ | งาน |
|-------|-----|
| 1 | ตั้ง BM + สาขาอย่างน้อย 1 สาขา (§5 handoff) |
| 2 | ทดสอบ register → HR approve → ใช้ Rich Menu |
| 3 | ทดสอบ OT: พนักงานยื่น → BM → HR |
| 4 | ทดสอบลา + สรุปวันเข้างาน 2 ขั้น |
| 5 | (แนะนำ) Rotate keys หลัง sign-off |

---

## Dependency Order

```
T109 (docs) ──┬──► T110 (E2E) ──► T112 (UAT fixes)
              └──► T111 (security) ──┘
T113 (ops) — parallel กับ T110–T112
T114 — หลัง AC1–AC5 ผ่าน
```

---

## หลัง M38 — Fork (เลือก 1 ทาง โดยลูกค้า)

| Milestone | ชื่อ | Tasks | เงื่อนไข kickoff |
|-----------|------|-------|------------------|
| **M40** | Employee Web Portal v2 | T121–T124 | **Client approved 2026-06-12** — หลัง T109 |
| **M42** | Cleanup / docs sync | T129 | หลัง M40 — ไม่ลบ portal |
| ~~**M41**~~ | ~~Workforce lite~~ | ~~T125–T128~~ | **Cancelled** — ไม่ต้องการตอนนี้ |
| **M39** | Payroll Baht & Payslip | T115–T120 (เดิม T96–T101) | **Signed CR** + กติกาคำนวณเงิน |

**แนะนำ:** ปิด T109 → M40 (T121–124) → M42 (T129) → M38 sign-off / Inventory ตาม priority

---

## Locked (ไม่แตะใน M38)

- `/admin` HR Admin Dashboard หน้าแรก
- Employee profile layout หลัก
- Payroll **baht calculation** (รอ M39)

---

## Skills to Load (เมื่อ dispatch)

| Task | Skills |
|------|--------|
| T109 | `02-cursor-set-task`, docs only |
| T110 | `05-claude-execute`, Playwright/e2e scripts |
| T111 | `10-security-review` |
| T112 | `05-claude-execute`, `07-delivery-audit` |
| T113 | Supabase skill, `14-deployment-checklist` |
| T114 | `06-cursor-review-task`, `14-deployment-checklist` |

---

*สร้างโดย Cursor Orchestrator — 2026-06-11*
