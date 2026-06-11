# Cursor Review: INT-05 — Buffer API + Settings

**Date:** 2026-06-10  
**Decision:** ✅ APPROVED (with hotfix)

## Validation

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ PASS (driver.mjs warnings only) |
| `"use server"` buffer-publisher | ✅ |
| Server audit logs (`acp_audit_logs`) | ✅ `serverLog()` — no `addLog()` |
| env-only token + read-only Settings | ✅ |
| `bufferMode` prop from page.tsx | ✅ |
| `testBufferConnection` + JSON errors | ✅ `settings/actions.ts` |
| `BUFFER_PROFILE_ID` in `.env.example` | ✅ |
| Mock banner + `[MOCK]` logs | ✅ |
| Scope | ✅ allowed files only |

## Acceptance Criteria

1. ✅ `/settings` OpenAI + Buffer + Supabase status
2. ✅ Publish/schedule/retry → Buffer API when token present
3. ✅ Mock mode labeled when token absent
4. ✅ Publish logs in audit table
5. ✅ build + typecheck + lint pass
6. ✅ TASK_RESULT + CURSOR_REVIEW_REQUEST

## Cursor hotfix

- **`bufferSchedule`**: live path now converts `scheduled_at` to **Unix seconds** via `toBufferScheduledAt()` — was missing vs `INT-05_PLAN_REVIEW.md` condition #5

## Notes

- `/publishing` + `/settings` static at build — env baked until restart (acceptable Phase 1)
- Current `BUFFER_ACCESS_TOKEN` is OIDC type → live publish fails with clear error; Settings Test Connection surfaces it
- Live schedule untested with valid Buffer API token
- Secondary post = manual first comment (documented in UI)

## Next Task

INT-06 — Supabase Auth (PLAN, opus, subagent enabled)
