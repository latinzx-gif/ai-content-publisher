# GROUND_TRUTH.md — CNV WorkHub

> @/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md — กฎทั้งหมดใน COMPANY_OS.md มีผลกับ project นี้ด้วย
> Override เฉพาะส่วนที่ระบุด้านล่างเท่านั้น

**อ่านไฟล์นี้ก่อนทุก session ก่อนตัดสินใจ scope หรือเริ่มงานใดๆ**

---

## 1. สิ่งที่กำลังสร้าง

**CNV WorkHub** — ระบบบริหารจัดการ HR ผ่าน LINE Official Account

เส้นทางหลัก:
```
พนักงาน CNV WorkHub (LINE): Rich Menu → เช็คอิน/เช็คเอาท์ / ขอลา / ขอเอกสาร
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
| **M1–M20** | ✅ **CLOSED** | T01–T75 |
| **M21–M37** | ✅ **CLOSED** | T76–T108; tag `hr-payroll-v1.0` |
| **Post-v1.0 patches** | ✅ **DEPLOYED** | Register gate, OT 2-tier, client UAT hotfixes (`57eed46`) |
| **M38 Phase 12 Go-Live** | 🔜 **NEXT** | T109 in-progress → T110–T114 planned |
| **M40 Portal v2** | 🔜 **QUEUED** | T121–T124 — หลัง T109 (client 2026-06-12) |
| **M42 Cleanup** | 🔜 **QUEUED** | T129 — หลัง M40 |
| **M41 Workforce** | ❌ **CANCELLED** | T125–T128 — ไม่ต้องการตอนนี้ |
| **M39 Payroll Baht** | 🔒 **LOCKED** | T115–T120 — needs signed CR |

**Business rules (production — อัปเดต 2026-06-28):**
- พนักงาน: **LINE/LIFF** + **Portal v2** (`/portal`)
- Onboarding: register → **inactive** → HR approve → active
- **Attendance:** เช็คอิน/เช็คเอาท์ → **บันทึกทันที** (auto-approve + payroll hours) — ไม่ผ่าน BM
- **Leave / OT:** พนักงานยื่น → **HR อนุมัตiคนเดียว** (`pending_hr`) — BM ไม่ใช้ขั้นอนุมัตiแล้ว
- Payroll: **ชม.เท่านั้น** — บาทรอ M39
- บันทึกความคืบหน้า CNV WorkHub: `hr-app/reports/LINE_OA_WORK_LOG.md`

---

## 4. Active Task

**T155 — Morning push (HR-config Employee + Officer)** — EXECUTE

| Field | Value |
|-------|-------|
| Part B (now) | Codex — settings UI `/admin/settings` |
| Part A (next) | Codex — `morning-push` edge + migration |
| Orchestrator | Cursor only |

ดูรายละเอียดเต็ม: `orchestration/CURRENT_TASK.md`

---

## 6. Agent Override (2026-06-15 — Cursor + Codex only)

> **Claude Code พักสำหรับ project นี้** — ไม่ dispatch ไปโปรเจกต์อื่น / งาน hr-payroll จนกว่า user จะเปิดกลับ

| Role | Agent | หมายเหตุ |
|------|-------|----------|
| **Orchestrator** | **Cursor** | set task, review, deploy, Linear |
| **Implementer** | **Codex (GPT-5.5)** | UI, lib, i18n, edge functions, migration **files** |
| ~~Claude Code~~ | ⏸ **PAUSED** | ไม่ใช้ใน queue จนกว่า user สั่งเปิด |

| เงื่อนไข | Agent |
|---------|-------|
| UI, settings, i18n, isolated features | **Codex** |
| Edge functions (`supabase/functions/*`) | **Codex** |
| Migrations (SQL files in repo) | **Codex** |
| Security review / delivery audit | **Cursor** orchestrates checklist — ไม่ dispatch Claude |
| Review + deploy prod | **Cursor** (หลัง Codex STOP) |

**Loop:** Cursor → `CURRENT_TASK.md` → Codex EXECUTE → `_agent/TASK_RESULT.md` → Cursor `review` → deploy

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

## 5. ห้ามสร้าง (Project-specific)

| ต้องการรู้เรื่อง | อ่านที่ |
|----------------|---------|
| งานปัจจุบัน | `orchestration/CURRENT_TASK.md` |
| Approval history | `orchestration/REVIEW_STATUS.md` |
| Milestones + tasks overview | `MILESTONES.md` ← **M38 next (T109–T114)** |
| Phase 12 plan | `orchestration/PHASE_12_PLAN.md` |
| PRD ฉบับเต็ม | `docs/PRD.md` |
| All tasks (Taskmaster) | `.taskmaster/tasks/tasks.json` |
| Demo readiness | `hr-app/reports/DELIVERY_READINESS_AUDIT.md` |
| Inventory roadmap | `hr-app/reports/INVENTORY_ROADMAP.md` |
| Portal roadmap | `hr-app/reports/PORTAL_ROADMAP.md` |
| **CNV WorkHub work log (เตือนความจำ)** | `hr-app/reports/LINE_OA_WORK_LOG.md` |
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

*Last updated: 2026-06-15 — Team: Cursor + Codex only (Claude Code paused)*
