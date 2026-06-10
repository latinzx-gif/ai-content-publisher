# PRD feature module (extracted from `src/app/page.tsx`)

Incremental split of the PRD monolith. **Do not** add new logic to `page.tsx` — extend modules here.

| Path | Purpose |
|------|---------|
| `config/navigation.ts` | `navGroups`, `pageMeta`, `PageName` |
| `types/` | API, board, content, dashboard, runtime types |
| `lib/` | Pure helpers (`text`, `command-center`, `dashboard-tabs`) |
| `components/primitives/` | Small shared UI (`AlertIcon`, `PanelSection`, `Tag`, `RiskBadge`, `RiskPill`, `SectionKicker`, `SystemStateCard`) |
| `components/Sidebar.tsx` | Desktop PRD sidebar shell |
| `components/MobileSidebarDrawer.tsx` | Mobile nav drawer overlay |
| `components/TopBar.tsx` | PRD header bar (auth, search, actions) |
| `components/DashboardHeader.tsx` | Page title, breadcrumb, tab strip |
| `components/MiniPageCard.tsx` | Stat/summary card (label, value, detail) |
| `components/CalendarPost.tsx` | Calendar grid post chip (drag/reschedule) |
| `components/LegendDot.tsx` | Calendar status legend dot |
| `components/ChannelCard.tsx` | Publishing channel summary card |
| `components/PublishingStatus.tsx` | Publishing queue status pill |
| `components/StatCard.tsx` | Dashboard stat card with tone variants |
| `components/CreateStep.tsx` | Create workflow step indicator |
| `components/WorkspaceView.tsx` | Generic workspace placeholder layout |
| `components/PrdPageLoadingFallback.tsx` | Suspense loading state for PRD `/` |
| `components/SafetyConfirmationDialog.tsx` | Safety confirmation modal + `SafetyConfirmation` types |
| `components/EndToEndWorkflowSimulation.tsx` | SW-134 end-to-end workflow simulation panel |
| `components/CommandCenterHero.tsx` | Dashboard operations command hero |
| `components/WorkflowPipelineOverview.tsx` | Publishing pipeline step counts |
| `components/StatePreviewStrip.tsx` | Empty / loading / error state preview strip |
| `components/ResponsiveQaStrip.tsx` | Responsive viewport QA guard strip |
| `components/BoardCard.tsx` | Kanban board item card |
| `components/MobileBoardStack.tsx` | Mobile stacked kanban view |

Remaining view components still live in `src/app/page.tsx` until later slices.
