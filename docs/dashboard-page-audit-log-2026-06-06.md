# Dashboard Page Audit Log

Date: 2026-06-06
Scope: Dashboard page only (src/app/prd/page.tsx)
Status: In-progress

## Audit outcome
- Completed page-by-page pass for Dashboard controls and mapped each action to an operational next target.
- No button on Dashboard was left with a missing click handler after this pass.

## Changes made
1. Added contextual routing helpers in `PrdPage`.
   - `goToPageWithTab(page, tab?, note?)` to navigate page+tab and show explicit action note.
   - `openDashboardFilter()` for filter button behavior.
   - `resetDashboardState()` to reset dashboard tab and refresh data when token is present.
   - `openDashboardRunningView()` to open Publishing queue flow.
   - `openDashboardErrorDetails()` to open Review Queue Needs review.
   - `openDashboardStatAction(label)` to route each KPI stat detail action:
     - Working posts -> Publishing / Scheduled
     - Need review -> Review Queue / Needs review
     - Scheduled -> Calendar / Today
     - Agent runs -> Agents / Prompts
     - fallback -> Analytics / Performance
   - `openDashboardBoardItem(item)` to open board item action context into Review Queue.

2. Connected Dashboard action props to these handlers.
   - `onFilter` now calls `openDashboardFilter()`.
   - `onResetState` now calls `resetDashboardState()`.
   - `onOpenRunning` now calls `openDashboardRunningView()`.
   - `onViewDetails` now calls `openDashboardErrorDetails()`.
   - `onStatMoreAction` now accepts stat label and maps to specific destination.
   - `onOpenBoardItem` now receives selected board item context and routes with item id in notice.

3. Updated `DashboardView` / `BoardColumn` / `BoardCard` prop contracts.
   - `onOpenBoardItem` now passes selected `BoardItem` into handler.
   - Stat more-action now passes `stat.label` back to router decision logic.

## Notes
- Existing placeholder notices were kept where the backend destination is not fully implemented yet, but each now has a clear planned route and action target.
- No other page components were modified in this pass.

