# PRD — LINE OA HR & Payroll Management Platform

**Version:** 1.0 | **Date:** 2026-06-08 | **Source:** head-office-app.vercel.app

## Overview
ระบบบริหารจัดการ HR ผ่าน LINE Official Account — พนักงานทำธุรกรรมด้านบุคลากรผ่าน LINE
HR/ผู้บริหารจัดการข้อมูลผ่าน Web Admin Dashboard

## Target Users
- **พนักงาน** — ใช้ LINE OA (เช็คอิน, ลา, ขอเอกสาร, ร้องเรียน)
- **HR / Admin** — ใช้ Web Dashboard (อนุมัติ, จัดการ, ดูรายงาน)
- **ผู้บริหาร** — ดู Dashboard ภาพรวม

## Tech Stack
- Frontend (Admin): Next.js 16, shadcn/ui, Tailwind CSS
- Backend: Next.js API Routes
- Database: Supabase (PostgreSQL + Storage)
- LINE: Messaging API, LIFF, Flex Message, Webhook, Rich Menu
- Auth: LINE Login + Role-based (พนักงาน/HR/Admin)
- Geo: LINE Location Picker / GPS
- Cron: Supabase Edge Functions (Probation/Visa reminders)
- Deploy: Vercel

## Core Features — Phase 1 (P1)

### F1: System Dashboard
- Overview cards: พนักงานทั้งหมด, เช็คอินแล้ว/ยัง, ลา/ขาด/สาย, คำร้องรอดำเนิน
- การแจ้งเตือนด่วน: ทดลองงานใกล้ครบ, วีซ่าใกล้หมด
- กราฟ: เข้างานรายวัน/สัปดาห์/เดือน, สัดส่วนประเภทลา, อัตราการเข้างาน %

### F2: Employee Data Dashboard
- ตารางรายชื่อพนักงาน — ค้นหา กรอง เรียงลำดับได้
- Profile รายบุคคล: ข้อมูลส่วนตัว, สัญญาจ้าง, เงินเดือน, วีซ่า, ทดลองงาน
- แจ้งเตือน: ทดลองงานใกล้ครบ, วีซ่าใกล้หมด, สัญญาจ้างใกล้สิ้นสุด

### F3: Check-in / Check-out (LINE OA)
- พนักงานเช็คอิน-เช็คเอาท์ผ่าน LINE Rich Menu
- บันทึก Timestamp + Geo Location
- รองรับ QR Code scan
- เช็คสาย: แจ้งเตือนถ้าเกินเวลากำหนด
- Push Notification เช้า (ถ้ายังไม่เช็คอิน)
- สรุปชั่วโมงทำงานรายวัน

### F4: Leave Management
- ขอลางานผ่าน LINE (เลือกประเภท, วันที่, เหตุผล, แนบไฟล์)
- แสดงยอดวันลาคงเหลือก่อนส่ง
- HR อนุมัติ/ไม่อนุมัติผ่าน Web Dashboard
- LINE ส่งผลการอนุมัติกลับหาพนักงาน
- ปฏิทินวันลา, รายงานสถิติ, ยอดวันลาคงเหลือ

### F5: Probation & Visa Alerts
- แจ้งเตือนทดลองงาน: 30/14/7/1 วันก่อนครบ (ถึง HR + พนักงาน)
- แจ้งเตือนวีซ่า/Work Permit: 60/30/14/7/1 วันก่อนหมด
- HR บันทึกผลทดลองงาน / อัปเดตสถานะวีซ่าหลังต่อ

### F6: Attendance Summary
- สรุปการเข้างานรายวันส่งพนักงานทาง LINE ตอนเย็น
- สรุปรายสัปดาห์ / รายเดือน
- สรุปภาพรวมส่ง HR ทาง LINE Group

## Support Features — Phase 2 (P2)

### F7: Document Request
- ขอเอกสารผ่าน LINE (หนังสือรับรอง, สลิปเงินเดือน, ฯลฯ)
- HR ดำเนินการออกเอกสาร
- ติดตามสถานะทาง LINE

### F8: Complaint / Whistleblowing
- แจ้งเรื่องร้องเรียนผ่าน LINE (ระบุ/ไม่ระบุตัวตน)
- HR จัดการและตอบกลับผ่าน Web Dashboard

### F9: HR Announcements
- HR สร้างประกาศผ่าน Web → ส่ง Flex Message ถึงพนักงาน LINE
- กำหนดกลุ่มเป้าหมาย, กำหนดเวลาส่ง

## Out of Scope (Phase 2+)
- Payroll calculation / slip generation
- Multi-company / multi-branch
- Advanced analytics / BI
- Mobile app (native)
- Integration กับ accounting software
