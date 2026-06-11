@AGENTS.md

## Reading Order (อ่านตามลำดับนี้เสมอ)

1. `/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md` — company rules, agent roles, routing
2. `../orchestration/GROUND_TRUTH.md` — project scope, phase, forbidden, active task

## Project North Star

**อ่านก่อนทุก session:** `../orchestration/GROUND_TRUTH.md` — product goal, phase status, active task, ห้ามสร้างอะไร

## Current State (2026-06-11)

- Phase 1 MVP: **CLOSED** ✅
- Phase 1.1: **CLOSED** ✅
- Phase 1 refactor (P1-04): **CLOSED** ✅ — `page.tsx` เหลือ 13 บรรทัด, components ทั้งหมดอยู่ `src/features/prd/components/`
- P1-FIX-01 (workflow integrity, `764d659`) + P1-LINT-01 (`afe6af3`): **DONE** ✅
- Current: **P1-DEMO-FINAL — DEMO READY** (ดู `../orchestration/CURRENT_TASK.md`)
- ค้าง: ยืนยัน migration `20260611090000_acp_posts_status_rejected.sql` บน live + รัน E2E ซ้ำ
- Phase 2/3: **LOCKED** — ห้ามเริ่มจนกว่า user จะ approve
- Orchestration: `../orchestration/CURRENT_TASK.md`
- Demo truth: `../reports/DEMO_READINESS_REPORT.md`
