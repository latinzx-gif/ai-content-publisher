# GROUND_TRUTH.md — LINE OA HR & Payroll Platform

> @/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md — กฎทั้งหมดใน COMPANY_OS.md มีผลกับ project นี้ด้วย
> Override เฉพาะส่วนที่ระบุด้านล่างเท่านั้น

**อ่านไฟล์นี้ก่อนทุก session ก่อนตัดสินใจ scope หรือเริ่มงานใดๆ**

---

## 1. สิ่งที่กำลังสร้าง

**LINE OA HR & Payroll Management Platform** — ระบบบริหารจัดการ HR ผ่าน LINE OA

เส้นทางหลัก:
```
พนักงาน LINE OA: Rich Menu → เช็คอิน/เช็คเอาท์ / ขอลา / ขอเอกสาร
HR Web Dashboard: อนุมัติ / ดูรายงาน / จัดการข้อมูล / รับ Alerts
Cron Jobs: แจ้งเตือน Probation/Visa อัตโนมัติ + สรุปประจำวัน
```

- **Tech Stack:** Next.js 16, Supabase (PostgreSQL + Storage + Edge Functions), LINE Messaging API, LIFF, Flex Message, shadcn/ui, Tailwind CSS, Vercel
- **Auth:** LINE Login + Role-based (employee / hr / admin / **branch_manager** — Phase 5)
- **Cron:** Supabase Edge Functions (ICT timezone)
- **Database prefix:** `hr_` (ทุก table)

---

## 2. App Structure

| Surface | Path | URL |
|---------|------|-----|
| Web Admin | `hr-app/src/app/admin/*` | `https://[domain]/admin/` |
| LINE Webhook | `hr-app/src/app/api/line/webhook` | POST endpoint |
| LIFF (Leave form) | `hr-app/src/app/liff/leave` | LIFF URL |
| LIFF (Documents) | `hr-app/src/app/liff/documents` | Web/LIFF URL |
| LIFF (Complaint) | `hr-app/src/app/liff/complaint` | Web/LIFF URL |
| LIFF (QR checkin) | `hr-app/src/app/liff/checkin` | LIFF URL |

- **Project root:** `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/`
- **App root:** `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app/`
- **Deploy:** Vercel

---

## 3. Phase Status (2026-06-11)

| Phase | Status | หมายเหตุ |
|-------|--------|----------|
| **M1: Foundation** | ✅ **CLOSED** | T01–T05 |
| **M2: Check-in/Check-out** | ✅ **CLOSED** | T06–T11 |
| **M3: Web Dashboard** | ✅ **CLOSED** | T12–T16 |
| **M4: Leave Management** | ✅ **CLOSED** | T17–T21 |
| **M5: Alerts & Summary** | ✅ **CLOSED** | T22–T26 |
| **M6: Delivery** | ✅ **CLOSED** | T27–T30; audit 🟡 `DELIVERY_READINESS_AUDIT.md` |
| **M7: Document Request (F7)** | ✅ **CLOSED** | T31–T34 |
| **M8: Complaints (F8)** | ✅ **CLOSED** | T35–T38 |
| **M9: Announcements (F9)** | ✅ **CLOSED** | T39–T42 |
| **M10: Phase 2 Delivery** | ✅ **CLOSED** | T43–T45; audit P2 🟢 |
| **Phase 3 (M11–M15)** | ✅ **CLOSED** | T46–T60; audit P3 🟢 `DELIVERY_READINESS_AUDIT_P3.md` |
| **Phase 4 (M16–M20)** | ⏳ **PENDING REVIEW** | T61–T75 complete — `DELIVERY_READINESS_AUDIT_P4.md` |
| **Phase 5 (M21–M28)** | ⏳ **PENDING REVIEW** | T76–T95 MVP — `DELIVERY_READINESS_AUDIT_P5.md` |

---

## 4. Active Task

**T77 — Phase 5 Delivery & Client Handoff**

| Field | Value |
|-------|-------|
| Phase | **EXECUTE** |
| Production | https://hr-app-two-iota.vercel.app |
| Supabase | `oouswalwqhojpzqwwdvs` (hr-payroll) |
| T76 | ✅ APPROVED — BM notify, badges, cron migration |
| T77 progress | Vault + cron ✅; handoff doc + git ⏳ |
| Locked | HR Admin Dashboard — ห้ามแก้ |

ดูรายละเอียดเต็ม: `orchestration/CURRENT_TASK.md`

---

## 5. ห้ามสร้าง (Project-specific)

เพิ่มจาก Universal DO NOT DO ใน COMPANY_OS.md:

- ❌ Payroll **baht calculation** / salary slip generation (Phase 5: สรุป **ชม.** เท่านั้น — ดู `PHASE_5_PLAN.md`)
- ❌ Multi-company (multi-**branch** อนุญาตใน Phase 5)
- ❌ Mobile app native (iOS/Android)
- ❌ Integration กับ accounting software (SAP, SAGE ฯลฯ)
- ❌ Advanced BI / analytics pipeline
- ❌ Phase 2 features **นอกแผน** `PHASE_2_PLAN.md` (F7–F9 อนุมัติแล้ว — เริ่ม T31+)
- ❌ Direct database access จาก client (ต้องผ่าน API routes หรือ Supabase RLS เท่านั้น)
- ❌ Store LINE tokens ใน localStorage (ใช้ server-side เท่านั้น)

---

## 6. Agent Override

| เงื่อนไข | Agent |
|---------|-------|
| New isolated components/pages | Codex (GPT-5.5) |
| Database schema, RLS, migrations | Claude Code |
| LINE Webhook logic, LIFF integration | Claude Code |
| Auth, security | Claude Code |
| UI components ที่ไม่แตะ logic | Codex |
| Supabase Edge Functions (Cron) | Claude Code |
| Delivery audit, security review | Claude Code (Opus) |

---

## 7. Key Files

| ต้องการรู้เรื่อง | อ่านที่ |
|----------------|---------|
| งานปัจจุบัน | `orchestration/CURRENT_TASK.md` |
| Approval history | `orchestration/REVIEW_STATUS.md` |
| Milestones + tasks overview | `MILESTONES.md` |
| PRD ฉบับเต็ม | `docs/PRD.md` |
| All tasks (Taskmaster) | `.taskmaster/tasks/tasks.json` |
| Demo readiness | `hr-app/reports/DELIVERY_READINESS_AUDIT.md` |
| Phase 2 plan | `orchestration/PHASE_2_PLAN.md` |
| Phase 3 plan | `orchestration/PHASE_3_PLAN.md` |
| Phase 4 plan | `orchestration/PHASE_4_PLAN.md` |
| Phase 5 plan | `orchestration/PHASE_5_PLAN.md` |

---

## 8. Environment Variables ที่ต้องใช้

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LINE
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
NEXT_PUBLIC_LINE_LIFF_ID=

# App
NEXT_PUBLIC_BASE_URL=

# Optional
HR_LINE_GROUP_ID=
WORK_START_HOUR=9
WORK_START_MINUTE=0
```

---

*Last updated: 2026-06-10 — Phase 5 requirements locked; Phase 4 pending review*
