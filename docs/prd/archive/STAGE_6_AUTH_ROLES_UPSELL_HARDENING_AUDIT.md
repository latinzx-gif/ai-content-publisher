# Stage 6 Audit: Auth, Roles, Upsell Locks, and Production Hardening

Date: 2026-06-07
Timezone: Asia/Bangkok
Status: Passed with noted production follow-up

## Objective

Enforce auth, role, billing/upsell locks, and production hardening before release readiness.

Stage 6 focuses on closing the gap between UI locks and backend enforcement. A locked premium feature must be blocked by API routes, not only by disabled buttons.

## Completed scope

### Backend role and entitlement enforcement

- Confirmed all protected routes continue to require Bearer auth through `requireApiActor`.
- Confirmed sensitive workflow routes continue to use team permissions:
  - `can_create`
  - `can_review`
  - `can_approve`
  - `can_publish`
  - `can_manage_settings`
- Added backend entitlement enforcement for premium agent routing:
  - `POST /api/agents/route-task`
  - Gate: `agent_routes`
- Added backend entitlement enforcement for premium publishing integration mutations:
  - `PATCH /api/publishing/queue`
  - Gate: `publishing_integrations`
  - `POST /api/publishing/sync`
  - Gate: `publishing_integrations`
- Added backend entitlement enforcement before Review can create publishing queue entries:
  - `POST /api/review/decision` when `decision=auto_queue`
  - Gate: `publishing_integrations`
  - `POST /api/reviews/action` when `action=auto_queue`
  - Gate: `publishing_integrations`

### UI alignment

- Added frontend plan flag for publishing integration lock:
  - `planEntitlements.publishingIntegrations=false`
- Publishing view now shows an upgrade-required operational state for locked publishing integrations.
- Publish Now, Retry, Complete Sync, Cancel, and Publish Selected are disabled when publishing integrations are locked.
- Queue visibility remains readable so operators can still see workflow state without being allowed to trigger premium external publishing actions.

### Production hardening

Added baseline security headers in `next.config.ts`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

This avoids a heavy CSP rollout that could break the current UI while still improving launch-readiness.

## Validation gates

- TypeScript: Passed
  - Command: `npx tsc --noEmit`
- ESLint: Passed with existing warning
  - Command: `npx eslint src scripts next.config.ts`
  - Existing warning: `scripts/audit-mvp-production.mjs:51:7 warning 'failed' is assigned a value but never used`
  - No new lint errors introduced by Stage 6.
- Route check: Passed
  - Command: `curl -s -o /tmp/prd-stage-6.html -w '%{http_code}' http://127.0.0.1:3000/prd`
  - Result: `200`
- Health check: Passed
  - Command: `curl -s http://127.0.0.1:3000/api/health`
  - Result: `status: ok`
- Security header check: Passed
  - Command: `curl -s -I http://127.0.0.1:3000/prd | rg -i "x-content-type-options|x-frame-options|referrer-policy|permissions-policy|HTTP/"`
  - Result included all expected headers.
- Entitlement gate smoke: Passed
  - `POST /api/agents/route-task` returned `402` with feature `agent_routes` on the current locked plan.
  - `POST /api/publishing/sync` returned `402` with feature `publishing_integrations` on the current locked plan.

## Supabase and security notes

- No database schema migration was added in Stage 6.
- Existing Supabase tables and RLS policies remain the authoritative data boundary.
- Recent Supabase changelog review highlighted Data API exposure and RLS/role separation as current concerns. Stage 6 did not add new tables, so no new Data API exposure work was required.
- Server-side Supabase access still uses `SUPABASE_SERVICE_ROLE_KEY`; the key is not exposed to browser code.
- API authorization decisions continue to use server-looked-up `team_members` and subscription entitlement functions, not user-editable `user_metadata`.

## Browser sanity note

The `/prd` page loaded successfully and remained responsive. A coordinate-based Browser attempt did not reliably switch from Dashboard to Publishing because the sidebar is dense and several visible labels include `Publishing`. UI lock behavior is therefore validated by code inspection plus TypeScript/route checks rather than a full Browser click path in this stage.

## Follow-up tasks for Stage 7

- Add a deterministic frontend test hook or URL/tab state for direct page navigation during smoke testing.
- Add a dedicated entitlement smoke script that reports locked vs enabled plan behavior without creating production data.
- Prepare production deployment checks for required and optional env vars:
  - Required: Supabase URL, service role, OpenAI key
  - Optional but needed for live publish: Buffer token
  - Optional but needed for local bridge: Codex local bridge secret
- Keep live Buffer publish disabled until a valid provider token is installed and an explicit live-publish smoke is approved.

## Decision

Stage 6 is complete for MVP auth, role, upsell lock, and baseline production hardening. Proceed to Stage 7 release readiness and final smoke preparation.
