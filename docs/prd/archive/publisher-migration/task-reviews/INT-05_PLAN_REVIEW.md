# Cursor Plan Review: INT-05 — Buffer API + Settings

**Date:** 2026-06-09  
**Decision:** ✅ APPROVED → EXECUTE

## Decisions

| Question | Decision |
|----------|----------|
| Token storage | **env-only** — `BUFFER_ACCESS_TOKEN` in `.env.local`; Settings read-only status |
| Server Actions file | **Single** `buffer-publisher.ts` with `"use server"` (matches `openai.ts`) |
| Profile ID | **First active profile** fallback; `BUFFER_PROFILE_ID` env override when set |
| Mock banner | **Prop from `publishing/page.tsx`** — not `useEffect` + `getBufferMode()` |
| `testBufferConnection` | **`src/app/settings/actions.ts`** (new) — keep Settings UI thin |

## Cursor conditions (EXECUTE)

1. Pass `bufferMode: "live" \| "mock"` from async `publishing/page.tsx` → `PublishQueue` prop
2. Mock banner + mock log prefix `[MOCK]` when token absent; live path when token present
3. Map Buffer `text` from `content.primary` (headline + long_form + hashtags); secondary remains first-comment manual note in log
4. `testBufferConnection()` must parse Buffer JSON error body (e.g. OIDC 401 message) — not status code only
5. Live schedule: Buffer `scheduled_at` as Unix seconds from ISO input
6. Server audit logs via `createServiceClient()` → `acp_audit_logs`; no `addLog()` in buffer-publisher
7. Document optional `BUFFER_PROFILE_ID` in `.env.example`
8. No migrations; no new packages unless build breaks

## Notes

- `BUFFER_ACCESS_TOKEN` is in `.env.local` but current value returns OIDC 401 — live publish will fail until valid Buffer API token; Settings test must surface this clearly
- Token presence ≠ token validity — mock banner only when token **absent** (acceptable Phase 1)
- Buffer v1 deprecation noted — OK for Phase 1 MVP

## Next

Claude `--execute` per approved `TASK_PLAN.md` + conditions above.
