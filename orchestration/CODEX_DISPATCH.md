# CODEX_DISPATCH.md — วิธีส่งงานให้ Codex (GPT-5.5)

**Codex ไม่อ่านไฟล์ตาม protocol เอง — Cursor ต้องแนบ context ทุกครั้ง**

---

## Template (copy-paste ทุกครั้งที่ส่งงานให้ Codex)

```
[COMPANY CONTEXT]
Project: [ชื่อ project]
Tech stack: [stack]
Forbidden (ห้ามสร้าง): [รายการจาก GROUND_TRUTH.md]
Quality gates: npm run build + typecheck + lint ต้อง pass

[TASK]
ID: [TASK_ID]
Goal: [goal จาก CURRENT_TASK.md]
Allowed files:
  - path/to/file1
  - path/to/file2
Forbidden files: [ถ้ามี]

Acceptance Criteria:
- [criteria 1]
- [criteria 2]

[PLAN]
(เนื้อหา TASK_PLAN.md ทั้งหมด — หลัง Cursor approve แล้ว)

[OUTPUT REQUIRED]
เมื่อเสร็จแล้ว เขียน _agent/TASK_RESULT.md ตาม format นี้:
- Status: DONE / PARTIAL / BLOCKED
- Files Changed: list
- Acceptance Self-Check: checklist
- Deviations from Plan: ถ้ามี
```

---

## กฎสำหรับ Codex

- ทำเฉพาะ Allowed Files เท่านั้น
- ห้าม improvise นอก plan
- ถ้าเจอ edge case ที่ไม่ได้ plan → บันทึกใน TASK_RESULT.md แล้วทำต่อ
- ห้าม commit หรือ push เอง — Cursor ทำ
- เสร็จแล้ว → เขียน TASK_RESULT.md แล้ว STOP
