# As-Built Product Requirements Document (PRD)

**Date:** 2026-06-08  
**Status:** 80% Implementation Baseline  
**Project:** Head Office - Content Operations Command Center

---

## 1. Product Summary
Head Office is a centralized content operations platform for legal and accounting teams. The main product surface is `/prd`, where users create source-backed content, run agent-assisted drafting, review text and visual output, stage items for publishing, and inspect workflow logs.

The product is aimed at reducing the operational overhead and quality risk of producing specialized professional content by keeping the workflow inside one authenticated command center with explicit review gates.

---

## 2. Target User
- **Primary User:** Managing partners, lawyers, accountants, and content managers in professional service firms
- **User Skill Level:** Domain experts and operators with mixed technical proficiency
- **Main Use Case:** Turn a brief or source-driven topic into platform-ready legal/accounting content with citations, image output, review gating, and publishing support

---

## 3. Current Product Goal
The realistic V1 goal is to make the `/login` -> `/prd` workflow usable for:
- content brief intake
- source-backed content generation
- image generation and layout preparation
- human review and approval
- publishing queue support
- runtime and workflow monitoring

This document does not treat marketplace, payments, multi-tenant expansion, or full campaign automation as part of V1.

---

## 4. Current Core User Flow

| Step | Status | Implementation Detail |
| :--- | :--- | :--- |
| **Login** | **Implemented** | Functional auth with bearer-token and profile bootstrap paths |
| **Dashboard / PRD Command Center** | **Partial** | Main shell exists and is usable, but still mixes live data with fallback states |
| **Create Post** | **Implemented / Partial** | Manual and Quick AI modes exist; backend persistence is real; some UI behavior is still preview-oriented |
| **Source Search / RAG** | **Implemented / Partial** | Source search and RAG routes exist; output quality depends on indexed sources |
| **Draft Generation** | **Implemented** | Content text generation persists into `content_translations` |
| **Image Generation / Layout** | **Partial** | Real asset-output path is now connected, but durable storage/provider alignment remains incomplete |
| **Review** | **Partial** | Review items are created and rendered, but some output surfaces remain payload-heavy and not fully normalized |
| **Publishing Queue** | **Partial** | Queue logic exists; external sync remains environment-dependent |
| **Logs** | **Implemented / Partial** | Logs and workflow history exist; some surfaces remain operationally technical |

---

## 5. In-Scope Pages and Workflows
- **`/login`**: primary authenticated entry
- **`/prd`**: main command center shell with these operational surfaces:
  - Dashboard
  - Calendar
  - Create Post
  - Review Queue
  - Publishing
  - Content Library
  - Analytics
  - Knowledge Base
  - Rules & Brand
  - Agents
  - Settings
  - Logs
  - Content Job Detail

Excluded from V1 main flow:
- `editor-canvas2` has been removed from the repository working tree and is not part of the `/prd` product scope. Do not restore or reference it unless explicitly requested later.

---

## 6. Current Feature Scope

### Authentication
- **Status:** Working
- **Related Files:** `src/app/login/page.tsx`, `src/lib/server/authAccounts.ts`
- **User Value:** Secure access control to the main product workflow
- **Limitation:** No clearly confirmed logout/refresh UX path in the main shell

### Dashboard
- **Status:** Partial
- **Related Files:** `src/app/prd/page.tsx`, `src/app/api/dashboard/overview/route.ts`
- **User Value:** Pipeline visibility and workflow navigation
- **Limitation:** Still blends live and fallback state on some surfaces

### Brand / Profile
- **Status:** Partial
- **Related Files:** `src/app/prd/page.tsx`
- **User Value:** Controls professional tone and rules context for generation
- **Limitation:** Persistence of user edits is not clearly proven

### Content Generation
- **Status:** Implemented / Partial
- **Related Files:** `src/app/api/content/jobs/route.ts`, `src/lib/agents/executeAgentRun.ts`
- **User Value:** Creates bilingual content drafts from user brief and source context
- **Limitation:** Create flow is real, but some preview surfaces remain UI-heavy rather than cleanly final

### Draft Review
- **Status:** Partial
- **Related Files:** `src/app/prd/page.tsx`, `src/app/api/reviews/route.ts`
- **User Value:** Shows generated text, review metadata, and readiness state
- **Limitation:** Review experience is still partly metadata-driven and visually uneven

### Text Approval
- **Status:** Partial
- **Related Files:** `src/app/api/reviews/action/route.ts`, `src/app/api/review/decision/route.ts`
- **User Value:** Human approval/rejection before publishing
- **Limitation:** Approval UX depends on readable package presentation being stable

### Image Generation
- **Status:** Partial
- **Related Files:** `src/lib/agents/executeAgentRun.ts`, `src/lib/agents/openaiImages.ts`
- **User Value:** Produces visual output for posts
- **Limitation:** Real asset-output path now exists, but output is not yet normalized into durable Supabase Storage and provider/model alignment still needs work

### Image Selection
- **Status:** Partial
- **Related Files:** `src/app/prd/page.tsx`, `src/lib/agents/executeAgentRun.ts`
- **User Value:** Lets review flow attach and inspect selected/generated images
- **Limitation:** Some surfaces still rely on labels, placeholders, or indirect asset references

### Creative Approval
- **Status:** Partial
- **Related Files:** `src/app/prd/page.tsx`, `src/app/api/reviews/route.ts`
- **User Value:** Gives reviewers a chance to confirm visual and layout readiness
- **Limitation:** Layout output is often presented as structured summary rather than a true creative preview

### Calendar / Scheduling
- **Status:** Partial
- **Related Files:** `src/app/prd/page.tsx`, `src/app/api/calendar/slots/route.ts`
- **User Value:** Scheduling view for planned publishing
- **Limitation:** Still contains fallback-heavy planning behavior

### Publishing
- **Status:** Partial
- **Related Files:** `src/app/api/publishing/queue/route.ts`, `src/app/api/publishing/sync/route.ts`
- **User Value:** Moves approved content toward external publishing
- **Limitation:** Entitlement and integration readiness still gate real publish behavior

### Logs
- **Status:** Implemented / Partial
- **Related Files:** `src/app/api/logs/route.ts`, `src/lib/server/systemLog.ts`
- **User Value:** Runtime and workflow traceability
- **Limitation:** Logs are operationally useful, but remain technical and not always normalized for non-technical users

### Settings / API Keys
- **Status:** Partial
- **Related Files:** `src/app/prd/page.tsx`, `src/app/api/health/route.ts`, `src/app/api/runtimes/route.ts`
- **User Value:** Shows readiness, runtime, and integration status
- **Limitation:** Some areas are more operational/debug-oriented than user-ready product settings

### Knowledge / RAG
- **Status:** Partial
- **Related Files:** `src/app/api/knowledge/process/route.ts`, `src/app/api/rag/search/route.ts`, `src/app/api/rag/chat/route.ts`
- **User Value:** Grounds generated content in source material
- **Limitation:** Quality depends on source ingestion and indexing state

### Agent Runtime
- **Status:** Partial
- **Related Files:** `src/app/api/agents/*`, `src/lib/agents/runtimeDiscovery.ts`, `src/lib/server/agentQueue.ts`
- **User Value:** Executes queue handoff and provider/runtime decisions
- **Limitation:** Runtime output surfaces are still somewhat technical and can expose developer-style status/payload thinking

---

## 7. User-Facing Output Requirements

V1 must not expose raw JSON as normal user-facing output.

### Content Text Output
- User should see readable post copy
- User should see caption/body text
- User should see platform-ready content by language/platform
- JSON may be stored internally, but user-facing surfaces must render readable text cards, not raw payloads

### Image Output
- User should see image preview or a clear visible asset reference
- User should not see raw provider payload as final output
- Placeholder asset rows must not be treated as final image output
- If image generation fails, the UI must show explicit degraded/error state

### Layout Image / Creative Output
- User should see a layout preview, structured visual summary, or creative card
- Raw layout JSON must not be final user-facing output
- Layout placeholders are planning artifacts, not final creative output

### Agent Output
- Agent result should be summarized into readable status, recommendation, handoff, or action
- Raw agent JSON should be hidden behind debug/dev mode only
- Runtime and approval surfaces should not require technical interpretation in normal V1 use

### Current As-Built Gap
Source inspection shows that `/prd` already maps many payloads into UI cards, but the system still contains metadata-heavy review/runtime surfaces and reported product behavior where raw or payload-shaped output can appear in user-facing flows. This is a V1 quality gap, not acceptable final behavior.

Affected or high-risk user-facing surfaces:
- Review Queue
- Content Job Detail
- Create Post preview/package surfaces
- Agent/runtime surfaces inside `/prd`
- Logs when used as workflow evidence by non-technical users

---

## 8. Out of Scope / Not Ready for V1
- Durable creative canvas/editor workflow
- Full settings mutation surface
- Advanced account management
- Marketplace/payment capabilities
- Multi-tenant enterprise workflow expansion
- restoring or integrating `editor-canvas2`

---

## 9. Content Lifecycle
1. **Job Creation** -> `content_items`
2. **Source Search / RAG**
3. **Draft Generation** -> `content_translations`
4. **Image / Layout Preparation** -> `content_assets` planning and generation handoff
5. **Real Visual Output or Explicit Degraded State**
6. **Review Queue Entry**
7. **Human Approval / Rejection**
8. **Publishing Queue**
9. **Publishing Sync / Failure / Published**

Important lifecycle rule:
- placeholder assets are allowed for slot tracking
- placeholder assets do not count as completed image output

---

## 10. Review and Approval Lifecycle
A review package currently combines:
- generated drafts
- source/citation context
- compliance findings
- image/layout status
- selected/generated assets when available

Approval must be based on readable human-facing content and asset output. Review is not complete if the reviewer is forced to inspect raw payloads or placeholder-only visual state.

---

## 11. Publishing Lifecycle
- Approved content moves into `publishing_queue`
- Sync logic exists through `/api/publishing/sync`
- External publishing depends on configured integrations and entitlements
- Degraded/failure state should remain visible when publish readiness is incomplete

---

## 12. Integrations and Dependencies
- **OpenAI:** text generation is implemented; image generation path exists but provider/storage alignment is incomplete
- **Image generation:** real asset-output path exists, but durable storage normalization remains incomplete
- **Buffer:** publishing support exists but remains environment-dependent
- **Supabase:** primary data/auth/storage/logging system
- **Auth:** bearer-token and profile bootstrap paths exist
- **Storage:** storage buckets exist, but generated image output is not yet fully normalized into durable asset storage
- **RAG / Embeddings:** implemented
- **Agent runtime bridge:** implemented in routing/discovery terms, but some output surfaces remain technical

---

## 13. Data Model Summary
- `content_items`
- `content_translations`
- `content_assets`
- `review_items`
- `publishing_queue`
- `agent_runs`
- `system_logs`
- `compliance_checks`

---

## 14. MVP Scope
V1 scope is the `/login` -> `/prd` operating flow with:
- readable content generation output
- readable image/layout output or explicit degraded state
- review based on human-readable content
- publishing queue support
- runtime/log visibility

V1 does not include advanced canvas editing, marketplace extensions, or broader platform expansion.

---

## 15. Acceptance Criteria
V1 should be considered functionally acceptable only when:
- Create Post produces readable content text output
- image generation produces a visible asset preview/reference or explicit failure state
- layout/creative output is shown as preview or structured summary, not raw JSON
- Review Queue shows readable text/image/layout output
- approval actions are based on readable content, not raw payloads
- placeholder assets do not count as completed visual output
- publishing queue state is understandable by a normal operator

---

## 16. Known Risks
- **Critical:** Raw JSON or payload-shaped output appearing in user-facing review/runtime surfaces undermines V1 usability
- **Critical:** Image output is still not normalized into durable storage
- **Major:** `/prd` still mixes live and fallback/mock-backed state
- **Major:** Publishing remains environment-dependent
- **Major:** `src/app/prd/page.tsx` concentrates too much of the product surface
- **Major:** Some agent/runtime/settings surfaces are still more technical than user-facing

---

## 17. Unknowns
- Exact current live surfaces where raw JSON is observed at runtime, beyond the reported product behavior and payload-heavy source paths
- Full durable-storage readiness for generated images
- Production alignment of `src/lib/agents/openaiImages.ts`
- Final persistence readiness of settings and rules/brand editing

---

## 18. MVP Release Readiness: NOT READY
Reasoning:
1. Raw JSON or payload-shaped output is still a reported V1 quality problem for user-facing surfaces
2. Image output path still lacks durable-storage normalization
3. `/prd` still contains fallback/mock ambiguity across critical surfaces
4. Review and approval quality still depends on making output consistently human-readable

---

## 19. Next Documents
- `docs/AS_BUILT_SITEMAP.md`
- `docs/GAP_ANALYSIS.md`
- `docs/FINAL_SCOPE_LOCK.md`
- `docs/FINAL_TEST_MATRIX.md`
- `docs/RELEASE_CHECKLIST.md`
