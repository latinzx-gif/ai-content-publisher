# CURRENT TASK: T109 — Grouped Admin Sitemap & Nav (P1-NAV)

## Phase

EXECUTE

## Status

Plan approved — ready for EXECUTE (2026-06-12)

## Primary Agent

Claude Code (claude-fable-5)

## Recommended Model

claude-fable-5

## Goal

Implement grouped admin sidebar and route cleanup per **`hr-app/reports/SITEMAP_NAV_PLAN.md`** (locked decisions).

1. **3 nav groups** in sidebar (desktop + mobile):
   - **Human Management** — Dashboard, Employee, Approval, Attendance, Leave, OT, Announcements, Complaints, Documents
   - **Accounting** — Payroll
   - **Management** — Organization, Branches, Report & Analytics, Inventory, Setting

2. **Report route:** create `/admin/report` with `ReportsPanel` logic from `reports/page.tsx`; redirect `/admin/reports` and `/admin/ceo` → `/admin/report`

3. **Auth:** `adminLoginPath(ceo)` → `/admin/report`; remove CEO path prison; remove Management `employee` redirect to `/admin` only; full grouped nav for Management employee + CEO

4. **Inventory:** `/admin/inventory` placeholder (`DevelopmentEmptyState`)

5. **BM portal:** unchanged — `/admin/branch` only; `isBranchPortalPath` must not treat `/admin/branch/[slug]` as BM

## Allowed Files

```
PROJECTS/hr-payroll-client/hr-app/src/components/admin/admin-nav-types.ts
PROJECTS/hr-payroll-client/hr-app/src/components/admin/admin-nav.ts
PROJECTS/hr-payroll-client/hr-app/src/components/admin/admin-nav-icons.tsx
PROJECTS/hr-payroll-client/hr-app/src/components/admin/AdminSidebar.tsx
PROJECTS/hr-payroll-client/hr-app/src/components/admin/AdminHeader.tsx
PROJECTS/hr-payroll-client/hr-app/src/components/admin/branch-nav.ts
PROJECTS/hr-payroll-client/hr-app/src/components/admin/ceo-nav.ts
PROJECTS/hr-payroll-client/hr-app/src/lib/auth/dev-view.ts
PROJECTS/hr-payroll-client/hr-app/src/lib/auth/roles.ts
PROJECTS/hr-payroll-client/hr-app/src/app/admin/layout.tsx
PROJECTS/hr-payroll-client/hr-app/src/app/admin/report/page.tsx
PROJECTS/hr-payroll-client/hr-app/src/app/admin/reports/page.tsx
PROJECTS/hr-payroll-client/hr-app/src/app/admin/ceo/page.tsx
PROJECTS/hr-payroll-client/hr-app/src/app/admin/inventory/page.tsx
PROJECTS/hr-payroll-client/hr-app/src/features/dashboard/HrAdminDashboard.tsx
PROJECTS/hr-payroll-client/hr-app/src/features/ceo-dashboard/CeoDashboard.tsx
PROJECTS/hr-payroll-client/hr-app/_agent/TASK_PLAN.md
PROJECTS/hr-payroll-client/hr-app/_agent/CURSOR_PLAN_REQUEST.md
```

## Forbidden

- Department-based menu filtering (out of scope)
- Inventory module / DB schema
- Moving Human Management URLs (`/admin/employees`, etc.)
- BM portal restructure (`/admin/branch` hub)
- `CLIENT_HANDOFF_P5.html` unless explicitly in EXECUTE follow-up
- New npm dependencies without approval

## Acceptance Criteria

- [ ] Sidebar shows 3 section headers with 14 items per sitemap
- [ ] `/admin/report` renders Reports & Analytics (same behavior as old `/admin/reports`)
- [ ] `/admin/reports` and `/admin/ceo` redirect to `/admin/report`
- [ ] `/admin/inventory` shows placeholder (200)
- [ ] Management `employee` can navigate all admin routes (no layout redirect to `/admin` only)
- [ ] CEO uses grouped nav; login lands on `/admin/report`
- [ ] `branch_manager` still only sees Branch Dashboard nav
- [ ] `/admin/branches` → `/admin/branch/[slug]` drill still works
- [ ] `npm run build && npm run typecheck && npm run lint` pass

## Depends

- T108 APPROVED ✅

## Skills to Load

- `/Users/jakarinosk/HEAD-OFFICE/orchestration/workflow-skills/03-claude-plan/SKILL.md`
- `/Users/jakarinosk/HEAD-OFFICE/orchestration/workflow-skills/05-claude-execute/SKILL.md`
- `/Users/jakarinosk/HEAD-OFFICE/orchestration/workflow-skills/10-security-review/SKILL.md` (auth/layout changes)

## Reference

- `hr-app/reports/SITEMAP_NAV_PLAN.md`
- `PROJECTS/hr-payroll-client/GROUND_TRUTH.md`

## Subtasks (execute order)

1. P1-NAV-01 — types + `ADMIN_NAV_GROUPS`
2. P1-NAV-02 — sidebar grouped UI + badges
3. P1-NAV-03 — dev-view + `getNavItemsForRole`
4. P1-RPT-01 — `/admin/report` + redirects + internal links
5. P1-RPT-02 — auth paths (`roles.ts`, `layout.tsx`)
6. P1-INV-01 — inventory placeholder
7. P1-QA-01 — smoke (Cursor review gate; deploy after APPROVE)
