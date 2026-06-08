# Current App Inventory

Date: 2026-06-08
Timezone: Asia/Bangkok
Mode: Inventory only / documentation only

## 1. Project Overview

- App name: Head Office
- Current purpose: a content operations command center for creating, reviewing, approving, scheduling, and publishing legal/accounting content with agent orchestration, RAG, compliance checks, and publishing sync.
- Tech stack detected:
  - Next.js 16 App Router
  - React 19
  - TypeScript
  - Tailwind CSS 4
  - Supabase Postgres, Auth, Storage, RLS, RPC
  - OpenAI API integration through custom agent runtime
  - lucide-react, framer-motion, zustand
  - three / @react-three/fiber / @react-three/drei for 3D UI surfaces
- Main business goal inferred from the implementation: take a brief and sources, generate bilingual content, attach images/layout and compliance review, route approved work to publishing, and keep an auditable workflow trail across dashboard, review, logs, and publishing.
- Available verification commands in `package.json`:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
  - `npm run smoke:auth`
  - `npm run smoke:backend-contracts`
  - `npm run smoke:entitlements`
  - `npm run smoke:agent-execution`
  - `npm run smoke:rag-workflow`
  - `npm run smoke:deploy`
  - `npm run smoke:prod`
  - `npm run smoke:cleanup`
  - `npm run deploy:check`
  - `npm run deploy:prod:preflight`
  - `npm run daemon:agent`

## 2. Current Route / Page Inventory

### Main pages in current product scope

| Route | Purpose | Main components used | Status | Notes | Related files |
|---|---|---|---|---|---|
| `/` | Root entrypoint | `next/navigation` redirect | Working | Redirects immediately to `/login`. | `src/app/page.tsx` |
| `/login` | Auth entry page | Sign in/sign up form, password visibility toggle, local credential persistence | Working | Uses bearer-token session flow and redirects to `/prd` when a token exists. | `src/app/login/page.tsx`, `src/app/api/auth/sign-in/route.ts`, `src/app/api/auth/sign-up/route.ts`, `src/lib/server/authAccounts.ts` |
| `/prd` | Main product shell / command center | Dashboard, Calendar, Publishing, Create Post, Review Queue, Content Library, Analytics, Knowledge Base, Rules & Brand, Agents, Logs, Settings, content job drawer | Partial | Main live surface exists, but the page still mixes live APIs with fallback data and many mode-specific UI states. | `src/app/prd/page.tsx` |
 
### Removed artifacts excluded from this product inventory

| Route / file | Reason excluded | Related files |
|---|---|---|
| `editor-canvas2` | Removed from the repository working tree and excluded from the Head Office `/prd` product scope. Do not restore or reference it unless explicitly requested. | None in current working tree |

### API routes

| Route | Purpose | Status | Notes | Related files |
|---|---|---|---|---|
| `/api/auth/sign-in` | Create session from email/password | Working | Server auth route returning bearer token session payload. | `src/app/api/auth/sign-in/route.ts`, `src/lib/server/authAccounts.ts` |
| `/api/auth/sign-up` | Create auth user, profile, and starter team member | Working | Uses Supabase admin auth and starter team-member bootstrap. | `src/app/api/auth/sign-up/route.ts`, `src/lib/server/authAccounts.ts` |
| `/api/health` | Runtime/env readiness check | Working | Reports required and optional env variables only. | `src/app/api/health/route.ts` |
| `/api/runtimes` | Agent runtime discovery | Partial | Depends on local bridge/runtime environment. | `src/app/api/runtimes/route.ts`, `src/lib/agents/runtimeDiscovery.ts` |
| `/api/content/jobs` | Create/list/delete content jobs | Partial | Core Create Post backend exists; delete path is present but high risk because it cascades across related tables. | `src/app/api/content/jobs/route.ts` |
| `/api/agents` | Agent registry / agent CRUD | Partial | Implemented, but behavior depends on Supabase data and permissions. | `src/app/api/agents/route.ts` |
| `/api/agents/run` | Queue or execute a single agent run | Partial | Depends on route/task mappings and runtime availability. | `src/app/api/agents/run/route.ts` |
| `/api/agents/execute` | Reconcile backlog and execute queued runs | Partial | Core orchestrator worker path exists. | `src/app/api/agents/execute/route.ts` |
| `/api/agents/route-task` | Resolve task -> agent route | Partial | Route lookup and model selection are implemented in code. | `src/app/api/agents/route-task/route.ts`, `src/lib/server/agentQueue.ts` |
| `/api/dashboard/overview` | Dashboard aggregation data | Partial | Reads content, review, agent, log, and error state into board/cards. | `src/app/api/dashboard/overview/route.ts` |
| `/api/calendar/slots` | Schedule listing and reschedule action | Partial | Reads scheduled content and writes schedule changes. | `src/app/api/calendar/slots/route.ts` |
| `/api/knowledge/sources` | Knowledge source upload/record | Partial | Stores source metadata and upload path. | `src/app/api/knowledge/sources/route.ts` |
| `/api/knowledge/process` | Chunk/embed/index knowledge sources | Partial | Requires OpenAI embeddings and Supabase persistence. | `src/app/api/knowledge/process/route.ts` |
| `/api/rag/search` | Citation-backed search | Partial | Returns source-backed results or refusal. | `src/app/api/rag/search/route.ts` |
| `/api/rag/chat` | RAG chat with persisted query history | Partial | Similar to search, but with chat/query persistence. | `src/app/api/rag/chat/route.ts` |
| `/api/reviews` | List or create review items | Partial | Joins content translations and assets into review payloads. | `src/app/api/reviews/route.ts` |
| `/api/reviews/action` | Review action handler | Partial | Approve / reject / request changes / auto queue. | `src/app/api/reviews/action/route.ts` |
| `/api/reviews/compliance` | Compliance check builder | Partial | Creates compliance checks and findings. | `src/app/api/reviews/compliance/route.ts` |
| `/api/review/decision` | Alternate review decision endpoint | Partial | Mirrors the review action flow with decision semantics. | `src/app/api/review/decision/route.ts` |
| `/api/publishing/queue` | Publishing queue list/create/update | Partial | Strongly gated by permission and entitlements. | `src/app/api/publishing/queue/route.ts` |
| `/api/publishing/sync` | Publishing sync lifecycle | Partial | Depends on Buffer/live publishing readiness. | `src/app/api/publishing/sync/route.ts` |
| `/api/logs` | System and error logs | Partial | Reads system logs and error events. | `src/app/api/logs/route.ts` |
| `/api/logs/export` | Export logs | Partial | Feature-gated export path. | `src/app/api/logs/export/route.ts` |

## 3. Current Feature Inventory

### Authentication

- What exists now: email/password sign in and sign up, bearer-token session handling, profile bootstrap, team-member bootstrap, and a dev-only auth bypass controlled by env vars.
- What works: `/login` can create a Supabase session through server routes; auth state is stored in browser session storage; API routes can resolve an actor from the token or bypass locally.
- What is partial: no clear logout route or token refresh workflow is visible in the inspected code; dev bypass can mask real auth failures during local testing.
- What appears missing: no dedicated account management UI beyond sign in/up.
- Related files: `src/app/login/page.tsx`, `src/app/api/auth/sign-in/route.ts`, `src/app/api/auth/sign-up/route.ts`, `src/lib/server/authAccounts.ts`, `src/lib/server/apiSecurity.ts`
- Risk level: Major

### Dashboard

- What exists now: a `/prd` dashboard surface backed by `/api/dashboard/overview`, plus linked navigation into review, publishing, logs, and detail drawers.
- What works: dashboard data is pulled from content, review, agent, log, and error tables; board items can be opened into other surfaces.
- What is partial: the main page still uses fallback arrays and UI-only states in some views, so live state and mock state are mixed in one shell.
- What appears missing: no separate lightweight dashboard service; everything is concentrated in the large PRD page.
- Related files: `src/app/prd/page.tsx`, `src/app/api/dashboard/overview/route.ts`
- Risk level: Major

### Brand/Profile setup

- What exists now: Settings and Rules & Brand sections, plus profile/team-member data in the database schema.
- What works: the UI surfaces brand voice and profile/settings sections; team roles and permissions exist in Supabase.
- What is partial: no clear mutation API for brand profile editing was found in the inspected routes.
- What appears missing: a dedicated server-backed settings editor for brand voice and profile metadata.
- Related files: `src/app/prd/page.tsx`, `supabase/migrations/20260606055923_ai_content_platform_core_schema.sql`, `src/lib/server/apiSecurity.ts`
- Risk level: Major

### Content generation

- What exists now: Create Post in manual and quick modes, content job creation, source search, draft generation, and agent routing.
- What works: content jobs are created in `content_items`; source search queues the next draft step; draft generation persists translations and advances workflow metadata.
- What is partial: the orchestration is real, but some UI states still rely on local fallback data or preview packages.
- What appears missing: a dedicated content generation service outside the main PRD shell.
- Related files: `src/app/prd/page.tsx`, `src/app/api/content/jobs/route.ts`, `src/lib/agents/executeAgentRun.ts`, `src/lib/server/agentQueue.ts`
- Risk level: Major

### Draft review

- What exists now: review item creation, review list API, review drawer/detail in the PRD shell, and compliance helper routes.
- What works: review items are persisted; translations and assets are joined into review payloads; decision routes can approve/reject/request changes.
- What is partial: approval/requeue behavior depends on actor permissions, live data, and review package completeness.
- What appears missing: a separate dedicated review application; review lives inside the same PRD shell.
- Related files: `src/app/api/reviews/route.ts`, `src/app/api/reviews/action/route.ts`, `src/app/api/review/decision/route.ts`, `src/app/api/reviews/compliance/route.ts`, `src/lib/server/reviewRequeue.ts`
- Risk level: Major

### Text approval

- What exists now: generated translations are stored per language, can be surfaced inside review items, and can be moved through approval decisions.
- What works: `draft_generation` writes to `content_translations`; approval actions can mark content approved, rejected, or ready for review.
- What is partial: there is no separate text-editor workflow visible beyond the review package.
- What appears missing: rich in-app text editing and version compare tooling.
- Related files: `src/lib/agents/executeAgentRun.ts`, `src/app/api/reviews/route.ts`, `src/app/api/review/decision/route.ts`, `supabase/migrations/20260606075045_add_atomic_create_review_rpc_and_grants.sql`
- Risk level: Major

### Image generation

- What exists now: an Image & Layout Agent route, image/layout metadata, and `content_assets` rows for layout placeholders.
- What works: the workflow creates asset rows, tracks layout type, counts, and review-package metadata.
- What is partial: no direct OpenAI image generation call was found. The agent runtime supports text responses only, and `gpt-image-2` is routed as a model preference but falls back away from the current Responses runtime. The current implementation looks like layout/asset placeholder generation rather than real image production.
- What appears missing: actual image file generation and upload persistence for the main content workflow.
- Related files: `src/lib/agents/executeAgentRun.ts`, `src/lib/agents/modelPolicy.ts`, `src/lib/agents/openaiResponses.ts`, `src/lib/agents/openaiModels.ts`, `supabase/migrations/20260606065446_seed_openai_agents_and_routes.sql`
- Risk level: Critical

### Image selection

- What exists now: the create-post metadata carries `selectedAssets`, `assetLayoutPlan`, `facebookLayoutRule`, `layout`, and `imageCount`.
- What works: the workflow can store layout rules and generate multiple asset placeholders for carousel or single-image layouts.
- What is partial: there is no visible real asset picker backed by stored image files or a curated asset library in the inspected code.
- What appears missing: a true image asset selection workflow from a live library or generated image set.
- Related files: `src/app/api/content/jobs/route.ts`, `src/lib/agents/executeAgentRun.ts`, `src/app/prd/page.tsx`
- Risk level: Major

### Creative approval

- What exists now: review-package handoff, compliance checks, review item status changes, and an approve/reject/request-changes path.
- What works: the workflow can move from generated text/assets into review and then into approval decisions.
- What is partial: approval is human-led; the AI does not own final approval. The UI still mixes live and fallback states in places.
- What appears missing: a dedicated creative approval board distinct from the review queue.
- Related files: `src/app/api/reviews/action/route.ts`, `src/app/api/review/decision/route.ts`, `src/lib/reviews/compliance.ts`, `src/lib/server/reviewRequeue.ts`
- Risk level: Major

### Calendar / scheduling

- What exists now: calendar slots listing, content rescheduling, and `scheduled_at` / `scheduled` states.
- What works: content can be moved into a scheduled slot and the calendar API tracks day windows.
- What is partial: the UI uses fallback calendar data when live data is unavailable.
- What appears missing: drag-and-drop scheduling logic is not visible; the current flow is more API-driven than calendar-native.
- Related files: `src/app/api/calendar/slots/route.ts`, `src/app/prd/page.tsx`
- Risk level: Major

### Buffer / publishing

- What exists now: publishing queue, publishing sync, integration account reads, and a content-to-publish handoff.
- What works: approved content can be queued; the sync route tracks queue state and publishing jobs/errors.
- What is partial: publishing is entitlement-gated by `publishing_integrations`, and the external token/env readiness is required for live sync.
- What appears missing: a confirmed end-to-end live publish path with external provider credentials in this code review.
- Related files: `src/app/api/publishing/queue/route.ts`, `src/app/api/publishing/sync/route.ts`, `supabase/migrations/20260606061924_add_storage_and_secure_integration_tokens.sql`, `src/app/prd/page.tsx`
- Risk level: Major

### Settings / API keys

- What exists now: Settings sections for integrations, Codex connection, API tokens, release readiness, and profile.
- What works: the UI renders settings information and readiness summaries.
- What is partial: no clear server mutation endpoints for most settings were found in the inspected routes.
- What appears missing: a full settings backend for editing, saving, and validating integrations from the UI.
- Related files: `src/app/prd/page.tsx`, `src/app/api/runtimes/route.ts`, `src/app/api/health/route.ts`
- Risk level: Major

### Database / Supabase usage

- What exists now: a broad Supabase schema with content, translations, assets, review, compliance, agents, logs, publishing, calendar, RAG, plans, entitlements, integrations, and storage buckets.
- What works: the schema supports the main content lifecycle, audit trail, RLS, RPCs, and storage buckets.
- What is partial: the application depends on many coordinated tables and functions; some flows are present in SQL but not fully surfaced in UI.
- What appears missing: a thin data access layer is not present; instead, feature code talks to many tables directly.
- Related files: `supabase/migrations/*.sql`, `src/lib/supabase/server.ts`, `src/lib/server/apiSecurity.ts`, `src/lib/server/systemLog.ts`
- Risk level: Major

### Error / loading / empty states

- What exists now: fallback arrays, loading states, empty states, system/error logs, and dev-only auth bypass messaging.
- What works: the app can render with no live data, and error events are recorded in the database.
- What is partial: many surfaces still contain fallback content or mock rows, which can hide whether live data is actually present.
- What appears missing: a strict no-mock mode for all surfaces in production-like runs.
- Related files: `src/app/prd/page.tsx`, `src/app/api/logs/route.ts`, `src/app/api/health/route.ts`
- Risk level: Minor

## 4. Current Main User Flow

Start
-> Sign in or sign up on `/login`
-> Land in `/prd` dashboard
-> Open Create Post
-> Choose Manual Setup or Quick AI Mode
-> Add brief, sources, platform/language/layout settings
-> Queue source search
-> Generate draft text
-> Create image/layout package and compliance handoff
-> Enter Review Queue
-> Human reviewer approves, rejects, or requests changes
-> Approved content moves to Publishing Queue and scheduling
-> Publishing sync runs for external channels
-> Logs and Dashboard track the workflow trail

### Flow steps that are working

- Sign in / sign up routes exist and return a usable token session.
- Create Post creates a content job and queues agent runs.
- Source search, draft generation, review creation, and publishing queue persistence all exist in backend code.
- Dashboard, Review Queue, Publishing, and Logs all have data surfaces and deep-link style navigation in the PRD shell.

### Flow steps that are unclear

- Whether image generation is real or placeholder-only.
- Whether every UI fallback path is still visible in all live modes.
- Whether settings/integration pages can mutate real backend config from the UI.

### Flow steps that are broken or incomplete

- Real image production is not visible in code.
- Publishing relies on external token readiness and plan entitlements.
- Some PRD surfaces still mix live data with fallback UI state.

### Flow steps that are missing

- A dedicated image-generation persistence path with real uploaded files.
- A dedicated settings backend for editing integrations and brand settings.
- A thinner, smaller split between the command center and the workflow/detail surfaces.

## 5. Data / Status Flow

### `content_items.status`

| Status | Where it is used | Trigger | Transition completeness | Related files |
|---|---|---|---|---|
| `draft` | Content jobs, dashboard, agent backlog reconciliation | Create content job without queueing agents, or backlog reset | Complete enough to enter source search | `src/app/api/content/jobs/route.ts`, `src/app/api/agents/execute/route.ts`, `supabase/migrations/20260606055923_ai_content_platform_core_schema.sql` |
| `source_search` | Content jobs, dashboard, agent runs | Create Post queueing or source-search retry | Complete | `src/app/api/content/jobs/route.ts`, `src/lib/agents/executeAgentRun.ts` |
| `generating` | Content jobs, review requeue, backlog reconciliation | Source search success or review request changes | Complete | `src/lib/agents/executeAgentRun.ts`, `src/lib/server/reviewRequeue.ts` |
| `text_ready` | Dashboard, agent backlog reconciliation | Draft generation success | Complete | `src/lib/agents/executeAgentRun.ts`, `supabase/migrations/20260607101500_allow_text_ready_and_assets_ready_content_status.sql` |
| `assets_ready` | Dashboard, agent backlog reconciliation | Image layout finishes without review package readiness | Complete | `src/lib/agents/executeAgentRun.ts`, `supabase/migrations/20260607101500_allow_text_ready_and_assets_ready_content_status.sql` |
| `ready_for_review` | Dashboard, calendar, review action after changes request | Review request changes | Complete | `src/app/api/review/decision/route.ts`, `src/app/api/calendar/slots/route.ts` |
| `in_review` | Review Queue, dashboard, review RPCs | Review item creation or final image/compliance packaging | Complete | `src/lib/agents/executeAgentRun.ts`, `supabase/migrations/20260606075045_add_atomic_create_review_rpc_and_grants.sql` |
| `approved` | Review and publishing queues | Human approve or publish handoff | Complete | `src/app/api/reviews/action/route.ts`, `src/app/api/review/decision/route.ts`, `src/app/api/publishing/queue/route.ts` |
| `rejected` | Review actions | Human reject | Complete | `src/app/api/reviews/action/route.ts`, `src/app/api/review/decision/route.ts` |
| `scheduled` | Calendar, publishing queue, dashboard | Auto queue / schedule handoff | Complete | `src/app/api/calendar/slots/route.ts`, `src/app/api/publishing/queue/route.ts`, `supabase/migrations/20260606074344_add_atomic_review_action_rpc.sql` |
| `published` | Publishing queue, dashboard, logs | Publishing sync completion | Partial because external sync is separate | `src/app/api/publishing/sync/route.ts`, `src/app/api/dashboard/overview/route.ts` |
| `failed` | Dashboard, logs, publishing error states | Agent or publishing failure | Complete as an error state | `src/lib/agents/executeAgentRun.ts`, `src/app/api/publishing/sync/route.ts`, `src/app/api/logs/route.ts` |
| `archived` | Content lifecycle | Not clearly triggered in inspected code | Unknown/unused in visible flow | `supabase/migrations/20260606055923_ai_content_platform_core_schema.sql` |

### Other workflow tables and statuses

| Table / object | Status values | Trigger | Notes | Related files |
|---|---|---|---|---|
| `review_items` | `in_review`, `approved`, `rejected`, `changes_requested` | `create_review_item_atomic`, review decision routes | Review is the human approval gate. | `src/app/api/reviews/route.ts`, `src/app/api/reviews/action/route.ts`, `src/app/api/review/decision/route.ts`, `supabase/migrations/20260606075045_add_atomic_create_review_rpc_and_grants.sql` |
| `agent_runs` | `queued`, `running`, `succeeded`, `failed`, `cancelled` | `queueAgentRun`, `executeAgentRun` | Carries routing metadata, provider, and model selection. | `src/lib/server/agentQueue.ts`, `src/lib/agents/executeAgentRun.ts`, `src/app/api/agents/execute/route.ts` |
| `publishing_queue` | `queued`, `ready`, `syncing`, `published`, `failed`, `cancelled` | Publishing queue handoff and sync updates | External publish lifecycle. | `src/app/api/publishing/queue/route.ts`, `src/app/api/publishing/sync/route.ts` |
| `knowledge_sources` | `uploaded`, `processing`, `indexed`, `needs_review`, `failed` | Source upload and processing | Supports RAG and source-backed drafting. | `src/app/api/knowledge/sources/route.ts`, `src/app/api/knowledge/process/route.ts` |
| `compliance_checks` | `passed`, `warning`, `failed` | Compliance route and agent handoff | Used to hold legal/tax findings. | `src/app/api/reviews/compliance/route.ts`, `src/lib/reviews/compliance.ts` |
| `integration_accounts` | `connected`, `disconnected`, `expired`, `failed` | Publishing queue integration reads | Used for connector status in publishing. | `src/app/api/publishing/queue/route.ts`, `supabase/migrations/20260606055923_ai_content_platform_core_schema.sql` |

### Workflow log events worth noting

- `workflow.orchestrator_dispatch`
- `workflow.content_job_created`
- `workflow.source_search_completed`
- `workflow.source_search_blocked`
- `workflow.draft_generation_completed`
- `workflow.review_package_ready`
- `workflow.image_layout_completed`
- `workflow.content_job_deleted`
- `workflow.orchestrator_reconcile_queued`

These events carry `pipelinePhase`, `pipelinePosition`, `sourceTask`, `destinationTask`, `destinationAgent`, `destinationModel`, `assignedAt`, and the related workflow/content IDs. This is the main audit trail for "who handed work to whom, and when."

## 6. Integration Inventory

| Integration | Current implementation status | Visible env var names only | Risk or missing setup | Related files |
|---|---|---|---|---|
| OpenAI text generation | Partial but real for text agents | `OPENAI_API_KEY`, `OPENAI_AGENT_TEXT_MODEL` | Text responses are implemented; image generation is not. | `src/lib/agents/openaiResponses.ts`, `src/lib/agents/modelPolicy.ts`, `src/lib/agents/openaiModels.ts` |
| Image generation | Partial / not end-to-end | `OPENAI_API_KEY`, `OPENAI_AGENT_TEXT_MODEL` | `gpt-image-2` is configured in routing, but the current runtime is text-only and asset rows look like placeholders. | `src/lib/agents/modelPolicy.ts`, `src/lib/agents/executeAgentRun.ts`, `supabase/migrations/20260606065446_seed_openai_agents_and_routes.sql` |
| Buffer publishing | Partial | `BUFFER_ACCESS_TOKEN` | Live publish sync is gated by token readiness and entitlement checks. | `src/app/api/publishing/sync/route.ts`, `src/app/api/publishing/queue/route.ts`, `src/app/api/health/route.ts` |
| Supabase | Working | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Core app data, auth, and storage all depend on correct Supabase config. | `src/lib/supabase/server.ts`, `src/lib/server/authAccounts.ts`, `supabase/migrations/*.sql` |
| Auth | Working | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_CONTENT_DISABLE_API_AUTH`, `AI_CONTENT_DEV_PROFILE_ID`, `NEXT_PUBLIC_AI_CONTENT_DISABLE_API_AUTH` | Dev bypass can hide auth failures; production path still depends on valid bearer sessions. | `src/app/api/auth/*`, `src/lib/server/apiSecurity.ts`, `src/app/login/page.tsx` |
| Storage | Partial | Supabase storage config only | Buckets exist, but the inspected code mainly writes metadata; real asset upload/download is not clearly proven. | `supabase/migrations/20260606061924_add_storage_and_secure_integration_tokens.sql`, `src/lib/agents/executeAgentRun.ts`, `src/app/api/reviews/route.ts` |
| Mock mode | Working | No env var required; driven by fallback UI state | Many UI surfaces still have fallback arrays or mock-ready states. | `src/app/prd/page.tsx` |
| Placeholder logic | Working | No env var required | Present in image/layout, logs, dashboard, publishing, and review fallback states. | `src/app/prd/page.tsx`, `src/lib/agents/executeAgentRun.ts` |
| Agent runtime bridge | Partial | `MULTICA_AGENT_BRIDGE_URL`, `MULTICA_AGENT_BRIDGE_SECRET`, `MULTICA_DAEMON_STATE`, `MULTICA_DAEMON_ID`, `MULTICA_SERVER_URL`, `CODEX_LOCAL_BRIDGE_URL`, `CODEX_LOCAL_BRIDGE_SECRET` | Runtime discovery exists, but the exact live bridge path depends on environment. | `src/lib/agents/runtimeDiscovery.ts`, `src/app/api/runtimes/route.ts`, `src/app/api/content/jobs/route.ts` |
| Embeddings / RAG | Partial but real | `OPENAI_API_KEY`, `OPENAI_EMBEDDING_MODEL` | Knowledge indexing and citation search are implemented, but the data depends on populated sources. | `src/app/api/knowledge/process/route.ts`, `src/app/api/rag/search/route.ts`, `src/lib/rag/*` |

## 7. Quality / Risk Findings

### CRITICAL

- Real image generation is not implemented end-to-end. The agent routing chooses `gpt-image-2`, but the current runtime supports text responses only and the image/layout path writes placeholder asset rows instead of producing real image files.
- `DELETE /api/content/jobs` can remove the content item and multiple dependent tables in one request. That is a useful admin action, but it is also a high data-loss path if used casually.

### MAJOR

- `src/app/prd/page.tsx` is the entire command center and is very large. That creates maintainability risk and makes the workflow hard to reason about.
- The PRD shell still mixes live data, fallback data, and mock-ready UI states in several areas.
- Publishing is dependent on both entitlements and external token readiness, so the live publish path is not fully proven from code alone.
- Settings/brand/integration surfaces are present in UI, but clear server-side mutation routes were not found for most of them.
- The exact handoff from review into publishing is defined, but the external provider success path is still environment-dependent.

### MINOR

- The app still exposes many empty/fallback states, which can obscure whether live data has arrived.
- The command center has several parallel navigation concepts, which can make the route model feel broad.

## 8. Unknowns

- Whether a real uploaded image file path is written to `content_assets` for the main Create Post workflow is unknown from code inspection.
- Whether any external image-generation provider is wired elsewhere outside the inspected repo is unknown.
- Whether the settings pages can persist brand/integration changes is unknown because no clear mutation routes were found.
- Whether all publishing providers beyond Buffer are active in the current environment is unknown.
- Whether current live data in Supabase matches the seed schema exactly is unknown without a database read.

## 9. Recommended Next Documents

- `docs/AS_BUILT_PRD.md`
  - Capture the product as it exists now, not the original intent.
- `docs/AS_BUILT_SITEMAP.md`
  - Turn the route inventory into a clean sitemap and surface hierarchy.
- `docs/GAP_ANALYSIS.md`
  - Separate shipped behavior from partial and missing behavior.
- `docs/FINAL_TEST_MATRIX.md`
  - Define the minimum end-to-end checks for login, create post, review, publish, and logs.
- `docs/FINAL_SCOPE_LOCK.md`
  - Lock what is in scope for the next phase and what is explicitly out.
- `docs/RELEASE_CHECKLIST.md`
  - Create the final go/no-go checklist for deployment and smoke validation.

## 10. Next Prompt for As-Built PRD

Use this prompt next:

```text
Create docs/AS_BUILT_PRD.md from the current inventory.

Rules:
- Use only the existing codebase inventory from docs/CURRENT_APP_INVENTORY.md.
- Do not invent features, routes, or workflows that are not visible in code.
- Describe the product as it exists now, not as a future proposal.
- Keep the PRD structured, concrete, and implementation-aligned.

Include these sections:
1. Product summary
2. Target user and business objective
3. In-scope pages and workflows
4. Out-of-scope or partial areas
5. Content lifecycle
6. Review and approval lifecycle
7. Publishing lifecycle
8. Integrations and dependencies
9. Data model summary
10. Known risks and unknowns
11. As-built sitemap draft
12. As-built test surface summary

Use the inventory details to describe the actual flow from login -> dashboard -> create post -> review -> publishing -> logs.
Call out partial, broken, missing, and mock-backed areas explicitly.
```
