# Graphify Post-Implementation Audit Template

**Task ID**: `[TASK-ID]`
**Status**: `[PENDING / PASSED / FAILED]`

## 1. Scope Review
- [ ] Were any forbidden files edited?
- [ ] Were changes minimal and surgical?
- [ ] Was the "Objective" achieved?
- [ ] Any unauthorized files changed?

## 2. Technical Quality
- [ ] `git diff --stat` matches the planned scope?
- [ ] `npm run lint` passes?
- [ ] `npm run typecheck` passes (if required)?
- [ ] `npm run build` passes (if needed)?

## 3. Regression Risk
- [ ] Did changes introduce side effects to the UI?
- [ ] Are API contracts preserved?
- [ ] Are `taskTrace` fields still correct?
- [ ] Manual test note: `[Result]`

## 4. Final Disposition
- **Safe to commit**: `[Yes / No]`
- **Decision**: `[COMMIT / FIX / REVERT]`
- **Blocking issues**: `[None or List]`
- **Unauthorized changes**: `[None or List]`
- **Verification result**: `[Summary]`
- **Recommended action**: `[Next step]`
