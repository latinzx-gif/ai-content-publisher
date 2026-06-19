# Odoo Payroll Integration Guide

## ภาพรวม

Integration นี้เชื่อมต่อระบบ HR ปัจจุบัน (Next.js + Supabase) กับ Odoo ERP เพื่อ:
- Sync ข้อมูลพนักงาน
- ส่งข้อมูลชั่วโมงทำงาน, OT, และการลา
- ให้ Odoo คำนวณเงินเดือน, หักภาษี, ประกันสังคม
- สร้าง Payslip อัตโนมัติ

## สถาปัตยกรรม

```
┌─────────────────────────────────────┐
│ HR App (Next.js + Supabase)         │
│ - เช็คอิน/เช็คเอาท์                   │
│ - ลา/OT (ยื่น + อนุมัติ)              │
│ - Employee Management                │
└───────────────┬─────────────────────┘
                │ 
                │ API: /api/odoo/sync-payroll
                │ (XML-RPC)
                ↓
┌─────────────────────────────────────┐
│ Odoo 17 (Docker)                    │
│ - HR Module                         │
│ - Payroll Module                    │
│ - Salary Structure                  │
│ - Payslip Generation                │
└─────────────────────────────────────┘
```

## การติดตั้ง Odoo

### ขั้นตอนที่ 1: รัน Odoo ด้วย Docker

```bash
# ไปที่ project root
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client

# รัน Odoo container
docker-compose -f docker-compose.odoo.yml up -d

# ตรวจสอบว่า container รันอยู่
docker ps | grep odoo
```

**Output ที่คาดหวัง:**
```
hr-odoo      odoo:17.0    Up    0.0.0.0:8069->8069/tcp
hr-odoo-db   postgres:15  Up    5432/tcp
```

### ขั้นตอนที่ 2: Setup Odoo Database

1. เปิดเบราว์เซอร์ไปที่: http://localhost:8069
2. สร้าง database ใหม่:
   - **Database Name:** `hr_payroll`
   - **Email:** `admin@example.com`
   - **Password:** `admin`
   - **Language:** English (หรือ Thai ถ้ามี)
   - **Country:** Thailand
3. คลิก "Create Database"

### ขั้นตอนที่ 3: ติดตั้ง Payroll Module

1. ไปที่ **Apps** (เมนูด้านบน)
2. ค้นหา "Payroll"
3. คลิก **Install** ที่ "Payroll" app
4. รอให้การติดตั้งเสร็จ (จะติดตั้ง HR และ Contracts อัตโนมัติ)

### ขั้นตอนที่ 4: สร้าง Salary Structure

1. ไปที่ **Payroll → Configuration → Salary Structures**
2. คลิก **Create**
3. กรอกข้อมูล:
   - **Name:** `Monthly Salary - Thailand`
   - **Structure Type:** Regular Pay
4. เพิ่ม **Salary Rules:**

   **Rule 1: Basic Salary**
   - Name: `Basic Salary`
   - Code: `BASIC`
   - Category: Basic
   - Computation: `contract.wage`

   **Rule 2: Overtime**
   - Name: `Overtime Pay`
   - Code: `OT`
   - Category: Allowance
   - Computation: `(contract.wage / 176) * 1.5 * worked_days.OT.number_of_hours`

   **Rule 3: Social Security**
   - Name: `Social Security Deduction`
   - Code: `SSO`
   - Category: Deduction
   - Computation: `-min(750, contract.wage * 0.05)`

   **Rule 4: Income Tax (Simplified)**
   - Name: `Income Tax`
   - Code: `TAX`
   - Category: Deduction
   - Computation: `-result * 0.05` (ปรับตามกฎหมายจริง)

5. คลิก **Save**

### ขั้นตอนที่ 5: สร้าง Work Entry Types

1. ไปที่ **Payroll → Configuration → Work Entry Types**
2. สร้าง entry types ดังนี้:

   | Name | Code | Sequence |
   |------|------|----------|
   | Regular Work | WORK100 | 1 |
   | Overtime | OT | 2 |
   | Sick Leave | LEAVE110 | 3 |
   | Annual Leave | LEAVE120 | 4 |

## การใช้งาน API

### 1. ทดสอบการเชื่อมต่อ

```bash
curl http://localhost:3001/api/odoo/sync-payroll
```

**Response (สำเร็จ):**
```json
{
  "status": "connected",
  "message": "Connected to Odoo successfully",
  "uid": 2
}
```

**Response (ล้มเหลว):**
```json
{
  "status": "disconnected",
  "message": "Odoo authentication failed: ..."
}
```

### 2. Sync Payroll ประจำเดือน

```bash
curl -X POST http://localhost:3001/api/odoo/sync-payroll \
  -H "Content-Type: application/json" \
  -d '{"period": "2026-06"}'
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "period": "2026-06",
    "total_employees": 10,
    "processed": 8,
    "successful": 8,
    "failed": 0
  },
  "results": [
    {
      "employee_id": "uuid-123",
      "employee_name": "John Doe",
      "payslip_id": 42,
      "success": true
    }
  ]
}
```

### 3. ดู Payslip ใน Odoo

1. ไปที่ **Payroll → Payslips → All Payslips**
2. เลือก payslip ที่ต้องการ
3. คลิก **Print** เพื่อ export PDF

## Workflow การใช้งานจริง

### สิ้นเดือน: HR ทำ Payroll

```bash
# 1. เข้าไปที่ HR App Admin Dashboard
# 2. ไปที่ Payroll section (ถ้ามี UI)
# 3. หรือรัน API โดยตรง:

curl -X POST http://localhost:3001/api/odoo/sync-payroll \
  -H "Content-Type: application/json" \
  -d '{"period": "2026-06"}'
```

### ตรวจสอบและ Approve ใน Odoo

```
1. เข้า Odoo: http://localhost:8069
2. Payroll → Payslips
3. Review payslips
4. คลิก "Confirm" แต่ละ payslip
5. คลิก "Print Payslip" เพื่อดาวน์โหลด PDF
```

## API Reference

### GET /api/odoo/sync-payroll

Test connection to Odoo.

**Response:**
```typescript
{
  status: "connected" | "disconnected" | "error"
  message: string
  uid?: number
}
```

### POST /api/odoo/sync-payroll

Sync payroll data for a given period.

**Request Body:**
```typescript
{
  period: string  // Format: YYYY-MM (e.g., "2026-06")
}
```

**Response:**
```typescript
{
  success: boolean
  summary: {
    period: string
    total_employees: number
    processed: number
    successful: number
    failed: number
  }
  results: Array<{
    employee_id: string
    employee_name: string
    payslip_id: number
    success: boolean
    error?: string
  }>
  errors?: string[]
}
```

## Environment Variables

```bash
# Odoo Connection
ODOO_URL=http://localhost:8069      # Odoo server URL
ODOO_DB=hr_payroll                  # Database name
ODOO_USERNAME=admin                 # Admin username
ODOO_PASSWORD=admin                 # Admin password
```

## การจัดการ Docker Containers

### เริ่ม Odoo
```bash
docker-compose -f docker-compose.odoo.yml up -d
```

### หยุด Odoo
```bash
docker-compose -f docker-compose.odoo.yml down
```

### ดู Logs
```bash
# Odoo logs
docker logs hr-odoo -f

# Database logs
docker logs hr-odoo-db -f
```

### ลบข้อมูลทั้งหมด (Reset)
```bash
# หยุด containers
docker-compose -f docker-compose.odoo.yml down

# ลบ volumes (ข้อมูลทั้งหมดจะหาย!)
docker volume rm hr-odoo-data hr-odoo-db

# เริ่มใหม่
docker-compose -f docker-compose.odoo.yml up -d
```

## Troubleshooting

### ปัญหา: Cannot connect to Odoo

**สาเหตุที่เป็นไปได้:**
1. Odoo container ไม่ได้รัน
2. Database ยังไม่ได้สร้าง
3. Username/Password ผิด

**วิธีแก้:**
```bash
# ตรวจสอบ containers
docker ps | grep odoo

# ถ้าไม่มี, รันใหม่
docker-compose -f docker-compose.odoo.yml up -d

# ตรวจสอบ logs
docker logs hr-odoo -f
```

### ปัญหา: Payslip calculation ผิด

**วิธีแก้:**
1. ตรวจสอบ Salary Structure ใน Odoo
2. ตรวจสอบ Work Entry Types
3. ตรวจสอบข้อมูล worked_hours และ overtime_hours ที่ส่งไป

### ปัญหา: Employee not found in Odoo

**วิธีแก้:**
- Employee จะถูก sync อัตโนมัติเมื่อ sync payroll ครั้งแรก
- ถ้ายังไม่มี ระบบจะสร้างใหม่
- ตรวจสอบใน Odoo: HR → Employees

## ข้อควรระวัง

1. **ข้อมูลต้อง Approved ก่อน:**
   - Attendance ต้อง approved
   - OT ต้อง approved
   - Leave ต้อง approved
   - ระบบจะนับเฉพาะข้อมูลที่ status = 'approved'

2. **Period Format:**
   - ต้องเป็น `YYYY-MM` เท่านั้น (เช่น `2026-06`)
   - ระบบจะรวมข้อมูลทั้งเดือนอัตโนมัติ

3. **Odoo Modules:**
   - ต้องติดตั้ง Payroll module ก่อนใช้งาน
   - ต้องสร้าง Salary Structure ให้ครบถ้วน

4. **Docker Resources:**
   - Odoo + PostgreSQL ใช้ RAM ~500MB-1GB
   - ถ้าเครื่องช้า พิจารณาปิด container เมื่อไม่ใช้

## ถอนการติดตั้ง

หากต้องการถอดถอน Odoo Integration:

```bash
# 1. หยุดและลบ containers
docker-compose -f docker-compose.odoo.yml down -v

# 2. ลบไฟล์ที่สร้าง
rm /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/docker-compose.odoo.yml
rm -rf /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app/src/lib/odoo
rm -rf /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app/src/app/api/odoo

# 3. ลบ package
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app
npm uninstall odoo-xmlrpc

# 4. ลบ environment variables จาก .env.local
# ลบบรรทัด ODOO_* ออกจาก .env.local และ .env.local.example
```

## Support & Resources

- **Odoo Documentation:** https://www.odoo.com/documentation/17.0/
- **Odoo Payroll Guide:** https://www.odoo.com/documentation/17.0/applications/hr/payroll.html
- **odoo-xmlrpc Package:** https://www.npmjs.com/package/odoo-xmlrpc

---

**สร้างเมื่อ:** 2026-06-15  
**Version:** 1.0.0  
**Status:** Experimental (ทดลองใช้)
