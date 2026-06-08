# Stage 5 Audit: Publishing Integrations and Operational Queue Binding

Date: 2026-06-07
Timezone: Asia/Bangkok
Status: Passed with live-provider credential follow-up

## Objective

Prepare publishing integrations and bind the Publishing UI to backend-ready operational queue behavior.

Stage 5 focuses on making Publishing behave like an operations queue, not a static settings screen. The goal is to make approved content move through queue, sync, retry/failure, manual fallback, and published-log states with backend audit evidence.

## Completed scope

### Backend

- Extended `GET /api/publishing/queue` to return:
  - `queue`: publishing queue rows and linked content item metadata
  - `errors`: recent publishing errors
  - `jobs`: recent publishing job attempts
  - `integrations`: connected integration account health without exposing tokens
  - `summary`: canonical status counts
- Preserved existing permission gate:
  - `requireApiActor`
  - `requireTeamPermission(..., 'can_publish')`
- Kept provider tokens server-side. No access token is returned to the browser.
- Kept `POST /api/publishing/sync` as the canonical status mutation route because it creates:
  - `publishing_jobs`
  - `publishing_errors` for failed actions
  - audit events
  - system logs

### Frontend

- Updated Publishing queue actions to call `POST /api/publishing/sync` instead of only patching queue status.
- `Publish Now`, `Retry`, `Complete Sync`, and `Cancel` now route through the backend sync contract.
- Added sync metadata for source, previous status, requested status, and next UI status.
- Added safe manual failure metadata for platform sync failure states.
- Added Buffer as a Publishing channel card so Buffer health can surface in the operational queue.
- Updated Publishing channel health mapping to use backend integration account status when available:
  - connected
  - expired
  - failed
  - disconnected
- Fixed error platform mapping by joining `publishing_errors -> publishing_jobs -> publishing_queue` in the frontend mapper.
- Added operational buckets:
  - Approved unscheduled
  - Scheduled
  - Failed
  - Manual action
  - Published log
- Replaced static WordPress-only alert copy with dynamic channel/error/manual fallback copy.

## Validation gates

- TypeScript: Passed
  - Command: `npx tsc --noEmit`
- ESLint: Passed with existing warning
  - Command: `npx eslint src scripts`
  - Existing warning: `scripts/audit-mvp-production.mjs:51:7 warning 'failed' is assigned a value but never used`
  - No new lint errors introduced by Stage 5.
- Route check: Passed
  - Command: `curl -s -o /tmp/prd-stage-5.html -w '%{http_code}' http://127.0.0.1:3000/prd`
  - Result: `200`
- Health check: Passed
  - Command: `curl -s http://127.0.0.1:3000/api/health`
  - Result: `status: ok`
- Backend contract smoke: Passed
  - Command: `npm run smoke:backend-contracts -- http://127.0.0.1:3000`
  - Evidence:
    - `PASS runtime health: 200`
    - `PASS create content job: 201`
    - `PASS queue agent run: 202`
    - `PASS create review: 201`
    - `PASS approve review decision: 200`
    - `PASS auto queue publishing: 200`
    - `PASS publishing sync: 200`
    - `Backend contract smoke passed.`

## Current provider readiness

`/api/health` reports:

- Required runtime keys are configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
- Optional publishing provider key is not configured:
  - `BUFFER_ACCESS_TOKEN=false`

This means Stage 5 is ready for backend queue/sync/log operation, but live Buffer publish should remain disabled until the correct Buffer API/OAuth access credential is installed and verified.

## Supabase note

No schema migration was added in Stage 5. The work uses existing tables and existing RLS-gated server routes.

The current Supabase changelog was checked for relevant recent platform changes. The relevant risk remains Data API/table exposure behavior for newly created tables, but Stage 5 did not create new tables. Existing routes continue through server-side Supabase access and team permission guards.

## Browser sanity note

The `/prd` route loaded successfully. A Browser automation attempt to switch from Dashboard to Publishing via repeated sidebar text timed out because multiple visible elements share the label `Publishing`. This is a test harness locator issue, not a route failure. Static route, TypeScript, ESLint, health, and backend contract smoke all passed.

## Remaining follow-up for Stage 6+

- Add real live Buffer publish execution only after `BUFFER_ACCESS_TOKEN` is configured with a valid API/OAuth token.
- Add a dedicated live-provider smoke test that does not post externally unless explicitly approved.
- Bind Dashboard readiness cards to real `/api/health` and integration account status.
- Add role-aware UI locks for publishing actions based on `can_publish` and subscription plan.
- Add final production guardrails for external publish side effects.

## Decision

Stage 5 is complete for MVP queue/sync readiness. Proceed to Stage 6 after this audit is recorded.
