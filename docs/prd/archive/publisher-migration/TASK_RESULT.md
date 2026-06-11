# INT-06 Task Result: Supabase Auth

**Task:** INT-06  
**Date:** 2026-06-10  
**Status:** COMPLETE — build + lint pass; migration blocked (see note)

---

## 1. What Was Inspected

`layout.tsx` (no auth guard), `supabase/server.ts` (cookie-based client ready), `Sidebar.tsx` (no sign-out), existing migration (RLS placeholder), `db.ts` + `types.ts` for user_id integration points.

Also read: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — confirmed that Next.js 16 renamed `middleware.ts` → `proxy.ts` and the exported function `middleware` → `proxy`.

---

## 2. Files Changed

### New
- **`src/proxy.ts`** — Supabase SSR session refresh + route protection. Redirects unauthenticated users to `/login`; redirects authenticated users away from `/login` to `/dashboard`. Named `proxy` (not `middleware`) per Next.js 16 breaking change.
- **`src/app/login/page.tsx`** — client component: email input → `signIn(email)` Server Action → shows "Check your email" on success
- **`src/app/login/actions.ts`** — `"use server"`: `signIn(email)` calls `signInWithOtp()` with `emailRedirectTo: NEXT_PUBLIC_SITE_URL + /auth/callback`; `signOut()` calls `supabase.auth.signOut()` + `redirect("/login")`
- **`src/app/auth/callback/route.ts`** — Route Handler: exchanges `?code=` for session via `exchangeCodeForSession()`; redirects to `/dashboard` on success or `/login?error=auth_failed` on failure

### Modified
- **`src/components/Sidebar.tsx`** — imports `signOut` Server Action; adds sign-out button at bottom via `<form action={signOut}>`
- **`src/lib/supabase/types.ts`** — adds `user_id: string | null` to `AcpPost`; adds `user_id?: string | null` to `AcpPostInsert` (mirror for migration column)
- **`.env.example`** — added `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### Migration — BLOCKED (apply manually)

`supabase/migrations/20260610000001_acp_rls_auth.sql` could NOT be created by auto-mode (security rule on `supabase/migrations/**`).

**Cursor must apply this migration manually.** SQL content is in `CURSOR_REVIEW_REQUEST.md` Step 2.

---

## 3. Key Behaviors

| Condition | Behavior |
|---|---|
| Unauthenticated request to any route | Proxy redirects → `/login` |
| Authenticated user at `/login` | Proxy redirects → `/dashboard` |
| Email submitted on `/login` | Magic link sent; "Check your email" shown |
| Magic link clicked | `/auth/callback?code=X` exchanges code → session → `/dashboard` |
| Bad/expired code | Redirects to `/login?error=auth_failed` |
| Sign-out button clicked | Session cleared → `/login` |
| New post inserted (browser anon client) | `user_id` auto-set to `auth.uid()` via DB default |
| Service-role writes (openai.ts, buffer-publisher.ts) | Bypass RLS entirely — unaffected |

---

## 4. Next.js 16 Breaking Change: middleware → proxy

The file `src/middleware.ts` is deprecated in Next.js 16. The correct file is `src/proxy.ts` with exported function named `proxy`. Build warning confirmed this. The deprecated `src/middleware.ts` was deleted; `src/proxy.ts` is the live file.

---

## 5. Verification

```
npm run build  → ✓ Compiled. 24/24 pages. 0 TS errors. No deprecation warnings.
npm run lint   → 0 errors, 3 warnings (pre-existing in .claude/skills/driver.mjs)
```

`/auth/callback` and `ƒ Proxy (Middleware)` appear correctly in the route table.

---

## 6. Remaining Risks

1. **Migration not applied** — RLS is not active until Cursor applies `20260610000001_acp_rls_auth.sql`. All routes are auth-gated but DB rows are still world-readable at the API level until then.
2. **`NEXT_PUBLIC_SITE_URL` not in `.env.local`** — magic link redirects to `http://localhost:3000/auth/callback` (dev fallback) which is correct for local dev. Must be set for production deploy.
3. **Supabase email rate limiting** — 3 OTP emails/hour per address on free plan.
4. **`user_id IS NULL` policy arm** — existing demo rows created before INT-06 will be visible to any authenticated user (by design — legacy demo access). New rows get `user_id = auth.uid()`.

---

## 7. Next Recommended Action

Stop here and request Cursor review. Cursor must:
1. Apply `supabase/migrations/20260610000001_acp_rls_auth.sql` to the remote project
2. Add `NEXT_PUBLIC_SITE_URL` to `.env.local`
3. Add `latinzx@gmail.com` (or team emails) to Supabase Auth → Users for login testing

Next tasks: QA-01 (end-to-end) or DOC-01 (docs sync) per CLOSURE_TASK_QUEUE.
