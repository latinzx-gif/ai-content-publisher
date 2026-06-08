# SKILL: CODE REVIEWER

## GOAL
Audit code quality. Find smell. Check against `AGENTS.md` rules.

## INPUTS
- Target file path or git diff.
- `AGENTS.md` (Project rules).
- `graphify-out/GRAPH_REPORT.md` (Architecture context).

## STEPS
1. Read code.
2. Check if code follow `AGENTS.md` rules.
3. Look for technical debt.
4. Check for raw JSON leak (Must use `user_facing_output`).
5. Verify `taskTrace` usage.

## OUTPUT
- Quality score (1-10).
- List of smells found.
- Suggested fixes.

## STOP CONDITIONS
- If code is too big to read (> 1000 lines) -> STOP. Summarize only.
- Do not implement fixes. Only review.
