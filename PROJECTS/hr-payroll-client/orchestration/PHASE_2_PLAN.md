# Phase 2 Plan — CNV WorkHub

**Status:** 🔄 IN PROGRESS — T31 kickoff 2026-06-11 (orchestration + Linear ready)  
**Date:** 2026-06-11  
**PRD ref:** `docs/PRD.md` § Support Features — F7, F8, F9  
**Production base:** https://hr-app-two-iota.vercel.app

---

## Goal

ส่งมอบ **Support Features** ที่ Rich Menu มีปุ่มอยู่แล้วแต่ยังเป็น guide stub:

| Feature | PRD | Rich Menu |
|---------|-----|-----------|
| F7 Document Request | ขอเอกสาร + HR ออกเอกสาร + ติดตามสถานะ | เอกสาร |
| F8 Complaint | ร้องเรียน (ระบุ/ไม่ระบุตัวตน) + HR ตอบกลับ | ร้องเรียน |
| F9 Announcements | HR สร้างประกาศ → Flex push กลุ่มเป้าหมาย | ประกาศ |

**ยังห้าม:** payroll calc, multi-company, native app, accounting integration (GROUND_TRUTH §5)

---

## Proposed Milestones

### M7: Document Request (F7) — ~2 weeks

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T31 | Schema `hr_document_requests` + RLS + Storage bucket | Claude Code | migration |
| T32 | LIFF / LINE flow — เลือกประเภทเอกสาร, เหตุผล, ติดตามสถานะ | Claude Code | LIFF page + webhook |
| T33 | Web `/admin/documents` — queue, approve, upload ไฟล์, ส่ง LINE | Codex | admin UI |
| T34 | Flex templates — ยืนยันคำขอ, แจ้งพร้อมดาวน์โหลด/รับที่ HR | Codex | flex |

**Acceptance:** พนักงานขอหนังสือรับรองผ่าน LINE → HR ออกเอกสาร → พนักงานได้ notify + สถานะ done

---

### M8: Complaint / Whistleblowing (F8) — ~1.5 weeks

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T35 | Schema `hr_complaints` (anonymous flag, thread, status) + RLS | Claude Code | migration |
| T36 | LINE flow — ยื่นเรื่อง (ระบุ/ไม่ระบุตัวตน), รับ ticket id | Claude Code | webhook + flex |
| T37 | Web `/admin/complaints` (ใหม่) — รายการ, ตอบกลับ, ปิดเรื่อง | Codex | admin UI |
| T38 | Notify employee เมื่อ HR ตอบ (ถ้าไม่ anonymous) | Claude Code | push/flex |

**Acceptance:** ยื่นร้องเรียนผ่าน LINE → HR เห็นใน web → ตอบกลับ → employee รับแจ้ง (non-anonymous)

---

### M9: HR Announcements (F9) — ~1.5 weeks

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T39 | Schema `hr_announcements` + target (all/dept/role) | Claude Code | migration |
| T40 | Web compose — หัวข้อ, body, กลุ่มเป้าหมาย, schedule | Codex | `/admin/announcements` |
| T41 | Broadcast job — Flex Message batch push + rate limit | Claude Code | API route หรือ edge fn |
| T42 | Employee view ใน LINE — ประกาศล่าสุด (postback หรือ LIFF list) | Claude Code | LINE handler |

**Acceptance:** HR สร้างประกาศ → ส่งถึงพนักงานที่เลือก → แสดงใน LINE

---

### M10: Phase 2 Hardening — ~1 week

| ID | Task | Agent | Deliverables |
|----|------|-------|--------------|
| T43 | Security review Phase 2 (RLS ใหม่, anonymous complaint) | Claude Code Opus | `SECURITY_REVIEW_P2.md` |
| T44 | E2E 3 flows (document, complaint, announcement) | Claude Code | e2e scripts |
| T45 | Update demo script + delivery audit P2 | Cursor | reports |

**Total Phase 2:** 15 tasks (T31–T45) / ~6 weeks

---

## Technical Notes

- **Reuse:** Rich Menu handlers มี stub แล้ว (`document`, `complaint`, `announcement` actions) — แทนที่ guide ด้วย real flow  
- **LIFF:** อาจใช้ LIFF เดียวกับ leave pattern หรือ postback + multi-step conversation  
- **Storage:** เอกสาร PDF ใน Supabase Storage bucket `hr-documents` (private, signed URL)  
- **Anonymous complaints:** ไม่เก็บ `employee_id` เมื่อ anonymous; ใช้ one-way hash ticket สำหรับ employee ติดตาม  
- **Announcements rate limit:** LINE multicast 500/user batch — queue ถ้าพนักงาน >500

---

## Dependency Order

```
T31 → T32 → T33 → T34 (F7)
T35 → T36 → T37 → T38 (F8)     — ขนาน F7 ได้หลัง T31 pattern ชัด
T39 → T40 → T41 → T42 (F9)     — หลัง F7/F8 หรือขนานท้าย F7
T43 → T44 → T45 (hardening)
```

---

## First Task to Dispatch

**T31 — Document Request schema**  
Agent: Claude Code  
Skills: `10-security-review` (RLS design), Supabase skill  
Phase: PLAN → EXECUTE

```bash
# เมื่อพร้อมเริ่ม
task-master add-task ...   # หรือ parse PRD Phase 2
# Cursor: set CURRENT_TASK.md → T31, dispatch skill 03-claude-plan
```

---

## GROUND_TRUTH Updates Required

- §3: M1–M6 CLOSED; Phase 2 → **IN PROGRESS**  
- §5: ลบข้อห้าม F7–F9 (unlock)  
- §4 Active Task: T31 (เมื่อ user สั่ง `next task`)

---

*Orchestrator: Cursor — 2026-06-11*
