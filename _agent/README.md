# _agent/ — Implementer Handoff Folder

ไฟล์ในนี้เขียนโดย Claude Code ระหว่าง PLAN และ EXECUTE phase  
Cursor อ่านไฟล์เหล่านี้เพื่อ review และ cleanup หลังทุก task

---

## ไฟล์ที่จะปรากฏระหว่าง task

| ไฟล์ | เขียนโดย | Phase | วัตถุประสงค์ |
|------|----------|-------|-------------|
| `TASK_PLAN.md` | Claude | PLAN | แผนการ implement รายละเอียด |
| `CURSOR_PLAN_REQUEST.md` | Claude | PLAN | ขอ Cursor review แผน |
| `PLAN_APPROVAL.md` | Cursor | PLAN_REVIEW | อนุมัติหรือ reject แผน |
| `TASK_RESULT.md` | Claude | EXECUTE | สรุปสิ่งที่ทำ + validation |
| `CURSOR_REVIEW_REQUEST.md` | Claude | EXECUTE | ขอ Cursor review งาน |
| `GEMINI_AUDIT_RESULT.md` | Gemini | AUDIT | ผล audit |
| `ANTIGRAVITY_RESULT.md` | Antigravity | UI | ผล UI polish |

---

## หมายเหตุ

- ไฟล์ในนี้ถูก overwrite ทุก task — ไม่ใช่ permanent record
- Permanent record อยู่ที่ `reports/task-reviews/{TASK_ID}_REVIEW.md`
- อย่า commit ไฟล์เหล่านี้เข้า git (ยกเว้น Cursor สั่ง)
- ดู loop detail: `orchestration/AGENT_LOOP.md`
