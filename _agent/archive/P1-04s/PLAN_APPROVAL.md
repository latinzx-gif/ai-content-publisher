# Plan Approval

**Task:** P1-04h — Extract CalendarPost  
**Status:** ✅ APPROVED

| Field | Value |
|-------|-------|
| Decision | APPROVED |
| Reviewed by | Cursor |
| Date | 2026-06-10 |

## Cursor decisions

| # | Decision |
|---|----------|
| 1 | Verbatim move only — no LegendDot/ChannelCard in same slice |
| 2 | Type from `@/features/prd/types/api` |
| 3 | EXECUTE model: **claude-fable-5** |
| 4 | Verify: `npm run build` + `npm run typecheck` |

## Next

```bash
./orchestration/scripts/run-claude-background.sh execute
```
