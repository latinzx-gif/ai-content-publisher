# PRD feature module (extracted from `src/app/page.tsx`)

`src/app/page.tsx` is a **thin shell** (Suspense + `PrdPageClient`). All PRD UI and workspace logic lives here.

| Path | Purpose |
|------|---------|
| `PrdPageClient.tsx` | Client workspace router, data loading, handlers, API mapper helpers |
| `config/` | Navigation, agents, plan entitlements, display constants |
| `types/` | API, board, content, dashboard, review-queue, logs, workflow-status, content-job |
| `lib/` | Pure helpers (calendar, review-queue match, workflow IDs/stage, text, command-center, …) |
| `views/` | Major route views: Dashboard, Calendar, Publishing, Review Queue, Agents, Logs, Create Post, Settings, … |
| `views/settings/` | Settings sub-panels |
| `components/` | Shared panels, drawers, board, create workflow panels |
| `components/primitives/` | Small shared UI (`Tag`, `RiskBadge`, …) |
| `components/icons/` | PRD SVG icon components |
| `components/create/` | Create-post step panels |

## Views (`views/`)

| File | Route area |
|------|------------|
| `DashboardView.tsx` | Dashboard / command center |
| `CalendarView.tsx` | Calendar |
| `PublishingView.tsx` | Publishing queue |
| `ReviewQueueView.tsx` | Review queue |
| `AgentsView.tsx` | Agents |
| `LogsView.tsx` | Logs |
| `CreatePostView.tsx` | Create post workflow |
| `AnalyticsView.tsx` | Analytics placeholder |
| `ContentLibraryView.tsx` | Content library |
| `KnowledgeBaseView.tsx` | Knowledge base |
| `RulesBrandView.tsx` | Rules & brand |
| `SettingsView.tsx` | Settings shell |
| `settings/*` | Settings children (API tokens, integrations, readiness, …) |

## Key components

| File | Purpose |
|------|---------|
| `ContentJobDetailDrawer.tsx` | Full content-job detail drawer |
| `WorkflowStatusSyncPanel.tsx` | Cross-surface workflow sync status |
| `Sidebar.tsx`, `TopBar.tsx`, `MobileSidebarDrawer.tsx` | App chrome |
| `BoardColumn.tsx`, `BoardCard.tsx`, `MobileBoardStack.tsx` | Kanban board |
| `AgentPanel.tsx`, `AgentQueueCard.tsx` | Agent workforce UI |

Full extraction history: `orchestration/P1_04_REMAINING_PLAN.md` (HEAD-OFFICE repo).
