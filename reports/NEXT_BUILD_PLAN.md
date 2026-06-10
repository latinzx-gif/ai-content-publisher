# Next Build Plan (post Phase 1 close-out)

**Date:** 2026-06-10  
**Context:** After QA-01 conditional pass

---

## P0 — User actions (before live demo)

1. ✅ Apply `20260609000001_acp_schema.sql` — verified 2026-06-10
2. ✅ Apply `20260610000001_acp_rls_auth.sql` — verified 2026-06-10
3. ✅ `NEXT_PUBLIC_SITE_URL` + auth callback — user configured
4. ⚠️ `BUFFER_ACCESS_TOKEN` — optional for live publish (P1+)

---

## P1 — Engineering (Phase 1.1)

1. Fix lint `no-explicit-any` in `src/app/page.tsx` and `src/lib/agents/executeAgentRun.ts`
2. Add `orchestration/.env.local` with `LINEAR_API_KEY` for task notifications
3. ✅ Publisher E2E (Playwright) — gate tests + workflow spec (`docs/runbooks/PUBLISHER_E2E.md`)
4. ✅ Split `page.tsx` foundation (`src/features/prd/` — 12 modules; views remain in page)

---

## P2 — Deferred (unchanged)

- Source search, RAG/pgvector, analytics pipeline, learning loop
- Direct Meta/LinkedIn APIs (Buffer only in Phase 1)

---

## Phase 2 entry points

- `/publisher/sources`, `/publisher/knowledge`, `/publisher/analytics`, `/publisher/learning-loop` (placeholders exist)
