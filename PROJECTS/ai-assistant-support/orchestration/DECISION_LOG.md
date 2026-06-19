# DECISION_LOG.md — AI Assistant Support

Architecture decisions — newest first.

---

## 2026-06-16 — Project init

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Project folder | `PROJECTS/ai-assistant-support/` | แยกจาก hr-payroll-client ไม่ปน scope |
| App name | `support-app/` | Next.js deploy แยก Vercel |
| DB prefix | `aas_` | ไม่ชน `hr_` tables |
| LINE OA | Support OA กลาง 1 ตัว | multi-client via `aas_clients` + binding |
| Linear prefix | `[AAS]` | แยกจาก `[HRP]` dev backlog |
| Phase 1 scope | Intake + Linear + notify on Done | ยังไม่ auto-fix |
| Close-loop trigger | Linear webhook → Done | resolution จาก comment `[resolution]` |

---
