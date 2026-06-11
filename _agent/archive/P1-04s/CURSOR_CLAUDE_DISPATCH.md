# Cursor dispatch — P1-04h

**Task:** P1-04h — Extract `CalendarPost` from `page.tsx`  
**Model:** `claude-fable-5`

## Claude EXECUTE prompt

```text
/model claude-fable-5

EXECUTE — Task P1-04h. Read orchestration/CURRENT_TASK.md.

Extract CalendarPost from src/app/page.tsx → src/features/prd/components/CalendarPost.tsx
- Import CalendarDayPost type from existing @/features/prd/types (or page-local type if not exported yet)
- Verbatim move, no behavior change
- Update features/prd/README.md

npm run build && npm run typecheck
TASK_RESULT.md + CURSOR_REVIEW_REQUEST.md → STOP
```

## Slice progress

| ID | Component | page.tsx |
|----|-----------|----------|
| P1-04c–g | Shell + cards | 13,608 |
| P1-04h | CalendarPost | next |
