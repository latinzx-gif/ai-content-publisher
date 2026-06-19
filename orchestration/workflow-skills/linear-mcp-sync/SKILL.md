# Linear MCP Sync (hr-payroll-client)

Cursor **ต้อง** อัปเดต Linear ทุกครั้งหลัง orchestration event เสร็จ — ไม่ต้องรอ user สั่ง

ใช้ **Linear MCP plugin** เป็นหลัก (authenticated ใน Cursor)  
ถ้า MCP ไม่พร้อม → ลอง `orchestration/scripts/linear-hrp-*.mjs`  
ถ้าทั้งคู่ล้มเหลว → บันทึกใน `REVIEW_STATUS.md` Notes ว่า Linear skipped

## Project

- **Linear project:** `CNV WorkHub`
- **Issue title pattern:** `[HRP] T{NN}` (เช่น T29 → `[HRP] T29`)
- **ค้นหา issue:** `list_issues` query=`[HRP] T29` project=`CNV WorkHub`

## State mapping (Taskmaster → Linear)

| Taskmaster | Linear state |
|------------|--------------|
| `pending` | Todo |
| `in-progress` | In Progress |
| `done` | Done |

## Events — ทำทุกครั้งหลัง step เสร็จ

### 1. Task set (`next task` / `set task`)

1. `save_issue` → state `In Progress` (issue จาก query `[HRP] T{id}`)
2. `save_comment` body:
   ```
   **Task set — in progress** (Cursor orchestrator)
   Phase PLAN. See `PROJECTS/hr-payroll-client/orchestration/CURRENT_TASK.md`
   {summary ถ้ามี}
   ```

### 2. Plan approved (`approve plan`)

1. `save_issue` → state `In Progress` (ถ้ายังไม่ใช่)
2. `save_comment`:
   ```
   **Plan approved — EXECUTE** (Cursor orchestrator)
   {summary}
   Dispatch: skill `05-claude-execute`
   ```

### 3. Plan rejected

1. `save_comment` — **Plan rejected** + reason + required changes
2. state คง `In Progress` หรือ `Todo`

### 4. Task review APPROVE

1. `save_issue` → state `Done`
2. `save_comment`:
   ```
   **Review: APPROVED** (Cursor orchestrator)
   {summary — gates + acceptance criteria}
   ```

### 5. Task review REJECT

1. `save_issue` → state `In Progress`
2. `save_comment`:
   ```
   **Review: REJECTED** (Cursor orchestrator)
   {summary}
   **Required fix:** {fixes}
   ```

## Shell fallback (optional)

```bash
cd ~/HEAD-OFFICE
node orchestration/scripts/linear-hrp-status.mjs --id <N> --event <event> --summary "..."
node orchestration/scripts/linear-hrp-review.mjs --id <N> --verdict approved --summary "..."
```

### 6. Milestone sync (หลังปิด milestone หรือ `/goal` closeout)

1. `list_milestones` project=`CNV WorkHub`
2. ถ้ายังไม่มี → `save_milestone` สร้าง M1–M10 ตาม `MILESTONES.md`
3. `save_issue` ผูก milestone ให้ issues T01–T30:

| Milestone | Tasks |
|-----------|-------|
| M1: Foundation | T01–T05 |
| M2: Check-in/Check-out | T06–T11 |
| M3: Web Dashboard | T12–T15 |
| M4: Leave Management | T16–T20 |
| M5: Alerts & Summary | T21–T25 |
| M6: Delivery | T26–T30 |
| M7–M10 | T31–T45 (เมื่อสร้าง issues แล้ว) |

4. M1–M6 closed → `targetDate` วันปิด + description `✅ CLOSED`
5. M7–M10 planned → `targetDate` ตาม `PHASE_2_PLAN.md` + `📋 PLANNED`

## Checklist ก่อนจบ orchestration step

- [ ] Linear issue state ตรง Taskmaster
- [ ] Comment โพสต์แล้ว (มี event label ชัดเจน)
- [ ] Milestone ผูก issue แล้ว (ถ้าเป็น milestone closeout)
- [ ] User ไม่ต้องพิมพ์ "อัพเดท Linear"
