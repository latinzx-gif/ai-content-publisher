# SKILL: REFACTOR SIMPLIFIER

## GOAL
Make code simple. Remove mess. No new feature.

## INPUTS
- Target file.
- `graphify-out/GRAPH_REPORT.md` (See dependencies).

## STEPS
1. Read code.
2. Find duplicate logic.
3. Find unused code.
4. Make code shorter. Keep logic same.
5. Check `GRAPH_REPORT.md` to ensure imports stay valid.
6. Run `npm run lint`.

## OUTPUT
- Summary of removal.
- Improved code file.
- Verification status.

## STOP CONDITIONS
- If refactor change database schema -> STOP.
- If refactor touch monolithic `page.tsx` broadly -> STOP.
