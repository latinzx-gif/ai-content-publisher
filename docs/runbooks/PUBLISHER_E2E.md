# Publisher E2E (Playwright)

**App:** `head-office-app` @ `http://localhost:3001`  
**Task:** P1-03

## Install browsers (one time)

```bash
cd head-office-app
npx playwright install chromium
```

## Always runnable — auth gate

Verifies anonymous users are redirected to `/publisher/login`:

```bash
npm run test:e2e:gate
```

## Full 12-step smoke (authenticated)

Requires a saved Supabase session (magic-link login once).

### 1. Save auth state

```bash
npm run dev -- -p 3001
# another terminal:
npx playwright codegen http://localhost:3001/publisher/login \
  --save-storage=playwright/.auth/publisher.json
```

Complete magic-link login in the opened browser, then close codegen.

### 2. Run workflow tests

```bash
npm run test:e2e:publisher
```

Optional fixed post id:

```bash
E2E_PUBLISHER_POST_ID=my-post-123 npm run test:e2e:publisher
```

## All E2E

```bash
npm run test:e2e
```

## CI notes

- Set `PLAYWRIGHT_SKIP_WEBSERVER=1` if the app is started externally.
- Authenticated project is **skipped** when `playwright/.auth/publisher.json` is missing.
- Upload `playwright/.auth/publisher.json` as a CI secret artifact for full workflow runs.

## Related

- Step map: `e2e/publisher-steps.ts`
- Config: `playwright.config.ts`
