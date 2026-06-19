# PRD — AI Assistant Support

**Version:** 1.0 | **Date:** 2026-06-16 | **Project:** `ai-assistant-support`

## Overview

ระบบรับแจ้งปัญหา/bug/ร้องเรียนจากลูกค้า B2B ผ่าน **LINE Official Account Support กลาง 1 ตัว**  
แต่ละคำร้องผูกกับ **บริษัท (client)** ที่ลูกค้าเลือก → สร้าง **Linear issue** แยกตามลูกค้า / ประเภทงาน / ระดับปัญหา  
เมื่อแก้ไขเสร็จและปิดงานใน Linear → **แจ้งกลับลูกค้าทาง LINE** อัตโนมัติ

**ไม่เกี่ยวกับ** CNV WorkHub employee HR flows (`hr-app`, `hr_complaints`, `[HRP]` tasks)

## Target Users

- **ลูกค้า B2B (contact person)** — แจ้ง bug/error/ร้องเรียน/คำถามผ่าน Support OA
- **Owner (Jakarin)** — ดูคิวใน Linear, ปิดงาน, ใส่ resolution summary
- **AI Agent (Phase 2+)** — หยิบงานจาก Linear ตาม priority (ยังไม่ทำใน Phase 1)

## Tech Stack (Phase 1)

- **App:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Database:** Supabase PostgreSQL — table prefix `aas_`
- **LINE:** Messaging API, LIFF, Flex Message, Webhook (Support OA แยกจาก WorkHub)
- **Issue tracking:** Linear API + webhook (project `AI Assistant Support`, prefix `[AAS]`)
- **Deploy:** Vercel (project แยกจาก hr-app)
- **Auth (Phase 1):** LIFF + LINE user id binding; admin ใช้ env gate หรือ magic link ภายหลัง

## Core Flow (Phase 1)

```
ลูกค้า → Support OA Rich Menu → LIFF เปิดคำร้อง
  → เลือกบริษัท + ประเภท + ระดับ (P0–P3) + รายละเอียด
  → บันทึก aas_tickets + สร้าง Linear issue
  → Flex ยืนยัน ticket code (AAS-XXXXXX)

Owner แก้ปัญหา → Linear state Done + comment [resolution] ...
  → Linear webhook → push LINE Flex สรุปการแก้ไขให้ผู้แจ้ง
```

## Phase 1 Features

### F1: Project Scaffold & Database

- สร้าง `support-app/` Next.js project พร้อม scripts build/typecheck/lint
- Supabase migrations: `aas_clients`, `aas_support_contacts`, `aas_tickets`
- Seed ตัวอย่าง client (ChineseVibe / CNV WorkHub) พร้อม `linear_project_id` placeholder
- Env template: LINE Support channel, Supabase, Linear API key

**Acceptance:** migrations apply ได้; types generate; build pass

### F2: Client Registry

- ตาราง `aas_clients`: name, slug, linear_project_name, active, optional repo_url (Phase 2)
- Admin read-only list (Phase 1 ง่ายๆ) หรือ seed-only
- ลูกค้าเลือกบริษัทจาก dropdown ใน LIFF (เฉพาะ clients ที่ active)

**Acceptance:** LIFF แสดงรายชื่อ client จาก DB

### F3: Support Contact Binding

- ครั้งแรก: กรอก **รหัสองค์กร** (org code) หรือ deep link `?client=slug`
- เก็บ `aas_support_contacts`: line_user_id ↔ client_id, display_name
- ผู้ใช้ที่ bind แล้ว default บริษัทในฟอร์มถัดไป

**Acceptance:** user bind ได้; แจ้งซ้ำไม่ต้องกรอก org code

### F4: LINE Webhook (Support OA)

- `POST /api/line/webhook` — verify signature, route events
- Rich Menu postback: เปิด LIFF ticket, ติดตามสถานะ
- ไม่เปิด free-text chat ใน Phase 1 (Rich Menu + LIFF เท่านั้น)

**Acceptance:** webhook 200; invalid signature 401

### F5: LIFF Ticket Intake

- Route `/liff/ticket` (create) และ `/liff/ticket/status` (follow-up)
- ฟิลด์: client, type (bug|error|complaint|question|feature), severity (P0–P3), subject, body, optional page_url
- สร้าง ticket code `AAS-XXXXXX`
- บันทึก `aas_tickets` status `open`

**Acceptance:** submit สำเร็จ; validation ชัดเจน

### F6: Linear Issue Creation

- หลัง submit: สร้าง Linear issue ใน project ของ client
- Title: `[AAS][{client_slug}] {severity} · {type} · {subject}`
- Labels: `client:{slug}`, `type:*`, `severity:P0|P1|P2|P3`
- Description: ticket code, reporter, body, page_url, LINE user id (internal section)
- เก็บ `linear_issue_id`, `linear_issue_url` ใน ticket

**Acceptance:** issue ปรากฏใน Linear ถูก project/labels

### F7: LINE Confirm on Submit

- Flex message ยืนยัน: ticket code, บริษัท, ประเภท, ระดับ, ข้อความ "จะแจ้งกลับเมื่อดำเนินการเสร็จ"

**Acceptance:** push ถึง line_user_id หลัง submit

### F8: Linear Webhook → Close-Loop Notify

- `POST /api/linear/webhook` — verify signature (Linear)
- เมื่อ issue → state **Done**: อ่าน comment ล่าสุดที่ขึ้นต้น `[resolution]` หรือ custom field
- อัปเดต ticket `resolved` + `resolution_summary`
- Push LINE Flex สรุปการแก้ไขให้ผู้แจ้ง
- Retry / log ถ้า LINE push fail (`notified_at` null → retry queue ง่ายๆ)

**Acceptance:** ปิด Linear → ลูกค้าได้ Flex ภายใน 1 นาที (best-effort)

### F9: Ticket Status Follow-up

- LIFF หรือ postback: กรอก `AAS-XXXXXX` → แสดงสถานะ + Linear link (internal ซ่อนจากลูกค้า)
- สถานะ: open, in_progress, waiting_client, resolved, closed

**Acceptance:** ค้นหา ticket ของตัวเองได้

### F10: Deploy & Runbook

- Vercel project `ai-assistant-support`
- `docs/RUNBOOK.md`: ตั้ง LINE OA, LIFF endpoint, Linear webhook, env vars
- Smoke checklist

**Acceptance:** production URL + webhook verified

## Ticket Types & Severity (Reference)

| Type | คำอธิบาย |
|------|----------|
| bug | พฤติกรรมผิดจากที่คาด |
| error | ระบบ error / 500 / ใช้ไม่ได้ |
| complaint | ร้องเรียนบริการ |
| question | คำถามใช้งาน |
| feature | ขอฟีเจอร์ (Phase 1 รับเรื่องได้ แต่ไม่ auto-implement) |

| Severity | คำอธิบาย |
|----------|----------|
| P0 | ระบบล่ม / กระทบทั้งองค์กร |
| P1 | feature หลักใช้ไม่ได้ |
| P2 | มี workaround |
| P3 | เล็กน้อย / cosmetic |

## Out of Scope — Phase 1 (LOCKED)

- Auto-fix code ใน repo ลูกค้า
- AI triage / priority scoring อัตโนมัติ
- Integration กับ hr-app หรือ `hr_complaints`
- Multi OA (OA ต่อลูกค้า) — ใช้ OA กลาง 1 ตัว
- Public anonymous intake ไม่มี org binding
- Mobile native app
- Payment / billing per ticket

## Phase 2 (LOCKED — ห้ามเริ่มจน user approve)

- AI triage (category, effort, auto_fixable)
- Agent queue: Cursor orchestrator หยิบ `[AAS]` จาก Linear
- Deep link จาก CNV WorkHub admin "แจ้งปัญหา"
- Admin dashboard แก้ resolution จาก web แล้ว sync Linear
- Sentry/Vercel log attach อัตโนมัติ

## Success Metrics (Phase 1)

- ลูกค้าเปิด ticket ผ่าน LINE ได้ภายใน 3 นาที
- 100% tickets มี Linear issue ที่ map client/type/severity
- 100% Done issues ส่ง LINE notify (หรือ log failure ชัดเจน)

## Dependencies

- LINE Support OA (channel id, secret, access token) — user สร้างใน LINE Console
- Supabase project (ใหม่หรือ shared HEAD-OFFICE — แนะนำ project ใหม่)
- Linear team + project `AI Assistant Support` + labels
- Vercel account
