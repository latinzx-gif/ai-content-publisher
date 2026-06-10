# CURSOR_REVIEW_GATE.md — Review Before Next Task

**Purpose:** No implementer (Claude Code, Codex, etc.) may start the next task until **Cursor** reviews and approves the previous one.

---

## Loop With Plan + Review Gate

Full diagram: `AGENT_LOOP.md`

```text
┌─────────────────────────────────────────────────────────────┐
│  Cursor writes CURRENT_TASK.md (Phase: PLAN)                  │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Claude PLAN: TASK_PLAN.md + CURSOR_PLAN_REQUEST.md → STOP   │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Cursor approves plan → PLAN_APPROVAL.md → Phase: EXECUTE    │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Claude EXECUTE: implements approved plan only               │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Implementer executes CURRENT_TASK.md only                   │
│  - Allowed files only                                        │
│  - npm run build + typecheck + lint                          │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Implementer writes:                                         │
│  - head-office-app/_agent/TASK_RESULT.md                  │
│  - head-office-app/_agent/CURSOR_REVIEW_REQUEST.md        │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Implementer STOPS                                           │
│  ❌ Do NOT update CURRENT_TASK.md                            │
│  ❌ Do NOT start next task in CLOSURE_TASK_QUEUE.md          │
│  ❌ Do NOT commit or push                                    │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  User opens Cursor → "Review task [ID]"                      │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Cursor reviews:                                             │
│  - git diff / changed files                                  │
│  - TASK_RESULT.md acceptance criteria                        │
│  - build/typecheck/lint (re-run if needed)                   │
│  - scope check (no Phase 2/3, no forbidden files)            │
└────────────────────────────┬────────────────────────────────┘
                             ▼
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          APPROVED         FIX           STOP
              │              │              │
              ▼              ▼              ▼
   Update REVIEW_STATUS   Rewrite      STOP_FOR_USER.md
   Update CURRENT_TASK    CURRENT_TASK  wait for user
   to next task           (fix only)
              │
              ▼
   User tells implementer: "Continue — read CURRENT_TASK.md"
```

---

## Implementer Rules (Hard)

1. **One task per session** unless `CURRENT_TASK.md` explicitly allows more.
2. After finishing, always write `CURSOR_REVIEW_REQUEST.md` using the template below.
3. **Never self-approve** — do not mark a task complete in `REVIEW_STATUS.md`.
4. If `REVIEW_STATUS.md` shows previous task is not `APPROVED`, **refuse to start** and tell the user to run Cursor review first.
5. If blocked (missing env, scope question), write `STOP_FOR_USER` in `TASK_RESULT.md` and still STOP.

---

## Cursor Reviewer Checklist

When user says "Review task FIX-01" (or current task ID):

### 1. Read outputs

- `head-office-app/_agent/TASK_RESULT.md`
- `head-office-app/_agent/CURSOR_REVIEW_REQUEST.md`
- `CLOSURE_TASK_QUEUE.md` — acceptance criteria for that task

### 2. Inspect changes

```bash
git status --short head-office-app
git diff head-office-app
```

### 3. Re-validate (if not trusted)

```bash
cd head-office-app
npm run build && npm run typecheck && npm run lint
```

### 4. Scope check

- [ ] Only allowed files changed
- [ ] No Phase 2/3 features added
- [ ] No secrets in diff
- [ ] No edits to forbidden orchestration files (unless DOC-01)

### 5. Record decision in `REVIEW_STATUS.md`

| Decision | Action |
|----------|--------|
| **APPROVED** | Set task row to APPROVED; copy next task spec from `CLOSURE_TASK_QUEUE.md` into `CURRENT_TASK.md` |
| **FIX** | Write fix-only `CURRENT_TASK.md`; set task row to FIX_REQUESTED |
| **STOP** | Write `STOP_FOR_USER.md` at repo root with reason; set task row to BLOCKED |

### 6. Post-task cleanup (mandatory every task)

After APPROVE or FIX decision, Cursor **must** run cleanup before closing the review:

1. **Archive** — copy task artifacts to `head-office-app/reports/task-reviews/`:
   - `{TASK_ID}_REVIEW.md` — decision + validation summary
   - `{TASK_ID}_TASK_RESULT.md` — snapshot of implementer output
2. **Reset handoff** — set `CURSOR_REVIEW_REQUEST.md` to idle (no pending review)
3. **Update trackers** — `REVIEW_STATUS.md`, `CLOSURE_TASK_QUEUE.md` progress table
4. **Set next task** — write `CURRENT_TASK.md` (if APPROVED) or fix task (if FIX)
5. **Sync state** — update `PROJECT_STATE.md` active task line
6. **Remove blockers** — delete `STOP_FOR_USER.md` if resolved
7. **Leave `TASK_RESULT.md`** at app root as latest implementer output (overwrite next task)

Cleanup checklist file: `TASK_CLEANUP_CHECKLIST.md`

### 7. Tell user

- Review decision (APPROVED / FIX / STOP)
- What was cleaned up
- Next step: run implementer on new `CURRENT_TASK.md` OR provide missing env/decision

---

## CURSOR_REVIEW_REQUEST.md Template

Implementer creates this file at `head-office-app/_agent/CURSOR_REVIEW_REQUEST.md`:

```markdown
# Cursor Review Request

## Task
[ID] — [Name]

## Status
Ready for review

## Summary
[2–3 sentences of what changed]

## Files Changed
- path — reason

## Validation Run
- build: PASS/FAIL
- typecheck: PASS/FAIL
- lint: PASS/FAIL

## Acceptance Criteria Self-Check
1. [✅/❌] ...
2. [✅/❌] ...

## How Cursor Should Verify
[Specific steps: e.g. "Open /rules without post_id", "grep addLog in lib files"]

## Risks / Open Questions
[Anything Cursor should decide before next task]

## Implementer Stop Confirmation
I have STOPPED and am NOT starting the next task.
```

---

## User Commands (Copy-Paste)

**After implementer finishes:**

> Review task [ID] for ai-content-publisher. Read TASK_RESULT.md and CURSOR_REVIEW_REQUEST.md, check diff, run lint/build, run TASK_CLEANUP_CHECKLIST.md, update REVIEW_STATUS.md, archive to reports/task-reviews/, set CURRENT_TASK.md to next task if approved.

**To resume implementer:**

> Previous task approved. Read CURRENT_TASK.md and CURSOR_REVIEW_GATE.md, then execute only that task.

---

## File Locations

| File | Owner | Purpose |
|------|-------|---------|
| `CLOSURE_TASK_QUEUE.md` | Cursor | Full close-out plan |
| `CURRENT_TASK.md` | Cursor | Active task only |
| `REVIEW_STATUS.md` | Cursor | Approval tracker |
| `CURSOR_REVIEW_GATE.md` | Cursor | This process |
| `apps/.../TASK_RESULT.md` | Implementer | Task output |
| `apps/.../CURSOR_REVIEW_REQUEST.md` | Implementer | Review handoff |
| `STOP_FOR_USER.md` | Cursor | Blockers |
