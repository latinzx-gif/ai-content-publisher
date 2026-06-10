# Cursor Review: P1-SEC-01 — API auth bypass hard-gate (F1 + F4 partial)

**Date:** 2026-06-10  
**Source:** `DELIVERY_READINESS_AUDIT.md` F1 (P0), F4 (deploy gate)  
**Decision:** ✅ APPROVED

## Changes

| File | Change |
|------|--------|
| `src/lib/auth-bypass.ts` | **New** — `NODE_ENV !== 'production'` guard for server + public flags |
| `src/lib/server/apiSecurity.ts` | Uses `isServerApiAuthBypassEnabled()` |
| `src/app/page.tsx` | Uses `isPublicApiAuthBypassEnabled()` |
| `scripts/predeploy-production-gate.mjs` | Fail if bypass flags truthy in env |
| `scripts/check-deploy-readiness.mjs` | Anon key + site URL required; forbid bypass vars in production |
| `.env.example` | Document dev-only bypass flags |

## Verification

- `npm run typecheck` — run at review time
- `npm run build` — run at review time

## Note

Local `.env.local` may still set bypass flags — **safe in dev**; production build ignores them.

**Next:** P1-04e TopBar (page split) or F2/F3 (Buffer + E2E).
