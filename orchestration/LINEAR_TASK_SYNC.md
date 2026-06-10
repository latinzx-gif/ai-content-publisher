# Linear task sync (after each close-out task)

Cursor posts to Linear when each task **QA-01**, **DOC-01**, **CLOSE-01** (or any `--task`) completes.

## Setup (one time)

Create `orchestration/.env.local`:

```bash
LINEAR_API_KEY=lin_api_your_key
# Optional — defaults to first team in workspace
LINEAR_TEAM_KEY=JAK
```

Get API key: Linear → Settings → API → Personal API keys  
Workspace: https://linear.app/jakarinosk

## Post after each task

```bash
cd ~/HEAD-OFFICE

node orchestration/scripts/linear-task-update.mjs \
  --task QA-01 \
  --status done \
  --title "End-to-End Verification" \
  --summary "Build/typecheck pass; publisher routes auth-gated." \
  --blockers "Apply acp_* migrations in Supabase; fix Buffer OIDC token."
```

**Status values:** `done` | `blocked` | `in_progress`

## Cursor rule

After completing and self-reviewing each orchestration task:

1. Update `REVIEW_STATUS.md` + task `TASK_RESULT.md`
2. Run `linear-task-update.mjs` with summary + blockers for the user
3. If `LINEAR_API_KEY` missing → note in `TASK_RESULT.md` that Linear was skipped

## Issue naming

Issues are titled `[ACP] {TASK_ID} — {title}` so they are easy to filter in Linear.
