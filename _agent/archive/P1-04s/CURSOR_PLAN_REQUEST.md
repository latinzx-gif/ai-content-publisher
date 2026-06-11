# Plan Review Request — P1-04h

## Task

P1-04h — Extract `CalendarPost` from `page.tsx`

## Plan Summary

Verbatim extraction ของ calendar post chip (~52 บรรทัด) ไป `src/features/prd/components/CalendarPost.tsx`. Pure presentational + drag/click handlers; type จาก `features/prd/types/api` ที่มีอยู่แล้ว. 4 call sites ใน `CalendarView` ไม่ต้องแก้.

## Files That Will Change

- `src/features/prd/components/CalendarPost.tsx` — new component
- `src/app/page.tsx` — remove inline function, add import
- `src/features/prd/README.md` — document new file

## Risks Flagged

- Drag `dataTransfer` JSON ต้องเหมือนเดิม (`contentItemId`)
- ห้าม refactor `LegendDot` / `ChannelCard` ใน slice เดียวกัน

## Questions for Cursor

- ไม่มี — scope ชัด, pattern เดียวกับ P1-04c–g
