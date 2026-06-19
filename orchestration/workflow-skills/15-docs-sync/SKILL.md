---
name: workflow-docs-sync
description: >-
  Sync GROUND_TRUTH.md, REVIEW_STATUS.md, and CLAUDE.md after any major session
  where significant work was done. Use after demo sessions, multi-commit sprints,
  or any time GROUND_TRUTH.md is more than 1 day old and work happened.
---

# Skill: Docs Sync

## When to Use

โหลด skill นี้เมื่อ:
- จบ session ที่มี commit > 3 ครั้ง
- GROUND_TRUTH.md อัปเดตล่าสุดเกิน 1 วัน แต่มีงานเกิดขึ้น
- มี Phase ใหม่เสร็จหรือปิด
- มีการตัดสินใจ architecture สำคัญ
- ก่อนเริ่ม agent session ใหม่หลังหยุดพัก

---

## Step 1 — อ่านสถานะปัจจุบัน

```bash
# ดู commits ที่เกิดขึ้นตั้งแต่ docs อัปเดตล่าสุด
git log --oneline -20

# ดูไฟล์ที่เปลี่ยน
git diff --name-only HEAD~10 HEAD

# เช็ค GROUND_TRUTH last updated
head -5 orchestration/GROUND_TRUTH.md
```

---

## Step 2 — อัปเดต GROUND_TRUTH.md

เช็คและ update ทุก section นี้:

```markdown
## 3. Phase Status — update สถานะ Phase ให้ตรงกับความจริง
| Phase | Status | หมายเหตุ |
ถ้า phase ปิดแล้ว → ✅ CLOSED
ถ้ากำลังทำ → 🔄 IN PROGRESS + ระบุ commit hash ล่าสุด

## 4. Active Task — update งานปัจจุบัน
| Field | Value |
ระบุ task ID + phase ปัจจุบัน (PLAN/EXECUTE/DEMO READY)

## งานค้าง / Queue ถัดไป
ลบงานที่ปิดแล้วออก
เพิ่มงานค้างใหม่ที่เจอระหว่าง session
```

กฎ:
```
✅ อัปเดต phase status ให้ตรงกับ git log จริง
✅ ระบุ commit hash ของงานที่ปิด
✅ เพิ่ม blocker ที่เจอใหม่
❌ ห้ามลบ phase ที่ LOCKED โดยไม่มี user approve
❌ ห้ามเขียน Phase 2+ เป็น IN PROGRESS ถ้า user ยังไม่ approve
```

---

## Step 3 — อัปเดต REVIEW_STATUS.md

```markdown
## Session [วันที่]
| Task | Commit | Status | Notes |
|------|--------|--------|-------|
| [task name] | [hash] | ✅ DONE | [สิ่งที่ทำ] |
```

เพิ่ม entry ทุก task ที่ปิดใน session นี้

---

## Step 4 — อัปเดต CLAUDE.md (ถ้ามี)

```markdown
## Current State ([วันที่])
- [Phase ล่าสุด]: **[STATUS]** ✅
- Current: **[TASK ID] — [STATUS]**
- ค้าง: [งานที่ยังค้างอยู่]
```

---

## Step 5 — อัปเดต ASK_BOSS.md (ถ้ามี)

ถ้า session นี้มี finding ที่รอ user ตัดสินใจ:
- เพิ่ม entry ใหม่ใน ASK_BOSS.md
- Mark RESOLVED สำหรับข้อที่ user ตัดสินใจแล้ว

---

## Step 6 — Verify sync สมบูรณ์

ตรวจสอบว่า:
- [ ] GROUND_TRUTH.md `## Phase Status` ตรงกับ git log
- [ ] GROUND_TRUTH.md `## Active Task` ระบุ task ปัจจุบัน
- [ ] REVIEW_STATUS.md มี entry ของ session นี้
- [ ] CLAUDE.md `Current State` อัปเดตวันที่แล้ว
- [ ] ไม่มี phase ที่ LOCKED แต่เขียนว่า IN PROGRESS

---

## Output

```markdown
## Docs Sync Summary — [วันที่]

### ไฟล์ที่อัปเดต
- GROUND_TRUTH.md — [สิ่งที่เปลี่ยน]
- REVIEW_STATUS.md — เพิ่ม [N] entries
- CLAUDE.md — อัปเดต Current State

### Phase Status หลัง sync
| Phase | Status |
|-------|--------|
| [Phase] | [Status] |

### งานค้าง (Queue)
- [รายการ]

### รอ user ตัดสินใจ
- [รายการจาก ASK_BOSS.md]
```

---

## ⚠️ กฎเหล็ก

```
ห้าม start task ใหม่ถ้า GROUND_TRUTH.md ค้างเกิน 1 วัน
ห้ามแก้ Phase Status โดยไม่มีหลักฐานใน git log
ห้าม unlock Phase ที่ LOCKED โดยไม่มี user approve เป็นลายลักษณ์อักษร
```
