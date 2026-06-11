---
name: supabase-rls-security-auditor
description: >-
  Audits Supabase schema, client usage, secrets handling, and RLS readiness for
  ai-content-publisher acp_ tables on luxegqsccaodcikxhwrm. Use when reviewing
  INT-01 migrations, INT-02 persistence, INT-06 auth, env configuration, service
  role exposure, or shared-database risks with head-office-app.
---

# Supabase RLS & Security Auditor — ai-content-publisher

## Purpose

Ensure database work is **safe**, **correctly prefixed**, and **ready for INT-06 RLS** — without leaking service keys or breaking the shared `ai-auto-tools` project.

## Locked Project Context

| Item | Value |
|------|------|
| Project | `ai-auto-tools` |
| Ref | `luxegqsccaodcikxhwrm` |
| URL | `https://luxegqsccaodcikxhwrm.supabase.co` |
| Shared with | `head-office-app` (different tables — no `acp_` prefix there) |
| This app's tables | `acp_posts`, `acp_post_content`, `acp_post_images`, `acp_audit_logs` |

Migration path: `head-office-app/supabase/migrations/`

Types: `head-office-app/src/lib/supabase/types.ts`

## Client Helpers

| File | Role | Exposure |
|------|------|----------|
| `client.ts` | Browser — anon/publishable key | Client-safe |
| `server.ts` | Cookie session + `createServiceClient()` | Server-only |
| `createServiceClient()` | Bypasses RLS | **Never** import in `"use client"` files |

Env vars (document in `.env.example`, values in `.env.local` only):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server only

## Schema Contract (INT-01)

### `acp_posts`
- PK: `post_id` **text** (e.g. `demo-001`) — intentional for localStorage compatibility
- `status` CHECK: draft | revision_requested | approved | scheduled | published | failed

### `acp_post_content`
- FK → `acp_posts(post_id)` ON DELETE CASCADE
- Unique index on `post_id` (one content row per post)

### `acp_post_images`
- FK → `acp_posts(post_id)` CASCADE
- `type` CHECK: primary | secondary

### `acp_audit_logs`
- **No FK** on `post_id` — logs survive post deletion
- Indexes on `post_id`, `created_at DESC`

## RLS Posture (Phase 1 vs INT-06)

| Phase | RLS state | Access model |
|-------|-----------|--------------|
| INT-01 | Disabled | Service role for migrations; anon for future client reads |
| INT-02 | Still disabled | Prefer server-side writes via service client until policies exist |
| INT-06 | Enable + policies | Owner-scoped; `auth.uid()` ownership on `acp_posts` |

When enabling RLS (INT-06), every exposed table needs:
- RLS enabled
- SELECT policy (UPDATE requires SELECT in Postgres)
- UPDATE policies with both `USING` and `WITH CHECK`
- No `SECURITY DEFINER` shortcuts in `public` without auth checks

## Security Checklist

- [ ] No service role key in source, client components, or `NEXT_PUBLIC_*`
- [ ] No secrets in `TASK_RESULT.md`, commits, or skill docs
- [ ] All new tables use `acp_` prefix (no collision with head-office-app)
- [ ] Migrations are idempotent where possible (`if not exists`)
- [ ] `createServiceClient()` throws if `SUPABASE_SERVICE_ROLE_KEY` missing
- [ ] Client reads use typed `Database` from `types.ts`
- [ ] Data API exposure: if tables invisible to REST, check grants + RLS (not just "table missing")

## Audit Workflow

1. Read latest migration SQL — columns, FKs, indexes, triggers
2. Compare `types.ts` to migration (no drift)
3. Grep for `SUPABASE_SERVICE_ROLE_KEY` and `createServiceClient` usage — server-only paths
4. Grep for `@supabase` imports in `src/app/**` client files
5. Verify live tables (if env available): head/count query per `acp_*` table
6. Flag INT-06 prep gaps (missing `user_id` column if auth will need ownership)

## Verification Commands

```bash
cd head-office-app
npm run build && npm run typecheck && npm run lint

# Optional — table existence (requires .env.local, do not print keys)
# node -e "..." using createServiceClient pattern
```

## Output Format

```markdown
## Supabase Security Audit

### Schema
- Migration reviewed: [file]
- Types sync: ✅ / ❌ [drift details]

### Secret exposure
- Service role in client bundle: ✅ none / ❌ [file]

### RLS readiness (INT-06)
- [gaps: missing owner column, policies needed, etc.]

### Shared DB risks
- [acp_ prefix compliance, head-office collision check]

### Risk level
Critical | Major | Minor

### Recommended actions
1. [...]
```

## Forbidden Actions

- Modifying `head-office-app` Supabase tables without explicit approval
- Using retired Legal System project (`nyartblhcenvbworsgxn`)
- Enabling RLS without policies (locks out all access)
- Storing API keys in `acp_posts.metadata` or client-accessible JSONB
- `SECURITY DEFINER` functions in `public` to bypass RLS without review
