# Cursor Plan Review: INT-06 — Supabase Auth

**Date:** 2026-06-10  
**Decision:** ✅ APPROVED → EXECUTE

## Decisions

| Question | Cursor decision |
|----------|-----------------|
| Auth strategy | **Magic link** (`signInWithOtp`) — Phase 1 demo; no password flow |
| RLS migration | **Yes, in INT-06** — required by `CLOSURE_TASK_QUEUE.md` acceptance #2 |
| Sidebar UX | **Sign-out only** — no email display (minimize Sidebar refactor) |
| `NEXT_PUBLIC_SITE_URL` | **Approved** — add to `.env.example` + `.env.local` for dev |

## RLS approach (Cursor conditions)

1. New migration: `supabase/migrations/20260610000001_acp_rls_auth.sql`
2. Add `user_id uuid references auth.users(id)` to `acp_posts` (nullable for legacy rows)
3. Enable RLS on `acp_posts`, `acp_post_content`, `acp_post_images`, `acp_audit_logs`
4. Policies: authenticated user CRUD where `acp_posts.user_id = auth.uid()` OR `user_id IS NULL` (legacy demo rows until backfill)
5. Child tables: access via `post_id` → owning `acp_posts.user_id`
6. **Server Actions** keep `createServiceClient()` for generation/publish logs — service role bypasses RLS (existing INT-03–05 pattern)
7. **Client `db.ts` paths** must use user-scoped anon client after login — new posts set `user_id` on insert

## Subagent (before first edit)

Read-only pass: `safe-research-delegator` + `supabase-rls-security-auditor` + `nextjs-app-router-auditor` — report in chat only.

## Model

EXECUTE stays **opus** per `CURRENT_TASK.md`.

## Deferred

- Email display in Sidebar → post-MVP
- Email/password auth → post-MVP
- Backfill all legacy `post_id` rows to a user → optional in migration comment; `user_id IS NULL` policy covers demo

## Next

`CLAUDE_MODEL=opus ./scripts/run-claude-task.sh --execute`
