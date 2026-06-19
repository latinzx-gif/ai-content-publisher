# Odoo Integration - Quick Start

> **แนวทางที่ 1:** ใช้ระบบ HR ปัจจุบัน + Odoo เป็น Payroll Engine

## 🚀 เริ่มต้นใช้งาน (5 นาที)

### 1. รัน Odoo

```bash
# ที่ project root
cd /Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client
docker-compose -f docker-compose.odoo.yml up -d
```

### 2. Setup Odoo Database

1. เปิด http://localhost:8069
2. สร้าง database: `hr_payroll`
3. Username: `admin` / Password: `admin`
4. ติดตั้ง **Payroll** module

### 3. ทดสอบการเชื่อมต่อ

```bash
curl http://localhost:3001/api/odoo/sync-payroll
```

คาดหวัง: `{"status": "connected", ...}`

### 4. Sync Payroll ทดลอง

```bash
curl -X POST http://localhost:3001/api/odoo/sync-payroll \
  -H "Content-Type: application/json" \
  -d '{"period": "2026-06"}'
```

### 5. ดูผลใน Odoo

ไปที่: http://localhost:8069 → **Payroll → Payslips**

---

## 📁 ไฟล์ที่สร้างขึ้น

```
hr-payroll-client/
├── docker-compose.odoo.yml          # Docker setup สำหรับ Odoo
├── ODOO_INTEGRATION.md              # เอกสารคู่มือฉบับเต็ม
└── hr-app/
    ├── src/
    │   ├── lib/odoo/
    │   │   └── client.ts            # Odoo API client
    │   └── app/api/odoo/
    │       └── sync-payroll/
    │           └── route.ts         # API endpoint
    └── .env.local                   # เพิ่ม ODOO_* variables
```

---

## 🔧 Commands ที่ใช้บ่อย

```bash
# เริ่ม Odoo
docker-compose -f docker-compose.odoo.yml up -d

# หยุด Odoo
docker-compose -f docker-compose.odoo.yml down

# ดู logs
docker logs hr-odoo -f

# ทดสอบ connection
curl http://localhost:3001/api/odoo/sync-payroll

# Sync payroll เดือนมิถุนายน 2026
curl -X POST http://localhost:3001/api/odoo/sync-payroll \
  -H "Content-Type: application/json" \
  -d '{"period": "2026-06"}'
```

---

## 🎯 Workflow การใช้งานจริง

**ทุกสิ้นเดือน:**

1. **พนักงาน:** เช็คอิน/เช็คเอาท์ ผ่าน LINE (ตามปกติ)
2. **Manager:** อนุมัติ attendance, OT, leave (ตามปกติ)
3. **HR:** รัน sync payroll API:
   ```bash
   curl -X POST http://localhost:3001/api/odoo/sync-payroll \
     -H "Content-Type: application/json" \
     -d '{"period": "2026-06"}'
   ```
4. **HR:** เข้า Odoo → Review & Approve payslips
5. **HR:** Print payslips เป็น PDF แจกพนักงาน

---

## ⚙️ Configuration

Environment variables ใน `hr-app/.env.local`:

```bash
ODOO_URL=http://localhost:8069
ODOO_DB=hr_payroll
ODOO_USERNAME=admin
ODOO_PASSWORD=admin
```

---

## ❌ ถ้าไม่ใช้แล้ว (ถอนการติดตั้ง)

```bash
# 1. หยุดและลบ containers
docker-compose -f docker-compose.odoo.yml down -v

# 2. ลบ package
cd hr-app && npm uninstall odoo-xmlrpc

# 3. ลบไฟล์
rm docker-compose.odoo.yml
rm ODOO_INTEGRATION.md
rm -rf hr-app/src/lib/odoo
rm -rf hr-app/src/app/api/odoo

# 4. ลบ ODOO_* จาก .env.local
```

---

## 📚 เอกสารเพิ่มเติม

อ่าน **ODOO_INTEGRATION.md** สำหรับ:
- การ setup Salary Structure
- Work Entry Types
- API Reference ฉบับเต็ม
- Troubleshooting

---

**Status:** ✅ พร้อมใช้งาน (Experimental)  
**Created:** 2026-06-15
