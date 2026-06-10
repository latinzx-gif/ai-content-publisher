# Workflow Skills — HEAD-OFFICE

Skills สำหรับแต่ละขั้นตอนการทำงาน Cursor + Codex + Claude Code

---

## Core Loop

```
[NEW PROJECT]          01-project-init
[SET TASK]             02-cursor-set-task   ← ระบุ skills ที่ต้องใช้ทุกครั้ง
[PLAN]                 03-claude-plan
[APPROVE PLAN]         04-cursor-review-plan
[EXECUTE]              05-claude-execute
[REVIEW TASK]          06-cursor-review-task
[DELIVERY]             07-delivery-audit    ← claude-opus-4-8
```

---

## Skill Routing — Cursor ใช้เลือกเพิ่ม

| เงื่อนไข | Skill |
|---------|-------|
| เริ่ม project ใหม่ | `01` + `08-prd-to-tasks` |
| งาน client / Fastwork | `11-client-requirements` + `08-prd-to-tasks` |
| task goal มี bug/fix/error/พัง | `09-debug-session` |
| task แตะ schema/table/RLS | `12-supabase-migration` |
| task แตะ auth/token/security | `10-security-review` |
| ก่อน deploy production | `14-deployment-checklist` + `10-security-review` |
| production พัง/ล่ม/down | `13-incident-playbook` |
| ก่อน demo ลูกค้า | `07-delivery-audit` + `10-security-review` |

---

## Full Skill List

| # | Skill | ใช้เมื่อ | Model |
|---|-------|---------|-------|
| 01 | project-init | เริ่ม project ใหม่ | fable-5 |
| 02 | cursor-set-task | Cursor set task ทุกครั้ง | — |
| 03 | claude-plan | PLAN phase (บังคับ) | fable-5 |
| 04 | cursor-review-plan | Cursor approve plan | — |
| 05 | claude-execute | EXECUTE phase (บังคับ) | fable-5 |
| 06 | cursor-review-task | Cursor review + approve | — |
| 07 | delivery-audit | Pre-demo audit | **opus-4-8** |
| 08 | prd-to-tasks | PRD → Taskmaster backlog | fable-5 |
| 09 | debug-session | Bug / fix / error | fable-5 |
| 10 | security-review | Pre-production security | **opus-4-8** |
| 11 | client-requirements | Fastwork client brief | fable-5 |
| 12 | supabase-migration | Schema / RLS / migration | fable-5 |
| 13 | incident-playbook | Production พัง/ล่ม | **opus-4-8** |
| 14 | deployment-checklist | ก่อน push production | fable-5 |

---

## กฎเหล็ก

- Claude Code ไม่ self-approve ไม่ start task ถัดไปเอง
- Cursor ไม่แตะ source code
- ทุก task: PLAN → APPROVE → EXECUTE → REVIEW
- Codex ต้องรับ context จาก Cursor ทุกครั้ง (ดู CODEX_DISPATCH.md)

---

## Taskmaster Quick Commands

```bash
task-master init
task-master parse-prd --input=docs/PRD.md
task-master list
task-master next
task-master set-status --id=<id> --status=<in-progress|done|blocked>
task-master expand --id=<id>
```
