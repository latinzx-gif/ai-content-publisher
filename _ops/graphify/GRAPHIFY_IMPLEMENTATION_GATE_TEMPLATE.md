# Graphify Implementation Gate Template

**Task ID**: `[TASK-ID]`
**Date**: `[YYYY-MM-DD]`
**Status**: `[READY / NOT READY]`

## 1. Analysis Result
- **Objective**: `[Clear 1-sentence goal]`
- **Target Workflow**: `[Workflow path, e.g., UI -> API -> Executor]`
- **Related Modules**: `[Module A, Module B]`
- **Impacted Files**: `[File A, File B]`
- **UI Surfaces**: `[List]`
- **API Dependencies**: `[List]`
- **Backend Components**: `[List]`
- **Storage/DB Impact**: `[List]`

## 2. Risk Nodes Identified
- `[Node 1]`: `[Risk description]`
- `[Node 2]`: `[Risk description]`

## 3. Allowed Scope (Strict)
### Allowed Files to Edit:
- `[File 1]`
- `[File 2]`

### Forbidden Files:
- `src/app/prd/page.tsx`
- `supabase/migrations/*`
- `[Other File]`

## 4. First Safe Task
`[Smallest, most isolated change to start with]`

## 5. Verification Requirements
- [ ] `npm run lint`
- [ ] `git diff --stat` review
- [ ] `[Custom check]`

## 6. Rollback Plan
`[How to revert changes if verification fails]`

## 7. Codex Handoff Summary
`[Summary for the Stage 6 prompt]`

## 8. Summary Decision
`[Brief justification for the Ready/Not Ready decision]`
