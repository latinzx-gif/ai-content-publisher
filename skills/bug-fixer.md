# SKILL: BUG FIXER

## GOAL
Find bug. Fix bug. No regression.

## INPUTS
- Error log or bug description.
- `PROJECT_STATE.md` (Check status).
- `graphify-out/GRAPH_REPORT.md` (Check blast radius).

## STEPS
1. Read bug report.
2. Search code. Find where bug live.
3. Check `GRAPH_REPORT.md`. What else break if I change dis?
4. Make fix. Keep it small.
5. Run `npm run lint`.
6. Verify fix.

## OUTPUT
- Bug cause summary.
- List of changed files.
- Verification result.

## STOP CONDITIONS
- If bug fix needs database migration -> STOP. Ask Gemini.
- If bug is in core monolithic file and not easy fix -> STOP. Report risk.
