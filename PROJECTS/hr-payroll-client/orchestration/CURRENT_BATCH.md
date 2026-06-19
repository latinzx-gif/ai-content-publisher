# CURRENT BATCH — Dashboard UI

## Mode
**EXECUTED** — UI-0 + UI-1 complete

## Scope
- **HR Admin web only** — Owner / Manager
- Employee Portal deferred (CNV WorkHub on LINE only)

## Completed

### UI-0 — Theme + Dashboard home
| Task | Status |
|------|--------|
| T32 Design tokens + fonts | ✅ |
| T33 AdminShell redesign | ✅ |
| T34 Brand components | ✅ |
| T35 HR Admin dashboard 12441 | ✅ |

### UI-1 — Admin pages reskin
| Page | Status |
|------|--------|
| `/admin/employees` + profile | ✅ |
| `/admin/attendance` | ✅ |
| `/admin/leaves` | ✅ |
| `/admin/alerts` | ✅ |
| `/login` | ✅ |

**Shared:** `AdminPageShell`, `PageHeader`, `BrandTabs`, `DataTableShell`, `StatusPill`, `KpiCard`

**Dev:** `http://localhost:3001` · LINE login: ngrok HTTPS URL in `.env.local`

---

## UI-3 — HR Admin Dashboard (12441) ✅
| Item | Status |
|------|--------|
| KPI 6 ใบ (incl. ring present rate) | ✅ |
| Onboarding donut + new hires | ✅ |
| Doc approvals stub | ✅ |
| Attendance exceptions + HR alerts | ✅ |
| Compliance + announcements stub | ✅ |
| Quick Actions 3×3 icons | ✅ |
| Sidebar promo card + mascot | ✅ |
| Charts row (7-day + pending leave) | ✅ |

## Next (optional)
- T14: Employee profile complete (schema fields + UI)
- Owner / Branch dashboards — Phase UI-3b
- Employee Portal (`/portal`) — deferred
- Payroll / Schedule / OT modules — Phase 2+

---
*Updated: 2026-06-11*
