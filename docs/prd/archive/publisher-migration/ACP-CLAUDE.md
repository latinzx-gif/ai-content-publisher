# AI Content Publisher — Claude Code Guide

Read this file first before any work in `apps/ai-content-publisher/`.

---

## What This Project Is

**AI Content Publisher** is a Next.js 16 App Router app in the HEAD-OFFICE monorepo. It implements a **legal/marketing content publishing workflow** for teams that need brand-safe, dual-language social posts with images, QC, review, calendar scheduling, and Buffer publishing.

**North-star demo flow (Phase 1):**

```text
Create → Brief → Rules → Content Generation → Image Prompts → Images
→ Quality Check → Review → Calendar → Publishing → Dashboard → Logs
```

**Target end state (Phase 1 complete criteria):** A user can run the full flow above with **real** persistence (Supabase), **real** AI generation (OpenAI text + images), **real** publishing (Buffer API), and **complete** audit logs — not browser mock data.

---

## What This Project Is NOT

Do **not** confuse this app with other repos in HEAD-OFFICE:

| Path | Role |
|------|------|
| `apps/ai-content-publisher/` | **This app** — active Phase 1 close-out target |
| `PROJECTS/AI Content Legal System/` | 🔒 **LOCKED / retired** — archive only. See `PROJECT_LOCK.md`. Do not implement or deploy. |
| `head-office-app/` | Different product — **PRD is their main web page** at `http://localhost:3001/` (not `/prd`). Out of scope for this app (`:3000`). |

If asked to work on "AI Content Legal System" or `ai-content-publisher-saas`, **stop** and use this app instead unless user explicitly unlocks the retired project.

---

## Current State (as of 2026-06)

### Done — Phase 1 mock/demo layer

- All 17 routes exist; 12 MVP workflow pages are functional with **localStorage** persistence.
- UI shell: Tailwind 4, shadcn/ui, navy sidebar (`src/components/Sidebar.tsx`).
- Mock generation in `src/lib/*` (deterministic samples, not OpenAI).
- Mock Buffer in `src/lib/buffer-publisher.ts` (`mock_publish_*` IDs).
- `npm run build` and `npm run typecheck` pass.
- UI-02 polish completed (`TASK_RESULT.md`).

### Supabase project (confirmed)

| Item | Value |
|------|-------|
| Project | `ai-auto-tools` (`luxegqsccaodcikxhwrm`) |
| Dashboard | https://supabase.com/dashboard/project/luxegqsccaodcikxhwrm |
| Env | `apps/ai-content-publisher/.env.local` |
| Note | Shared with `head-office-app` — INT-01 migrations must use `acp_` table prefix |

### Not done — still required for Phase 1 sign-off

| Gap | Detail |
|-----|--------|
| Persistence | localStorage only — Supabase env ready; schema/client pending INT-01 |
| AI | No `openai` package or API calls |
| Publishing | Buffer is mock — no real API |
| Settings | `/settings` is placeholder card only |
| Logging | `addLog()` missing in content/image/QC/brief libs |
| Lint | `ReviewDashboard.tsx` has 2 ESLint errors |
| `/rules` empty state | No `PostIdEmptyState` wrapper (other post_id pages have it) |
| Git | App folder may be untracked — do not assume committed state |

### Explicitly deferred — do NOT build without user approval

Phase 2: `/sources`, `/knowledge`, `/content-library`, full analytics pipeline, RAG/pgvector, source search APIs.

Phase 3: `/learning-loop`, multi-platform direct APIs, automated optimization.

These routes already show polished placeholder cards. Leave them as placeholders.

---

## Scope Guard (non-negotiable)

Source of truth: `../../PHASE_1_SCOPE_LOCK.md`

1. **One `post_id` per creation session** — all modules share the same ID.
2. **Dual language** — primary post + secondary first comment under same post.
3. **Images** — primary/secondary share `visual_concept_id`; same layout/mood, different text language.
4. **Publishing** — Buffer API only. No direct Meta/LinkedIn/Twitter APIs.
5. **AI** — OpenAI only for text and images when integrated. No multi-model routing.
6. **Auth** — Supabase Auth if needed. No custom auth system.
7. **No pgvector/embeddings** in Phase 1.
8. **No new npm packages** unless the current task explicitly allows it.

When scope is unclear: **stop and ask** rather than invent features.

---

## How Work Is Assigned

This repo uses **AGENT_LOOP.md** (plan → approve → execute → review). Before any work:

1. Read `../../AGENT_LOOP.md` and `../../REVIEW_STATUS.md`
2. Read `../../CURRENT_TASK.md` — check **Phase: PLAN or EXECUTE** and **`## Recommended Model`**
3. Read `../../MODEL_ROUTING.md` — use **sonnet** for bounded tasks; **opus** when Cursor marks EXECUTE as complex (auth, RLS, multi-file migrations)
4. Read `../../SUBAGENT_ROUTING.md` + skill `safe-research-delegator` when `## Subagent Policy` Enabled ≠ no — **research pass ห้ามเขียนไฟล์**; lead agent เขียน Allowed Files คนเดียว
5. If session model ≠ recommended: tell user `/model sonnet` or `/model opus`, or re-run `./scripts/run-claude-task.sh` (auto-picks model)
6. **PLAN phase:** write `TASK_PLAN.md` + `CURSOR_PLAN_REQUEST.md` only — **no code**; flag if EXECUTE should use **opus** + subagent policy
7. **EXECUTE phase:** verify `PLAN_APPROVAL.md` = APPROVED; if Subagent enabled → read-only research pass **before** first `src/` edit
8. Read `../../CURSOR_REVIEW_GATE.md` — **STOP** after each phase
9. Respect **Allowed Files** and **Forbidden Files** in that task.
10. After work, write `TASK_RESULT.md` **and** `CURSOR_REVIEW_REQUEST.md` in this app folder.
11. Do **not** start the next task until Cursor **reviews + cleans up** per `../../CURSOR_REVIEW_GATE.md` and `../../TASK_CLEANUP_CHECKLIST.md`.
12. Do **not** edit orchestration docs unless the task explicitly allows it (DOC-01 only).
13. **Pause Codex/Gemini edits** on same paths during EXECUTE — one writer only.

If `CURRENT_TASK.md` conflicts with this file, **`CURRENT_TASK.md` wins** for the current session.

**Full close-out plan:** `../../CLOSURE_TASK_QUEUE.md` (FIX-01 → CLOSE-01)

---

## Required Reading (before any task)

Read in this order:

| Priority | File | Why |
|----------|------|-----|
| 1 | `../../CURRENT_TASK.md` | Active task scope, allowed/forbidden files |
| 2 | `../../PHASE_1_SCOPE_LOCK.md` | What to build vs defer |
| 3 | `../../reports/NEXT_BUILD_PLAN.md` | Recommended next integration steps |
| 4 | `../../reports/DEMO_READINESS_REPORT.md` | Known risks and demo flow status |
| 5 | `TASK_RESULT.md` | Last completed work in this app |
| 6 | `../../CODEX_TASK_QUEUE.md` | Full task history 00–13 (reference only) |
| 7 | `../../QA_CHECKLIST.md` | Verification checklist per module |
| 8 | `../../HERMES_LOOP_RULES.md` | Build loop rules, validation requirements |

Optional context:

- `../../docs/automated_content_publishing_full_blueprint.html` — product blueprint
- `../../tasks/NEXT_CODEX_TASK.md` — queued small fix (empty states)
- `AGENTS.md` — Next.js 16 breaking-change warning

---

## App Structure

```text
apps/ai-content-publisher/
├── src/app/              # App Router pages (one folder per module)
├── src/components/       # Sidebar, UI primitives, PostIdEmptyState
├── src/lib/              # Business logic (mock today; integrate APIs here)
│   ├── brief-builder.ts
│   ├── rules-loader.ts
│   ├── content-generator.ts
│   ├── image-prompt-generator.ts
│   ├── image-generator.ts
│   ├── quality-checker.ts
│   ├── review-actions.ts
│   ├── calendar-data.ts
│   ├── buffer-publisher.ts
│   ├── dashboard-data.ts
│   └── log-system.ts
├── CLAUDE.md             # This file
├── AGENTS.md             # Next.js 16 agent rules
└── TASK_RESULT.md        # Last task output
```

**Route config** lives in `src/components/Sidebar.tsx` — keep sidebar and routes in sync.

**Post-dependent pages** expect `?post_id=...` in the URL. Demo ID example: `demo-001`.

---

## Data & Status Model

Statuses used across calendar, dashboard, publishing:

`draft` → `revision_requested` → `approved` → `scheduled` → `published` | `failed`

Storage keys are in `src/lib/*` and page components (localStorage). When migrating to Supabase, preserve this model — do not invent a parallel schema without a migration plan.

Log categories (`src/lib/log-system.ts`): `generation`, `image`, `publish`, `error`.

---

## Validation (run after every change)

```bash
cd apps/ai-content-publisher
npm run build
npm run typecheck
npm run lint
```

All three must pass before reporting a task complete.

**Next.js 16:** Read `node_modules/next/dist/docs/` before changing App Router patterns. This is not Next.js 14/15.

**Known warning:** Multiple lockfiles (`~/package-lock.json` vs app `package-lock.json`) cause workspace-root inference warning — fix only if tasked.

---

## Close-Out Queue (FIX-01 → CLOSE-01)

Source of truth: `../../CLOSURE_TASK_QUEUE.md`

| Task | What | Gate |
|------|------|------|
| **FIX-01** | Lint + `/rules` empty state | **ACTIVE** |
| FIX-02 | `addLog()` in all generator libs | Cursor review after FIX-01 |
| INT-01 | Supabase schema + client | Needs env vars |
| INT-02 | localStorage → Supabase | |
| INT-03 | OpenAI text | Needs API key |
| INT-04 | OpenAI images | |
| INT-05 | Buffer + Settings | Needs Buffer token |
| INT-06 | Supabase Auth | |
| QA-01 | E2E verification | |
| DOC-01 | Docs sync | |
| CLOSE-01 | Phase 1 sign-off | Final |

**One task per session. STOP after each. Cursor reviews before next.**

---

## Coding Conventions

- Match existing patterns in neighboring files (minimal diff).
- Use shadcn/ui + Tailwind; CSS variables in `globals.css` — avoid inline hex colors.
- Client components use `"use client"`; `page.tsx` wrappers can be server components for `searchParams`.
- No hardcoded secrets. Use env vars + Settings UI when integrating APIs.
- Do not commit unless the user explicitly asks.

---

## Stop Conditions (escalate to user)

Stop and report instead of guessing when:

- Task requires Phase 2/3 features (sources, RAG, learning loop, direct social APIs)
- Task requires editing forbidden orchestration files
- Supabase project URL/keys are missing for DB work
- Build fix requires changes outside allowed files
- User intent might mean `PROJECTS/AI Content Legal System/` instead of this app

---

@AGENTS.md
