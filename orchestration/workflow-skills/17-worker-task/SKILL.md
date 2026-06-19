---
name: workflow-worker-task
description: >-
  Protocol for sub-agents (workers) running parallel tasks within a session.
  Workers operate in isolated scope, report to MAIN agent, and never self-approve
  or modify shared orchestration files. Use when MAIN spawns worker-1, worker-2, etc.
---

# Skill: Worker Task Protocol

## Worker คืออะไร

Worker คือ agent ที่ MAIN สั่งให้ทำงาน parallel ใน session เดียวกัน เช่น:
- worker-1 ทำหน้า Dashboard
- worker-2 ทำหน้า Review Queue
- worker-3 ทำ API endpoint

Workers ทำงานอิสระแต่ **ห้ามตัดสินใจ scope นอกงานที่ assign**

---

## Worker Rules (บังคับทุกข้อ)

```
✅ ทำเฉพาะงานที่ MAIN assign ใน STATUS.md
✅ รายงานผลกลับ MAIN ผ่าน STATUS.md หรือไฟล์ result
✅ ถ้าเจอ blocking issue → หยุด บันทึก + แจ้ง MAIN
✅ commit เฉพาะ allowed files ของ task ตัวเอง

❌ ห้ามแก้ STATUS.md เอง (MAIN เท่านั้น)
❌ ห้ามแตะไฟล์นอก scope ของ task ตัวเอง
❌ ห้าม start task ถัดไปเองโดยไม่รอ MAIN assign
❌ ห้าม approve งานตัวเอง
❌ ห้ามแตะ security, auth, schema โดยไม่มี MAIN approve
❌ ห้าม git push
```

---

## MAIN Setup — ก่อนสั่ง workers

MAIN ต้องเตรียมให้ workers ก่อน:

### 1. สร้าง STATUS.md

```markdown
# Session STATUS — [วันที่]

| # | งาน | Worker | สถานะ | หมายเหตุ |
|---|-----|--------|-------|----------|
| 1 | [งาน 1] | worker-1 | ⏳ PENDING | |
| 2 | [งาน 2] | worker-2 | ⏳ PENDING | |

## Legend
✅ DONE | 🔄 IN PROGRESS | ⏳ PENDING | ⚠️ BLOCKED | 🚫 ASK_BOSS
```

### 2. เขียน worker prompt ให้ครบ

```markdown
## Worker [N] Task

**งาน:** [ระบุชัด]
**Allowed Files:** [list ชัดเจน]
**Forbidden:** [list ชัดเจน]
**Done When:** [acceptance criteria]
**รายงานกลับ:** แจ้ง MAIN เมื่อเสร็จ หรือเมื่อเจอ blocker

**Context ที่ต้องรู้:**
- [เฉพาะ context ที่จำเป็นสำหรับงานนี้]
```

---

## Worker Report Template

เมื่อ worker เสร็จ/บล็อก ให้รายงาน MAIN ด้านนี้:

```markdown
## Worker [N] Result — [หน้า/งาน]

**สถานะ:** ✅ DONE / ⚠️ BLOCKED

### สิ่งที่ทำ
- [รายการ]

### ไฟล์ที่เปลี่ยน
- [file path] — [สิ่งที่เปลี่ยน]

### ผ่าน checks
- [ ] build pass
- [ ] lint pass
- [ ] typecheck pass

### Blocker (ถ้ามี)
[ระบุชัดว่าติดอะไร รอใคร]

### Findings นอก scope
[บันทึกไว้ให้ MAIN ตัดสินใจ — ไม่แก้เอง]
```

---

## MAIN Review Checklist

หลัง worker ส่งผล:

```bash
# ตรวจว่าแตะเฉพาะ allowed files
git diff --name-only HEAD~1

# ตรวจ quality
npm run build
npm run lint
npm run typecheck

# ตรวจว่า logic ถูก — ไม่มี fake success ไม่มี mock data หลอก
```

ถ้าผ่านทั้งหมด → อัปเดต STATUS.md เป็น ✅ DONE

---

## Parallel Session Tips

```
MAIN จัด task ให้ worker ไม่ overlap กัน:
- worker-1: หน้า A + B (ไม่แตะ shared component)
- worker-2: หน้า C + D (ไม่แตะ shared component)
- ถ้าต้องแตะ shared → MAIN ทำเอง หลัง worker เสร็จ

ลำดับที่ดี:
1. MAIN แยก task
2. Workers ทำ parallel
3. MAIN merge + ตรวจ
4. MAIN commit รวม
```

---

## ⚠️ Anti-patterns ที่เจอบ่อย

```
❌ Worker ทำงานเกิน scope แล้ว commit ทับ worker อื่น
❌ Worker เจอ security issue แล้วแก้เองโดยไม่รอ MAIN
❌ Worker เสร็จแล้วไม่รายงาน — MAIN ไม่รู้ว่าเสร็จ
❌ MAIN ไม่ตรวจ output ก่อน start task ถัดไป
❌ Worker ทิ้ง uncommitted changes ค้างไว้โดยไม่บอก
```
