# Cursor Review: INT-06 — Supabase Auth

**Date:** 2026-06-10  
**Decision:** ✅ APPROVED (with manual migration step)

## Validation

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS (24/24 pages, `ƒ Proxy`) |
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ PASS (driver.mjs warnings only) |
| Magic link auth | ✅ `signInWithOtp` + `/auth/callback` |
| Route protection | ✅ `src/proxy.ts` (Next.js 16 convention) |
| Sign-out | ✅ Sidebar form → `signOut()` |
| `user_id` types | ✅ `types.ts` updated |
| `NEXT_PUBLIC_SITE_URL` | ✅ `.env.example` + `.env.local` |
| Scope | ✅ allowed files; no package.json changes |
| Server Actions bypass RLS | ✅ `createServiceClient()` unchanged |

## Acceptance Criteria

1. ✅ Unauthenticated → `/login` (proxy redirect)
2. ⚠️ RLS — migration **file created**; **apply to remote** (see below)
3. ✅ Demo flow path when logged in (code ready)
4. ✅ Validation passes

## Cursor cleanup done

1. Created `supabase/migrations/20260610000001_acp_rls_auth.sql` (with `TO authenticated` on policies)
2. Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`

## User action required

Apply migration to Supabase project `luxegqsccaodcikxhwrm`:

- Dashboard → SQL Editor → run contents of `supabase/migrations/20260610000001_acp_rls_auth.sql`
- Or `supabase db push` after `supabase link` (CLI link failed — account privileges)

Add redirect URL in Supabase Auth → URL Configuration:

- `http://localhost:3000/auth/callback`

Restart dev server after env change.

## Notes

- `proxy.ts` correct for Next.js 16.2.7 (not deprecated `middleware.ts`)
- Legacy rows `user_id IS NULL` visible to any authenticated user (per plan)
- Browser `addLog()` → `insertAuditLog` may fail until RLS applied + user logged in — server logs unaffected
- Live auth smoke not run in review

## Next Task

QA-01 — End-to-End Verification (PLAN)
