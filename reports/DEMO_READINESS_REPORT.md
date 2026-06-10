# Demo Readiness Report

**Date:** 2026-06-10 (P0-VERIFY)  
**App:** `head-office-app` (Publisher at `/publisher/*`)  
**Dev URL:** http://localhost:3001

---

## Build status

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ 0 errors (30 warnings) — P1-01 done |

---

## Integration status

| Integration | Status | Notes |
|-------------|--------|-------|
| Supabase `acp_*` | ✅ **Verified remote** | `verify-acp-schema.sh` + insert test PASS |
| Supabase Auth (magic link) | ✅ Proxy + routes | Callback `http://localhost:3001/publisher/auth/callback` — user configured |
| OpenAI (text + images) | ✅ Wired | Needs live session for full generate |
| Buffer publish | ⚠️ No token in `.env.local` | Mock/warn OK for demo |
| Persistence | ✅ Supabase `acp_*` | Not localStorage-only |

---

## Publisher routes (`:3001`)

| Route | Present | Auth gate |
|-------|---------|-----------|
| `/publisher/create` | ✅ | ✅ 307 if anonymous |
| `/publisher/briefs` | ✅ | ✅ |
| `/publisher/rules` | ✅ | ✅ |
| `/publisher/content-generation` | ✅ | ✅ |
| `/publisher/image-prompts` | ✅ | ✅ |
| `/publisher/images` | ✅ | ✅ |
| `/publisher/quality-check` | ✅ | ✅ |
| `/publisher/review` | ✅ | ✅ |
| `/publisher/calendar` | ✅ | ✅ |
| `/publisher/publishing` | ✅ | ✅ |
| `/publisher` (dashboard) | ✅ | ✅ |
| `/publisher/logs` | ✅ | ✅ |
| `/publisher/login` | ✅ | public 200 |

---

## Demo flow (12 steps)

| Step | Status | Notes |
|------|--------|-------|
| 1–12 | ⚠️ Manual after login | Routes + DB ready; run once signed in |

---

## Known limitations

1. Buffer token missing — live publish WARN
2. Playwright gate tests pass; full 12-step needs saved auth (`PUBLISHER_E2E.md`)
4. PRD `/` separate product surface

---

## Recommendation

**Demo-ready for dev** — sign in at `/publisher/login` and walk 12 steps.  
**Production:** Buffer token + E2E + lint (Phase 1.1 queue).
