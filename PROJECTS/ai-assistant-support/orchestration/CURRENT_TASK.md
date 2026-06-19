# CURRENT_TASK: Phase 1 LIVE ✅ / Next — Incident → Linear Implementation (Task 5 complete)

## Phase

COMPLETE (Phase 1 MVP)

## Status

✅ **LIVE** — app, LIFF, webhook, env vars, cron, and LINE Rich Menu are configured live

## สิ่งที่ทำ

| ขั้นตอน | สถานะ |
|---------|--------|
| Deploy to Vercel | ✅ |
| Set env vars (production) | ✅ |
| Verify endpoints | ✅ All 200/401 |
| SQL migrations | ✅ (มีข้อมูลแล้ว) |
| LINE webhook URL | ✅ active |
| Linear webhook | ✅ ID `dfaf8b10...` |
| LIFF app | ✅ ID `2010416723-q3dOdIyS` |
| Cron: Queue Monitor | ✅ ทุก 1 ชม. |
| Cron: Notify Retry | ✅ ทุก 30 นาที |
| Cron: Daily Summary | ✅ ทุก 8:00 น. |
| Rich Menu created | ✅ `richmenu-cf569ac22e493111e6a36411071dd088` |
| Rich Menu image uploaded | ✅ via `api-data.line.me` |
| Rich Menu set as default | ✅ verified via `GET /v2/bot/user/all/richmenu` |
| LIFF ticket URL | ✅ HTTP 200 |
| LIFF status URL | ✅ HTTP 200 |

## Next

1. ✅ `docs/INCIDENT_TO_LINEAR_IMPLEMENTATION_MAP.md` complete
2. ✅ Task 1 complete — shared incident/title/label builder extracted
3. ✅ Task 2 complete — `aas_incidents` migration + generated DB types + shared incident contract
4. ✅ Task 3 complete — fingerprint/create-or-bump incident service + Linear comment/update helpers
5. ✅ Task 4 complete — secure `/api/internal/incidents` ingestion endpoint (secret header + validation + `createOrBumpIncident` orchestration)
6. ✅ Task 5 complete — watcher relay now posts simulated alerts to `/api/internal/incidents`
7. Keep Phase 2 (AI triage, agent queue) **LOCKED** until ฟาเดล approves

หมายเหตุ: Rich Menu live state is API-verified in this session. A handset spot-check is still recommended operationally, but Phase 1 no longer has a deployment blocker.
