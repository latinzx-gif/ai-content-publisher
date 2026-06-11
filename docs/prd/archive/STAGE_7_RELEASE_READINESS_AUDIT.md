# Stage 7 Audit: Release Readiness, Deployment Preparation, and Final Smoke Setup

Date: 2026-06-07
Timezone: Asia/Bangkok
Status: Passed for local release readiness, pending external production deployment credentials

## Objective

Prepare the MVP for release readiness by making smoke tests deterministic, aligning release scripts with billing gates, and proving the local build and protected routes still pass after Stage 6 hardening.

## Completed scope

### Deterministic `/prd` smoke navigation

- Added deep-link support for `/prd`:
  - `?page=publishing`
  - `?page=review-queue`
  - `?page=create-post`
  - `?tab=scheduled`
- Page and tab parameters are normalized through slug matching.
- Default `/prd` behavior remains unchanged and still opens Dashboard.
- Internal page changes now update query parameters with `history.replaceState` so smoke tools can inspect current app state without relying on fragile sidebar coordinates.

### Release smoke scripts

- Added `npm run smoke:entitlements`.
- New script: `scripts/smoke-entitlements.mjs`.
- It verifies premium backend locks without creating production data:
  - `POST /api/agents/route-task` returns `402` for `agent_routes` on locked plans.
  - `POST /api/publishing/sync` returns `402` for `publishing_integrations` on locked plans.
- It supports enabled-plan mode with `AI_CONTENT_EXPECT_LOCKED_PLAN=no`, where the request should reach normal validation instead of billing lock.

### Deploy smoke hardening

- Updated `scripts/smoke-deploy.mjs` to check:
  - `/api/health`
  - `/prd`
  - `/prd?page=publishing&tab=scheduled`
  - protected review API rejects missing bearer
  - baseline security headers on `/prd`
- Updated `scripts/check-deploy-readiness.mjs` optional env checks to include:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_EMBEDDING_MODEL`
  - `OPENAI_AGENT_TEXT_MODEL`
  - `BUFFER_ACCESS_TOKEN`
  - `CODEX_LOCAL_BRIDGE_SECRET`

### Backend contract smoke alignment

- Updated `scripts/smoke-backend-contracts.mjs` so it understands Stage 6 billing enforcement.
- If publishing integrations are locked, the smoke now treats `402 publishing_integrations` as a correct pass state for the current plan.
- If publishing integrations are enabled, the smoke continues into publishing queue and sync checks as before.

## Validation gates

- TypeScript: Passed
  - Command: `npx tsc --noEmit`
- ESLint: Passed with existing warning
  - Command: `npx eslint src scripts next.config.ts`
  - Existing warning: `scripts/audit-mvp-production.mjs:51:7 warning 'failed' is assigned a value but never used`
  - No new lint errors introduced by Stage 7.
- Deploy smoke: Passed
  - Command: `npm run smoke:deploy -- http://127.0.0.1:3000`
  - Evidence:
    - `PASS runtime health: 200 expected 200`
    - `PASS PRD page: 200 expected 200`
    - `PASS PRD publishing deep link: 200 expected 200`
    - `PASS protected review API rejects missing bearer: 401 expected 401`
    - `Deploy smoke passed.`
- Entitlement smoke: Passed
  - Command: `npm run smoke:entitlements -- http://127.0.0.1:3000`
  - Evidence:
    - `PASS agent route premium lock: 402 (agent_routes)`
    - `PASS publishing sync premium lock: 402 (publishing_integrations)`
    - `Entitlement smoke passed.`
- Security header check: Passed
  - Command: `curl -s -I 'http://127.0.0.1:3000/prd?page=publishing&tab=scheduled' | rg -i 'HTTP/|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'`
  - Evidence includes:
    - `HTTP/1.1 200 OK`
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Production build: Passed
  - Command: `npm run build`
  - Evidence:
    - `Compiled successfully`
    - `/prd` generated successfully
    - API routes listed as dynamic server routes
- Backend contract smoke: Passed in locked publishing mode
  - Command: `npm run smoke:backend-contracts -- http://127.0.0.1:3000`
  - Evidence:
    - `PASS runtime health: 200`
    - `PASS create content job: 201`
    - `PASS queue agent run: 202`
    - `PASS create review: 201`
    - `PASS approve review decision: 200`
    - `PASS publishing premium lock: 402 (publishing_integrations)`
    - `Backend contract smoke passed with publishing integrations locked for the current plan.`

## External deployment readiness notes

Stage 7 proves local release readiness. It does not claim live production deployment is complete because these external conditions still require connected credentials or explicit approval:

- Vercel environment inspection requires authenticated Vercel CLI state.
- Live Buffer publishing requires a valid `BUFFER_ACCESS_TOKEN` and explicit live-publish approval.
- Browser Supabase client work should configure `NEXT_PUBLIC_SUPABASE_ANON_KEY` before browser-native Supabase features are enabled.
- Local Codex bridge actions require `CODEX_LOCAL_BRIDGE_SECRET` before any signed local bridge endpoint is enabled.

## Remaining risks for Big Audit

- The main `/prd` component is very large and ESLint reports Babel codegen deoptimization over 500KB. This is not a functional failure, but it is a maintainability risk.
- Browser automation via coordinate clicks was unreliable before deep-link support. Deep links now reduce this risk, but Big Audit should verify direct URL page states.
- Production deployment and Vercel env checks are not fully proven until authenticated Vercel CLI and target deployment URL are available.
- Live external publish is intentionally not tested without explicit provider credentials and approval.

## Decision

Stage 7 is complete for local release readiness and smoke preparation. Proceed to Big Audit.
