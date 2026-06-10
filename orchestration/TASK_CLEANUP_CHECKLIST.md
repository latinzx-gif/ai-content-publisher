# TASK_CLEANUP_CHECKLIST.md — Run After Every Task Review

Cursor runs this checklist after each implementer task, before setting the next task.

---

## Plan review (before EXECUTE)

- [ ] Read `head-office-app/_agent/TASK_PLAN.md`
- [ ] Read `head-office-app/_agent/CURSOR_PLAN_REQUEST.md`
- [ ] Scope matches `CURRENT_TASK.md` allowed files
- [ ] No Phase 2/3 / locked project scope
- [ ] Write `PLAN_APPROVAL.md` → APPROVED or REJECTED
- [ ] If APPROVED: set `CURRENT_TASK.md` Phase → `EXECUTE`

## Task review (before cleanup)

- [ ] Read implementer output:
  - Claude: `head-office-app/_agent/TASK_RESULT.md`
  - Gemini: `head-office-app/_agent/GEMINI_AUDIT_RESULT.md`
  - Antigravity: `head-office-app/_agent/ANTIGRAVITY_RESULT.md`
  - Cursor-only: notes in `reports/` or inline in review doc
- [ ] Read `head-office-app/_agent/CURSOR_REVIEW_REQUEST.md`
- [ ] `git status` + `git diff` for allowed files only
- [ ] `npm run build && npm run typecheck && npm run lint`
- [ ] Scope check: no Phase 2/3, no locked project edits, no secrets in diff
- [ ] Record decision: APPROVED / FIX_REQUESTED / BLOCKED

## Cleanup (after decision)

- [ ] Write `reports/task-reviews/{TASK_ID}_REVIEW.md`
- [ ] Archive `reports/task-reviews/{TASK_ID}_TASK_RESULT.md`
- [ ] Reset `CURSOR_REVIEW_REQUEST.md` to idle
- [ ] Update `REVIEW_STATUS.md` task row + current position
- [ ] Update `CLOSURE_TASK_QUEUE.md` progress table
- [ ] Update `PROJECT_STATE.md` active task
- [ ] Write next `CURRENT_TASK.md` (if APPROVED) or fix task (if FIX)
- [ ] Delete `STOP_FOR_USER.md` if blocker resolved
- [ ] Note deferred risks in `REVIEW_STATUS.md` § Deferred

## User handoff message

Tell user:
1. Task ID + decision
2. Active next task ID + **which agent** (see `AGENT_TASK_ROUTING.md`)
3. Command to send implementer (tmux or script)
4. If next task is PLAN → `./orchestration/scripts/run-claude-background.sh plan`
5. If next task is AUDIT → `./orchestration/scripts/run-gemini-task.sh audit`

---

## Archive location

```text
head-office-app/reports/task-reviews/
  FIX-01_REVIEW.md
  FIX-02_REVIEW.md
  FIX-02_TASK_RESULT.md
  INT-01_REVIEW.md   (after next review)
  ...
```
