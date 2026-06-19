# Incident → Linear Implementation Map

Date: 2026-06-16 20:51 +07
Project: AI Assistant Support
Status: Plan ready after Phase 1 LIVE

## Goal

Make every meaningful problem source create or update a Linear issue for follow-up fixing:
- customer report from LINE / LIFF
- automated monitor incident
- integration/webhook alert
- manual operator report

## Current State (verified in code)

Existing customer-report path already works:
- `support-app/src/app/api/liff/tickets/route.ts`
- `support-app/src/lib/actions/tickets.ts`
- `support-app/src/lib/linear/client.ts`
- `support-app/src/lib/linear/webhook.ts`

Current behavior:
1. LIFF ticket POST creates `aas_tickets` row
2. same flow creates a Linear issue with `[AAS][client] ...` title
3. `linear_issue_id` and `linear_issue_url` are saved back to `aas_tickets`
4. when issue is Done + `[resolution]` comment exists, Linear webhook updates ticket and sends LINE resolution Flex

Missing behavior:
- monitor/webhook/manual incidents do not yet have a first-class persistence model
- repeated incidents are not deduped before creating Linear work
- ticket-origin and monitor-origin issue creation are not using one shared incident abstraction

## Decision: Use 2 records, 1 shared Linear pipeline

Recommended design:
- keep customer tickets in `aas_tickets` exactly as-is
- add a new operational table `aas_incidents` for monitor/webhook/manual incidents
- share one Linear issue builder / label policy across both tickets and incidents

Why this is better than forcing monitor events into `aas_tickets`:
- monitor incidents do not have a real `reporter_line_user_id`
- operational incidents need occurrence counting and dedupe fields
- customer ticket lifecycle and monitor incident lifecycle are similar but not identical

## Target Architecture

### A. Customer report path (existing, retained)

LINE / LIFF submit
-> `POST /api/liff/tickets`
-> `createTicketAndNotify()`
-> `createTicketWithLinear()`
-> Linear issue
-> save `linear_issue_id/url` on `aas_tickets`

### B. Operational incident path (new)

cron / webhook / manual report
-> `POST /api/internal/incidents`
-> `createOrBumpIncident()`
-> if new: create Linear issue
-> if duplicate: update DB counters + comment on existing Linear issue
-> optional operator notification

## New Data Model

### Create table: `aas_incidents`

Create migration:
- `support-app/supabase/migrations/20260616xxxxxx_create_aas_incidents.sql`

Suggested columns:
- `id uuid primary key`
- `client_id uuid null references aas_clients(id)`
- `source text not null` — `monitor | webhook | manual | line`
- `source_ref text null` — upstream event id, cron job name, webhook id
- `service text not null` — `liff | webhook | api | cron | storage | auth`
- `severity text not null check (severity in ('P0','P1','P2','P3'))`
- `status text not null default 'open' check (status in ('open','investigating','resolved','closed'))`
- `subject text not null`
- `body text null`
- `fingerprint text not null`
- `occurrence_count integer not null default 1`
- `first_seen_at timestamptz not null default now()`
- `last_seen_at timestamptz not null default now()`
- `last_payload jsonb null`
- `linear_issue_id text null`
- `linear_issue_url text null`
- `ticket_id uuid null references aas_tickets(id)`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Indexes:
- `idx_aas_incidents_client_id`
- `idx_aas_incidents_status`
- `idx_aas_incidents_fingerprint`
- `idx_aas_incidents_last_seen_at`

Constraint recommendation:
- unique active fingerprint is better handled in app logic first
- do not start with a partial unique index until reopen semantics are agreed

## Shared Incident Contract

Create:
- `support-app/src/lib/incidents/types.ts`

```ts
export type IncidentSource = 'monitor' | 'webhook' | 'manual' | 'line';
export type IncidentSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export interface IncidentInput {
  clientId?: string | null;
  clientSlug?: string | null;
  clientName?: string | null;
  source: IncidentSource;
  sourceRef?: string | null;
  service: string;
  severity: IncidentSeverity;
  subject: string;
  body?: string | null;
  fingerprint?: string | null;
  metadata?: Record<string, unknown> | null;
}
```

Rules:
- `fingerprint` must be stable for the same repeated problem
- if caller does not provide one, derive it from `clientSlug + service + severity + normalized subject`

## Shared Logic to Create Next

### 1) Fingerprinting

Create:
- `support-app/src/lib/incidents/fingerprint.ts`

Responsibilities:
- normalize strings
- generate deterministic fingerprint
- avoid duplicates from timestamp-only differences

### 2) Linear issue builder

Create:
- `support-app/src/lib/incidents/linear.ts`

Responsibilities:
- build title
- build markdown description
- build labels
- map severity to Linear priority

Title pattern:
- customer ticket: `[AAS][{client_slug}] {severity} · {type} · {subject}`
- operational incident: `[AAS][{client_slug|system}] {severity} · {source} · {service} · {subject}`

Label pattern:
- `client:{slug}`
- `source:{source}`
- `service:{service}`
- `severity:{severity}`
- optional `type:{ticketType}` for customer tickets only

### 3) Incident create-or-bump service

Create:
- `support-app/src/lib/actions/incidents.ts`

Responsibilities:
- find existing open incident by `fingerprint`
- if found:
  - increment `occurrence_count`
  - set `last_seen_at = now()`
  - update `last_payload`
  - comment on existing Linear issue
- if not found:
  - insert `aas_incidents`
  - create Linear issue
  - save `linear_issue_id/url`

Suggested return shape:
```ts
{
  incidentId: string;
  disposition: 'created' | 'bumped';
  linearIssueId: string | null;
  linearIssueUrl: string | null;
}
```

## Changes to Existing Files

### Modify: `support-app/src/lib/linear/client.ts`

Add helpers:
- `commentOnLinearIssue(issueId, body)`
- `updateLinearIssuePriority(issueId, priority)`
- optional: `updateLinearIssueState(issueId, stateId)`

Do not remove `createLinearIssue()`.

### Modify: `support-app/src/lib/actions/tickets.ts`

Refactor only the Linear formatting portion:
- keep `createTicket()` behavior unchanged
- move title/description/labels building into shared helper(s)
- `createTicketWithLinear()` should call shared builder, not own formatting branch

Goal:
- both customer tickets and monitor incidents follow one title/label convention
- avoid drift between two code paths

### Modify: `support-app/src/lib/database.types.ts`

Add generated typings for `aas_incidents`

## New API Surface

Create:
- `support-app/src/app/api/internal/incidents/route.ts`

Purpose:
- secure ingestion point for cron jobs, webhook relays, and manual operator tooling

Auth:
- header `x-aas-incident-secret`
- compare against new env var `AAS_INCIDENT_INGEST_SECRET`

Behavior:
- validate request body against `IncidentInput`
- call `createOrBumpIncident()`
- return `{ success, disposition, incidentId, linearIssueUrl }`

## Cron / Watcher Integration

Do not let cron jobs create Linear issues in ad hoc shell code.

Instead:
- cron detects abnormal state
- cron POSTs normalized payload to `/api/internal/incidents`
- app owns dedupe + DB persistence + Linear mutation

This keeps:
- one policy
- one dedupe layer
- one audit trail
- fewer duplicate Linear issues

## Suggested Implementation Order

### Task 1 — Extract shared Linear formatting
Files:
- create `src/lib/incidents/linear.ts`
- modify `src/lib/actions/tickets.ts`

Acceptance:
- existing LIFF ticket flow still creates the same style of Linear issue
- `npm run typecheck` passes

### Task 2 — Add `aas_incidents` table + types
Files:
- create migration for `aas_incidents`
- modify `src/lib/database.types.ts`
- create `src/lib/incidents/types.ts`

Acceptance:
- migration SQL valid
- generated TS types compile

### Task 3 — Add create-or-bump incident service
Files:
- create `src/lib/incidents/fingerprint.ts`
- create `src/lib/actions/incidents.ts`
- modify `src/lib/linear/client.ts`

Acceptance:
- first incident creates Linear issue
- repeated incident bumps count instead of creating a second issue

### Task 4 — Add secure ingestion API
Files:
- create `src/app/api/internal/incidents/route.ts`
- modify `.env.example`

Acceptance:
- unauthorized request returns 401
- valid request returns created/bumped response

### Task 5 — Wire first watcher
Files:
- create `support-app/scripts/queue-monitor-relay.ts`
- add script + tests `support-app/scripts/queue-monitor-relay.test.ts`
- `support-app/package.json` (`watcher:queue` script)
- `.env.example` (`AAS_INCIDENT_INGEST_ENDPOINT`)

Acceptance:
- one simulated watcher alert posts to `/api/internal/incidents` and returns API success payload
- dry-run prints payload and target endpoint without requiring secret

## Validation Plan

Code validation:
- `cd support-app && npm run typecheck`
- `cd support-app && npm run build`

Manual API smoke:
1. POST one incident payload to `/api/internal/incidents`
2. confirm one `aas_incidents` row exists
3. confirm one Linear issue exists
4. POST same payload again
5. confirm `occurrence_count` increments and no new Linear issue is created
6. confirm a Linear comment was added to the existing issue

Regression checks:
- LIFF ticket submit still works
- Linear resolution webhook still updates `aas_tickets`
- LINE confirmation and resolution Flex behavior unchanged

## Scope Guard

In scope now:
- incident persistence
- incident dedupe
- Linear issue creation/update
- secure ingestion endpoint

Not in scope now:
- AI triage
- auto-fix
- deploy automation
- customer-facing UI changes
- pgvector / embeddings / campaign factory

## Recommended First Real Task

Start with Task 1 only:
- extract shared Linear formatting from `tickets.ts`
- do not create DB schema and ingestion endpoint in the same commit

Reason:
- lowest-risk refactor
- proves the shared incident model without touching production data yet
- gives a stable base before adding `aas_incidents`
