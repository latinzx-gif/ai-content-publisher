# CURRENT TASK: P1-DEMO-FINAL — Content OS demo readiness

## Phase

DEMO READY

## Status

**Content OS login:** `/publisher/login` (single entry; `/login` redirects)  
**Magic link:** hash-token completion on login page (implicit flow)  
**Auth gate:** Playwright 13/13 passed  
**Workflow E2E:** Playwright 13/13 passed (12 routes + draft save)  
**Build:** `npm run build` passes  
**Facebook publish/schedule:** verified live  
**Publisher logs:** `/publisher/logs` live  
**Claude Code runtime:** added (shared agent daemon bridge)  
**Buffer:** paused  
**Google (Gmail login + Drive):** optional — add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env.local`

## Primary Agent

Cursor

## Demo path (recommended)

1. `/publisher/login` — magic link (or Google after env set)
2. `/publisher/create` → `/publisher/review` → `/publisher/publishing`
3. PRD `/?page=settings` — Integrations (Facebook connected)
4. `/publisher/logs` — audit trail

## Goal checklist

- [x] Single login at `/publisher/login`; remove standalone `/login` UI
- [x] Fix login page stacking (layout layers)
- [x] `/publisher/logs` page
- [x] Google OAuth custom flow (no Supabase provider required)
- [x] Claude Code runtime alongside Codex
- [x] Playwright auth gate suite (13/13)
- [x] Playwright workflow suite (13/13) via `npm run test:e2e:auth`
- [x] Magic-link hash session completion on login page
- [x] Production build green
- [ ] User adds Google OAuth env + restart dev (optional for demo)
- [ ] (Later) Google Drive → RAG ingest

## Next action (user)

1. **Demo now** — magic link at `/publisher/login` (no Google env required)
2. Optional: Gmail button — add Google OAuth credentials + redirect URI
3. Re-run E2E anytime: `npm run test:e2e:auth && npm run test:e2e:all`
