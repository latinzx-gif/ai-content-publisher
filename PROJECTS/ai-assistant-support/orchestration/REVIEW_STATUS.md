# REVIEW_STATUS.md — AI Assistant Support

**Status:** ✅ **Phase 1 MVP LIVE** — Rich Menu default is configured and LIFF entrypoints are reachable
**Date:** 2026-06-16
**Orchestrator:** Hermes Agent
**URL:** https://support-app-brown.vercel.app

## T10 — Deploy Follow-up ✅ COMPLETE

| ขั้นตอน | สถานะ | Agent | Verification |
|---------|--------|-------|-------------|
| Env vars .env.local | ✅ | Hermes | LINE, LIFF, LINEAR, Supabase |
| Env vars Vercel prod | ✅ | Hermes | 10 vars set |
| Deploy to Vercel | ✅ | Hermes | `npm run build` ✅, typecheck ✅ |
| SQL migrations | ✅ | (pre-existing) | aas_clients + aas_tickets มีข้อมูล |
| LINE webhook | ✅ | Hermes | Active — https://support-app-brown.vercel.app/api/line/webhook |
| LIFF app | ✅ | ฟาเดล | ID `2010416723-q3dOdIyS` |
| Linear webhook | ✅ | Hermes | ID `dfaf8b10-12f6-4dc6-b402-f2a269a72947` |
| Verify endpoints | ✅ | Hermes | /liff/clients ✅, webhooks 401 ✅ |
| Cron: Queue Monitor | ✅ | Hermes | ทุก 1 ชม. |
| Cron: Notify Retry | ✅ | Hermes | ทุก 30 นาที |
| Cron: Daily Summary | ✅ | Hermes | ทุก 8:00 น. |
| Rich Menu configured live | ✅ | Hermes | default `richmenu-cf569ac22e493111e6a36411071dd088` via Messaging API |
| Rich Menu image uploaded | ✅ | Hermes | `POST https://api-data.line.me/v2/bot/richmenu/{id}/content` → 200 |
| Rich Menu default verification | ✅ | Hermes | `GET /v2/bot/user/all/richmenu` matches created ID |
| LIFF entrypoint verification | ✅ | Hermes | `/liff/ticket` 200, `/liff/ticket/status` 200, LIFF URLs 200 |

## Taskmaster

| Status | Tasks |
|--------|-------|
| ✅ completed | **T1–T10** — Phase 1 MVP build + deploy scope |
| 🔒 locked | **Phase 2** — AI triage, agent queue (รอฟาเดล approve) |

## Summary

Phase 1 MVP is LIVE. The deployment blocker was the Rich Menu setup; this session created the Rich Menu, uploaded the image, assigned it as the default, and verified the default binding plus LIFF URLs. A real handset tap spot-check is still recommended operationally, but it is no longer a release blocker.

## Incident → Linear Expansion (post-LIVE)

| Step | Status | Agent | Verification |
|------|--------|-------|-------------|
| Task 1 — shared Linear builder | ✅ | Hermes | `npx tsx --test src/lib/incidents/linear.test.ts` ✅, `npm run typecheck` ✅, `npm run build` ✅ |
| Task 2 — `aas_incidents` schema + types | ✅ | Hermes | Disposable Postgres migration apply ✅, `supabase gen types --db-url` ✅, `npx tsx --test src/lib/incidents/types.test.ts` ✅, `npm run typecheck` ✅, `npm run build` ✅ |
| Task 3 — fingerprint/create-or-bump + Linear helpers | ✅ | Hermes orchestrated + Engineering subagent + QA review | `npx tsx --test src/lib/incidents/fingerprint.test.ts src/lib/incidents/linear.test.ts src/lib/actions/incidents.test.ts` ✅ (30/30), `npm run typecheck` ✅, `npm run build` ✅, QA re-review APPROVED |
| Task 4 — secure /api/internal/incidents ingress | ✅ | Hermes | `npx tsx --test src/app/api/internal/incidents/route.test.ts` ✅, `npm run typecheck` ✅, `npm run build` ✅ |
| Task 5 — watcher relay (`scripts/queue-monitor-relay.ts`) | ✅ | Hermes | `npx tsx --test scripts/queue-monitor-relay.test.ts` ✅, `npm run typecheck` ✅, `npm run build` ✅ |
