# GOOD_TASK_GUIDE.md — เขียน Task และ Plan ให้ชัด

**สำหรับ:** Cursor (เขียน CURRENT_TASK.md) + Claude Code (เขียน TASK_PLAN.md)

---

## PART 1: Cursor — เขียน CURRENT_TASK.md ที่ดี

### ❌ Task ที่ไม่ชัด (Claude Code จะหลง)

```markdown
## Goal
Extract TopBar from page.tsx
```

### ✅ Task ที่ชัด (Claude Code ทำได้ถูกต้องทันที)

```markdown
## Goal
Extract **`TopBar`** component จาก `src/app/page.tsx` (~line 12338)
ไปเป็น `src/features/prd/components/TopBar.tsx`

- Component ใช้ `useCallback` → ต้องเพิ่ม `'use client'` directive
- Props ที่ต้องส่งผ่าน: `currentPage`, `onToggleSidebar`, `user`
- Import ใน page.tsx ต้องเปลี่ยนเป็น `import TopBar from '@/features/prd/components/TopBar'`
- Expected line count: page.tsx ~13,794 → ~13,700 (ลดประมาณ 90-100 บรรทัด)
```

---

### Checklist ก่อน Cursor commit CURRENT_TASK.md

- [ ] **Goal ระบุ:** ชื่อ component/function + ไฟล์ต้นทาง (พร้อม line number ถ้าทำได้) + ไฟล์ปลายทาง
- [ ] **Allowed Files:** ระบุ path เต็ม ไม่ใช่แค่ glob — ถ้า glob ต้องอธิบายขอบเขต
- [ ] **Forbidden:** บอกชัดว่าอะไรที่ห้ามแตะในงานนี้
- [ ] **Acceptance Criteria:** วัดได้จริง — ไม่ใช่ "ทำงานได้" แต่ "build pass + line count ลด + import ถูก"
- [ ] **Depends:** บอก task ก่อนหน้าที่ต้อง APPROVED ก่อน
- [ ] **Phase:** PLAN เสมอ เมื่อ set task ใหม่

---

### Template CURRENT_TASK.md

```markdown
# CURRENT TASK: [ID] — [ชื่อสั้น]

## Phase
PLAN

## Status
Ready for PLAN

## Primary Agent
Claude Code (claude-fable-5)

## Goal
[1-3 ประโยค บอก: ทำอะไร, ที่ไหน (path + line), ผลที่ต้องการ]
[ถ้ามี side effects หรือ dependency ให้บอกตรงนี้]

## Allowed Files
\`\`\`
head-office-app/src/...   ← ระบุ path เต็ม
head-office-app/src/...
head-office-app/_agent/TASK_PLAN.md
head-office-app/_agent/CURSOR_PLAN_REQUEST.md
\`\`\`

## Forbidden
- [ชื่อไฟล์/โฟลเดอร์ที่ห้ามแตะ]
- Phase 2/3 features
- New dependencies without approval

## Acceptance Criteria
- [ ] [วัดได้ เช่น: ไฟล์ X สร้างแล้ว export ถูก]
- [ ] [วัดได้ เช่น: page.tsx line count ลด]
- [ ] npm run build pass
- [ ] npm run typecheck pass
- [ ] No behavior change

## Depends
- [TASK_ID] ✅ — [ชื่อ task]

## Recommended Model
| Phase | Model |
|-------|-------|
| PLAN | claude-fable-5 |
| EXECUTE | claude-fable-5 |

## Skills to Load
- `03-claude-plan` — PLAN phase (บังคับ)
- `05-claude-execute` — EXECUTE phase (บังคับ)
- `09-debug-session` — ถ้า task เกี่ยวกับ bug/fix
- `12-supabase-migration` — ถ้า task แตะ schema/RLS
- [เพิ่ม skill อื่นถ้าจำเป็น]
```

---

## PART 2: Claude Code — เขียน TASK_PLAN.md ที่ดี

### ❌ Plan ที่ไม่ชัด (EXECUTE จะ improvise)

```markdown
## Plan
1. อ่านไฟล์ page.tsx
2. หา TopBar component
3. แยกออกมาเป็นไฟล์ใหม่
4. Update imports
```

### ✅ Plan ที่ชัด (EXECUTE ทำตามได้เลยไม่ต้องตัดสินใจเอง)

```markdown
## Plan

### Step 1 — อ่าน page.tsx บริเวณ TopBar
- `rtk read src/app/page.tsx 12320 12430`
- หา: props ทั้งหมดที่ TopBar ใช้, hooks ที่ใช้ (`useCallback`), types ที่ reference

### Step 2 — สร้าง src/features/prd/components/TopBar.tsx
- เพิ่ม `'use client'` บรรทัดแรก
- Copy TopBar function (line ~12338–12420) พร้อม types
- Props interface: `{ currentPage: PageName; onToggleSidebar: () => void; user: User | null }`
- Import: lucide-react icons ที่ใช้, PageName type จาก `../config/navigation`

### Step 3 — แก้ src/app/page.tsx
- ลบ TopBar function (~line 12338–12420)
- เพิ่ม import: `import TopBar from '@/features/prd/components/TopBar'`
- ตรวจ: <TopBar ... /> call site ยังอยู่ครบ

### Step 4 — Verify
- `npm run build`
- `npm run typecheck`  
- นับบรรทัด page.tsx: ควรลด ~80-100 บรรทัด

## Expected Outcome
| File | Before | After |
|------|--------|-------|
| `page.tsx` | ~13,794 lines | ~13,700 lines |
| `TopBar.tsx` | ไม่มี | ~90 lines ใหม่ |

## Risks
- ถ้า TopBar ใช้ state/context จาก parent scope → ต้องส่งเป็น props เพิ่ม
- ตรวจ: มี `useCallback` ที่ depends on closures ไหม

## Acceptance Self-Check
- [ ] TopBar.tsx มี 'use client'
- [ ] page.tsx ไม่มี TopBar function แล้ว
- [ ] build + typecheck pass
- [ ] ไม่มี behavior change
```

---

### Checklist ก่อน Claude Code ส่ง TASK_PLAN.md

- [ ] ระบุ **path เต็ม** ทุกไฟล์ที่จะแตะ — ไม่มีไฟล์ที่ไม่ได้อยู่ใน Allowed Files
- [ ] แต่ละ step บอก **ทำอะไร** ไม่ใช่แค่ "แก้ไฟล์"
- [ ] มี **Expected Outcome** ที่วัดได้ (line count, file exists, import path)
- [ ] มี **Risks** — สิ่งที่อาจพัง
- [ ] มี **Acceptance Self-Check** ครบทุกข้อจาก CURRENT_TASK.md
- [ ] ไม่มีงานนอก Allowed Files แม้แต่ 1 ไฟล์

---

## PART 3: สัญญาณเตือนว่า Plan / Task ไม่ชัดพอ

| สัญญาณ | ปัญหา | แก้อย่างไร |
|--------|--------|-----------|
| "แก้ตามความเหมาะสม" | Claude จะ improvise | ระบุ exact steps |
| ไม่มี line number | Claude อ่านทั้งไฟล์ waste context | ใส่ approximate line range |
| Acceptance ใช้คำ "ทำงานได้" | วัดไม่ได้ ผ่านง่ายเกิน | เปลี่ยนเป็น build pass + specific output |
| Allowed Files ใช้ `**` กว้างเกิน | Claude แตะไฟล์เกิน scope | ระบุ path เต็ม |
| ไม่มี Risks section | EXECUTE ไม่ระวัง edge case | ใส่ risks แม้แต่ "ไม่มี risk ที่รู้" |
| Plan มีแค่ 3-4 step กว้างๆ | EXECUTE ต้องตัดสินใจเองเยอะ | แตก step ให้ละเอียดกว่านี้ |
