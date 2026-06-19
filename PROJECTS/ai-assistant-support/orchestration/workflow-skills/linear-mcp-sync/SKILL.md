# Linear MCP Sync (ai-assistant-support)

Cursor **ควร** อัปเดต Linear หลัง orchestration event — ใช้ Linear MCP plugin

ถ้า MCP ไม่พร้อม → บันทึกใน `REVIEW_STATUS.md` Notes ว่า Linear skipped

## Project

- **Linear project:** `AI Assistant Support`
- **Issue title pattern:** `[AAS] T{NN}` (เช่น T3 → `[AAS] T3`)
- **ค้นหา issue:** `list_issues` query=`[AAS] T3` project=`AI Assistant Support`

## State mapping (Taskmaster → Linear)

| Taskmaster | Linear state |
|------------|--------------|
| `pending` | Todo |
| `in-progress` | In Progress |
| `done` | Done |

## Events

### Task set

1. `save_issue` → state `In Progress`
2. `save_comment`:
   ```
   **Task set — in progress** (Cursor orchestrator)
   Phase PLAN. See PROJECTS/ai-assistant-support/orchestration/CURRENT_TASK.md
   ```

### Plan approved

1. `save_comment` — **Plan approved — EXECUTE**
2. state คง `In Progress`

### Review APPROVE

1. `save_issue` → state `Done`
2. `save_comment` — **Review: APPROVED** + summary

### Review REJECT

1. state `In Progress`
2. `save_comment` — **Review: REJECTED** + required fixes

## Customer tickets (runtime — not Taskmaster)

Support tickets ใช้ title pattern:

`[AAS][{client_slug}] P1 · bug · {subject}`

ไม่ sync ผ่าน skill นี้ — สร้างจาก `support-app` API ตอน LIFF submit
