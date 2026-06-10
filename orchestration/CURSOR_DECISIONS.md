# CURSOR_DECISIONS.md — Decision Log

**Owner:** Cursor  
**Last Updated:** 2026-06-10

Single reference for locked infrastructure, per-task approvals, and workflow rules. Implementers: read `REVIEW_STATUS.md` for current task; this file for **why** decisions were made.

---

## Single app (consolidated 2026-06-10)

| Surface | Path | Dev URL | Role |
|---------|------|---------|------|
| **Head Office PRD** | `head-office-app/src/app/page.tsx` | **http://localhost:3001/** | Main product — dashboard, agents, create/review |
| **Content OS (Publisher)** | `head-office-app/src/app/publisher/*` | **http://localhost:3001/publisher/** | Phase 1 workflow (formerly `apps/ai-content-publisher` on :3000) |

- `head-office-app/` **retired** — code lives under `head-office-app`.
- Dev: `cd head-office-app && npm run dev` (default **:3001** if :3000 taken).
- Publisher auth: magic link at `/publisher/login`; PRD auth: password at `/login`.

---

## Claude Code model (locked)

| Decision | Value | Since |
|----------|-------|-------|
| Default model | **`claude-fable-5`** (Fable 5) | 2026-06-10 |
| Scripts | `run-claude-task.sh`, `run-claude-background.sh`, `tmux-claude.sh` pass `--model claude-fable-5` when unset |
| Override | `CLAUDE_MODEL` env or per-task `## Recommended Model` table |

---

## Infrastructure (locked)

| Decision | Value | Since |
|----------|-------|-------|
| Active app | `head-office-app` (PRD `/` + Publisher `/publisher/*`) | Phase 1 consolidated |
| Retired project | `PROJECTS/AI Content Legal System/` — do not implement | PROJECT_LOCK |
| Supabase project | `ai-auto-tools` / `luxegqsccaodcikxhwrm` | INT-01 |
| Table prefix | `acp_` (shared DB with head-office-app) | INT-01 |
| AI provider | OpenAI only (text + DALL-E) | Phase 1 lock |
| Publishing | Buffer API only (no direct Meta/etc.) | Phase 1 lock |
| Persistence | Supabase (not localStorage) | INT-02+ |

---

## Workflow (locked)

| Decision | Rule |
|----------|------|
| Review gate | Implementer STOP → Cursor review → next task |
| Plan before code | `PLAN_APPROVAL.md` must be APPROVED before EXECUTE |
| Model routing | Cursor sets `## Recommended Model` in `CURRENT_TASK.md` — see `MODEL_ROUTING.md` |
| Subagents | Complex tasks: read-only research first — see `SUBAGENT_ROUTING.md` |
| One writer | Only Claude lead agent writes `src/` during EXECUTE; Codex/Gemini pause |

---

## Task approvals

| Task | Decision summary |
|------|------------------|
| FIX-01 | ESLint clean + `/rules` PostIdEmptyState |
| FIX-02 | `addLog()` in 6 generator libs |
| INT-01 | `acp_*` schema + Supabase clients |
| INT-02 | localStorage → Supabase; service-role for server writes |
| INT-03 | OpenAI text via Server Actions in `openai.ts` |
| INT-04 | DALL-E 3 Option A — URL direct, no storage migration |
| INT-05 | Buffer env-only; `"use server"` buffer-publisher; Settings read-only; mock banner via prop |
| INT-06 | Magic link + `proxy.ts` + RLS migration file + sign-out |
| **QA-01** | **PLAN next** — E2E after migration applied |

---

## INT-04 plan decisions

- Option A: store DALL-E URL directly (no Supabase Storage)
- `generateImage()` async; `is_placeholder: false`

## INT-05 plan decisions

- Token: `BUFFER_ACCESS_TOKEN` env-only
- Single `buffer-publisher.ts` with `"use server"`
- First Buffer profile fallback; `BUFFER_PROFILE_ID` override
- `bufferMode` prop from `publishing/page.tsx`
- `testBufferConnection` in `settings/actions.ts`

## INT-05 execute hotfix

- `bufferSchedule`: convert `scheduled_at` to Unix seconds (`toBufferScheduledAt`)

## INT-06 plan decisions (pending execute)

| Question | Decision |
|----------|----------|
| Magic link vs password | **Magic link** |
| RLS in INT-06? | **Yes** — `user_id` + policies (acceptance criteria) |
| Sidebar email? | **No** — sign-out only |
| `NEXT_PUBLIC_SITE_URL` | **Yes** |

---

## Known env / ops

| Item | Status |
|------|--------|
| `BUFFER_ACCESS_TOKEN` | Present but OIDC — need valid Buffer API token for live publish |
| `/settings`, `/publishing` | Static at build — restart dev server after env change |
| DALL-E URL expiry | Deferred post-MVP |

---

## INT-06 execute notes

- `src/proxy.ts` (Next.js 16, not `middleware.ts`)
- Migration: `supabase/migrations/20260610000001_acp_rls_auth.sql` — **user applies to remote**
- `NEXT_PUBLIC_SITE_URL` in `.env.local`

## Queue remaining

QA-01 → DOC-01 → CLOSE-01
