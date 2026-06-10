# Current State Report

Date: 2026-06-06 — **ARCHIVED** (stale — app retired, ดู `reports/DEMO_READINESS_REPORT.md` สำหรับ current state)
App audited: `apps/ai-content-publisher` (retired — merged into `head-office-app`)

## Scope

This is a codebase audit only. No application code was modified. No packages were installed.

References reviewed:

- `docs/automated_content_publishing_full_blueprint.html`
- `docs/hermes_codex_execution_plan.html`
- `CODEX_TASK_QUEUE.md`
- `PHASE_1_SCOPE_LOCK.md`

## App Location

Requested path was `headoffice/apps/ai-content-publisher/`. The actual local path is:

```text
/Users/jakarinosk/HEAD-OFFICE/apps/ai-content-publisher
```

## Framework And Config

- Framework: Next.js App Router.
- Next.js version: `16.2.7`.
- React version: `19.2.4`.
- TypeScript: enabled, strict mode enabled.
- Scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
- Missing script expected by task queue:
  - `npx tsc --noEmit` can be run directly, but there is no `typecheck` npm script.
- Styling:
  - Custom CSS only in `src/app/globals.css`.
  - Tailwind is not installed.
  - shadcn/ui is not installed.
- `.gitignore` covers `.next`, `node_modules`, env files, build output, logs, TypeScript build info.
- `next.config.ts` is default/empty.

Next.js 16 note: the repo itself warns that this Next version has breaking changes and local docs under `node_modules/next/dist/docs/` should be checked before implementation.

## Current Routes

| Route | File | Current State |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Minimal home page with title and instruction to select sidebar module. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Placeholder heading only. |
| `/create` | `src/app/create/page.tsx` | Placeholder heading only. |

No physical pages currently exist for:

- `/briefs`
- `/rules`
- `/content-generation`
- `/image-prompts`
- `/images`
- `/quality-check`
- `/review`
- `/calendar`
- `/publishing`
- `/logs`
- `/settings`
- `/sources`
- `/knowledge`
- `/analytics`
- `/learning-loop`
- `/content-library`

The sidebar links to these routes, but they will currently 404 unless implemented.

## Current Components

| Component | File | Current State |
| --- | --- | --- |
| Root layout | `src/app/layout.tsx` | Imports `Sidebar`, renders a two-column app shell. |
| Sidebar | `src/components/Sidebar.tsx` | Static navigation with all module links grouped into MAIN, WORKFLOW, INTELLIGENCE, SYSTEM. No active state, badges, or route existence checks. |
| Global CSS | `src/app/globals.css` | Custom shell styling including 300px navy sidebar, nav links, pills, base typography/colors. |

## Dependencies

Current runtime dependencies:

- `next`
- `react`
- `react-dom`

Current dev dependencies:

- TypeScript
- ESLint / `eslint-config-next`
- React/Node type packages

Not present:

- `@supabase/supabase-js`
- `@supabase/ssr`
- `openai`
- Buffer SDK/client package
- Tailwind CSS
- shadcn/ui
- form libraries
- validation libraries

## Supabase Status

Supabase is not implemented.

Evidence:

- No Supabase dependency in `package.json`.
- No `src/lib/supabase` directory.
- No database client code.
- No migrations or schema files in this app.
- No Supabase Auth usage.
- No environment variable reads for Supabase.

Phase 1 impact:

- No persistent `post_id` model exists.
- No database-backed drafts/content/images/logs/settings exist.
- Dashboard cannot show live database counts.
- Logs cannot be stored in database tables yet.

## OpenAI Status

OpenAI text and image generation are not implemented.

Evidence:

- No `openai` dependency.
- No API route or server action for generation.
- No prompt builder modules.
- No text generation, image prompt generation, or image generation code.
- No OpenAI env handling.

Phase 1 impact:

- Brief generation is not connected to OpenAI.
- Content generation is absent.
- Image prompt generation is absent.
- Primary/secondary image generation is absent.
- Missing-key safe error behavior still needs to be built.

## Buffer / Publishing Status

Buffer publishing is not implemented.

Evidence:

- No Buffer dependency.
- No publishing client code.
- No publishing route/page file exists.
- No Buffer env handling.
- No publish/schedule/retry/log flow.

Phase 1 impact:

- Publishing route currently 404s.
- Approved content cannot be scheduled or published.
- Buffer status/retry/error logs are absent.

## Phase 1 Coverage Snapshot

| Phase 1 Module | Route | Current State |
| --- | --- | --- |
| Create | `/create` | Placeholder only. |
| Brief Builder | `/briefs` | Missing route. |
| Rule Loader | `/rules` | Missing route. |
| Content Generation | `/content-generation` | Missing route. |
| Image Prompt Generation | `/image-prompts` | Missing route. |
| Image Generation | `/images` | Missing route. |
| Quality Check | `/quality-check` | Missing route. |
| Review & Editing | `/review` | Missing route. |
| Calendar | `/calendar` | Missing route. |
| Publishing | `/publishing` | Missing route. |
| Dashboard | `/dashboard` | Placeholder only. |
| Logs | `/logs` | Missing route. |

## Current Strengths

- App is clean and small.
- App Router structure is present.
- Sidebar already includes the required module names and hrefs.
- Global shell already approximates the blueprint's 300px navy sidebar layout.
- TypeScript strict mode is enabled.

## Current Risks

- Sidebar links mostly point to missing routes.
- No data model or state machine exists.
- No persistence layer exists.
- No AI integration exists.
- No publishing integration exists.
- No Phase 1 functional workflow exists.
- Tailwind/shadcn requirements from Task 01 are not satisfied.
- `CODEX_TASK_QUEUE.md` expects validation after each implementation task; current app lacks a `typecheck` script.

## Audit Verdict

The app is at an early scaffold stage. It has a visual shell foundation and partial navigation, but Phase 1 functionality is effectively unbuilt. The next safe implementation step is Task 01 Product Shell: complete all routes/placeholders and align the shell with the blueprint before building deep workflow logic.
