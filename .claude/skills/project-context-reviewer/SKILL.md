---
name: project-context-reviewer
description: >-
  Reviews current head-office-app (Publisher /publisher/*) context before implementation or
  QA — required reading, scope risks, git diff, routes, and forbidden files.
  Use when starting a new task, reviewing Cursor task output, checking if Codex
  changed scope, or preparing a QA summary.
---

# Project Context Reviewer — head-office-app Publisher

## Purpose

Review the current project context before any implementation or QA task.

## Use When

- Starting a new task
- Reviewing Cursor task output
- Checking if Codex changed scope
- Preparing QA summary

## Required Reading

Read in this order. Resolve paths from app root `head-office-app/`.

| # | Requested | Actual path in this repo | Notes |
|---|-----------|--------------------------|-------|
| 1 | `README.md` | `README.md` | Boilerplate Next.js readme — low signal |
| 1b | *(app guide)* | `CLAUDE.md` | **Primary app onboarding** — read if README is thin |
| 2 | `docs/agent-control/*` | `../orchestration/AGENT_LOOP.md` | From app root — monorepo orchestration |
| | | `../orchestration/CURRENT_TASK.md` | Active task, Phase, allowed/forbidden files |
| | | `../orchestration/REVIEW_STATUS.md` | Prior task must be APPROVED |
| | | `../orchestration/CURSOR_REVIEW_GATE.md` | STOP rules + review template |
| | | `../orchestration/CLOSURE_TASK_QUEUE.md` | Full FIX → CLOSE sequence |
| | | `../orchestration/TASK_CLEANUP_CHECKLIST.md` | Post-review cleanup |
| | | `../orchestration/PROJECT_STATE.md` | Loop + completion snapshot |
| 3 | `docs/WORKFLOW_MASTER.md` | `../orchestration/PHASE_1_SCOPE_LOCK.md` | Active scope lock (replaces retired WORKFLOW_MASTER) |
| | | `../../docs/automated_content_publishing_full_blueprint.html` | Product blueprint |
| | | `../../reports/NEXT_BUILD_PLAN.md` | Integration plan |
| | | `../../reports/DEMO_READINESS_REPORT.md` | Known risks |
| 4 | PRD / Sitemap | `../../docs/automated_content_publishing_full_blueprint.html` | Closest PRD artifact |
| | | `../orchestration/QA_CHECKLIST.md` | Module verification |
| | | `../../OS/FASTWORK-OS/01_CLIENTS/law-ai-content/PROJECT_BRIEF.md` | Client brief (if exists) |
| | | `_agent/TASK_RESULT.md` | Last implementer output |
| | | `docs/prd/archive/publisher-migration/task-reviews/*.md` | Archived reviews |
| 5 | `package.json` | `package.json` | Scripts, allowed deps per task |
| 6 | App routes | `src/app/**/page.tsx` | Route folders |
| | | `src/components/publisher/Sidebar.tsx` | Publisher nav — keep in sync |
| 7 | Recent git diff | `git status --short head-office-app` | |
| | | `git diff head-office-app` | Scope creep check |

**Retired (read-only — do not implement):**

- `PROJECTS/AI Content Legal System/docs/WORKFLOW_MASTER.md` — 🔒 LOCKED project
- `PROJECTS/AI Content Legal System/PROJECT_LOCK.md`

If `CURRENT_TASK.md` conflicts with `CLAUDE.md`, **`CURRENT_TASK.md` wins** for the session.

## Project Identity (confusion guard)

| Path | Role | Port / URL |
|------|------|------------|
| `head-office-app/` | **Active app** — PRD at `/` + Publisher at `/publisher/*` | `http://localhost:3001` |
| `head-office-app/` | 🔒 Retired (consolidated into head-office-app) | — |
| `PROJECTS/AI Content Legal System/` | 🔒 Retired archive | Do not implement |

## Supabase (locked)

| Item | Value |
|------|------|
| Project | `ai-auto-tools` — `luxegqsccaodcikxhwrm` |
| Table prefix | `acp_` only |
| Env | `.env.local` (never commit) |

## Subagent / research pass

When used via `safe-research-delegator`: **read-only** — output Research Report in chat; do not Write/Edit files. See `../orchestration/SUBAGENT_ROUTING.md`.

## Agent Loop Gate

```text
PLAN    → head-office-app/_agent/TASK_PLAN.md + CURSOR_PLAN_REQUEST.md → STOP (no code)
EXECUTE → only if head-office-app/_agent/PLAN_APPROVAL.md = APPROVED
        → head-office-app/_agent/TASK_RESULT.md + CURSOR_REVIEW_REQUEST.md → STOP
```

Refuse to implement if:
- Previous task in `REVIEW_STATUS.md` is not APPROVED
- Phase is PLAN but code changes were requested
- Phase is EXECUTE but plan is not APPROVED

## Route Inventory (P1)

Verify against `Sidebar.tsx` + `src/app/`:

`/dashboard` · `/create` · `/review` · `/calendar` · `/publishing` · `/briefs` · `/rules` · `/content-generation` · `/image-prompts` · `/images` · `/quality-check` · `/logs` · `/settings`

**Deferred (P2/P3 placeholders — do not deepen without approval):** `/sources` · `/knowledge` · `/content-library` · `/analytics` · `/learning-loop`

## Context Review Procedure

1. Run required reading pass (table above).
2. Note active task ID + Phase from `CURRENT_TASK.md`.
3. Inspect `git diff` — flag files outside allowed list.
4. Compare request against `PHASE_1_SCOPE_LOCK.md`.
5. Check Codex/Cursor output for cross-app edits (`head-office-app`, retired Legal System).
6. Record gaps (missing env, missing plan approval, untracked folder).
7. **Audit only** unless current task authorizes implementation.

## Output

```markdown
## Project Context Review

### Current project state
- **Product:** ai-content-publisher | head-office-app | retired Legal System
- **Active task:** [ID] — Phase: [PLAN | EXECUTE]
- **Last approved task:** [from REVIEW_STATUS.md]
- **Persistence / AI / publish:** [localStorage | Supabase | mock | live — factual snapshot]
- **Validation:** build / typecheck / lint — [last known or re-run result]
- **Git:** [clean | dirty — summary of changed paths]

### Scope risk
| Risk | Level | Detail |
|------|-------|--------|
| [e.g. Phase 2 route work] | Critical / Major / Minor | [...] |
| [e.g. wrong Supabase project] | | |
| [e.g. EXECUTE without approved plan] | | |
| [e.g. Codex touched forbidden files] | | |

### Missing context
- [ ] [env var, API key, plan approval, PRD ambiguity, etc.]

### Recommended next action
[Single clear step: e.g. run PLAN for INT-02 | approve PLAN_APPROVAL | re-run validation | ask user for X]

### Files that should not be touched
- [from CURRENT_TASK.md Forbidden Files]
- `PROJECTS/AI Content Legal System/**` (LOCKED)
- `head-office-app/**` (unless explicitly scoped)
- Orchestration docs (`../../CURRENT_TASK.md`, `REVIEW_STATUS.md`, …) unless DOC-01
- `supabase/migrations/**` unless schema task or Cursor-approved bugfix
- Phase 2/3 routes: `/sources`, `/knowledge`, `/content-library`, `/learning-loop`, `/analytics` (deep work)
```

## Default Forbidden Paths (unless task allows)

```
PROJECTS/AI Content Legal System/**
head-office-app/**
../orchestration/CURRENT_TASK.md          # implementer must not self-advance
../../REVIEW_STATUS.md         # Cursor-only approval
package.json                   # unless CURRENT_TASK allows packages
src/app/**                     # unless active task includes app layer
```

## Forbidden Actions

- Implementing before context review output is written (when user asked for review only)
- Assuming git committed state (app folder may be untracked)
- Using retired Legal System Supabase or WORKFLOW_MASTER as active source of truth
- Self-approving tasks in `REVIEW_STATUS.md`
