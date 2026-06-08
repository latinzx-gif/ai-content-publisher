# Production Smoke Runbook

This runbook closes the remaining post-deploy MVP gate for the AI Content Platform.

## Current production URL

- Production alias: https://head-office-app.vercel.app

## Stage 1: Production readiness audit

Run:

```bash
npm run mvp:audit
```

This also writes a redacted machine-readable report:

```text
reports/mvp-production-audit.json
```

The report contains pass/fail status, smoke gate readiness, and the next command to run. It does not include API keys, bearer tokens, or secret values.

`reports/` is ignored by git because audit reports are runtime handoff artifacts.

The report includes `mvpComplete`. This value must remain `false` until authenticated smoke has passed with a dedicated smoke user.

To print the current final-gate command from the latest report:

```bash
npm run smoke:next
```

Or run the checks separately:

```bash
npm run deploy:check -- production
npx vercel inspect head-office-app.vercel.app
npm run smoke:deploy -- https://head-office-app.vercel.app
```

Pass criteria:

- `NEXT_PUBLIC_SUPABASE_URL` is configured.
- `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `OPENAI_API_KEY` is configured.
- `head-office-app.vercel.app` resolves to a production deployment with status `Ready`.
- `/api/health` returns `200`.
- `/prd` returns `200`.
- `/prd` includes required security headers.
- `/prd?page=publishing&tab=scheduled` returns `200`.
- Protected review API rejects missing bearer with `401`.

Current note, 2026-06-07:

- `npm run deploy:check -- production` passes with required env configured `3/3`.
- `npx vercel inspect head-office-app.vercel.app` passes with deployment status `Ready`.
- `npm run smoke:deploy -- https://head-office-app.vercel.app` currently fails only because the production alias is serving an older build without Stage 6/7 security headers.
- After explicit approval, redeploy current code and rerun smoke:

```bash
npm run build
npx vercel deploy --prebuilt --prod
npm run smoke:deploy -- https://head-office-app.vercel.app
```

## Stage 2: Dedicated smoke user setup

Use a dedicated smoke/test email only. Do not use a real admin, lawyer, accountant, or customer account.

Run:

```bash
AI_CONTENT_SMOKE_EMAIL=smoke-test@yourdomain.com \
AI_CONTENT_CONFIRM_CREATE_SMOKE_USER=yes \
npm run smoke:prod
```

What this does:

- Creates a dedicated Supabase Auth user.
- Reuses an existing dedicated smoke user with the same email by rotating its password.
- Confirms the smoke user email programmatically.
- Creates a short-lived local bearer token.
- Writes the token to `.env.smoke.local`.
- Creates a smoke content item fixture if one does not exist.
- Writes `AI_CONTENT_SMOKE_CONTENT_ID` to `.env.smoke.local`.
- Runs authenticated production smoke test.
- Regenerates the MVP audit report after smoke succeeds. This intentionally runs authenticated smoke again so `mvpComplete` is based on fresh audit evidence.

Safety guard:

- The script will not create a user unless `AI_CONTENT_CONFIRM_CREATE_SMOKE_USER=yes` is set.
- The bearer token is never printed.
- `.env.smoke.local` must not be committed.

## Stage 3: Authenticated production smoke audit

Expected pass output:

```text
PASS runtime health: ok
PASS create review: 201
PASS approve review: 200
Authenticated smoke passed.
```

Pass criteria:

- Production runtime health is OK.
- The smoke user can create a review.
- The smoke user can approve the review.
- API authorization works with a real Supabase bearer token.
- The smoke fixture data is clearly marked as smoke/test metadata.

## Stage 4: MVP closure criteria

The MVP can be considered deploy-ready only when all of these are true:

- Production deployment is `Ready`.
- Production alias resolves to the latest deployment.
- Required production env vars pass `deploy:check`.
- Basic unauthenticated smoke passes.
- Authenticated smoke passes with a dedicated smoke user.
- Remaining gaps are documented as post-MVP, not deploy blockers.

## Known remaining gates

- Production must be redeployed from the current code before security-header smoke can pass.
- Authenticated smoke has not been completed until a dedicated smoke email is provided and `npm run smoke:prod` passes.

## Optional: Smoke cleanup

After authenticated smoke passes, clean up the dedicated smoke account and smoke fixture data:

```bash
AI_CONTENT_SMOKE_EMAIL=smoke-test@yourdomain.com \
AI_CONTENT_CONFIRM_CLEANUP_SMOKE=yes \
npm run smoke:cleanup
```

Cleanup behavior:

- Deletes `review_items` attached to smoke fixture content.
- Deletes `content_items` marked with `metadata.smoke = true` for the smoke profile.
- Deactivates `team_members` with role `smoke_tester`.
- Deletes the Supabase Auth user that exactly matches `AI_CONTENT_SMOKE_EMAIL`.

Safety guard:

- The script refuses to run unless `AI_CONTENT_CONFIRM_CLEANUP_SMOKE=yes` is set.
- Cleanup requires an exact smoke email match.

## Optional predeploy gate before production deploy

Before redeploying production, run the no-side-effect preflight gate:

```bash
npm run deploy:prod:preflight
```

This verifies production env readiness, builds the app, runs local deploy smoke, and checks entitlement locks. It does not deploy and does not transmit secrets.

After it passes and production deploy is explicitly approved, run:

```bash
npx vercel deploy --prebuilt --prod
npm run smoke:deploy -- https://head-office-app.vercel.app
```
