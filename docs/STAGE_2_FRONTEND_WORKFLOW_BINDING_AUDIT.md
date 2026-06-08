# Stage 2 Frontend Workflow Binding Audit

Date: 2026-06-07 Asia/Bangkok

## Scope

Stage 2 focuses on binding the PRD frontend workflows to the completed Supabase-backed backend contracts while keeping safe mock fallback behavior for demo mode when no bearer token is available.

## Completed in this stage

### Review Queue live binding

- Added `GET /api/reviews`.
- The endpoint authenticates the bearer token and requires `can_review`.
- The endpoint returns review items joined with content item metadata and reviewer display names.
- The PRD frontend now loads `/api/reviews?limit=80` when the Review Queue page is opened with a token.
- The Review Queue keeps the existing mock items when no token exists or the live request fails.
- The Review Queue shows loading and error states.

### Review decision backend sync

- Review Queue Approve, Reject, and Auto Queue actions now call `POST /api/review/decision` when:
  - an API bearer token exists
  - the selected review item is a real UUID-backed item
- Mock review IDs still use the local fallback flow so demo behavior remains stable.
- Successful live decisions refresh:
  - Review Queue
  - Logs
  - Publishing Queue when Auto Queue is used
- Failed live decisions write a visible workflow audit event in the local UI stream.

### Logs live binding

- Added `GET /api/logs`.
- The endpoint authenticates the bearer token and requires active team membership.
- The endpoint returns:
  - `system_logs`
  - `error_events`
  - summarized log counts
- The PRD Logs page now loads `/api/logs?limit=100` when opened with a token.
- The Logs page keeps mock/stage audit events when no token exists or live loading fails.
- The Logs page shows loading and error states.

### Existing live bindings confirmed still present

- Dashboard already loads `/api/dashboard/overview`.
- Calendar already loads `/api/calendar/slots`.
- Publishing already loads `/api/publishing/queue`.
- Create Post already posts to `/api/content/jobs` when a token exists.

## Audit evidence

### Static validation

- `npx tsc --noEmit` passed.
- `npx eslint src scripts` passed with 0 errors.
- Existing warning remains:
  - `scripts/audit-mvp-production.mjs`: `failed` is assigned but never used.

### Runtime validation

- `GET /prd` returned `200 OK`.
- In-app browser sanity check confirmed:
  - current URL is `http://127.0.0.1:3000/prd`
  - Dashboard content is visible
  - Review Queue navigation/content is visible
  - Logs navigation/content is visible
  - bearer token UI is visible

### API smoke validation

Authenticated smoke with the local smoke bearer token:

- `GET /api/reviews?limit=5` returned `200`.
- `GET /api/logs?limit=10` returned `200`.

## Remaining gaps for later stages

These are not blockers for Stage 2, but should be handled before final production readiness:

- Logs export buttons are still UI-only unless the plan entitlement unlocks `POST /api/logs/export`.
- Publishing page uses `/api/publishing/queue` for queue updates; the live connector sync path through `/api/publishing/sync` should be expanded during Publishing Integrations.
- Create Post live flow creates a backend content job but still uses the local package preview for immediate UI handoff; Agent Execution Layer should replace this with persisted agent output.
- Content Job Detail still reconstructs details from merged frontend state; later stages should load a canonical backend detail endpoint.
- Dashboard/Review/Publishing/Logs status consistency should be re-audited after real agent execution mutates workflow states.

## Stage-closing decision

Stage 2 passes.

The frontend now binds the key MVP surfaces to backend APIs with safe fallback behavior. The next stage can begin: Agent Execution Layer.
