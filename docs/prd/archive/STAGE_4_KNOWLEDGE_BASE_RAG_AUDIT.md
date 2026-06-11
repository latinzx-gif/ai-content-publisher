# Stage 4 Knowledge Base / RAG Audit

Date: 2026-06-07 Asia/Bangkok

## Scope

Stage 4 focuses on connecting Knowledge Base / RAG into the MVP workflow so the platform can retrieve approved sources, answer with citations, block unsafe unsupported answers, and feed cited source context into agent execution.

## Completed in this stage

### Shared RAG context

- Added `buildAgentRagContext()` as a shared RAG context builder.
- The helper runs vector search through `searchKnowledge()`.
- It builds guarded citation answers through `buildCitationAnswer()`.
- It returns:
  - original query
  - retrieval matches
  - citation answer
  - citations
  - blocked state/reason

### RAG API logging

- `POST /api/rag/search` now returns both matches and guardrail state.
- `POST /api/rag/search` now writes `workflow.rag_search` to `system_logs`.
- `POST /api/rag/chat` now writes `workflow.rag_chat` to `system_logs`.
- Blocked RAG answers are logged as open/medium severity instead of silently succeeding.

### Agent source-search integration

- `executeAgentRun()` now builds RAG context for `source_search` runs.
- RAG context is included in the OpenAI agent input.
- `source_search` handoff now persists real retrieved citation titles/scores into `content_items.metadata.sourceSearch.citations`.
- If `knowledge_base_required` is active and no citations are available, source search remains blocked/open and the content stays in `source_search`.
- If citations are available, the content moves to `generating`.

### Knowledge Base UI live RAG test

- The Knowledge Base AI Chat Bot now calls `POST /api/rag/chat` when an API bearer token is present.
- The UI shows live answer text, citation cards, blocked state, and error state.
- The existing mock citation cards remain as safe fallback when no token is available.

### Smoke tooling

- Added `npm run smoke:rag-workflow`.
- The smoke script:
  - creates a knowledge source
  - processes/indexes text into chunks and embeddings
  - runs RAG chat with strict citations
  - creates a RAG-backed content job
  - executes the `source_search` agent
  - verifies citation persistence and system logs

## Audit evidence

### Stage smoke validation

Command:

```bash
npm run smoke:rag-workflow -- http://127.0.0.1:3000
```

Result:

- `PASS create knowledge source: 200`
- `PASS process knowledge source: 200 (1 chunk(s))`
- `PASS RAG chat citations: 200 (1 citation(s))`
- `PASS create RAG-backed content job: 201`
- `PASS execute RAG source_search: 200`
- `PASS source citations persisted: 1`
- `PASS RAG query persisted: 1`
- `PASS RAG logs persisted: 2`
- `RAG workflow smoke passed.`

Smoke evidence:

- `knowledgeSourceId=f6ea3aba-1f72-4772-8ff2-995346a2b7af`
- `contentJobId=759452a2-3257-4f03-8150-c67019f124d9`

### Static validation before audit report

- `npx tsc --noEmit` passed.
- `npx eslint src scripts` passed with 0 errors.
- Existing warning remains:
  - `scripts/audit-mvp-production.mjs`: `failed` is assigned but never used.

## Supabase/security notes

- RAG uses existing RLS-protected `knowledge_sources`, `knowledge_chunks`, `knowledge_embeddings`, and `rag_queries`.
- `match_knowledge_chunks()` remains a restricted RPC granted to authenticated users.
- `system_logs` writes are best-effort and preserve main workflow behavior.
- No service-role key is exposed to the browser.

## Remaining gaps for later stages

- File upload UI is still not wired to real file storage upload.
- Google Drive and Obsidian connectors remain integration placeholders.
- The Create flow still needs UX restructuring so RAG source state appears naturally inside the guided creation flow.
- Content Job Detail should show canonical RAG citations from backend state.
- Production hardening should add cleanup for smoke-created knowledge sources/chunks.

## Stage-closing decision

Stage 4 passes.

Knowledge Base / RAG is now connected to backend retrieval, the live UI chat, and agent `source_search` execution. The next checkpoint should be the newly requested UX restructure before moving into Publishing Integrations.
