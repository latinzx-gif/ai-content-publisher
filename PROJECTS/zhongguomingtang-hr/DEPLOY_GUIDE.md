# 🚀 Deploy Guide — 中国名堂 HR System

## ขั้นตอนทั้งหมด (ประมาณ 30 นาที)

---

## 1. Supabase Setup

1. ไปที่ https://supabase.com → New Project → ตั้งชื่อ `zhongguomingtang-hr`
2. เลือก Region: **Southeast Asia (Singapore)**
3. รอ project สร้าง (~2 นาที)
4. ไปที่ **SQL Editor** → วาง code จาก `supabase/schema.sql` → Run

   ```
   Project Settings → API → copy:
   - Project URL  → NEXT_PUBLIC_SUPABASE_URL
   - anon key     → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role → SUPABASE_SERVICE_ROLE_KEY
   ```

---

## 2. Line OA + LIFF Setup

1. ไปที่ https://developers.line.biz → Console
2. สร้าง **Messaging API Channel** → copy Channel Access Token & Channel Secret
3. ไปที่ **LINE Login** Channel → LIFF → Add LIFF App
   - Endpoint URL: `https://YOUR_APP.vercel.app/employee`
   - Scope: `openid`, `profile`
   - copy **LIFF ID**
4. ตั้ง Webhook URL (ทำหลัง deploy):
   `https://YOUR_APP.vercel.app/api/line-webhook`

---

## 3. Deploy ไป Vercel

```bash
# 1. Clone/push project ไป GitHub ก่อน
cd zhongguomingtang-hr
git init && git add . && git commit -m "initial"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main

# 2. ไปที่ vercel.com → Import Git Repository
# 3. ตั้ง Environment Variables ตาม .env.example
# 4. Deploy!
```

**Environment Variables ที่ต้องใส่ใน Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_LIFF_ID=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
NEXT_PUBLIC_APP_URL=https://YOUR_APP.vercel.app
NEXTAUTH_SECRET=   ← openssl rand -base64 32
```

---

## 4. Line OA Webhook

หลัง deploy แล้ว:
1. Line Developers → Messaging API → Webhook URL:
   `https://YOUR_APP.vercel.app/api/line-webhook`
2. กด **Verify** → ต้องผ่าน
3. เปิด **Use webhook**

---

## 5. สร้างข้อมูลตั้งต้น

ไปที่ Supabase SQL Editor:

```sql
-- เพิ่มพนักงาน HR Admin
INSERT INTO employees (employee_code, first_name, last_name, position, branch_id, shift_type_id, base_salary, status)
SELECT 'EMP001', 'สมชาย', 'พิทักษ์ดี', 'HR Manager',
  (SELECT id FROM branches WHERE name = 'สาขาสีลม'),
  (SELECT id FROM shift_types WHERE name = 'Officer'),
  35000, 'active';

-- เพิ่มวันลาปีนี้
INSERT INTO leave_balances (employee_id, year)
SELECT id, 2026 FROM employees;
```

---

## 6. File Structure สรุป

```
zhongguomingtang-hr/
├── app/
│   ├── employee/
│   │   ├── page.tsx          ← หน้าหลัก (LIFF)
│   │   ├── clock/page.tsx    ← เข้า-ออกงาน + GPS
│   │   ├── leave/page.tsx    ← ขอลา
│   │   ├── ot/page.tsx       ← ขอ OT
│   │   ├── documents/page.tsx← ขอเอกสาร
│   │   └── complaint/page.tsx← ร้องเรียน
│   ├── admin/
│   │   ├── page.tsx          ← Dashboard
│   │   ├── attendance/       ← ตรวจเวลา
│   │   ├── requests/         ← อนุมัติคำขอ
│   │   ├── payroll/          ← เงินเดือน
│   │   └── shifts/           ← จัดกะ
│   └── api/
│       ├── attendance/       ← Clock in/out API
│       ├── leaves/           ← Leave CRUD
│       ├── ot/               ← OT CRUD
│       └── line-webhook/     ← Line OA events
├── lib/
│   ├── shift-utils.ts        ← ⭐ กะดึก logic
│   ├── supabase.ts           ← DB client
│   └── liff.ts               ← Line LIFF
└── supabase/
    └── schema.sql            ← Database schema ครบ
```

---

## กะดึก Logic (สำคัญ)

```typescript
// ไฟล์ lib/shift-utils.ts
// canClockOut() จะ block ถ้า:
// - กะดึก + เวลาปัจจุบัน 20:00-23:59 → ยังเร็วเกินไป
// - ทำงานน้อยกว่า 1 ชั่วโมง
// getWorkDate() จัดการวันที่ข้ามเที่ยงคืน
```

---

## งบประมาณ (เดือนแรก)

| บริการ | ราคา |
|--------|------|
| Supabase Free | ฟรี (500MB, 50K req/เดือน) |
| Vercel Free | ฟรี |
| Line OA | ฟรี (1,000 msg/เดือน) |
| **รวม** | **ฟรี** |

เมื่อพนักงานมากขึ้น → Supabase Pro $25/เดือน
