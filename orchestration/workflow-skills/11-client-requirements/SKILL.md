---
name: workflow-client-requirements
description: >-
  Extract structured requirements from a client brief, Fastwork job post, or
  conversation. Output: GROUND_TRUTH.md + Taskmaster backlog + timeline estimate.
  Use at the start of every client project.
---

# Skill: Client Requirements → Project Setup

## When to Use
- รับงาน Fastwork ใหม่
- ลูกค้าส่ง brief / requirement มา
- ก่อนเริ่ม quote หรือ timeline

---

## Step 1 — สกัด requirements จาก brief

อ่าน brief แล้วตอบให้ได้:

| คำถาม | ต้องรู้ |
|-------|---------|
| ทำอะไร | Feature หลัก 3-5 อย่าง |
| ไม่ทำอะไร | สิ่งที่อยู่นอก scope |
| Tech stack | กำหนดมาหรือ flexible |
| Deadline | วันส่งงาน |
| Deliverable | Code / System / Report / SOP |
| Integration | ต่อกับ system อื่นไหม |

ถ้าข้อมูลไม่ครบ → **ถามลูกค้าก่อน อย่า assume**

---

## Step 2 — จำแนก complexity

```
Simple  (< 3 วัน)  : landing page, form, automation เดี่ยว
Medium  (3-7 วัน)  : CRUD app, dashboard, workflow หลายขั้น
Complex (> 7 วัน)  : full system, AI integration, multiple APIs
```

---

## Step 3 — สร้าง GROUND_TRUTH.md

ใช้ template จาก COMPANY_OS.md Section 11 แล้วเติม:
- ชื่อ project + client
- Tech stack ที่ตกลงกัน
- Phase 1 = deliverable ที่ตกลงกัน
- DO NOT BUILD = สิ่งนอก scope ที่ตกลง

---

## Step 4 — สร้าง Taskmaster backlog

```bash
task-master init
task-master parse-prd --input=docs/brief.md
```

แล้วรัน skill `08-prd-to-tasks` ต่อ

---

## Step 5 — ประเมิน timeline

คิด buffer เสมอ:

```
Estimated days × 1.3 = quoted timeline

Simple:  3 วัน → quote 4 วัน
Medium:  7 วัน → quote 9-10 วัน
Complex: 14 วัน → quote 18-20 วัน
```

---

## Output ที่ต้องมีก่อนจบ

- [ ] GROUND_TRUTH.md สร้างแล้ว — scope ชัด
- [ ] Taskmaster backlog พร้อม
- [ ] Timeline estimate พร้อม quote
- [ ] รายการ "ต้องถามลูกค้าเพิ่ม" ถ้ามี
