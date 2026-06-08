# Gap Analysis

Date: 2026-06-08  
Timezone: Asia/Bangkok  
Source documents:
- `docs/CURRENT_APP_INVENTORY.md`
- `docs/AS_BUILT_PRD.md`
- `docs/AS_BUILT_SITEMAP.md`

## 1. Product Scope Confirmation

- Main product surface: `/prd`
- Primary entry: `/login`
- Agent System is part of the product capability:
  - content text creation
  - source search / RAG support
  - image generation
  - layout / creative preparation
  - review / approval support
  - publishing support
  - logs / runtime monitoring
- `editor-canvas2`:
  - removed from the repository working tree
  - excluded from V1 main flow
  - must not be restored or referenced unless explicitly requested

## 2. V1 Goal

The realistic V1 goal is to deliver a dependable `/login` -> `/prd` operating flow where a user can:
- create a content job
- generate readable content text
- inspect real or explicitly degraded image output
- inspect layout/creative output in readable form
- approve or reject through Review Queue
- move approved content into Publishing Queue
- inspect workflow and runtime state in Logs

## 3. Gap Summary

### Critical
- Raw JSON or payload-shaped output in user-facing core flow
- Review/approval surfaces still risk exposing technical output instead of readable content
- Generated image output is not yet normalized into durable storage

### Major
- `/prd` still mixes live data and fallback/mock-backed UI state
- Publishing remains environment-dependent and entitlement-gated
- Settings and Rules & Brand lack clearly confirmed persistence
- `src/app/prd/page.tsx` carries too much product surface
- Layout/creative output is still summary-heavy rather than preview-rich
- Logs and runtime surfaces remain highly technical

### Minor
- Secondary navigation surfaces are less connected to the main flow
- Placeholder/demo-style surfaces still exist in some non-core views

### Unknown
- Exact live routes/components where raw JSON is currently appearing in runtime, beyond the reported product issue and payload-heavy source paths
- Final production alignment of image provider/model bridge

## 4. Critical Gaps

### Gap: Raw JSON or payload-shaped output appears in core user-facing flow

- User impact:
  - users cannot reliably understand or approve content if they see raw JSON, provider payloads, or developer-shaped structures instead of readable output
- Related feature:
  - Create Post
  - Review Queue
  - Content Job Detail
  - Agent/runtime status
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/reviews/route.ts`
  - `src/app/api/dashboard/overview/route.ts`
- Why it blocks V1:
  - V1 review/approval requires human-readable text, visual output, and approval state
- Suggested fix direction:
  - normalize all user-facing output into readable cards, previews, summaries, and status labels
  - keep raw payloads hidden behind debug/dev-only surfaces
- V1 or Phase 2:
  - **V1**

### Gap: Review Queue cannot depend on technical interpretation

- User impact:
  - legal/accounting reviewers should not need to infer content readiness from metadata structures, payload-shaped output, or placeholder artifacts
- Related feature:
  - Review Queue
  - Approval
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/reviews/route.ts`
- Why it blocks V1:
  - approval quality collapses if review is not based on readable text/image/layout output
- Suggested fix direction:
  - keep text/image/layout sections readable and explicit
  - replace any raw output with review cards, preview states, or clear degraded messages
- V1 or Phase 2:
  - **V1**

### Gap: Generated image output is not yet normalized into durable storage

- User impact:
  - even when the UI can render image references, long-term review and publishing confidence remains weaker without durable storage-backed asset references
- Related feature:
  - Image Generation
  - Review Queue
  - Publishing
- Related files:
  - `src/lib/agents/openaiImages.ts`
  - `src/lib/agents/executeAgentRun.ts`
  - `src/app/prd/page.tsx`
- Why it blocks V1:
  - visual output path is still incomplete from a storage/persistence standpoint
- Suggested fix direction:
  - store generated assets in durable storage and attach stable references to review/publishing flow
- V1 or Phase 2:
  - **V1**

## 5. Major Gaps

### Gap: `/prd` still mixes live and fallback/mock-backed state

- User impact:
  - users may not know whether they are seeing real workflow state or fallback output
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/dashboard/overview/route.ts`
  - `src/app/api/logs/route.ts`
  - `src/app/api/calendar/slots/route.ts`
- Suggested fix direction:
  - make fallback state explicit
  - prevent operational-looking fake readiness

### Gap: Layout/creative output is still summary-heavy

- User impact:
  - users often see visual brief / layout plan summaries instead of richer creative preview
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/reviews/route.ts`
- Suggested fix direction:
  - keep V1 simple but readable: structured creative summary card or preview block, not raw layout structures

### Gap: Agent/runtime surfaces are still developer-oriented

- User impact:
  - operators may understand queue status, but outputs and readiness language remain too technical in some panels
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/runtimes/route.ts`
  - `src/app/api/agents/*`
- Suggested fix direction:
  - convert runtime output into readable status, recommendation, and action language

### Gap: Publishing remains environment-dependent

- User impact:
  - users can reach Publishing Queue without guaranteed live sync capability
- Related files:
  - `src/app/api/publishing/queue/route.ts`
  - `src/app/api/publishing/sync/route.ts`
- Suggested fix direction:
  - make readiness/failure states explicit in UI

### Gap: Settings and Rules & Brand do not have clearly confirmed persistence

- User impact:
  - configuration can appear editable without proven save lifecycle
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/health/route.ts`
  - `src/app/api/runtimes/route.ts`
- Suggested fix direction:
  - clearly separate read-only operational context from editable configuration

## 6. Minor Gaps

### Gap: Secondary surfaces are less tied to the main flow
- Suggested polish:
  - strengthen cross-linking between workflow IDs and secondary surfaces

### Gap: Placeholder/demo output still exists in non-core surfaces
- Suggested polish:
  - label mock-backed output explicitly

## 7. Raw JSON User-Facing Output Gaps

### Critical

#### Gap: Review or approval depends on payload-shaped output instead of readable content
- User impact:
  - blocks human approval quality
- Related surface:
  - Review Queue
  - Content Job Detail
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/reviews/route.ts`
- Suggested fix direction:
  - render readable text cards, image previews, creative summaries, and clear status labels
- V1 or Phase 2:
  - **V1**

### Major

#### Gap: Agent/runtime output is readable mainly to developers
- User impact:
  - operators may struggle to interpret runtime state and next action
- Related surface:
  - Agents
  - Settings runtime checks
  - Logs
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/runtimes/route.ts`
  - `src/app/api/logs/route.ts`
- Suggested fix direction:
  - summarize runtime output into operator-friendly language and status
- V1 or Phase 2:
  - **V1**

#### Gap: Layout/image output can still require technical interpretation
- User impact:
  - users can see visual brief, selected assets, and generated-assets state, but creative/layout output is still partly metadata-driven
- Related surface:
  - Create Post package
  - Review Queue
  - Content Job Detail
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/reviews/route.ts`
- Suggested fix direction:
  - prefer preview blocks and readable summaries over raw structures
- V1 or Phase 2:
  - **V1**

### Minor

#### Gap: Debug-style JSON may be acceptable only in developer-only contexts
- User impact:
  - non-blocking if hidden from normal operators
- Related surface:
  - future dev/debug panels only
- Related files:
  - not confirmed as a distinct production UI surface from current static inspection
- Suggested fix direction:
  - isolate to debug/dev mode
- V1 or Phase 2:
  - **Phase 2 / optional cleanup**

## 8. Agent System Gaps

### Content Text Agent
- Current status:
  - functional
- Missing capability:
  - final output normalization across all user-facing surfaces
- Related files:
  - `src/lib/agents/executeAgentRun.ts`
  - `src/app/prd/page.tsx`
- V1 readiness:
  - close, but still depends on readable output consistency

### Image Generation Agent
- Current status:
  - partially fixed
- Missing capability:
  - durable storage-backed output and production-aligned provider bridge
- Related files:
  - `src/lib/agents/openaiImages.ts`
  - `src/lib/agents/executeAgentRun.ts`
- V1 readiness:
  - not fully ready

### Layout Image Agent
- Current status:
  - partial
- Missing capability:
  - richer preview/creative summary normalization
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/reviews/route.ts`
- V1 readiness:
  - partial

### Approval Agent
- Current status:
  - partial
- Missing capability:
  - fully normalized readable approval package
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/reviews/action/route.ts`
  - `src/app/api/review/decision/route.ts`
- V1 readiness:
  - conditional on readable output

### Publishing Agent
- Current status:
  - partial
- Missing capability:
  - proven live sync readiness and readable failure states
- Related files:
  - `src/app/api/publishing/queue/route.ts`
  - `src/app/api/publishing/sync/route.ts`
- V1 readiness:
  - partial

### Logs / Runtime Monitor
- Current status:
  - functional but technical
- Missing capability:
  - more operator-friendly output summaries
- Related files:
  - `src/app/prd/page.tsx`
  - `src/app/api/logs/route.ts`
  - `src/app/api/runtimes/route.ts`
- V1 readiness:
  - partial

## 9. V1 Must Fix
- Raw JSON must not be normal user-facing output in core review flow
- Content text must be rendered as readable post copy
- Image output must be rendered as preview/reference
- Layout output must be rendered as preview/creative summary
- Approval flow must use readable content, not raw payloads
- Placeholder assets must not count as completed output
- Generated image output must be normalized into durable storage or stable persisted references

## 10. Phase 2
- Advanced canvas editor
- Full creative layout editor
- Marketplace
- Payment
- Multi-tenant enterprise expansion
- Full campaign factory
- Google Drive RAG expansion
- restoring or integrating `editor-canvas2` unless explicitly requested

## 11. Fix Priority
1. Provider/storage bridge for generated image output
2. Remove raw JSON/payload-shaped output from core review/approval surfaces
3. Reduce mock/fallback ambiguity in `/prd`
4. Prove publishing readiness and degraded-state visibility

## 12. Next Fix Prompts

### Critical Fix Prompt 1
Audit and fix the provider/storage bridge so generated images are stored with durable references and appear as stable review-ready assets in `/prd`.

### Critical Fix Prompt 2
Audit `/prd` review, content job detail, and agent/runtime surfaces for any raw JSON or payload-shaped user-facing output, then replace those surfaces with readable UI summaries, previews, and explicit degraded/error states.

### Critical Fix Prompt 3
Audit all fallback/mock-backed states in the `/prd` core flow and make live, fallback, empty, and degraded states explicit so the user cannot mistake fake readiness for real workflow completion.
