# Stage 3 Agent Execution Layer Audit

Date: 2026-06-07 Asia/Bangkok

## Scope

Stage 3 focuses on turning queued `agent_runs` into real OpenAI-backed workflow execution. The required outcome is that agents can claim queued work, call OpenAI, persist outputs, hand off to the next workflow step, and write audit/system logs before the platform moves to Knowledge Base/RAG and publishing integration stages.

## Completed in this stage

### OpenAI-backed execution

- Existing `executeAgentRun()` now sends workflow context into OpenAI through the Responses API.
- Agent instructions now request structured JSON output.
- The executor parses structured JSON when available and falls back to safe text summary parsing when needed.
- Agent run output now stores:
  - provider
  - execution model
  - requested routing model
  - OpenAI response id
  - raw text
  - parsed structured output
  - routing metadata

### Runtime model fallback

- The project routes agents through OpenAI only.
- `gpt-5.1` is proven available in this environment.
- `gpt-5.1-mini` was rejected by the OpenAI API during smoke testing.
- The executor now uses `OPENAI_AGENT_TEXT_MODEL` or `gpt-5.1` as runtime fallback when a queued run requests:
  - `gpt-image-2` for text-only image/layout briefing
  - `gpt-5.1-mini`
  - `gpt-5.1-nano`
- Requested model is still preserved in logs/output so routing decisions remain auditable.

### Workflow handoff persistence

Implemented post-success handoff behavior for:

- `source_search`
  - updates `content_items.status` to `generating`
  - persists source search summary/citations in content metadata
  - writes `workflow.source_search_completed`

- `draft_generation`
  - creates/upserts `content_translations`
  - updates `content_items.status` to `ready_for_review`
  - queues `image_layout` if no pending run exists
  - queues `legal_review` or `tax_review` if no pending run exists
  - writes `workflow.draft_generation_completed`

- `image_layout`
  - creates `content_assets` placeholders
  - persists visual brief/layout/image count metadata
  - writes `workflow.image_layout_completed`

- `legal_review` / `tax_review`
  - creates `compliance_checks`
  - creates `compliance_findings`
  - creates a human `review_items` queue item when needed
  - updates `content_items.status` to `in_review`
  - writes `workflow.compliance_review_completed`

### Smoke tooling

- Added `npm run smoke:agent-execution`.
- The smoke script creates a content job, executes initial queued runs, executes handoff runs, and verifies Supabase persistence.
- Added `OPENAI_AGENT_TEXT_MODEL=gpt-5.1` to `.env.example`.
- Added `OPENAI_AGENT_TEXT_MODEL` to `/api/health` optional runtime readiness.

## Audit evidence

### Static validation

- `npx tsc --noEmit` passed.
- `npx eslint src scripts` passed with 0 errors.
- Existing warning remains:
  - `scripts/audit-mvp-production.mjs`: `failed` is assigned but never used.

### Stage smoke validation

Command:

```bash
npm run smoke:agent-execution -- http://127.0.0.1:3000
```

Result:

- `PASS create content job: 201`
- `PASS execute initial source_search: 200`
- `PASS execute initial draft_generation: 200`
- `PASS execute handoff image_layout: 200`
- `PASS execute handoff legal_review: 200`
- `PASS translations persisted: 2`
- `PASS assets persisted: 1`
- `PASS review item persisted: 1`
- `PASS system logs persisted: 3`
- `Agent execution smoke passed.`

Smoke evidence:

- `contentJobId=afbf2cf0-389d-4283-aada-f4ebcfeef0cc`

## Important notes

- Live image generation is not implemented in Stage 3. The Image & Layout Agent now creates a real OpenAI-generated visual brief and asset placeholders. Actual image generation should be handled in a later dedicated media/asset stage or during Publishing/Asset Composer hardening.
- Stage 3 intentionally respects the current `knowledge_base_required` policy. If no approved sources exist, agents can return blocked/no-source structured output instead of hallucinating content.
- The smoke still proves workflow persistence because the system records translations, assets, compliance checks, review queue items, and system logs even when the generated content requests more sources.

## Remaining gaps for later stages

- Stage 4 Knowledge Base/RAG should connect real retrieval results into `source_search`.
- Stage 4 should add citations from indexed `knowledge_chunks` instead of relying only on model reasoning.
- Stage 5 Publishing Integrations should execute the Publishing Agent against live or mock-live platform sync contracts.
- Content Job Detail should later load canonical backend details, including persisted agent output and generated artifacts.
- Production hardening should decide whether to keep `OPENAI_AGENT_TEXT_MODEL=gpt-5.1` or move to a lower-cost model that is actually enabled in the OpenAI project.

## Stage-closing decision

Stage 3 passes.

Agent execution is now real, OpenAI-backed, persistent, and auditable. The next stage can begin: Knowledge Base / RAG.
