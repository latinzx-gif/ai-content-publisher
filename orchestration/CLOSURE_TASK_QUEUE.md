# CLOSURE_TASK_QUEUE.md — Phase 1 Close-Out Plan

**App:** `head-office-app` (Publisher `/publisher/*` — consolidated from retired `head-office-app`)  
**Goal:** Close Phase 1 MVP per `PHASE_1_SCOPE_LOCK.md` — real persistence, AI, publishing, logging, QA, handoff.  
**Last Updated:** 2026-06-09

---

## How This Queue Works

Tasks **00–13** and **UI-02** built the mock/demo layer. This queue finishes everything required to **sign off Phase 1**.

### Mandatory review gate (every task)

```text
Implementer reads CURRENT_TASK.md
  → implements ONE task only
  → writes head-office-app/_agent/TASK_RESULT.md
  → writes CURSOR_REVIEW_REQUEST.md
  → STOPS — does NOT start the next task
Cursor reviews diff + validation + acceptance criteria
  → updates REVIEW_STATUS.md (APPROVED / FIX / STOP)
  → updates CURRENT_TASK.md to next task (or fix task)
User tells implementer to continue
```

Full rules: `CURSOR_REVIEW_GATE.md`

**Model routing:** Cursor sets `## Recommended Model` in `CURRENT_TASK.md` per `MODEL_ROUTING.md`. Scripts pass `--model` to Claude Code automatically.

### Do NOT build (Phase 2/3 — locked)

Sources, Knowledge, Content Library, Learning Loop, RAG/pgvector, source search APIs, direct Meta/LinkedIn/Twitter APIs, full analytics pipeline.

---

## Progress Tracker

| Task | Name | Status | Cursor Review |
|------|------|--------|---------------|
| 00–13 | Mock layer build | ✅ Done | — |
| UI-02 | UI polish | ✅ Done | — |
| FIX-01 | Lint + rules empty state | ✅ Done | ✅ Approved |
| FIX-02 | Logging coverage | ✅ Done | ✅ Approved |
| INT-01 | Supabase schema + client | ✅ Done | ✅ Approved |
| INT-02 | Persistence migration | ✅ Done | ✅ Approved |
| INT-03 | OpenAI text generation | ✅ Done | ✅ Approved |
| INT-04 | OpenAI image generation | ✅ Done | ✅ Approved |
| INT-05 | Buffer API + Settings | ✅ Done | ✅ Approved |
| INT-06 | Auth (minimal) | ✅ Done | ✅ Approved |
| **QA-01** | End-to-end verification | 🔲 **NEXT** | — |
| DOC-01 | Docs + reports sync | 🔲 Queued | — |
| CLOSE-01 | Phase 1 sign-off | 🔲 Queued | — |

Cursor updates this table after each review in `REVIEW_STATUS.md`.

---

## FIX-01 — Lint + Rules Empty State

**Prerequisite:** None  
**Blocks:** Everything else (lint must be clean)

### Goal

Fix ESLint errors and align `/rules` with other post_id-dependent pages.

### Allowed Files

```
head-office-app/src/app/review/ReviewDashboard.tsx
head-office-app/src/app/rules/page.tsx
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Forbidden

`package.json`, orchestration docs, Phase 2/3 routes, unrelated files.

### Can Install Packages

NO

### Acceptance Criteria

1. `npm run lint` passes with 0 errors
2. `npm run build` passes
3. `npm run typecheck` passes
4. `/rules` without `?post_id=` shows `PostIdEmptyState` (same pattern as `/briefs`)
5. `/rules?post_id=demo-001` still renders `RulesLoader` unchanged
6. Review auto-pipeline behavior in `ReviewDashboard` preserved (no functional regression)
7. `TASK_RESULT.md` and `CURSOR_REVIEW_REQUEST.md` written

### Stop + Review

STOP after criteria met. Do not start FIX-02.

---

## FIX-02 — Full Logging Coverage

**Prerequisite:** FIX-01 approved by Cursor

### Goal

Every generation action writes to `addLog()` so `/logs` and dashboard analytics reflect the full workflow.

### Allowed Files

```
head-office-app/src/lib/brief-builder.ts
head-office-app/src/lib/rules-loader.ts
head-office-app/src/lib/content-generator.ts
head-office-app/src/lib/image-prompt-generator.ts
head-office-app/src/lib/image-generator.ts
head-office-app/src/lib/quality-checker.ts
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Can Install Packages

NO

### Acceptance Criteria

1. Each lib file above calls `addLog()` on generate/save/error paths
2. Log types: `generation` for text/brief/QC; `image` for prompts/images; `error` on failures
3. Demo flow (Create → … → Publish) produces logs for all 12 steps in `/logs`
4. `npm run build`, `typecheck`, `lint` all pass
5. No change to mock generation output content (logging only)

### Stop + Review

STOP. Cursor verifies log entries appear for steps 2–7 in demo flow.

---

## INT-01 — Supabase Schema + Client

**Prerequisite:** FIX-02 approved  
**User must provide:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only)

If env vars missing → write `STOP_FOR_USER` in TASK_RESULT, do not invent schema.

### Goal

Add Supabase project wiring and SQL migrations for posts, content, images, schedules, logs — matching existing `post_id` / status model.

### Allowed Files

```
head-office-app/package.json
head-office-app/package-lock.json
head-office-app/.env.example
head-office-app/supabase/migrations/*.sql
head-office-app/src/lib/supabase/client.ts
head-office-app/src/lib/supabase/server.ts
head-office-app/src/lib/supabase/types.ts
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Can Install Packages

YES — `@supabase/supabase-js`, `@supabase/ssr` only

### Supabase project (locked)

- **Project:** `ai-auto-tools` — `luxegqsccaodcikxhwrm`
- **URL:** `https://luxegqsccaodcikxhwrm.supabase.co`
- **Dashboard:** https://supabase.com/dashboard/project/luxegqsccaodcikxhwrm
- **Shared with:** `head-office-app` — **must prefix all tables `acp_`** to avoid collisions

### Schema Requirements (minimum)

- `acp_posts` — post_id, status, brand, platform, scheduled_at, metadata JSON
- `acp_post_content` — primary/secondary language blocks per post_id
- `acp_post_images` — primary/secondary, visual_concept_id, version, url
- `acp_audit_logs` — type, action, post_id, details, status, timestamp
- RLS: owner-scoped (prepare for INT-06); service role for migrations

Env: `head-office-app/.env.local` (service role configured; add anon key from dashboard if missing).

Reference (read-only archive): `PROJECTS/AI Content Legal System/supabase/migrations/` — project is **LOCKED** (`PROJECT_LOCK.md`); do not modify. Adapt ideas only.

### Acceptance Criteria

1. Migrations apply cleanly to Supabase project
2. Client helpers compile; no secrets in source
3. `.env.example` documents all required vars
4. `npm run build`, `typecheck`, `lint` pass
5. localStorage code untouched (INT-02 migrates usage)

### Stop + Review

STOP. Cursor reviews migration SQL + RLS + no secret leakage.

---

## INT-02 — Persistence Migration (localStorage → Supabase)

**Prerequisite:** INT-01 approved + env configured

### Goal

Replace localStorage reads/writes with Supabase for posts, content, images, logs. Keep same UI; change data layer only.

### Allowed Files

```
head-office-app/src/lib/*.ts (all lib files)
head-office-app/src/app/**/*.tsx (as needed for async data loading)
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Can Install Packages

BUILD-ERROR-ONLY

### Acceptance Criteria

1. Full demo flow persists across browser refresh and new session (same user)
2. Dashboard counts read from database
3. Calendar, publishing queue, review load from database
4. localStorage only used for ephemeral UI prefs (if any) — not post data
5. `PHASE_1_SCOPE_LOCK.md` criteria #7 satisfied (live DB counts)
6. All validation passes

### Stop + Review

STOP. Cursor runs demo flow + checks Supabase rows.

---

## INT-03 — OpenAI Text Generation

**Prerequisite:** INT-02 approved  
**User must provide:** `OPENAI_API_KEY`

### Goal

Replace mock text in brief, content, QC, and revision flows with OpenAI API. Safe fallback when key missing.

### Allowed Files

```
head-office-app/package.json
head-office-app/src/lib/brief-builder.ts
head-office-app/src/lib/content-generator.ts
head-office-app/src/lib/quality-checker.ts
head-office-app/src/lib/openai.ts (new)
head-office-app/src/app/settings/** (read keys from env/DB only)
head-office-app/.env.example
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Can Install Packages

YES — `openai` only

### Acceptance Criteria

1. With valid key: brief + dual-language content + QC use real OpenAI responses
2. Without key: clear UI error — no silent mock masquerading as real
3. Prompts respect loaded rules (brand, platform, language)
4. `addLog()` on every API call
5. No API key in client bundle
6. All validation passes

### Stop + Review

STOP. Cursor verifies missing-key behavior + one successful generation.

---

## INT-04 — OpenAI Image Generation

**Prerequisite:** INT-03 approved

### Goal

Replace placeholder image URLs with OpenAI image API for primary + secondary (shared `visual_concept_id`).

### Allowed Files

```
head-office-app/src/lib/image-prompt-generator.ts
head-office-app/src/lib/image-generator.ts
head-office-app/src/lib/openai.ts
head-office-app/supabase/migrations/* (storage bucket if needed)
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Can Install Packages

BUILD-ERROR-ONLY

### Acceptance Criteria

1. Primary + secondary images generated via API or stored in Supabase Storage
2. Version history preserved
3. Missing key → clear error state
4. `PHASE_1_SCOPE_LOCK.md` criteria #2–3 satisfied
5. All validation passes

### Stop + Review

STOP. Cursor checks image records in DB/storage.

---

## INT-05 — Buffer API + Settings Page

**Prerequisite:** INT-04 approved  
**User must provide:** Buffer access token (via Settings or env)

### Goal

Real Buffer publish/schedule/retry. Settings page for API credentials and connection status.

### Allowed Files

```
head-office-app/src/lib/buffer-publisher.ts
head-office-app/src/app/settings/**
head-office-app/src/app/publishing/**
head-office-app/.env.example
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Can Install Packages

BUILD-ERROR-ONLY (or Buffer HTTP client if needed)

### Acceptance Criteria

1. `/settings` has forms for OpenAI + Buffer + Supabase status (read-only where env-only)
2. Publish/schedule/retry call real Buffer API when token present
3. Mock mode clearly labeled when token absent
4. Publish logs in `audit_logs`
5. `PHASE_1_SCOPE_LOCK.md` criteria #6 satisfied
6. All validation passes

### Stop + Review

STOP. Cursor reviews Settings UI + publish flow (mock or live per env).

---

## INT-06 — Supabase Auth (Minimal)

**Prerequisite:** INT-05 approved  
**Recommended model:** PLAN `opus` · EXECUTE `opus` (auth + middleware + RLS)  
**Subagent policy:** Enabled `yes` · read-only · `safe-research-delegator`, `supabase-rls-security-auditor`, `nextjs-app-router-auditor`

### Goal

Basic auth boundary so posts/logs are user-scoped. No custom auth system.

### Allowed Files

```
head-office-app/src/lib/supabase/**
head-office-app/src/app/layout.tsx
head-office-app/src/app/login/** (new)
head-office-app/src/middleware.ts (new)
head-office-app/supabase/migrations/* (RLS updates)
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Can Install Packages

BUILD-ERROR-ONLY

### Acceptance Criteria

1. Unauthenticated users redirected to login
2. RLS enforces user owns their posts
3. Existing demo flow works for authenticated user
4. All validation passes

### Stop + Review

STOP. Cursor verifies RLS + login flow.

---

## QA-01 — End-to-End Verification

**Prerequisite:** INT-06 approved (or INT-05 if auth deferred by user)  
**Recommended model:** PLAN `sonnet` · EXECUTE `sonnet` (bump to `opus` if blocking cross-layer bugs)

### Goal

Run full Phase 1 demo flow + update readiness report.

### Allowed Files

```
head-office-app/** (read + test)
reports/DEMO_READINESS_REPORT.md
reports/NEXT_BUILD_PLAN.md
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
```

### Can Install Packages

YES — `@playwright/test` only if browser E2E is in scope

### Acceptance Criteria

1. All 12 demo steps in `QA_CHECKLIST.md` pass manually or via Playwright
2. `npm run build`, `typecheck`, `lint` pass
3. `DEMO_READINESS_REPORT.md` updated with real integration status
4. No Phase 2/3 scope creep

### Stop + Review

STOP. Cursor runs validation + reviews updated report.

---

## DOC-01 — Documentation Sync

**Prerequisite:** QA-01 approved

### Goal

Align all orchestration docs with actual shipped state.

### Allowed Files

```
PROJECT_STATE.md
reports/CURRENT_STATE_REPORT.md
reports/IMPLEMENTATION_GAP_MAP.md
reports/NEXT_BUILD_PLAN.md
head-office-app/CLAUDE.md
CLOSURE_TASK_QUEUE.md (progress table only)
REVIEW_STATUS.md
```

### Acceptance Criteria

1. No doc still claims "Tailwind not installed" or "routes missing"
2. `IMPLEMENTATION_GAP_MAP.md` reflects closed gaps
3. `CLAUDE.md` current state section accurate
4. Phase 2/3 still marked deferred

### Stop + Review

STOP. Cursor spot-checks docs vs codebase.

---

## CLOSE-01 — Phase 1 Sign-Off

**Prerequisite:** DOC-01 approved

### Goal

Final checklist against `PHASE_1_SCOPE_LOCK.md` complete criteria. Prepare handoff.

### Allowed Files

```
reports/PHASE_1_SIGNOFF.md (new)
head-office-app/_agent/TASK_RESULT.md
head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
QA_CHECKLIST.md (check boxes only)
```

### Acceptance Criteria

1. All 10 criteria in `PHASE_1_SCOPE_LOCK.md` § "Phase 1 Complete Criteria" checked ✅
2. `reports/PHASE_1_SIGNOFF.md` lists: what was built, env vars needed, known limitations, Phase 2 entry points
3. Recommended git commit file list provided (no commit unless user asks)
4. Project marked **CLOSED** in `REVIEW_STATUS.md`

### Stop

This is the final task. After Cursor approves CLOSE-01, Phase 1 is done.

---

## Phase 1 Complete Criteria Mapping

| # | Criterion | Closing Task |
|---|-----------|--------------|
| 1 | Topic → brief → dual-language content | INT-03 |
| 2 | Image prompts + primary/secondary images | INT-04 |
| 3 | Quality Check flags issues | INT-03 |
| 4 | Review, edit, approve, revision | INT-02 (persist) + existing UI |
| 5 | Calendar shows scheduled posts | INT-02 |
| 6 | Buffer publish or manual fallback | INT-05 |
| 7 | Dashboard live DB counts | INT-02 |
| 8 | Full audit logs | FIX-02 + INT-02 |
| 9 | `npm run build` zero errors | Every task |
| 10 | `tsc --noEmit` passes | Every task |

---

## Quick Reference for Implementer

```bash
# Before starting ANY task
cat ../../CURRENT_TASK.md
cat ../../CURSOR_REVIEW_GATE.md
cat ../../REVIEW_STATUS.md   # confirm previous task APPROVED

# After completing task
cd head-office-app
npm run build && npm run typecheck && npm run lint
# Write TASK_RESULT.md + CURSOR_REVIEW_REQUEST.md
# STOP — wait for Cursor review
```
