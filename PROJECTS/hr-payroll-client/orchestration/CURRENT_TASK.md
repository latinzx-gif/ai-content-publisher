# CURRENT TASK: T123 — Portal v2 Widgets + LIFF (M40)

## Phase

EXECUTE

## Status

In progress — T122 auth done (2026-06-12)

## Primary Agent

Claude Code (claude-fable-5)

## Goal

Complete M40 portal polish per **`hr-app/reports/PORTAL_ROADMAP.md`** and **`hr-app/reports/HR_DELIVERY_CLOSURE.md`** Wave 2.

1. Verify all `/portal/*` pages load real data for active `employee`
2. LIFF shortcuts complete (leave, attendance, OT, documents) on home
3. Schedule page — no misleading future-phase copy
4. Then **T124**: mobile smoke + `CLIENT_HANDOFF_FINAL.md` update

## Allowed Files

```
PROJECTS/hr-payroll-client/hr-app/src/app/portal/**
PROJECTS/hr-payroll-client/hr-app/src/features/portal/**
PROJECTS/hr-payroll-client/hr-app/reports/CLIENT_HANDOFF_FINAL.md
PROJECTS/hr-payroll-client/hr-app/reports/HR_DELIVERY_CLOSURE.md
```

## Forbidden

- Admin nav changes (T109 done)
- Inventory T134
- Payroll baht (M39)
- M41 workforce

## Acceptance Criteria

- [ ] `/portal` home shows attendance, leave, announcements for test employee
- [ ] LIFF links include OT `/liff/overtime`
- [ ] T124: handoff documents LINE + Portal dual channel
- [ ] `npm run build && typecheck && lint` pass

## Depends

- T122 ✅ (portal auth enabled)

## Skills to Load

- `05-claude-execute`
- `10-security-review` (portal-only scope)

## Queue after T124

T129 (M42 cleanup) → T134 (inventory inbound) → T110–T114 (sign-off v1.1)
