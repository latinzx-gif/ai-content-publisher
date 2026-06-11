# Big Audit: AI Content Platform MVP Production Readiness

Date: 2026-06-07
Timezone: Asia/Bangkok
Status: Not complete for external production deployment, passed for local MVP readiness

## Executive decision

The AI Content Platform MVP is locally functional and has passed the major backend, agent, RAG, entitlement, release-smoke, and production-build gates.

However, the full active goal cannot be marked complete yet because external production readiness is not fully proven. The current Vercel preview environment is missing required runtime variables, and live Buffer publishing is intentionally not enabled without a valid provider token and explicit approval.

## Requirement-by-requirement audit

| Requirement | Evidence inspected | Result |
| --- | --- | --- |
| Stage audit/log after each stage | Stage 2, 3, 4, 4.5, 5, 6, and 7 audit documents exist in `docs/` | Passed |
| Frontend workflows bound to Supabase backend | `STAGE_2_FRONTEND_WORKFLOW_BINDING_AUDIT.md`, final backend smoke, protected API smoke | Passed |
| Real agent execution and handoff | `smoke:agent-execution` passed with source search, draft generation, image layout, legal review, persisted translations/assets/review/logs | Passed |
| Knowledge Base/RAG connected | `smoke:rag-workflow` passed with source creation, processing, RAG citations, persisted queries/logs, and RAG-backed content job | Passed |
| Publishing integrations prepared | Stage 5 audit, queue/sync routes, publishing jobs/errors/log paths, backend contract smoke | Passed for queue/sync readiness |
| Live external publishing | `/api/health` and Stage 5/7 audits show `BUFFER_ACCESS_TOKEN` not configured | Not complete, intentionally gated |
| Auth and role enforcement | API routes require bearer token and team permissions; protected review API rejects missing bearer; Stage 6 audit | Passed |
| Billing/upsell locks | `smoke:entitlements` passed: `agent_routes` and `publishing_integrations` return 402 on locked plan | Passed |
| Production hardening | Security headers present, server-only env usage retained, build passed | Passed baseline hardening |
| Release readiness scripts | `smoke:deploy`, `smoke:entitlements`, `smoke:backend-contracts`, `smoke:agent-execution`, `smoke:rag-workflow`, `build` passed | Passed local release readiness |
| External deployment env readiness | `npm run deploy:check -- preview` shows missing required Vercel preview env vars | Failed external readiness |
| Closing Big Audit | This document | Completed, with blockers |

## Final validation evidence

### TypeScript and lint

Command:

```bash
npx tsc --noEmit && npx eslint src scripts next.config.ts
```

Result:

- TypeScript passed.
- ESLint passed with 0 errors.
- Existing warning remains:
  - `scripts/audit-mvp-production.mjs:51:7 warning 'failed' is assigned a value but never used`

### Production build

Command:

```bash
npm run build
```

Result:

- Next.js build passed.
- `/prd` generated successfully.
- API routes are listed as dynamic server routes.

### Deploy smoke

Command:

```bash
npm run smoke:deploy -- http://127.0.0.1:3000
```

Result:

- `PASS runtime health: 200 expected 200`
- `PASS PRD page: 200 expected 200`
- `PASS PRD publishing deep link: 200 expected 200`
- `PASS protected review API rejects missing bearer: 401 expected 401`
- `Deploy smoke passed.`

### Entitlement smoke

Command:

```bash
npm run smoke:entitlements -- http://127.0.0.1:3000
```

Result:

- `PASS agent route premium lock: 402 (agent_routes)`
- `PASS publishing sync premium lock: 402 (publishing_integrations)`
- `Entitlement smoke passed.`

### Backend contract smoke

Command:

```bash
npm run smoke:backend-contracts -- http://127.0.0.1:3000
```

Result:

- `PASS runtime health: 200`
- `PASS create content job: 201`
- `PASS queue agent run: 202`
- `PASS create review: 201`
- `PASS approve review decision: 200`
- `PASS publishing premium lock: 402 (publishing_integrations)`
- `Backend contract smoke passed with publishing integrations locked for the current plan.`

### Agent execution smoke

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
- `PASS assets persisted: 2`
- `PASS review item persisted: 1`
- `PASS system logs persisted: 3`
- `Agent execution smoke passed.`

### RAG workflow smoke

Command:

```bash
npm run smoke:rag-workflow -- http://127.0.0.1:3000
```

Result:

- `PASS create knowledge source: 200`
- `PASS process knowledge source: 200`
- `PASS RAG chat citations: 200`
- `PASS create RAG-backed content job: 201`
- `PASS execute RAG source_search: 200`
- `PASS source citations persisted`
- `PASS RAG query persisted`
- `PASS RAG logs persisted`
- `RAG workflow smoke passed.`

### External deployment env check

Command:

```bash
npm run deploy:check -- preview
```

Result:

- Failed because Vercel preview has `0/3` required variables configured:
  - `NEXT_PUBLIC_SUPABASE_URL`: missing
  - `SUPABASE_SERVICE_ROLE_KEY`: missing
  - `OPENAI_API_KEY`: missing
- Optional variables are also not configured in Vercel preview:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_EMBEDDING_MODEL`
  - `OPENAI_AGENT_TEXT_MODEL`
  - `BUFFER_ACCESS_TOKEN`
  - `CODEX_LOCAL_BRIDGE_SECRET`

## Supabase security and changelog review

Supabase guidance reviewed during this goal emphasized:

- RLS must remain enabled for exposed schemas.
- Service-role keys must stay server-side only.
- Authorization should not rely on user-editable metadata.
- New Supabase Data API exposure behavior requires attention for new tables and projects.

Current Stage 6/7 changes did not create new tables, so no new Data API grants or migrations were required. Existing server routes use bearer-token actor validation, team permission checks, and entitlement gates.

Reference:

- Supabase changelog search surfaced recent Data API/RLS related changes and self-hosted database role changes: https://supabase.com/changelog

## Secret exposure audit

A text scan for sensitive env names and literal API key patterns found:

- Server-side uses in `src/lib/supabase/server.ts`, `src/lib/rag/embedText.ts`, and `src/lib/agents/openaiResponses.ts`.
- Script and documentation references to env variable names.
- No real secret literal was found in `src`, `scripts`, `docs`, `next.config.ts`, `package.json`, or `.env.example`.
- `.env.example` uses placeholders.

## Remaining blockers before marking the full goal complete

1. Configure Vercel preview/production required environment variables without printing secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`

2. Rerun external deploy readiness:

```bash
npm run deploy:check -- preview
npm run deploy:check -- production
```

3. Deploy or inspect the target Vercel deployment, then run production smoke:

```bash
npm run smoke:deploy -- https://<target-deployment-url>
npm run smoke:prod -- https://<target-deployment-url>
```

4. Configure live publishing only when approved:
   - Add a valid `BUFFER_ACCESS_TOKEN`.
   - Run a provider-profile/token preflight.
   - Run a live publish smoke only after explicit approval because it can create external side effects.

5. Optional but recommended before launch:
   - Configure `NEXT_PUBLIC_SUPABASE_ANON_KEY` only if browser-native Supabase client features are enabled.
   - Configure `CODEX_LOCAL_BRIDGE_SECRET` before enabling signed local bridge actions.
   - Split the very large `/prd` component into smaller modules to reduce maintainability risk.

## Final conclusion

The MVP is ready for local acceptance testing and release preparation. It is not yet proven ready for external production deployment because Vercel required env vars are missing and live Buffer publishing is not configured.

The active goal should remain open until those external production readiness blockers are resolved and revalidated.

## Post-audit progress: Vercel env push readiness

Date: 2026-06-07

After the initial Big Audit, a safe local dry-run was added for Vercel environment pushes.

### Added tooling

- `npm run deploy:env:dry-run`
- `scripts/push-vercel-env.mjs` now supports:
  - `AI_CONTENT_VERCEL_ENV_DRY_RUN=yes`
  - optional envs for OpenAI agent model, Supabase anon key, Buffer token, and Codex local bridge secret
  - secret-safe output that reports only key readiness, not values

### Safe dry-run evidence

Command:

```bash
AI_CONTENT_VERCEL_ENV_FILE=.env.local npm run deploy:env:dry-run -- preview
```

Result:

- `READY NEXT_PUBLIC_SUPABASE_URL: plain value present`
- `READY SUPABASE_SERVICE_ROLE_KEY: sensitive value present`
- `READY OPENAI_API_KEY: sensitive value present`
- `READY OPENAI_EMBEDDING_MODEL: plain value present`
- Optional keys skipped because not provided:
  - `OPENAI_AGENT_TEXT_MODEL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `BUFFER_ACCESS_TOKEN`
  - `CODEX_LOCAL_BRIDGE_SECRET`

### Updated blocker status

- Required values exist locally in `.env.local`.
- Required values have not been transmitted to Vercel preview yet.
- Explicit approval is required before running the real push because it sends sensitive secrets to Vercel.

Recommended command after approval:

```bash
AI_CONTENT_VERCEL_ENV_FILE=.env.local npm run deploy:env:push -- preview
npm run deploy:check -- preview
```

## Post-audit progress: audit tooling warning cleanup

Date: 2026-06-07

The previous ESLint warning in `scripts/audit-mvp-production.mjs` was removed by deleting an unused `failed` variable. This did not change audit behavior because completion decisions already use `basicFailed` and `authenticatedSmokePassed`.

### Validation evidence

Command:

```bash
npx tsc --noEmit && npx eslint src scripts next.config.ts
```

Result:

- Passed with no ESLint errors and no prior unused-variable warning.
- Remaining console output is a Babel deoptimization note for the very large `/prd` page bundle, which remains a maintainability risk rather than a failing gate.

Command:

```bash
AI_CONTENT_VERCEL_ENV_FILE=.env.local npm run deploy:env:dry-run -- preview
```

Result:

- Required preview env values are present locally and ready to push.
- No secret values were printed or transmitted.

Command:

```bash
npm run smoke:deploy -- http://127.0.0.1:3000
npm run smoke:entitlements -- http://127.0.0.1:3000
```

Result:

- Deploy smoke passed.
- Entitlement smoke passed.

### Current blocker

The project is still waiting for explicit approval before transmitting `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` from `.env.local` to Vercel preview.

## Post-audit progress: production env and alias check

Date: 2026-06-07

### Production env readiness

Command:

```bash
npm run deploy:check -- production
```

Result:

- Passed.
- Required configured: `3/3`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
- Optional configured: `1/5`
  - `OPENAI_EMBEDDING_MODEL`
- Optional missing:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_AGENT_TEXT_MODEL`
  - `BUFFER_ACCESS_TOKEN`
  - `CODEX_LOCAL_BRIDGE_SECRET`

### Production alias readiness

Command:

```bash
npx vercel inspect head-office-app.vercel.app
```

Result:

- Passed.
- Production alias resolves to a Vercel deployment.
- Deployment status: `Ready`.
- Deployment id: `dpl_3iJYhj1Tv43s3MKj9rjyWxy9w4YU`.

### Production smoke result

Command:

```bash
npm run smoke:deploy -- https://head-office-app.vercel.app
```

Result:

- Runtime health passed.
- PRD page returned `200` but failed required security header checks.
- PRD publishing deep link passed.
- Protected review API rejected missing bearer with `401`.

### Updated blocker

Production is currently serving an older deployment that does not include the Stage 6/7 security header changes. The local build has these headers, but the production alias must be redeployed before production smoke can pass.

Recommended command after explicit approval to deploy current code:

```bash
npm run build
npx vercel deploy --prebuilt --prod
npm run smoke:deploy -- https://head-office-app.vercel.app
```

## Post-audit progress: production predeploy gate

Date: 2026-06-07

A no-side-effect production predeploy gate was added to make the final approval step safer and repeatable.

### Added tooling

- `npm run deploy:prod:preflight`
- Script: `scripts/predeploy-production-gate.mjs`

This script performs no deployment and transmits no secrets. It runs:

- production env readiness check
- production build
- local deploy smoke
- entitlement lock smoke

### Validation evidence

Command:

```bash
npm run deploy:prod:preflight
```

Result:

- Production env readiness passed with required configured `3/3`.
- Production build passed.
- Local deploy smoke passed.
- Entitlement lock smoke passed.

### Current blocker

The next required step is still side-effecting and requires explicit approval:

```bash
npx vercel deploy --prebuilt --prod
npm run smoke:deploy -- https://head-office-app.vercel.app
```
