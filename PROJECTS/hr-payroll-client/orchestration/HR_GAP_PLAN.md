# HR Admin Gap Analysis vs PRD — อัปเดต 2026-06-10

**อ้างอิง:** `docs/PRD_SITEMAP.html` (Web Admin sitemap บรรทัด 423–454)  
**สถานะโปรเจกต์:** 15/30 tasks approved (T01–T13, T16, T21)  
**LINE ฝั่งพนักงาน:** Rich Menu 6 ปุ่ม + check-in/out ครบ — ฝั่ง HR Web ยังไม่ครบ

---

## สรุปภาพรวม

| ฝั่ง | Done | Partial | Missing |
|------|------|---------|---------|
| LINE (พนักงาน) | เช็คอิน/เอาท์, morning push, QR, guide cards | ฟอร์มลา (UI อย่างเดียว) | เอกสาร, ร้องเรียน, ประกาศ (P2 stub) |
| Web Admin (HR) | Shell, Dashboard, รายชื่อพนักงาน | Dashboard KPI/กราฟ | Profile, Attendance, Leave approval, Alerts UI, Settings |
| Backend/Cron | Probation alert (HR only) | — | Visa alert, evening summary, HR group summary |

**Admin sidebar วันนี้:** Dashboard ✅ | Employees (list) ✅ | Attendance 🔲 | Leaves 🔲 | Alerts 🔲  
**ยังไม่มีใน nav:** เอกสาร, ร้องเรียน, ประกาศ, ตั้งค่าระบบ

---

## เปรียบเทียบ PRD Web Admin ทีละโมดูล

### 1. Dashboard ภาพรวมระบบ — **Partial (T12 ✅)**

**มีแล้ว:** KPI cards, bar chart 7 วัน, pie chart สถานะลา, badge ทดลองงาน/วีซ่าใกล้หมด  
**ยังขาด:**
- แยก KPI ลา/ขาด/สาย ชัดเจน (ตอนนี้ "ขาด" = proxy จาก active − checked_in)
- คำร้องรอดำเนินการรวม (เอกสาร/ร้องเรียน — ยังไม่มี table)
- กราฟรายสัปดาห์/เดือน + อัตราเข้างาน %
- Pie chart ตาม**ประเภทลา** (ตอนนี้ group ตาม status)

---

### 2. Dashboard ข้อมูลพนักงาน — **Partial (T13 ✅)**

**มีแล้ว:** `/admin/employees` — search ชื่อ, filter แผนก/สถานะ, sort, pagination 20  
**ยังขาด (T14):**
- หน้า profile `/admin/employees/[id]` — ข้อมูลส่วนตัว, สัญญา, เงินเดือน
- บันทึกผลทดลองงาน (ผ่าน/ไม่ผ่าน/ขยาย)
- แก้ไขวีซ่า/work permit
- ประวัติการทำงาน (ลิงก์ไป attendance)
- Search รหัสพนักงาน (schema ยังไม่มี `employee_code`)
- UI พิมพ์ QR check-in (API มีแล้วที่ `/api/checkin/qr`)

---

### 3. ข้อมูลเวลา (Time & Attendance) — **Missing (T15)**

**LINE:** เช็คอิน geo/QR, เช็คเอาท์, สรุป Flex ต่อครั้ง — ครบ  
**Web Admin:** `/admin/attendance` = placeholder "Coming soon"  
**ต้องทำ:** ตารางประวัติ, filter ช่วงวันที่, สรุปชั่วโมง, สาย/ขาด/ลา, export CSV, สรุปรายเดือน

---

### 4. จัดการคำขอลางาน — **Missing (T17–T20)**

**LINE:** `/liff/leave` ฟอร์ม + แสดงยอดคงเหลือ (T16 ✅) — **submit ยัง stub**  
**Web Admin:** `/admin/leaves` = placeholder  

| Sub-feature PRD | Task | สถานะ |
|-----------------|------|--------|
| ส่งคำขอ + แจ้ง HR ทาง LINE | T17 | pending |
| HR อนุมัติ/ปฏิเสธ + เหตุผล | T18 | pending |
| หักยอดลา + แจ้งผลพนักงาน | T19 | pending |
| ปฏิทิน + รายงาน + ยอดคงเหลือ | T20 | pending |

---

### 5. จัดการคำขอเอกสาร — **Missing (P2 🔒)**

LINE: guide card "Phase 2" เท่านั้น  
Web Admin: ไม่มี route  
→ รอ unlock Phase 2 หลัง Phase 1 delivery

---

### 6. จัดการเรื่องร้องเรียน — **Missing (P2 🔒)**

LINE: guide card เท่านั้น  
Web Admin: ไม่มี route

---

### 7. สร้างประกาศ / แจ้งเตือน — **Partial backend only**

| Sub-feature | สถานะ |
|-------------|--------|
| แจ้งเตือนเช็คอินเช้า | ✅ T10 |
| แจ้งเตือนทดลองงาน cron | ✅ T21 (HR only — ยังไม่ push พนักงาน) |
| แจ้งเตือนวีซ่า cron | ❌ T22 |
| Web UI จัดการ alert | ❌ T23 (stub page) |
| สร้างประกาศ HR → LINE | ❌ P2 |
| สรุปภาพรวมเย็น (พนักงาน) | ❌ T24 |
| สรุป HR Group รายวัน | ❌ T25 |

---

### 8. ตั้งค่าระบบ — **Missing (ไม่อยู่ใน T01–T30)**

PRD ระบุ: ข้อมูลบริษัท, ประเภทการลา, ช่วงเวลาเช็คอิน, CNV WorkHub / LINE config  
ปัจจุบัน: work hours = env vars (`WORK_START_HOUR`) ไม่มี admin UI  
→ เสนอ **T31 Settings** หลัง Phase 1 core หรือรวมใน delivery audit scope

---

## Roadmap ถัดไป (แนะนำ)

### Batch 3 — ทันที (file-isolated, deps พร้อม)

| Task | ชื่อ | Agent | File zone |
|------|------|-------|-----------|
| **T14** | Employee Profile | Claude Code | `admin/employees/[id]/*`, `features/employees/profile/*` |
| **T15** | Attendance History | Codex | `admin/attendance/*`, `features/attendance/*` |
| **T17** | Leave Request flow | Claude Code | `api/leave/*`, wire `LeaveForm` submit |

### Batch 4 — Leave + Alerts backend

| Task | ชื่อ | Agent |
|------|------|-------|
| **T18** | Leave Approval (Web) | Codex |
| **T19** | Balance update + LINE notify | Claude Code |
| **T22** | Visa/Work Permit Alert Cron | Claude Code |

### Batch 5 — Alert UI + Summaries

| Task | ชื่อ | Agent |
|------|------|-------|
| **T23** | Alert Dashboard | Codex |
| **T20** | Leave Calendar + Report | Codex |
| **T24** | Evening attendance summary | Claude Code |
| **T25** | HR Group daily summary | Claude Code |

### Delivery (M6)

T26 Security → T27 E2E → T28 Deploy → T29 Demo → T30 Audit

### Phase 2 (หลัง unlock)

เอกสาร, ร้องเรียน, ประกาศ HR (LINE + Admin) — งานใหม่นอก T30

### Optional polish

- T12 follow-up: กราฟสัปดาห์/เดือน, attendance %, leave-by-type pie
- T21 gap: push แจ้งพนักงานเมื่อครบทดลองงาน (PRD ระบุทั้ง HR + employee)
- T31 Settings page

---

## หมายเหตุ stub pages (label ผิด — แก้ตอน EXECUTE)

| Page | Label ปัจจุบัน | Task ที่ถูก |
|------|----------------|-------------|
| `/admin/attendance` | T14 | **T15** |
| `/admin/leaves` | T15 | **T18** (list) + T17 (flow) |
| `/admin/alerts` | T16 | **T23** |

---

*สร้างโดย Cursor Orchestrator — จาก PRD gap audit 2026-06-10*
