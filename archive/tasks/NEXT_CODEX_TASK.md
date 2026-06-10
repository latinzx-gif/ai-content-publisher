# NEXT TASK — Redirect

**Do not use this file for scope.** The close-out plan moved to:

1. **`CURRENT_TASK.md`** — active task (implementer reads this)
2. **`CLOSURE_TASK_QUEUE.md`** — full remaining work FIX-01 → CLOSE-01
3. **`CURSOR_REVIEW_GATE.md`** — must STOP after each task for Cursor review
4. **`REVIEW_STATUS.md`** — check approval before starting

---

## Current Active Task

**FIX-01** — Lint + Rules Empty State

```bash
# Implementer start
cat CURRENT_TASK.md
cat CURSOR_REVIEW_GATE.md
cat REVIEW_STATUS.md
```

---

## After Implementer Finishes

User tells Cursor:

> Review task FIX-01 for ai-content-publisher. Read TASK_RESULT.md and CURSOR_REVIEW_REQUEST.md, validate build/lint, update REVIEW_STATUS.md, set CURRENT_TASK.md to FIX-02 if approved.

---

## Superseded

The previous "empty state on 6 pages" work is mostly done. FIX-01 covers the remaining `/rules` page + lint fixes.
