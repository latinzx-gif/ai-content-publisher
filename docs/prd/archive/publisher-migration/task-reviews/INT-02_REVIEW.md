# Cursor Review: INT-02 — Persistence Migration

**Date:** 2026-06-09  
**Decision:** ✅ APPROVED (with 1 publish hotfix applied by Cursor)

## Validation

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ PASS (3 warnings, `driver.mjs` only) |
| Scope (`src/lib/*`, `src/app/**`) | ✅ PASS |
| Migrations untouched | ✅ PASS |
| `create-draft` localStorage only | ✅ PASS |
| Post data localStorage removed | ✅ PASS (logs + create-draft only) |

## Acceptance Criteria

1. ✅ Persistence layer migrated to `acp_*` via `src/lib/db.ts`
2. ✅ Dashboard counts from `getDashboardCounts()`
3. ✅ Calendar / publishing / review use DB helpers
4. ✅ Ephemeral draft stays in localStorage
5. ✅ build + typecheck + lint pass
6. ✅ TASK_RESULT + CURSOR_REVIEW_REQUEST written

## Hotfix during review

**Issue:** `PublishQueue` wrote `status: "publishing"` but DB CHECK constraint omits that value → upsert would fail before publish.

**Fix:** Removed intermediate `publishing` upserts; `buffer-publisher.ts` sets `published` / `scheduled` / `failed` directly.

## Notes (deferred, not blocking)

- `publishing` remains in TS union but unused in DB — harmless
- `as any` on db upserts — acceptable until `supabase gen types`
- `addLog()` dual-write localStorage + fire-and-forget DB
- No RLS → INT-06
- Images still `is_placeholder: true` → INT-04
- `metadata` merge not atomic — OK for single-user demo

## Next Task

INT-03 — OpenAI Text Generation (Phase: PLAN)
