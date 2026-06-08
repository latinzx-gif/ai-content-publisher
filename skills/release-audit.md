# SKILL: RELEASE AUDIT

## GOAL
Is code ready for client? Check everything.

## INPUTS
- `AGENTS.md` (Check V1 goal).
- `PROJECT_STATE.md` (Check milestone).
- `graphify-out/GRAPH_REPORT.md` (Check stability).

## STEPS
1. Run `npm run build`.
2. Check `git status`. Must be clean.
3. Verify no raw JSON in `/prd` surfaces.
4. Check image status labels. No "fake success".
5. Verify `taskTrace` completeness.

## OUTPUT
- Readiness Status (READY / NOT READY).
- List of blockers.
- Polish needed.

## STOP CONDITIONS
- Do not fix issues. Report only.
- Stop if build fails.
