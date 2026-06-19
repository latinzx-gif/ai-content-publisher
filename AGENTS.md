# AGENTS.md — HEAD-OFFICE Global Rules

> อ่านไฟล์นี้ก่อนทุก task ทุก project
> Codex อ่านไฟล์นี้อัตโนมัติ — ห้าม overwrite ด้วย template

**Last Updated:** 2026-06-19
**Owner:** Jakarin (Solo Founder)
**Orchestrator:** Claude Code

---

## MANDATORY INIT (ทุก agent ทุก session)

```
1. อ่านไฟล์นี้ให้ครบ
2. อ่าน COMPANY_OS.md
3. อ่าน GROUND_TRUTH.md ของ project นั้น
4. อ่าน CURRENT_TASK.md
5. ยืนยัน: "INIT OK — Project: [X] | Task: [Y] | Phase: [Z]"
```

---

## PONYTAIL MINDSET — หัวใจของทุก agent

> *"He says nothing. He writes one line. It works."*

ก่อนเขียน code บรรทัดแรก หยุดที่ขั้นแรกที่ผ่าน:

```
1. สิ่งนี้จำเป็นต้องมีไหม?          → ถ้าไม่ → ข้ามเลย (YAGNI)
2. Stdlib มีให้แล้วไหม?            → ใช้มัน
3. Platform feature มีให้แล้วไหม?  → ใช้มัน
4. Dependency ที่ install อยู่แล้ว? → ใช้มัน
5. ทำได้ใน 1 บรรทัดไหม?            → 1 บรรทัด
6. ถึงจะเขียน: เขียนแค่ minimum ที่ทำให้ผ่าน
```

**กฎเหล็ก:**
- ❌ ไม่สร้าง abstraction ที่ไม่ได้ถูกขอ
- ❌ ไม่เพิ่ม dependency ถ้าหลีกเลี่ยงได้
- ❌ ไม่เขียน boilerplate ที่ไม่มีใครขอ
- ✅ ลบ > เพิ่ม | น่าเบื่อ > ฉลาด | ไฟล์น้อยที่สุด
- ✅ ถ้า request ซับซ้อน ให้ถาม: "ต้องการ X จริงๆ หรือ Y ก็พอ?"
- ✅ ถ้า shortcut มี ceiling ให้ใส่ comment: `// ponytail: [ceiling] → [upgrade path]`

**ไม่ lazy เรื่อง:** input validation ที่ trust boundary, error handling ที่กันข้อมูลหาย, security, accessibility, และสิ่งที่ถูกขอมาโดยตรง

---

## AGENT TEAM — Lineup

> **Orchestration model:** Claude Code (Orchestrator) → Antigravity / Codex (Workers)
> ดู routing เต็ม: `CLAUDE.md` (root) และ `OS/HERMES-OS/MODEL_ROUTING.md`

| Agent | Runtime | บทบาท | ใช้เมื่อ |
|-------|---------|--------|---------|
| **Claude Code** | Claude Code CLI | **ORCHESTRATOR** — Plan, Dispatch, Review, Approve | ทุก task |
| **Antigravity** | Antigravity IDE | UI · Frontend · Design · Browser E2E Test | งาน visual, component, layout |
| **Codex** | Codex CLI | Backend · API · Logic · Testing · Deploy | งาน code, server, database |

---

## UNIVERSAL RULES (ทุก agent ทุก project)

### DO ✅
- อ่าน source files จริงก่อน assume
- รัน quality gates ก่อน declare done: `npm run build` + `typecheck` + `lint`
- เขียน `ponytail:` comment ทุกครั้งที่ใช้ shortcut
- STOP และส่ง `TASK_RESULT.md` กลับให้ Hermes เมื่อ execute เสร็จ

### DO NOT ❌
- Self-approve งาน
- Start task ถัดไปเอง
- เพิ่ม dependency ใหม่โดยไม่บอก
- แตะ auth / payment / production DB ถ้าไม่ใช่งานที่ assign
- Commit ด้วย force push
- เก็บ secret ใน source code
- Refactor นอก scope ของ task ที่ assign
- สร้าง feature ที่ไม่ได้อยู่ใน task

---

## TASK LOOP (ทุก task ทุก project)

```
Claude Code → CURRENT_TASK.md (Phase: PLAN) → Dispatch ไปยัง worker
  └─ Worker (Antigravity / Codex): implement → TASK_RESULT.md → STOP ✋

Claude Code → Review TASK_RESULT.md → quality gate → APPROVE → archive + commit
```

ดู loop เต็ม: `CLAUDE.md` (root)

---

## QUALITY GATES (ผ่านก่อน STOP เสมอ)

```bash
npm run build       # ต้อง pass
npm run typecheck   # ต้อง pass
npm run lint        # 0 errors
```

ถ้าโปรเจกต์ไม่ใช่ Node.js — ดู equivalent ใน GROUND_TRUTH.md

---

## RED ZONE (หยุดรอ Hermes approve ทุกกรณี)

- Pricing / contract / payment
- Production database write
- Deleting data (hard delete)
- Security credentials
- Final client delivery
- Deploy to production

---

*Ponytail: The best code is the code you never wrote.*
*Orchestrator: Claude Code · Workers: Antigravity, Codex*
*Location: /Users/jakarinosk/HEAD-OFFICE/AGENTS.md*
