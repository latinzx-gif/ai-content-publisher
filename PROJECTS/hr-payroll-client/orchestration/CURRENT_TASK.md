# CURRENT TASK: None — M38 Planned (not started)

## Phase

**PLANNING** — next milestone **M38 / Phase 12** ready for kickoff

## Status

| Field | Value |
|-------|-------|
| Last closed | Batch T77–T108 + tag `hr-payroll-v1.0` |
| Post-v1.0 deployed | Register gate + OT 2-tier + **client UAT hotfixes** (`57eed46`) |
| UAT hotfix scope | Notifications, permanent delete, BM nav, sidebar hide (Perf/Recruit/Training) |
| Next milestone | **M38** — T109–T114 |
| Plan doc | `orchestration/PHASE_12_PLAN.md` |

## To start M38

1. User confirms kickoff → Cursor runs `task [T109]` or `next task`
2. First task: **T109 Docs reconciliation**
3. Parallel: ลูกค้าเริ่ม UAT checklist `CLIENT_HANDOFF_P5.md` §10

## M38 task queue

| ID | Task | Status |
|----|------|--------|
| T109 | Docs reconciliation | 📋 planned |
| T110 | E2E registration + OT 2-tier | 📋 planned |
| T111 | Security review P7 | 📋 planned |
| T112 | Client UAT fix batch | 📋 planned |
| T113 | Ops hardening | 📋 planned |
| T114 | Sign-off + tag `hr-payroll-v1.1` | 📋 planned |

## After M38 (client chooses)

- **M39** Payroll baht (T115–T120) — needs signed CR
- **M40** Portal v2 — if web dashboard for employees wanted
- **M42** Cleanup — if LINE-only permanent

## Read

- `orchestration/PHASE_12_PLAN.md`
- `MILESTONES.md`
- `hr-app/reports/CLIENT_HANDOFF_P5.md` §4.0, §4.1, §10
