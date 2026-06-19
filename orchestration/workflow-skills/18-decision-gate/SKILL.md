---
name: workflow-decision-gate
description: >-
  Protocol for when an agent finds an issue or decision that is beyond its authority.
  Agents STOP, log to ASK_BOSS.md, and wait — never self-decide on security,
  scope, schema, or UX strategy. Use whenever a finding needs user input.
---

# Skill: Decision Gate

## เมื่อไหรที่ต้องใช้ skill นี้

Agent พบสิ่งเหล่านี้ → **STOP ทันที** → บันทึก ASK_BOSS.md → รอ user

```
🔴 Security findings — auth bypass, RLS hole, unauthenticated endpoint
🔴 Schema change ที่ไม่อยู่ใน task
🔴 Logic ที่ไม่ชัดเจน — อาจทำให้ข้อมูลหาย
🟡 UX ที่มีหลายทางเลือก — hardcode / real data / ซ่อน
🟡 Scope ที่ไม่แน่ใจว่า Phase ไหน
🟡 Dependency ใหม่ที่ไม่ได้ approve
🟡 Feature drift ที่เกินขอบเขต CURRENT_TASK.md
```

---

## กฎเหล็ก

```
✅ บันทึก finding ทุกอย่างไว้ก่อน — อย่าทิ้ง
✅ ระบุ impact ชัด: จะเกิดอะไรถ้าแก้ / ถ้าไม่แก้
✅ เสนอทางเลือก ก/ข/ค พร้อม tradeoff

❌ ห้ามแก้ security issue เองโดยไม่มี user approve
❌ ห้ามตัดสินใจ UX strategy เอง
❌ ห้าม skip บันทึก — "จะบอกทีหลัง" ทำให้ลืมเสมอ
❌ ห้ามทำ workaround ที่ "ดูเหมือนแก้" แต่ซ่อนปัญหา
```

---

## ASK_BOSS.md Entry Template

```markdown
## 🔴 [Security/Critical] / 🟡 [UX/Strategy] — [ชื่อสั้น]

### ปัญหา
[อธิบายชัดว่าเจออะไร พบที่ไหน]

### ไฟล์ที่เกี่ยว
`[path/file.ts:line]` — [บรรทัดที่เกี่ยว]

### ความเสี่ยง / ผลกระทบ
[ถ้าปล่อยไว้จะเกิดอะไร]

### ทางเลือก
- **ก** [ทางเลือก 1] — [tradeoff]
- **ข** [ทางเลือก 2] — [tradeoff]  
- **ค** [ทางเลือก 3] — [tradeoff]

### รออนุมัติ
✅ [คำถามชัดๆ ที่รอคำตอบ]?

---
```

---

## ประเภท Decision และ Template ที่เหมาะ

### 🔴 Security — ต้องการ approve ก่อนแก้

```markdown
## 🔴 Security — [ชื่อ]
- **ไฟล์:** `[path]:line`
- **ความเสี่ยง:** [อธิบาย attack vector]
- **แก้ด้วย:** [วิธีแก้ที่แนะนำ]
- **รออนุมัติ:** แก้ได้เลยไหม?
```

### 🟡 UX / Data — เลือก ก/ข/ค

```markdown
## 🟡 UX — [ชื่อหน้า] — [ปัญหา]
- **ไฟล์:** `[path]`
- **ปัญหา:** [อธิบาย]
- **ตัวเลือก:**
  - **ก** ต่อ DB จริง (ใช้เวลา X, Phase Y scope)
  - **ข** ติดป้าย "Demo data" (เร็ว ไม่หลอก)
  - **ค** ซ่อนก่อน demo
- **รอคำตอบ:** ก / ข / ค ?
```

### 🟡 Scope / Phase — ตัดสินใจว่า Phase ไหน

```markdown
## 🟡 Scope — [Feature]
- **พบที่:** [context]
- **ปัญหา:** feature นี้อยู่ใน Phase ไหน? GROUND_TRUTH.md ไม่ระบุ
- **ถ้าทำตอนนี้:** [impact]
- **ถ้ารอ Phase ถัดไป:** [impact]
- **รอคำตอบ:** ทำตอนนี้ หรือ lock ไว้ใน Phase [N]?
```

---

## หลัง user ตอบ

```markdown
## RESOLVED — [ชื่อ]
- **คำตอบ:** [ตัวเลือกที่ user เลือก]
- **วันที่:** [วันที่ตอบ]
- **Action:** [สิ่งที่ต้องทำต่อ]
```

ย้าย entry จาก ASK_BOSS.md ไปเก็บใน DECISION_LOG.md

---

## Priority ของ Decision

```
🔴 Security → ต้อง resolve ก่อน demo เสมอ
🔴 Data loss risk → ต้อง resolve ก่อน production
🟡 UX strategy → resolve ก่อน ship feature นั้น
🟡 Scope → resolve ก่อนเริ่ม task ที่เกี่ยว
🟢 Polish → resolve ตอนไหนก็ได้
```

---

## Integration กับ COMPANY_OS.md Loop

ใน PLAN phase ถ้าเจอ decision ที่ต้องถาม:
```
Claude → เขียน TASK_PLAN.md ปกติ
       + เขียน ASK_BOSS.md entries
       + ระบุใน CURSOR_PLAN_REQUEST.md: "มี N decisions รอ user"
       → STOP รอ Cursor review

Cursor → ตอบ decisions → เขียน PLAN_APPROVAL.md (หรือรอ user ตอบ)
```
