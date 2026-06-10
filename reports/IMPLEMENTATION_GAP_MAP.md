# Implementation Gap Map

**Date:** 2026-06-10  
**App:** `head-office-app` — Publisher `/publisher/*`

---

## Reference target (Phase 1)

Create → Brief → Rules → Content → Image prompts → Images → QC → Review → Calendar → Publishing → Dashboard → Logs

**Routes:** `/publisher/create` … `/publisher/logs` (see `reports/DEMO_READINESS_REPORT.md`)

---

## Closed gaps (was missing in 2026-06-06 audit)

| Gap | Status |
|-----|--------|
| Phase 1 route coverage | ✅ 12 publisher routes in build |
| Supabase integration | ✅ `acp_*` libs + migrations in repo |
| OpenAI integration | ✅ `src/lib/publisher/openai.ts` |
| Buffer integration | ✅ `buffer-publisher.ts` |
| Auth + route guard | ✅ `src/proxy.ts` + `/publisher/login` |
| Monorepo consolidation | ✅ Single app on `:3001` |

---

## Remaining gaps (2026-06-10)

| Gap | Severity | Owner | Status |
|-----|----------|-------|--------|
| Remote `acp_*` migration applied | P0 | User | ✅ Applied (both migrations) |
| Lint clean (`no-explicit-any`) | P1 | Engineering | ✅ Done (P1-01) |
| Authenticated 12-step E2E proof | P1 | User + dev | ⚠️ Needs `playwright/.auth/publisher.json` |
| Buffer live token | P1 | User — env | ⚠️ `BUFFER_ACCESS_TOKEN` OIDC token invalid |
| PRD `/` separate QA | P2 | Future task | 🔒 Deferred |

---

## Deferred (Phase 2/3 — unchanged)

Source search, RAG/pgvector, competitor monitoring, advanced analytics, learning loop, direct platform APIs.
