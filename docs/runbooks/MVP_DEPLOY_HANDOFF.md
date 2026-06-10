# AI Content Platform MVP Deploy Handoff

Last updated: 2026-06-07

## Current gate status

| Stage | Status | Evidence |
|---|---:|---|
| P0.3 Review API atomicity | PASS | Supabase migrations applied through `20260606075045_add_atomic_create_review_rpc_and_grants`; audit found no high/medium blockers. |
| P0.4 API guard smoke | PASS | Protected API routes return `401` for missing bearer instead of `500`; audit found no high/medium blockers. |
| P0.5 Deploy hygiene | PASS | `next.config.ts` pins Turbopack root; `.env.example` and README env contract added; build warning removed. |
| P1 Deploy/runtime | PARTIAL | Vercel production env readiness and alias inspection pass, but production alias is serving an older build without Stage 6/7 security headers. |
| P1.1 Health endpoint | PASS | `/api/health` returns `200 ok` when required runtime env is configured and `503 degraded` when missing. |
| P1.2 Deploy automation | PASS | `deploy:check` and `smoke:deploy` scripts added and audited. |
| P1.3 Authenticated smoke harness | PASS | `smoke:auth` added and audited; requires bearer token and smoke content id. |
| P1.4 Smoke fixture prep | PASS | `smoke:prepare` added and audited; validates bearer token and refuses to escalate existing team members. |

## Current blocker

Production is ready at the env/alias level, but the production alias is serving an older deployment that does not include the Stage 6/7 security headers.

Current evidence:

- `npm run deploy:check -- production`: required production vars are configured `3/3`.
- `npx vercel inspect head-office-app.vercel.app`: production alias resolves to a `Ready` deployment.
- `npm run smoke:deploy -- https://head-office-app.vercel.app`: runtime health and protected API checks pass, but `/prd` fails the security-header portion of the smoke because production is stale.
- `AI_CONTENT_VERCEL_ENV_FILE=.env.local npm run deploy:env:dry-run -- preview`: required preview values are present locally and ready to push, but no secret values have been transmitted to preview yet.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Optional:

- `OPENAI_EMBEDDING_MODEL` defaults to `text-embedding-3-small`
- `OPENAI_AGENT_TEXT_MODEL` defaults to `gpt-5.1`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is needed only before browser-native Supabase client features are enabled
- `BUFFER_ACCESS_TOKEN` is needed before live Buffer publishing is enabled
- `CODEX_LOCAL_BRIDGE_SECRET` is needed before signed local Codex bridge actions are enabled

## Safe production redeploy sequence after approval

Production env is already configured. The remaining production blocker is redeploying the current local code so the security headers and latest smoke tooling are included.

After explicit approval to deploy production:

```bash
npm run build
npx vercel deploy --prebuilt --prod
npm run smoke:deploy -- https://head-office-app.vercel.app
```

Expected `smoke:deploy` result:

- `/api/health` returns `200`
- `/prd` returns `200`
- `/prd?page=publishing&tab=scheduled` returns `200`
- `/prd` includes required security headers
- unauthenticated `/api/reviews` returns `401`

## Safe preview env sequence after approval

Preview env values are available locally in `.env.local` and have passed dry-run. To push them to preview, explicit approval is required because this transmits `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` to Vercel.

```bash
AI_CONTENT_VERCEL_ENV_FILE=.env.local npm run deploy:env:dry-run -- preview
AI_CONTENT_VERCEL_ENV_FILE=.env.local npm run deploy:env:push -- preview
npm run deploy:check -- preview
```

Do not paste secret values into shell commands. Keep secrets in non-committed local env files or Vercel's encrypted env store.

For branch-scoped preview env vars, use a non-production branch explicitly after approval:

```bash
AI_CONTENT_VERCEL_ENV_FILE=.env.local AI_CONTENT_VERCEL_GIT_BRANCH=feature-branch npm run deploy:env:push -- preview
AI_CONTENT_VERCEL_GIT_BRANCH=feature-branch npm run deploy:check -- preview
```

## Authenticated runtime smoke

Use a dedicated smoke/test user token and a smoke fixture content item.

Prepare a fixture:

```bash
set -a
source .env.smoke.local
set +a
npm run smoke:prepare
```

Use a non-committed `.env.smoke.local` file for local smoke secrets:

```bash
cp docs/templates/env.smoke.local.example .env.smoke.local
```

Then edit `.env.smoke.local` as a local file. Do not paste secret values into shell commands. The file format is documented in [env.smoke.local.example](docs/templates/env.smoke.local.example).

Run authenticated smoke:

```bash
set -a
source .env.smoke.local
set +a
npm run smoke:auth -- https://your-preview-url.vercel.app
```

Add `AI_CONTENT_SMOKE_CONTENT_ID=content-item-uuid` to `.env.smoke.local` after `smoke:prepare` prints the fixture id.

Expected `smoke:auth` result:

- `/api/health` returns `200`
- `/api/reviews` creates a legal review with `201`
- `/api/reviews/action` approves that review with `200`

## Security notes

- Do not print `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, or bearer tokens.
- Do not paste real service-role keys or bearer tokens directly into shell commands. Use non-committed local env files or a secrets manager.
- Use a dedicated smoke/test content item.
- Use a least-privilege test user token.
- `smoke:prepare` will not escalate an existing team member that lacks required review smoke permissions.

## Remaining post-MVP hardening ideas

- Add optional `AI_CONTENT_SMOKE_AUTH_USER_ID` or smoke-user email allowlist to `smoke:prepare`.
- Add authenticated browser-level smoke after real login UI/session exists.
- Add production environment checks after preview deployment is proven.
