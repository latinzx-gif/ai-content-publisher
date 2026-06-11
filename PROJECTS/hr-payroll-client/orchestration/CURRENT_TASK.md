# CURRENT TASK: T28 — Deployment (production + Vercel config)

## Phase

PLAN

## Status

Ready for PLAN — ใช้ skill `14-deployment-checklist` ก่อน push production

## Primary Agent

Claude Code (claude-fable-5) — integration + Vercel/Supabase CLI

## Goal

Deploy `hr-app` ไป **Vercel production** พร้อม env, Supabase migrations/functions, และอัปเดต LINE webhook URL

### Deliverables

1. **Vercel project** — link repo `hr-payroll-client/hr-app`, production branch
2. **Env vars** (Production + Preview) จาก `.env.local.example` — ไม่ commit secrets
3. **Supabase production** — migrations applied, edge functions deployed (`probation-alerts`, `visa-alerts`, `evening-summary`)
4. **LINE Developers** — Webhook URL → `https://<production-domain>/api/line/webhook`
5. **LIFF endpoints** — `NEXT_PUBLIC_BASE_URL` ชี้ production
6. **`reports/DEPLOY_T28_CHECKLIST.md`** — gate results ทุกข้อจาก skill 14

### Pre-deploy gates (skill 14)

- [ ] `npm run build && npm run typecheck && npm run lint` pass
- [ ] `npm run test:e2e` pass
- [ ] No secrets in git diff
- [ ] Migrations applied on prod Supabase
- [ ] Cron schedules configured (ICT)
- [ ] Smoke: `/login`, `/admin`, webhook signature test

### Allowed Files

```
hr-app/vercel.json
hr-app/.env.local.example (comments only)
hr-app/reports/DEPLOY_T28_CHECKLIST.md
hr-app/_agent/TASK_PLAN.md
hr-app/_agent/CURSOR_PLAN_REQUEST.md
orchestration/DEPLOY_NOTES.md
```

## Forbidden

- Commit `.env.local` / service role keys
- Auth bypass in production env
- Force push main
- แก้ feature code นอก deploy config/docs

## Acceptance Criteria

- [ ] Production URL loads `/admin` (after LINE login)
- [ ] `reports/DEPLOY_T28_CHECKLIST.md` ทุก gate PASS หรือ documented skip
- [ ] LINE webhook verified (200 + signature) on production URL
- [ ] Edge functions deployed and cron active
- [ ] `npm run test:e2e` still passes locally

## Depends

- T27 E2E — ✅ APPROVED
- T26 Security — ✅ APPROVED

## Recommended Model

claude-fable-5

## Skills to Load

- `orchestration/workflow-skills/03-claude-plan/SKILL.md`
- `orchestration/workflow-skills/05-claude-execute/SKILL.md`
- `orchestration/workflow-skills/14-deployment-checklist/SKILL.md`

---
*Set by Cursor — 2026-06-11 — Taskmaster #28 in-progress*
