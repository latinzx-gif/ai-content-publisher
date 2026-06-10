# Delivery Readiness Audit

**Date:** 2026-06-10
**Auditor:** Claude Code (`claude-opus-4-8`) — **Audit Only** (no code changes)
**App:** `head-office-app` — Publisher `/publisher/*` (PRD `/` is a separate surface)
**Scope:** Phase 1 Complete Criteria (PHASE_1_SCOPE_LOCK §"Phase 1 Complete Criteria") + production delivery requirements (deployment, Buffer, Supabase, auth, env vars)
**Sources read:** `GROUND_TRUTH.md`, `PHASE_1_SCOPE_LOCK.md`, `DEMO_READINESS_REPORT.md`, `reports/IMPLEMENTATION_GAP_MAP.md` + live code scan

---

## Verdict

| Question | Answer |
|----------|--------|
| Phase 1 complete criteria met? | **Yes — 10/10 functional criteria pass** (build, typecheck, routes, auth gate, persistence, AI wiring, Buffer path) |
| **Production-ready as-is?** | **NO** — blocked by **1 critical security hole (F1)** + 3 high-severity gaps (Buffer live, E2E proof, deploy config) |
| Demo-ready (dev)? | **Yes** — confirmed by independent build + gate inspection |

The app is functionally complete for Phase 1 and demo-ready, consistent with prior reports. It is **not** production-deliverable until the auth-bypass flag is hard-gated (F1) and the live Buffer + deploy-config gaps close.

---

## Independent verification (this audit, run live)

| Gate | Phase-1 Criterion | Result |
|------|-------------------|--------|
| `npm run build` | #9 (zero errors) | ✅ **exit 0, 0 errors** — 12 publisher routes compiled; output shows `ƒ Proxy (Middleware)` |
| `npx tsc --noEmit` | #10 (zero errors) | ✅ **exit 0** |
| `npm run lint` | — | ✅ **exit 0, 0 errors / 47 warnings** (drifted up from ~30 reported) |
| Auth gate active | — | ✅ `proxy.ts` recognized as middleware by Next 16.2.7 build (`PROXY_FILENAME` convention) |
| 12 publisher routes present | #1–8 | ✅ all present + Phase-2 placeholders |

> **Note on `proxy.ts`:** Next.js 16.2.7 renames the middleware convention to `proxy.ts` (`node_modules/next/dist/.../02-file-conventions/proxy.md`, `constants.js → PROXY_FILENAME`). The auth gate is **valid and active** — not a misnamed dead file. Build output confirms `ƒ Proxy (Middleware)`.

---

## Findings (ranked)

### 🔴 F1 — CRITICAL: Unguarded API auth-bypass flag can ship to production
**Severity:** P0 — production security hole

- `.env.local` currently sets **`AI_CONTENT_DISABLE_API_AUTH=true`** and **`NEXT_PUBLIC_AI_CONTENT_DISABLE_API_AUTH=true`**.
- [`src/lib/server/apiSecurity.ts:5`](../head-office-app/src/lib/server/apiSecurity.ts#L5) reads the flag with **no `NODE_ENV` / environment guard**:
  ```ts
  const API_AUTH_BYPASS_ENABLED = process.env.AI_CONTENT_DISABLE_API_AUTH === 'true';
  ```
  When enabled, `requireApiActor()` (line 35) skips bearer-token validation entirely and returns a "dev bypass actor" resolved to an **active admin team member** (`getDevBypassActor`). Every `/api/*` route (23 routes incl. `agents/execute`, `publishing/queue`, `reviews/action`, `rag/*`, `knowledge/*`) becomes unauthenticated.
- **No deploy script blocks it.** `grep DISABLE_API_AUTH scripts/` → empty. Neither `check-deploy-readiness.mjs` nor `predeploy-production-gate.mjs` verifies the flag is unset/false for production.
- **Not documented** in `.env.example` — invisible to whoever provisions prod env vars.
- The `NEXT_PUBLIC_` twin is bundled to the **client** ([`page.tsx:3247`](../head-office-app/src/app/page.tsx#L3247)), advertising bypass state in shipped JS.

**Risk:** If this env value is copied into a Vercel/prod environment (easy, since it lives next to the keys that *must* be copied), the entire API is open to anonymous callers acting as admin.

**Recommended fix (next task, not this audit):**
1. Hard-guard: `const API_AUTH_BYPASS_ENABLED = process.env.NODE_ENV !== 'production' && process.env.AI_CONTENT_DISABLE_API_AUTH === 'true';`
2. Add a fail-closed assertion in `predeploy-production-gate.mjs` that aborts if either `AI_CONTENT_DISABLE_API_AUTH` or `NEXT_PUBLIC_AI_CONTENT_DISABLE_API_AUTH` is truthy for `production`.
3. Document both flags in `.env.example` as **dev-only — must be unset in production**.

---

### 🟠 F2 — HIGH: Buffer live publish never proven (mock-only)
**Severity:** P1 — Phase-1 criterion #6 only satisfied in mock mode

- No `BUFFER_ACCESS_TOKEN` in `.env.local`. [`buffer-publisher.ts:22`](../head-office-app/src/lib/publisher/buffer-publisher.ts#L22) → `getBufferMode()` returns `"mock"`.
- In mock mode, `bufferPublish` **marks the post `published`** and logs a success audit row **without any real publish** ([lines 36–39](../head-office-app/src/lib/publisher/buffer-publisher.ts#L36)). This is a *fake-success state* — the kind AGENTS.md §Image Rules warns against, here applied to publishing.
- `IMPLEMENTATION_GAP_MAP` notes the prior `BUFFER_ACCESS_TOKEN` was an invalid OIDC token. Live `/updates/create.json` path is unexercised.
- Mock fallback is acceptable for **demo**; it is **not** acceptable as proof of production publish.

**Recommended:** Provide a valid Buffer token + `BUFFER_PROFILE_ID`, run one live publish + one live schedule, capture the Buffer IDs. (Tracked as P1-BUFFER-01.)

---

### 🟠 F3 — HIGH: Authenticated 12-step E2E not proven
**Severity:** P1

- Playwright **gate** project passes, but the full authenticated workflow needs `playwright/.auth/publisher.json` (not committed; user-supplied). `DEMO_READINESS_REPORT` flow steps 1–12 are "⚠️ Manual after login."
- No automated proof that Create → … → Publishing succeeds end-to-end against the live Supabase project. (Tracked as P1-E2E-02.)

**Recommended:** Save authenticated storage state, run `npm run test:e2e:publisher`, attach the trace.

---

### 🟠 F4 — HIGH: No deployment config + anon-key gap in deploy gate
**Severity:** P1 — production deploy will misbehave on a missing var the gate treats as optional

- **No deployment artifacts in repo:** no `vercel.json`, no `Dockerfile`, no CI workflow (`.github/`). Deploy depends entirely on an out-of-repo Vercel project + manual `npm run deploy:env:push`.
- **Anon-key contradiction:** [`proxy.ts:28`](../head-office-app/src/proxy.ts#L28) dereferences `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` (non-null assertion) on **every** publisher request — but `check-deploy-readiness.mjs` lists `NEXT_PUBLIC_SUPABASE_ANON_KEY` as **optional**. If prod is provisioned per the gate's "required" list only, the auth middleware throws on first request → all `/publisher/*` 500s.
- `NEXT_PUBLIC_SITE_URL` (magic-link prod callback base) is likewise not in the gate's required set; a wrong/missing value silently breaks magic-link redirect in production.

**Recommended:** Move `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` to `requiredEnvironmentVariables`; add a committed `vercel.json` (or document the deploy target explicitly).

---

### 🟡 F5 — MEDIUM: Forbidden Phase-2/3 code is shipped & built (scope drift)
**Severity:** P2 — contradicts "Phase 1 closed, nothing forbidden built"; raises surface area, cost, audit burden

GROUND_TRUTH §5 forbids — **in all phases** — RAG / pgvector / embeddings, advanced analytics, and multi-tenant. All are present and compiled into the production build:

| Forbidden item | Evidence |
|----------------|----------|
| Embeddings + pgvector RAG | `src/lib/rag/{embedText,searchKnowledge,buildAnswer,chunkText,buildRagContext,guardrails}.ts`; `embedText.ts:19` calls `https://api.openai.com/v1/embeddings`; `searchKnowledge.ts:20` calls `match_knowledge_chunks` RPC |
| RAG/knowledge API routes | `/api/rag/chat` (115L), `/api/rag/search` (84L), `/api/knowledge/process` (106L), `/api/knowledge/sources` (77L) — real implementations, not stubs |
| Multi-tenant entitlements | `src/lib/entitlements/{checkFeature,guards}.ts`; migration `..._add_plans_entitlements_and_agent_routes.sql` |
| Advanced Analytics | `/publisher/analytics/page.tsx` — **217-line real implementation** (not a placeholder, unlike sources/knowledge/content-library/learning-loop which are 19-line stubs ✅) |

These are wired but gated out of the primary nav (Sidebar marks them `phase: P2/P3`). They likely **predate the scope-lock** (inherited from the original `ai-content-publisher` platform schema). Still, they: (a) consume the OpenAI embeddings key, (b) expand the authenticated API surface, (c) contradict the documented closed scope. **No code change recommended under Audit Only** — flag for a scope-reconciliation decision (remove vs. formally re-admit).

---

### 🟡 F6 — MEDIUM: Env-var contract drift
**Severity:** P2

- `.env.example:6` sets `OPENAI_AGENT_TEXT_MODEL=gpt-5.1` — a model id that does not match the documented OpenAI/GPT contract; risks a runtime model-not-found if consumed literally.
- `OPENAI_EMBEDDING_MODEL` in `.env.example` is only consumed by the forbidden RAG path (F5).
- `.env.example` omits the security-critical `AI_CONTENT_DISABLE_API_AUTH` family (F1) — so the example neither warns about it nor documents safe defaults.

---

### 🔵 F7 — LOW: Documentation inconsistencies
**Severity:** P3

- `PHASE_1_SCOPE_LOCK.md` route table lists `/create`, `/briefs`, … but the shipped app and GROUND_TRUTH use `/publisher/*`. Cosmetic, but a reader following SCOPE_LOCK would hit 404s.
- Lint warnings drifted **30 → 47** since `DEMO_READINESS_REPORT` (still 0 errors). Worth a cleanup pass before sign-off so regressions stay visible.

---

## Production delivery checklist

| Requirement | Status | Blocker |
|-------------|--------|---------|
| Build / typecheck / lint clean | ✅ | — |
| Auth gate active on `/publisher/*` | ✅ | — |
| **API auth bypass hard-gated for prod** | ❌ | **F1 (P0)** |
| Supabase `acp_*` schema + RLS migrations in repo | ✅ | `20260609_acp_schema`, `20260610_acp_rls_auth` present |
| Supabase env vars complete in deploy gate | ⚠️ | F4 — anon key/site URL "optional" |
| OpenAI text + image wired | ✅ | needs live session to exercise |
| Buffer **live** publish proven | ❌ | F2 (P1) |
| Authenticated 12-step E2E proven | ❌ | F3 (P1) |
| Deployment config committed (vercel.json/CI) | ❌ | F4 (P1) |
| Scope matches GROUND_TRUTH (no forbidden modules) | ⚠️ | F5 — RAG/entitlements/analytics shipped |
| `.env.example` documents all required + safety flags | ⚠️ | F6 |

---

## Recommended next actions (priority order)

1. **F1 (P0):** Hard-gate the auth-bypass flag on `NODE_ENV !== 'production'` + add a fail-closed check to `predeploy-production-gate.mjs` + document in `.env.example`. **Blocks any production deploy.**
2. **F4 (P1):** Promote `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `NEXT_PUBLIC_SITE_URL` to required in `check-deploy-readiness.mjs`; commit a deploy config.
3. **F2 (P1):** Provision a valid `BUFFER_ACCESS_TOKEN` and prove one live publish + schedule.
4. **F3 (P1):** Capture authenticated 12-step Playwright run.
5. **F5 (P2):** Scope-reconciliation decision (user) — remove forbidden RAG/entitlements/analytics, or formally re-admit them into scope.
6. **F6 / F7 (P2–P3):** Fix `.env.example` model id + document safety flags; reconcile SCOPE_LOCK route names; lint-warning cleanup.

---

## Scope statement

This was an **Audit Only** pass. No source files were modified. The only file written is this report (`reports/DELIVERY_READINESS_AUDIT.md`). Build/typecheck/lint were executed read-only to validate delivery gates; no fixes were applied. Fix recommendations are deferred to a separate, approved task per the Cursor → Claude loop.
