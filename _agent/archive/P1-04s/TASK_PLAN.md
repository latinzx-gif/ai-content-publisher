# TASK PLAN: P1-04h — Extract CalendarPost

## Summary

ย้าย `CalendarPost` (calendar grid post chip, drag/reschedule) จาก `src/app/page.tsx` ไป `src/features/prd/components/CalendarPost.tsx` แบบ verbatim — ไม่เปลี่ยน behavior. ใช้ type `CalendarDayPost` ที่มีอยู่แล้วใน `@/features/prd/types/api`.

## Files to Change

| File | Action | Details |
|------|--------|---------|
| `src/features/prd/components/CalendarPost.tsx` | CREATE | `'use client'` + `CalendarPost` + `CalendarPostProps` |
| `src/app/page.tsx` | MODIFY | ลบ `function CalendarPost`; เพิ่ม import |
| `src/features/prd/README.md` | MODIFY | เพิ่มแถว `CalendarPost.tsx` |

## Step-by-Step

### Step 1 — ยืนยัน type dependency
- อ่าน: `src/features/prd/types/api.ts` — `CalendarDayPost`, `CalendarPostStatus` exported แล้ว
- ทำ: import `type CalendarDayPost` ใน component ใหม่จาก `@/features/prd/types/api`

### Step 2 — สร้าง component file
- อ่าน: `src/app/page.tsx` 12342–12393
- ทำ:
  - สร้าง `CalendarPost.tsx` with `'use client'`
  - Export `CalendarPostProps`: `{ post: CalendarDayPost; draggable?: boolean; onReschedule?: (post: CalendarDayPost) => void }`
  - Copy JSX + `styles` map verbatim (queued/posted/draft/issue)
  - เก็บ drag handlers (`onDragStart` JSON `contentItemId`, `onDragEnd` noop)

### Step 3 — อัปเดต page.tsx
- อ่าน: call sites 6246, 6338, 6399, 6446 (`<CalendarPost ... />`)
- ทำ:
  - `import { CalendarPost } from '@/features/prd/components/CalendarPost'`
  - ลบ `function CalendarPost` (12342–12393)
  - **ไม่แก้** call sites — props เหมือนเดิม

### Step 4 — README + validate
- อัปเดต `src/features/prd/README.md`
- รัน: `npm run typecheck && npm run build`

## Expected Outcome

| Metric | Before | After |
|--------|--------|-------|
| `page.tsx` lines | ~13,608 | ~13,556 (−52) |
| `CalendarPost.tsx` | ไม่มี | ~55 lines |

## Risks

1. **`CalendarDayPost` import path** — ใช้ `@/features/prd/types/api` ไม่ duplicate type ใน page.tsx
2. **Drag payload** — ต้องคง `contentItemId: post.id` ใน `dataTransfer` เหมือนเดิม มิฉะนั้น `moveCalendarPost` พัง
3. **`styles[post.status]`** — `post.status` เป็น `CalendarPostStatus`; ห้ามเปลี่ยน key map

## Acceptance Self-Check

- [ ] `CalendarPost` อยู่ใน `src/features/prd/components/`
- [ ] `page.tsx` line count ลดลง
- [ ] `npm run build` pass
- [ ] `npm run typecheck` pass
- [ ] ไม่เปลี่ยน behavior (4 call sites ใน `CalendarView` ยังใช้ props เดิม)
