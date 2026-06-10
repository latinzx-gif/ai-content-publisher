# TASK PLAN: P1-04 — Remaining monolith split

## Summary

Continue verbatim extraction of `src/app/page.tsx` into `src/features/prd/` until the file is a thin router shell. **P1-04aa–ac landed in one pass** (BoardColumn, AgentPanel, DashboardLifecycleDetail + workflow libs).

## Current metrics

| Metric | Value |
|--------|-------|
| `page.tsx` | ~12,301 lines |
| Removed since P1-04 start | ~2,163 lines |
| Component modules under `features/prd/` | ~40 |

## Next execution queue (approved direction — review later)

1. **P1-04ad** — `WorkflowStatusSyncPanel`
2. **P1-04ae** — `ContentJobDetailDrawer`
3. **P1-04af** — `DashboardView` (largest remaining slice)

Full roadmap: `orchestration/P1_04_REMAINING_PLAN.md`

## Constraints

- Allowed: `page.tsx`, `features/prd/**`
- No edits: `COMPANY_OS.md`, publisher migration, migrations (separate branch)
- One integrator per batch on `page.tsx`

## Verification

```bash
cd head-office-app && npm run typecheck && npm run build
wc -l src/app/page.tsx
```
