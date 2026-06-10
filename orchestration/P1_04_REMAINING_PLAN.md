# P1-04 Remaining Plan — `page.tsx` → `features/prd/`

**Updated:** 2026-06-10  
**Current:** `page.tsx` **13 lines** (thin shell); logic in `features/prd/PrdPageClient.tsx` (~3,654 lines)  
**Status:** **P1-04 exit criteria met**

---

## Done (P1-04c–ac)

| ID | Component / module |
|----|-------------------|
| c–r | Sidebar, TopBar, primitives, WorkspaceView, loading fallback |
| s–y | SafetyDialog, simulation strips, CommandCenterHero, pipeline, QA strips |
| z–aa | BoardCard, MobileBoardStack, BoardColumn |
| ab | AgentPanel, AgentQueueCard, `config/agents`, `lib/datetime` |
| ac | DashboardLifecycleDetail, `config/dashboard-lifecycle`, `lib/workflow-ids`, `lib/workflow-stage` |

---

## Phase A — Dashboard shell (next 4–6 `next` runs)

| ID | Extract | ~lines saved | Notes |
|----|---------|--------------|-------|
| **P1-04ad** | `WorkflowStatusSyncPanel` | ~70 | Used in ContentJobDetailDrawer |
| **P1-04ae** | `ContentJobDetailDrawer` | ~350 | Large; keep lifecycle grid inline or shared primitive later |
| **P1-04af** | `DashboardView` | ~1,100 | Biggest win; leave in page until board helpers moved |
| **P1-04ag** | `DashboardView` helpers → `lib/dashboard-board.ts` | ~200 | `mapDashboardPayload`, board sync helpers |

**Goal:** Dashboard route composes from `features/prd/views/DashboardView.tsx` + existing components.

---

## Phase B — Major views (one view per batch)

| ID | View | Est. lines | Priority |
|----|------|------------|----------|
| P1-04ba | `CalendarView` | ~580 | High (self-contained) |
| P1-04bb | `PublishingView` | ~220 | High |
| P1-04bc | `ReviewQueueView` | ~460 | High |
| P1-04bd | `CreatePostView` | ~430 | Medium |
| P1-04be | `LogsView` | ~200 | Medium |
| P1-04bf | `AgentsView` | ~220 | Medium |
| P1-04bg | `SettingsView` + children | ~1,200 | Low (many sub-panels) |
| P1-04bh | `AnalyticsView`, `ContentLibraryView`, `KnowledgeBaseView` | ~400 each | Low |

**Goal:** `page.tsx` = `PrdPageClient` router + data hooks only (~2–3k lines target).

---

## Phase C — `PrdPageClient` slim-down

| ID | Work |
|----|------|
| P1-04ca | Move pure mappers (`mapCalendarPayload`, `mapReviewPayload`, …) → `features/prd/lib/api-mappers/` |
| P1-04cb | Move `PrdPageClient` state + handlers → `features/prd/hooks/usePrdWorkspace.ts` |
| P1-04cc | `page.tsx` thin shell: default export + Suspense only |

---

## Suggested batch commands

```text
next batch 3   → ad + ae + one small primitive
next           → single slice when reviewing PR
```

**Parallel safety:** Only one agent edits `page.tsx` per batch. New files can be created in parallel; integrate in one pass.

---

## Exit criteria (P1-04 complete)

- [x] `page.tsx` ≤ **3,000** lines (**13** lines)
- [x] `npm run typecheck` + `npm run build` clean
- [x] `features/prd/README.md` lists all views/components
- [x] No behavior change (verbatim moves)

---

## Blocked (user)

| ID | Task | Blocker |
|----|------|---------|
| P1-E2E-02 | Authenticated Playwright | `playwright/.auth/publisher.json` |
| P1-BUFFER-01 | Live Buffer publish | `BUFFER_ACCESS_TOKEN` |
