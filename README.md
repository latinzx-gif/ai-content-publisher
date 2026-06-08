# ai-content-publisher

## PRD Figma Prototype Page

This app has a dedicated route for the PRD prototype:

- `http://localhost:3000/prd` => full-screen embed of `https://cozy-ritzy-09485008.figma.site`
- `http://localhost:3000/` redirects to `/prd`
- Original dashboard remains at `http://localhost:3000/editor-canvas2`

Run locally:

```bash
cd /Users/jakarinosk/HEAD-OFFICE/head-office-app
npm run dev
```

Build & run production:

```bash
npm run build
npm run start
```

## Environment variables

Create these required variables in local `.env.local` and in the deployment environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Optional:

- `OPENAI_EMBEDDING_MODEL`
- `CODEX_LOCAL_BRIDGE_URL`
- `CODEX_LOCAL_BRIDGE_SECRET`

Use [env.vercel.local.example](docs/templates/env.vercel.local.example) as the file-format template. Do not paste real secret values into shell commands.

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` are server-only secrets. Do not expose them in client code.
- `OPENAI_EMBEDDING_MODEL` is optional. The app defaults to `text-embedding-3-small`.
- `CODEX_LOCAL_BRIDGE_URL` and `CODEX_LOCAL_BRIDGE_SECRET` enable the local Codex runtime adapter. Without them, runtime auto-select falls back to OpenAI.
- Protected API routes require a valid Supabase user bearer token.
- `/login` uses server-side auth routes (`/api/auth/sign-in` and `/api/auth/sign-up`) and does not require `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the browser.
- Local smoke-test passwords live in `.env.smoke.local` as `AI_CONTENT_SMOKE_PASSWORD`. The smoke bearer token lives in the same file as `AI_CONTENT_BEARER_TOKEN`.
- The browser stores the active API bearer token in `sessionStorage` under `prd_api_bearer_token`. If "Remember email + password" is enabled, the login form stores `prd_login_email` and `prd_login_password` in `localStorage` on that browser only.

## Local Agent Daemon for Codex runtime

Head Office owns the workflow and can use Codex as an optional local runtime through a small local bridge.

1. Set a non-committed bridge secret in `.env.local`:

```bash
CODEX_LOCAL_BRIDGE_URL=http://127.0.0.1:8787/runtime/execute
CODEX_LOCAL_BRIDGE_SECRET=replace-with-a-local-secret
HEAD_OFFICE_AGENT_WORKSPACE=/Users/jakarinosk/HEAD-OFFICE/head-office-app
HEAD_OFFICE_AGENT_ALLOWED_WORKSPACES=/Users/jakarinosk/HEAD-OFFICE
HEAD_OFFICE_CODEX_COMMAND=codex
HEAD_OFFICE_CODEX_ARGS=exec -
```

2. Start the daemon in a separate terminal:

```bash
cd /Users/jakarinosk/HEAD-OFFICE/head-office-app
set -a
source .env.local
set +a
npm run daemon:agent
```

3. Start the web app in another terminal:

```bash
npm run dev
```

4. In `/prd`, open `Settings > API Tokens`, select `Auto select runtime` or `Codex`, then click `Check runtimes`.

The daemon exposes:

- `GET /health`
- `GET /runtime/discover`
- `POST /runtime/execute`

Every daemon request except `/health` requires `Authorization: Bearer CODEX_LOCAL_BRIDGE_SECRET`. The daemon only runs in the configured workspace allowlist and does not expose raw secrets to the browser.

## Deploy readiness check

After adding deployment environment variables, verify runtime configuration without exposing secret values:

```bash
curl https://your-preview-url.vercel.app/api/health
```

Expected result:

- `200` with `status: "ok"` when required env vars are configured.
- `503` with `status: "degraded"` and a list of missing env var names when configuration is incomplete.

You can also run the deploy checklist locally:

```bash
npm run deploy:check
```

This checks the Vercel `preview` environment by default. Pass another target when needed:

```bash
npm run deploy:check -- production
```

For this project, `main` is the Production Branch. Production already has the non-secret values configured. The helper skips existing env vars by default, so you can keep every value in a non-committed `.env.vercel.local` and run:

```bash
cp docs/templates/env.vercel.local.example .env.vercel.local
```

Then edit `.env.vercel.local` as a local file. Do not paste secret values into shell commands. The file format is documented in [env.vercel.local.example](docs/templates/env.vercel.local.example).

```bash
npm run deploy:env:push -- production
npm run deploy:check -- production
```

For branch-scoped preview env vars, use a non-production branch and pass it through `AI_CONTENT_VERCEL_GIT_BRANCH`:

```bash
AI_CONTENT_VERCEL_GIT_BRANCH=feature-branch npm run deploy:env:push
AI_CONTENT_VERCEL_GIT_BRANCH=feature-branch npm run deploy:check
```

To push only selected variables, use `AI_CONTENT_VERCEL_ENV_NAMES`:

```bash
AI_CONTENT_VERCEL_ENV_NAMES=SUPABASE_SERVICE_ROLE_KEY,OPENAI_API_KEY npm run deploy:env:push -- production
```

Use `AI_CONTENT_VERCEL_ENV_FORCE=yes npm run deploy:env:push` only when intentionally replacing existing Vercel env vars.

After a preview deploy is available, smoke the deployed URL:

```bash
npm run smoke:deploy -- https://your-preview-url.vercel.app
```

To verify authenticated review workflow, provide a valid Supabase user bearer token and an existing accessible `content_items.id`:

```bash
set -a
source .env.smoke.local
set +a
npm run smoke:auth -- https://your-preview-url.vercel.app
```

This checks `/api/health`, creates a legal review, and approves that review. The token is read from the environment and is not printed by the script.
Use a dedicated smoke/test content item and a least-privilege test user token. Do not run this against production editorial content unless you intend to create and approve a real review.

To create a dedicated smoke content item for the bearer token user:

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

The prepare script validates the bearer token with Supabase Auth, creates or updates the token user's `profiles` row, creates a minimal `smoke_tester` team member only when no team member exists, then creates a new `content_items` smoke fixture. It refuses to escalate permissions for an existing team member. It prints the resulting `AI_CONTENT_SMOKE_CONTENT_ID` and does not print the bearer token or service role key.

### Push to GitHub

1. Review changed files and confirm no local secrets are included.
2. `git add .`
3. `git commit -m "Prepare AI content platform MVP for deploy"`
3. `git push`
