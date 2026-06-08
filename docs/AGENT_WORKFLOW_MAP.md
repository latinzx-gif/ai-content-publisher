# AGENT WORKFLOW MAP

## 1. Current workflow summary

Primary entry is `/login`. Primary operating surface is `/prd`.

The real backend workflow is:

Create Post  
→ `POST /api/content/jobs` creates `content_items`  
→ initial agent run queued in `agent_runs` (`source_search`)  
→ orchestrator handoff queues `draft_generation`  
→ Content Strategy Agent writes `content_translations` and text package metadata  
→ Image & Layout Agent writes layout plan + placeholder asset slots, then queues `image_generation`  
→ Image generation writes real asset references into `content_assets` or explicit degraded state  
→ Legal Compliance Agent writes `compliance_checks` + `compliance_findings`  
→ orchestrator creates `review_items` only when image output and compliance are both ready  
→ human reviewer approves/rejects/requests changes  
→ approved item can enter `publishing_queue`  
→ Publishing Agent / sync routes write publishing jobs, errors, and logs  
→ `/api/logs` and `/prd` surfaces read persisted runtime events

The workflow engine is not a separate `content_tasks` table. The real queue/task layer is `agent_runs.target_type` plus status transitions on `content_items`.

## 2. Agent responsibility map

### Agent Orchestrator
- Initial entry point: [src/app/api/content/jobs/route.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/api/content/jobs/route.ts)
- Runtime handoff engine: [src/lib/agents/executeAgentRun.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/agents/executeAgentRun.ts)
- Responsibility:
  - queue first task
  - assign next task from current output
  - block invalid transitions
  - create review queue only when prerequisites are met
  - write workflow dispatch logs

### Content Strategy Agent
- Output contract/runtime: [src/lib/agents/openaiResponses.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/agents/openaiResponses.ts), [src/lib/agents/executeAgentRun.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/agents/executeAgentRun.ts)
- Responsibility:
  - grounded draft generation
  - title/body/hashtags/caption package
  - `user_facing_output` + `internal_payload`
  - persist text into `content_translations`

### Image & Layout Agent
- Layout handoff/runtime: [src/lib/agents/executeAgentRun.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/agents/executeAgentRun.ts)
- Image provider: [src/lib/agents/openaiImages.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/agents/openaiImages.ts)
- Responsibility:
  - visual brief
  - layout plan
  - placeholder slot planning only
  - real image generation task
  - persist visible asset references into `content_assets`

### Legal Compliance Agent
- Review/QC handoff: [src/lib/agents/executeAgentRun.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/agents/executeAgentRun.ts)
- Local compliance helper: [src/lib/reviews/compliance.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/reviews/compliance.ts)
- Responsibility:
  - compliance status
  - findings and fixes
  - readiness recommendation
  - approval gate before human review handoff

### Publishing Agent
- Queue gate: [src/app/api/publishing/queue/route.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/api/publishing/queue/route.ts)
- Sync/publish state: [src/app/api/publishing/sync/route.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/api/publishing/sync/route.ts)
- Responsibility:
  - prevent unapproved publish
  - enqueue publish jobs
  - record publish job attempts and failures

## 3. Task ownership matrix

| Workflow Step | Owner Agent | Input | Output | Status | Persistence | UI Surface | Current Risk |
|---|---|---|---|---|---|---|---|
| Create Post | Agent Orchestrator entry | title, brief, category, languages, platforms, metadata | `content_items` row + first `agent_runs` row | none -> `source_search` | `content_items`, `agent_runs`, `system_logs` | `/prd` Create Post | `GET /api/content/jobs` reads compatibility view, not base table directly |
| Source Search | Agent Orchestrator + source task route | brief + source policy + connectors | citations, source package, next draft task | `source_search` -> `generating` or blocked | `agent_runs.output`, `content_items.metadata`, `system_logs`, `agent_logs` | `/prd` Create Post, Agents, Logs | source/citation package still metadata-heavy |
| Draft Generation | Content Strategy Agent | source package + brief + platform/language settings | text package, localized drafts, approval summary | `generating` -> `text_ready` | `content_translations`, `content_items.metadata`, `agent_runs.output` | `/prd` Create Post, Review Queue, Content Job Detail | raw structured output still normalized late in some surfaces |
| Layout Planning | Image & Layout Agent | text package + visual brief inputs | layout summary + placeholder slots + queued image task | `text_ready` -> image pending | `content_assets` placeholder rows, `content_items.metadata`, `agent_runs.output` | `/prd` Create Post, Content Job Detail | layout preview is still mostly summary, not rich creative preview |
| Image Generation | Image & Layout Agent | visual brief + image prompt | real asset URL/data URL or degraded state | pending -> generated/partial/failed | `content_assets`, `content_items.metadata`, `agent_runs.output`, `system_logs` | `/prd` Review Queue, Content Job Detail | durable storage not complete; provider bridge still a risk |
| Compliance QC | Legal Compliance Agent | text package + citations + visual/package metadata | readiness status, recommendation, findings | text/assets ready -> ready for review or still blocked | `compliance_checks`, `compliance_findings`, `content_items.metadata`, `agent_runs.output` | `/prd` Review Queue, Content Job Detail | some readiness details still flow through metadata |
| Review Queue Creation | Agent Orchestrator | compliance complete + real image output ready | `review_items` row | -> `in_review` | `review_items`, `approval_events`, `system_logs` | `/prd` Review Queue | depends on several metadata gates |
| Human Review | Human reviewer with review RPC | review item + package | approve/reject/request changes | `in_review` -> terminal review state | `review_items`, `approval_events`, `system_logs` | `/prd` Review Queue | reject/rework path is real but UX still technical in places |
| Re-draft after changes | Agent Orchestrator + Content Strategy Agent | review rejection/change reason | new `draft_generation` run | back to `generating` | `agent_runs`, `content_items.metadata`, `system_logs` | `/prd` Review Queue, Agents, Logs | downstream metadata reset is complex |
| Publishing Queue | Publishing Agent | approved content/review + schedule/platform | `publishing_queue` row | `approved` -> `scheduled` | `publishing_queue`, `audit_events`, `system_logs` | `/prd` Publishing | gated by entitlements and connector readiness |
| Publish Sync | Publishing Agent | queue item + connector state | published/failed job record | queue status transitions | `publishing_jobs`, `publishing_errors`, `publishing_queue`, `system_logs` | `/prd` Publishing, Logs | environment dependent |

## 4. Data/output handoff map

### Create Post
- Input: UI form in [src/app/prd/page.tsx](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/prd/page.tsx)
- API: `POST /api/content/jobs`
- First persisted data:
  - `content_items`
  - `agent_runs` (`source_search`)
  - `system_logs` dispatch event

### Source package -> Text package
- Runtime source: `executeAgentRun()` handoff in [src/lib/agents/executeAgentRun.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/agents/executeAgentRun.ts)
- Output:
  - source citations and source package in `agent_runs.output`
  - draft queue assignment in `agent_runs`
  - metadata snapshot on `content_items`

### Text package -> Visual package
- Draft generation output is normalized into:
  - `user_facing_output`
  - `internal_payload`
- Persisted to:
  - `content_translations`
  - `content_items.metadata.draftGeneration`
- Then queues:
  - `image_layout`
  - `legal_review`

### Visual package -> Review package
- Layout planning writes:
  - `visualBrief`
  - `assetLayoutPlan`
  - placeholder `content_assets`
- Image generation writes:
  - real asset URLs or data URLs
  - degraded message if generation fails
- Compliance writes:
  - readiness status
  - findings
  - recommendation
- Review package is assembled by:
  - [src/app/api/reviews/route.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/api/reviews/route.ts)

### Review -> Publish
- Human decision APIs:
  - [src/app/api/reviews/action/route.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/api/reviews/action/route.ts)
  - [src/app/api/review/decision/route.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/api/review/decision/route.ts)
- Approved content can be queued through:
  - [src/app/api/publishing/queue/route.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/api/publishing/queue/route.ts)

## 5. Status transition map

### Content item status
- `draft`
- `source_search`
- `generating`
- `text_ready` and `assets_ready` are allowed by later migrations and resolved in runtime logic
- `in_review`
- `approved`
- `rejected`
- `scheduled`
- `published`
- `failed`

Primary transitions observed:
- create post: none -> `source_search`
- source search complete: `source_search` -> `generating`
- draft complete: `generating` -> `text_ready`
- image + compliance complete: -> `in_review`
- review approved: `in_review` -> `approved`
- queue for publishing: `approved` -> `scheduled`

### Agent run status
- `queued`
- `running`
- `succeeded`
- `failed`
- `cancelled`

### Review status
- `in_review`
- `approved`
- `rejected`
- `changes_requested`

### Publishing queue status
- `queued`
- `ready`
- `syncing`
- `published`
- `failed`
- `cancelled`

## 6. Backend persistence/logging map

### Core persistence
- `content_items`: main workflow record, shared metadata, top-level status
- `content_translations`: per-language content output
- `content_assets`: placeholder slots and real asset references
- `review_items`: review queue
- `compliance_checks`, `compliance_findings`: approval readiness evidence
- `agent_runs`: real task queue and structured outputs
- `agent_logs`: per-run runtime logs
- `publishing_queue`, `publishing_jobs`, `publishing_errors`: publishing pipeline
- `audit_events`, `error_events`, `system_logs`: audit/runtime persistence

### Logged events
Persisted runtime events include:
- orchestrator dispatch
- task start/success/failure
- review package ready
- compliance completion
- publishing sync status
- error/degraded state when generation fails

Primary logging implementation:
- [src/lib/server/systemLog.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/server/systemLog.ts)
- [src/lib/agents/executeAgentRun.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/lib/agents/executeAgentRun.ts)
- [src/app/api/logs/route.ts](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/api/logs/route.ts)

## 7. UI surface map

### `/prd` Create Post
- Starts workflow
- shows brief, source search, generated text preview, review package staging

### `/prd` Review Queue
- reads normalized review payload
- displays approval package, readable summaries, image state

### `/prd` Content Job Detail
- shows workflow timeline, text package, image/layout state, approval state

### `/prd` Publishing
- shows queue entries, sync status, failures

### `/prd` Agents / Logs
- shows runtime discovery, agent activity, system logs
- still more technical than review/publishing surfaces

Main renderer is still [src/app/prd/page.tsx](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/prd/page.tsx).

## 8. Raw JSON root cause map

### A. Agent prompt / contract issue
- Historically real. `openaiResponses.ts` enforced JSON-only output.
- Current state: partially fixed.
- Runtime now separates:
  - `user_facing_output`
  - `internal_payload`
- Remaining issue is less in prompt shape and more in downstream mapping.

### B. Backend/API mapper issue
- Main remaining source.
- `reviews`, `dashboard`, and `logs` had to reconstruct readable presentation from metadata-heavy rows.
- This is the main reason payload-shaped output leaked into `/prd`.

### C. Persistence/data shape issue
- `content_items.metadata` is overloaded.
- Workflow state, package summaries, visual brief, readiness, degraded state, and routing hints are mixed together.
- Data is persisted, but the shape is not cleanly separated between domain state and presentation state.

### D. UI renderer issue
- `/prd/page.tsx` is a large shell that still normalizes mixed shapes in the client.
- Some operator surfaces remain technical and closer to debug views than final product views.

### E. Mock/fallback data issue
- Several `/prd` surfaces still have fallback/mock behavior.
- This creates ambiguity between live workflow truth and UI fallback state.

## 9. Critical workflow gaps

1. `POST /api/content/jobs` writes `content_items`, while `GET /api/content/jobs` reads the compatibility view `content_jobs`. This works because of the view, but it is a boundary worth documenting.
2. There is no dedicated content task table. Task splitting relies on `agent_runs.target_type`, which is real but less explicit than a first-class workflow-task model.
3. Image output is real enough for review gating now, but durable asset storage is still incomplete.
4. Layout output is still mostly summary/brief data, not a strong visual preview path.
5. `/prd` still carries technical surfaces where readable presentation and debug data are not cleanly separated.
6. Publishing is real, but still environment- and entitlement-dependent.

## 10. Minimal fix strategy

1. Keep `agent_runs` as the task system and make its role explicit in backend/API docs and operator UI.
2. Continue moving `/prd` and API payloads toward normalized presentation models so `user_facing_output` is primary and `internal_payload` stays debug-only.
3. Finish durable storage for generated image assets and prefer stable `storage_path` + reference URLs over transient provider output.
4. Tighten operator-facing logs so each event consistently exposes:
   - agent
   - event type
   - status
   - readable message
   - related workflow id
   - degraded/error note
5. Reduce mock/fallback ambiguity on critical `/prd` workflow surfaces before further UI expansion.

## 11. Recommended next prompt for Backend + Agent Contract Fix

`BACKEND + AGENT CONTRACT FIX: DURABLE ASSET STORAGE + EXPLICIT TASK/TRACE MODEL`

Audit and fix the backend path so generated image assets are persisted with durable storage references, `agent_runs` task ownership is exposed more explicitly in API/log payloads, and `/prd` operator surfaces consume a stable workflow trace model without mixing presentation data and debug metadata.
