# Graphify Implementation Gate

**Task ID**: `TASK-002`
**Date**: `2026-06-08`
**Status**: `READY`

## 1. Analysis Result
- **UI Surfaces**: `/prd` Dashboard Board.
- **API Dependencies**: `/api/dashboard/overview/route.ts`.
- **Backend Components**: `prdPresentation.ts`, `workflowTrace.ts`.
- **Storage/DB Impact**: None.

## 2. Risk Nodes Identified
- `src/app/prd/page.tsx`: **MONOLITH**. Contains local state sync logic (`replaceDashboardColumnItem`) that must match the API mapping.
- `src/app/api/dashboard/overview/route.ts`: **MAPPING CORE**. Changing the status-to-bucket logic affects card placement globally.

## 3. Allowed Scope (Strict)
### Allowed Files to Edit:
- `src/app/api/dashboard/overview/route.ts`
- `src/app/prd/page.tsx` (Surgical edits to sync logic only)

### Forbidden Files:
- `src/lib/agents/executeAgentRun.ts`
- `src/lib/server/workflowTrace.ts`
- `supabase/migrations/*`

## 4. Verification Requirements
- [x] `npm run lint`
- [x] `git diff --stat` review
- [x] Manual verification of card placement on `/prd`.

## 5. Summary Decision
The task is a necessary alignment of the UI columns with the real Agent Workflow Map. It does not introduce new backend logic or schema changes. Proceeding to implementation.
