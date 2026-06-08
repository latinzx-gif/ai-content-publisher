# Graphify Implementation Gate

**Task ID**: `TASK-002`
**Date**: `2026-06-08`
**Status**: `READY`

## 1. Analysis Result
- **Objective**: Refine the dashboard board mapping to accurately reflect the agent workflow stages using the `taskTrace` logic from the backend.
- **Target Workflow**:
  UI / PRD surface
  → dashboard overview / presentation data (`/api/dashboard/overview`)
  → content pipeline status display (Board Columns)
  → review / action visibility
- **Related Modules**:
  - [[_COMMUNITY_Dashboard and Sidebar UI|Dashboard and Sidebar UI]]
  - [[_COMMUNITY_Workflow and Review Queue|Workflow and Review Queue]]
  - [[_COMMUNITY_Dashboard Filtering and Sync|Dashboard Filtering and Sync]]
  - [[_COMMUNITY_Dashboard View and Counts|Dashboard View and Counts]]
  - [[_COMMUNITY_Product Presentation Builder|Product Presentation Builder]]
- **Impacted Areas**:
  - Dashboard API mapping logic
  - Frontend local state synchronization
  - Task trace visualization

## 2. Risk Nodes Identified
- `src/app/prd/page.tsx`: **MONOLITH**. Contains local state sync logic (`replaceDashboardColumnItem`) that must match the API mapping. High regression risk.
- `src/app/api/dashboard/overview/route.ts`: **MAPPING CORE**. Changing the status-to-bucket logic affects card placement globally.
- `prdPresentation.ts`: **PRESENTATION LOGIC**. Shared normalization logic for multiple surfaces.

## 3. Allowed Scope (Strict)
### Allowed Files to Edit:
- `src/app/api/dashboard/overview/route.ts` (Candidate for bucket mapping refinement)
- `src/app/prd/page.tsx` (Candidate for surgical edits to `replaceDashboardColumnItem` and sync logic ONLY)

### Forbidden Files:
- `src/lib/agents/executeAgentRun.ts` (Workflow engine)
- `src/lib/server/workflowTrace.ts` (Trace reconstruction)
- `supabase/migrations/*` (Database schema)
- Unrelated API routes
- Unrelated lib files
- Generated Graphify output (`graph.json`, `graph.html`, etc.)
- Graphify governance templates in `_ops/graphify/`

## 4. First Safe Task
Refine the `boardBuckets` logic in `src/app/api/dashboard/overview/route.ts` to move `text_ready` and `assets_ready` items from 'Todo' to 'In Progress'.

## 5. Verification Requirements
- [ ] `git diff --stat` review
- [ ] `npm run lint`
- [ ] Manual verification of card placement on the `/prd` dashboard board.
- [ ] Verify that approving a review item correctly moves the card according to new sync rules.

## 6. Rollback Plan
Run `git checkout src/app/api/dashboard/overview/route.ts src/app/prd/page.tsx` to restore the previous mapping state.

## 7. Codex Handoff Summary
Align dashboard columns with real agent activity by refining the mapping of backend statuses to visual buckets.

## 8. Summary Decision
The task is a necessary alignment of the UI columns with the real Agent Workflow Map. It improves operator visibility without introducing new backend logic or schema changes.

---

### **CODEX HANDOFF PROMPT**

> **IMPLEMENTATION HANDOFF: CONTENT PIPELINE UI COLUMN ALIGNMENT (TASK-002)**
>
> **Objective**: Refine the dashboard board mapping to accurately reflect the agent workflow stages using the `taskTrace` logic from the backend.
>
> **Target Workflow**: `/prd` Dashboard UI -> `/api/dashboard/overview` -> `workflowTrace.ts` mapping.
>
> **Context**:
> Read `AGENTS.md` and `.codex/skills/README.md`.
> Use the `content-pipeline-ui-mapper` skill.
>
> **Strict Boundaries**:
> - **Allowed Files**: `src/app/api/dashboard/overview/route.ts`, `src/app/prd/page.tsx`.
> - **Forbidden Files**: `src/app/prd/page.tsx` (Broad edits), `src/lib/agents/executeAgentRun.ts`, `supabase/migrations/*`.
> - **Rules**: Do not redesign UI. Do not install packages. Keep changes minimal. No broad refactor rule.
>
> **Task List**:
> 1. In `src/app/api/dashboard/overview/route.ts`, update `boardBuckets` mapping:
>    - **In Progress**: Include `text_ready` and `assets_ready` (active agent states).
>    - **Done**: Include `approved` and `scheduled`.
>    - **Todo**: Retain `draft` (initial state) and `ready_for_review`.
> 2. In `src/app/prd/page.tsx`, update `replaceDashboardColumnItem` to align with the new column assignments.
>
> **Verification**:
> - Run `npm run lint`.
> - Provide `git diff --stat` in the final summary.
>
> **Deliverables**:
> - List of changed files
> - Risk summary

---

Gemini must stop here. Codex is required for implementation.
