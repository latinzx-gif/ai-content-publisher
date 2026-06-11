# Dashboard UI Redesign Plan — 中国名堂 ZHONGGUOMINGTANG

**อ้างอิง:** `/Users/jakarinosk/Downloads/UI Dashboard /` (10 mockups)  
**Brand asset:** Panda mascot logo (แดง + 云纹)  
**โปรเจกต์:** `hr-payroll-client/hr-app` — ต่อจาก LINE OA HR Phase 1 (T01–T25 ✅)  
**วันที่:** 2026-06-11

---

## 1. สรุปสิ่งที่ลูกค้าต้องการ

จาก mockup ลูกค้าต้องการ **2 พอร์ทัล** ภายใต้ธีมเดียวกัน:

| พอร์ทัล | ผู้ใช้ | Mockup หลัก |
|---------|--------|-------------|
| **Employee Self-Service (ESS)** | พนักงาน | 12089 Home, 12090 Profile, 12085 Schedule, 12086 OT, 12088 Payslip, 12087 HR Support |
| **HR / Management Dashboard** | HR, Branch Manager, Executive | 12441 HR Admin, 12440 Branch Manager, 12438 Executive, 12439 UI Spec |

**ธีมร่วม:** แดง `#E80012`, พื้นขาว/เทาอ่อน, mascot แพนด้า + ลาย云, sidebar navigation, KPI cards, donut/line charts, status pills

---

## 2. Design System (จาก 12439_0.jpg)

### สี
| Token | Hex | ใช้กับ |
|-------|-----|--------|
| `brand-red` | `#E80012` | ปุ่มหลัก, active nav, hero banner |
| `brand-red-light` | `#FEE2E2` | active nav background, tags |
| `surface` | `#FFFFFF` | cards |
| `background` | `#F5F5F5` | page bg |
| `sidebar-dark` | `#111111` | sidebar (spec sheet) |
| `text-primary` | `#111111` | หัวข้อ |
| `text-muted` | `#6B7280` | label |

> ปัจจุบัน `BRAND_RED = #D32F2F` ใน LINE Flex — **อัปเดตเป็น `#E80012`** ให้ตรง mockup

### ฟอนต์
| ภาษา | Font |
|------|------|
| TH | Prompt |
| EN | Inter |
| CN | Noto Sans SC |

### Components มาตรฐาน (ทุกหน้า)
- **Hero banner** — แถบแดง + mascot ขวา + 云纹
- **Sidebar** — logo บน, nav กลาง, user card + logout ล่าง
- **KPI card** — ตัวเลขใหญ่ + trend badge (+4.3%)
- **Status pill** — Approved (green), Pending (orange), Rejected (red)
- **Widget card** — white, rounded-xl, shadow-sm, header + "View All"
- **Top bar** — search, notification bell (badge), profile dropdown

---

## 3. Screen Inventory — แมป mockup → route

### A. Employee Portal (ใหม่ทั้งหมด — ยังไม่มีใน hr-app)

| Mockup | หน้า | Route เสนอ | ข้อมูลจากระบบเดิม |
|--------|------|------------|-------------------|
| 12089 | **Home** | `/portal` | check-in status, leave balance, payslip stub, announcements |
| 12090 | **My Profile** | `/portal/profile` | `hr_employees` + fields เพิ่ม (migration) |
| — | Attendance | `/portal/attendance` | `hr_attendance` self-read |
| — | Leave & Time Off | `/portal/leave` → LIFF หรือ embed form | T16/T17 ✅ |
| 12088 | **Payslip & Benefits** | `/portal/payslip` | **ใหม่** — table `hr_payslips` |
| 12085 | **My Schedule** | `/portal/schedule` | **ใหม่** — table `hr_shifts` / calendar |
| 12086 | **OT Request** | `/portal/ot` | **ใหม่** — table `hr_overtime` |
| — | Documents | `/portal/documents` | storage + P2 |
| 12087 | **HR Support** | `/portal/support` | FAQ + tickets (P2) |

### B. HR Admin — อัปเกรดจาก `/admin/*` ที่มี

| Mockup | หน้า | Route ปัจจุบัน | Gap vs mockup |
|--------|------|----------------|---------------|
| 12441 | **HR Admin Dashboard** | `/admin` | ขาด: onboarding donut, doc approvals, HR tickets, recruitment, compliance, quick actions 3×3 |
| 12439 | Employees | `/admin/employees` | ขาด: avatar, status pill, Add Employee CTA, search bar บน |
| 12439 | Attendance | `/admin/attendance` | ขาด: donut present rate, trend line, exception list |
| 12439 | Leave | `/admin/leaves` | มีแล้ว — ต้อง skin ใหม่ + pending list widget บน dashboard |
| 12441 | Alerts | `/admin/alerts` | มีแล้ว — ย้ายเป็น widget + compliance reminders |
| — | Payroll | ไม่มี | **ใหม่** — Phase 2+ |
| — | Settings | ไม่มี | T31 |

### C. Role-based Dashboards (Phase 2)

| Mockup | Role | Route เสนอ |
|--------|------|------------|
| 12438 | Executive / CEO | `/admin/executive` |
| 12440 | Branch Manager | `/admin/branch` |

---

## 4. Gap Analysis — สิ่งที่มี vs mockup

### มีแล้ว (logic พร้อม — แค่ reskin + layout)
- Auth LINE Login + role guard ✅
- Admin shell + 5 nav ✅
- KPI พื้นฐาน (employees, check-in, late/absent, pending leave) ✅
- Bar chart 7 วัน + pie leave status ✅
- Employees list + profile ✅
- Attendance history + CSV ✅
- Leave approval + calendar/report/balances ✅
- Alerts (probation/visa/work permit) ✅
- LINE check-in/out, leave LIFF ✅

### ยังไม่มี (ต้อง build ใหม่ตาม mockup)
| Feature | Mockup | Priority |
|---------|--------|----------|
| Design system + theme | 12439 | **P0** |
| Hero banner + mascot | ทุกหน้า | **P0** |
| Employee portal ทั้งชุด | 12089–12090 | **P1** |
| HR Admin dashboard widgets | 12441 | **P1** |
| Payslip module | 12088 | P2 |
| Schedule / shifts | 12085 | P2 |
| OT Request | 12086 | P2 |
| HR Support / tickets | 12087 | P2 |
| Executive / Branch dashboards | 12438, 12440 | P3 |
| Global search bar | 12441 | P3 |
| Payroll, Recruitment, Training | 12439 | P3 (out of scope Phase 1) |

---

## 5. แผน Implementation — 4 Phase

### Phase UI-0: Design Foundation (1 batch)
**เป้า:** ทุกหน้า admin ใช้ธีม 中国名堂 ได้ทันที โดยไม่เปลี่ยน business logic

| Task | งาน | File zone |
|------|-----|-----------|
| **T32** | Design tokens — CSS vars, fonts (Prompt/Inter/Noto Sans SC), `brand-red` | `src/styles/`, `layout.tsx` |
| **T33** | `AdminShell` redesign — sidebar logo, nav icons, user card, notification bell | `components/admin/*` |
| **T34** | Shared UI — `HeroBanner`, `KpiCard`, `StatusPill`, `WidgetCard` | `components/brand/*` |
| **T35** | Reskin `/admin` dashboard ตาม 12441 layout | `features/dashboard/*`, `admin/page.tsx` |

**Acceptance:** `/admin` หน้าตาใกล้ 12441 (KPI 6 ใบ, 2 แถว widgets, quick actions) ข้อมูลจริงจาก DB

---

### Phase UI-1: Admin Pages Reskin (1 batch)
**เป้า:** ทุกหน้า sidebar ใช้ layout เดียวกัน

| Task | หน้า | Mockup ref |
|------|------|------------|
| **T36** | Employees + Profile | 12439 Employee List/Profile |
| **T37** | Attendance — donut + trend + table | 12439 Attendance |
| **T38** | Leaves — tabs + pending widget style | 12439 Leave |
| **T39** | Alerts → compliance widget style | 12441 Compliance |

---

### Phase UI-2: Employee Portal (2 batches)
**เป้า:** Web portal สำหรับพนักงาน (นอกจาก LINE) ตาม 12089

**Batch A — Shell + Home**
| Task | งาน |
|------|-----|
| **T40** | `/portal` layout + auth (role=employee) |
| **T41** | Home widgets: Check-in/out, Leave balance, Schedule today, Announcements |
| **T42** | My Profile ตาม 12090 (read-only ก่อน, edit ทีหลัง) |

**Batch B — Modules ใหม่**
| Task | งาน | ต้องมี schema |
|------|-----|--------------|
| **T43** | Payslip list + detail | `hr_payslips` migration |
| **T44** | My Schedule calendar | `hr_shifts` / `hr_schedule_events` |
| **T45** | OT Request form + history | `hr_overtime` |
| **T46** | HR Support FAQ + ticket stub | `hr_tickets` |

> **ทางเลือก:** หน้า Home บาง widget ลิงก์ไป LIFF เดิม (check-in, leave) แทน build ซ้ำ — ลด scope

---

### Phase UI-3: Role Dashboards + Polish (optional)
| Task | งาน |
|------|-----|
| **T47** | Executive dashboard `/admin/executive` — 12438 |
| **T48** | Branch manager `/admin/branch` — 12440 |
| **T49** | Global search, i18n TH/EN/CN toggle |
| **T50** | Mobile responsive ตาม 12439 mobile section |

---

## 6. Layout เป้าหมาย — HR Admin Dashboard (12441)

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar] │ Welcome back, HR Admin 👋     Fri May 16, 2025  │
│  Logo     ├─────────────────────────────────────────────────┤
│  Nav×11   │ [KPI][KPI][KPI][KPI][KPI][KPI]  ← 6 cards       │
│           ├──────────────┬──────────────┬───────────────────┤
│  Panda    │ Onboarding   │ Doc Approvals│ Attendance Exc.   │
│  card     │ donut+list   │ list         │ list              │
│           ├──────────────┼──────────────┼───────────────────┤
│           │ Recruitment  │ Compliance   │ Announcements     │
│           │ snapshot     │ reminders    │ feed              │
│           ├─────────────────────────────────────────────────┤
│           │ Quick Actions 3×3 grid                            │
└─────────────────────────────────────────────────────────────┘
```

### แมป widget → data ที่มีวันนี้

| Widget 12441 | Data source ปัจจุบัน | หมายเหตุ |
|--------------|----------------------|----------|
| Total Employees | `hr_employees` count | ✅ |
| Leave Approvals Pending | `hr_leaves` pending | ✅ |
| Attendance Exceptions | late + absent today | ✅ (proxy) |
| Onboarding / Recruitment | — | stub หรือ Phase 2 |
| Payroll Processing | — | stub |
| HR Tickets | — | stub |
| Announcements | — | stub จนกว่า P2 |
| Quick Actions | links ไป `/admin/*` | ✅ |

---

## 7. Layout เป้าหมาย — Employee Home (12089)

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar] │ 🔴 Welcome back, {name}!        [bell] [avatar]  │
│  Logo     │     Friday, May 24, 2024                         │
│  Nav×9    ├─────────────────────────────────────────────────┤
│           │ [Check In/Out] [Leave Balance] [Latest Payslip] │
│  User     │ [Today Schedule] [OT Request]  [Documents]      │
│  + Logout │ [HR Support]     [Announcements]                 │
└─────────────────────────────────────────────────────────────┘
```

### แมป widget → ระบบเดิม

| Widget | Implementation |
|--------|----------------|
| Check In/Out | ลิงก์ LIFF `/liff/checkin` + สถานะจาก `hr_attendance` วันนี้ |
| Leave Balance | `hr_leave_balances` + ลิงก์ `/liff/leave` |
| Latest Payslip | stub จน T43 |
| Today Schedule | stub จน T44 |
| OT Request | stub จน T45 |
| HR Support | stub จน T46 |
| Announcements | stub / LINE broadcast P2 |

---

## 8. Assets ที่ต้องเตรียม

| Asset | ที่มา | ใช้กับ |
|-------|-------|--------|
| Logo PNG | user provided (`S__16105538...png`) | sidebar, favicon |
| Mascot hero | export จาก logo หรือ mockup | hero banner ขวา |
| 云纹 pattern | SVG repeat background | hero banner |
| Nav icons | lucide-react (มีแล้ว) | sidebar |

**คัดลอกเข้า repo:**
```
hr-app/public/brand/logo.png
hr-app/public/brand/mascot-hero.png
hr-app/public/brand/cloud-pattern.svg
```

---

## 9. ลำดับแนะนำ — เริ่มได้ทันที

```
สัปดาห์ 1:  T32 → T35   (ธีม + HR Admin dashboard ใหม่)
สัปดาห์ 2:  T36 → T39   (reskin หน้า admin ที่เหลือ)
สัปดาห์ 3:  T40 → T42   (Employee portal shell + home)
สัปดาห์ 4+: T43 → T46   (modules ใหม่ตามลำดับลูกค้า)
```

**Quick win สำหรับ demo:** ทำแค่ **Phase UI-0 (T32–T35)** — HR Admin หน้าแรกสวยตาม mockup + ข้อมูลจริง ใช้เวลา ~1 batch

---

## 10. สิ่งที่ไม่ทำในรอบนี้ (ยกให้หลัง LINE OA HR delivery)

- Payroll processing จริง
- Recruitment pipeline
- Training & Development
- Performance review
- Organization chart
- Mobile app native (ใช้ responsive web ตาม 12439)

---

## 11. Batch ถัดไปที่แนะนำ (สำหรับ dispatch)

### Batch UI-1: T32 + T33 + T34 + T35 (ไฟล์ไม่ชน)

```
T32  src/styles/theme.css, app/layout.tsx (fonts)
T33  components/admin/AdminShell, AdminSidebar, AdminHeader
T34  components/brand/HeroBanner, KpiCard, WidgetCard, StatusPill
T35  features/dashboard/*, admin/page.tsx
```

**Skills:** shadcn, react-best-practices  
**Agent:** Codex (UI-heavy)  
**ห้ามแตะ:** API routes, Supabase schema, LINE handlers

---

*Plan by Cursor Orchestrator — อ้างอิง mockup จาก `/Users/jakarinosk/Downloads/UI Dashboard /`*
