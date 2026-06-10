---
name: workflow-delivery-audit
description: >-
  Pre-delivery audit using claude-opus-4-8: cross-check all acceptance criteria,
  demo flow, known blockers, and open issues before showing the product to a client.
  Use when user says "audit before demo" or "ready to deliver?".
---

# Skill: Delivery Audit (Opus)

## When to Use

ก่อน demo ให้ลูกค้า หรือก่อน handoff — ต้องการ audit แบบ fresh eyes ที่ไม่มี bias

**รัน skill นี้ด้วย model: `claude-opus-4-8`** (ไม่ใช่ default fable-5)

---

## Reading Protocol (อ่านก่อน audit — ห้ามข้าม)

```
1. orchestration/GROUND_TRUTH.md           ← scope + phase + forbidden
2. reports/DEMO_READINESS_REPORT.md        ← current demo readiness
3. reports/PHASE_1_SIGNOFF.md             ← known limitations
4. orchestration/REVIEW_STATUS.md         ← task completion history
5. orchestration/CURRENT_TASK.md          ← active task status
6. head-office-app/AGENTS.md              ← codebase rules
```

---

## Audit Checklist

### A. Phase 1 Core Flow (ทดสอบ end-to-end)

```
Create Post → Brief Builder → Rule Loader → Content Gen (TH+EN)
→ Image Prompt → Image Gen → Quality Check → Review & Approval
→ Calendar → Publishing (Buffer) → Logs
```

สำหรับแต่ละ stage:
- [ ] Route exists และ load ได้ (ไม่ 404)
- [ ] ทำงานได้กับ real data (ไม่ใช่แค่ mock)
- [ ] Error state handled (ถ้า API ล้มเหลว ไม่ crash)
- [ ] Data persist ใน Supabase ถูกต้อง

---

### B. Authentication

- [ ] Magic link login ทำงาน (`/publisher/login`)
- [ ] Password login ทำงาน (`/login`)
- [ ] RLS: ผู้ใช้ A เห็นแค่ data ของตัวเอง
- [ ] Session expire handled

---

### C. Technical Health

```bash
cd head-office-app
npm run build    → ต้องไม่มี error
npm run typecheck → ต้องไม่มี error
npm run lint     → ต้องไม่มี error

# ถ้ามี tests
npm run test     → pass rate
```

---

### D. Known Blockers (ตรวจสถานะ)

| Blocker | Status | Note |
|---------|--------|------|
| Valid BUFFER_ACCESS_TOKEN | ? | ต้องมี token จริงก่อน demo live publish |
| playwright/.auth/publisher.json | ? | ต้องมีก่อน E2E test |

---

### E. Scope Drift Check

อ่าน GROUND_TRUTH.md "ห้ามสร้าง" list แล้วตรวจ codebase:
- [ ] ไม่มี Phase 2+ feature ที่ build โดยไม่ได้ approve
- [ ] ไม่มี direct Meta/LinkedIn/Twitter API
- [ ] ไม่มี RAG / embeddings / pgvector
- [ ] ไม่มี multi-tenant / marketplace

---

## Output: เขียน DELIVERY_READINESS_AUDIT.md

บันทึกที่ `reports/DELIVERY_READINESS_AUDIT.md`

```markdown
# Delivery Readiness Audit — [วันที่]

## Auditor
claude-opus-4-8 — [session]

## Verdict
🟢 READY / 🟡 READY WITH CAVEATS / 🔴 NOT READY

## Summary
[2-3 ประโยค]

## Critical Issues (ต้องแก้ก่อน demo)
1. [ถ้ามี]

## Minor Issues (แก้ได้หลัง demo)
1. [ถ้ามี]

## Known Blockers (user action required)
1. BUFFER_ACCESS_TOKEN — [status]
2. playwright auth — [status]

## Scope Drift Found
[ถ้าไม่มี: "None"]

## Build Status
build: PASS / FAIL
typecheck: PASS / FAIL
lint: PASS / FAIL

## Recommendations
1. [สิ่งที่ควรทำก่อน demo]
```

---

## หลัง audit เสร็จ

บอก user:
- Verdict: 🟢/🟡/🔴
- Critical issues ถ้ามี (พร้อม path และ description)
- สิ่งที่ต้อง user action (token, auth file)
- ขั้นตอนถัดไป
