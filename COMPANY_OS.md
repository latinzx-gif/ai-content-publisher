# COMPANY_OS.md — รัฐธรรมนูญกลาง

**อ่านไฟล์นี้ก่อนทุก project ก่อนตัดสินใจ scope หรือเริ่มงานใดๆ**
**ทุก project ต้อง reference ไฟล์นี้ใน GROUND_TRUTH.md ของตัวเอง**

---

## 1. Company Identity

**Owner:** Jakarin (โอ) — Solo Founder
**โมเดลธุรกิจ 3 ส่วน:**

| ส่วน | คืออะไร | เป้าหมาย |
|------|---------|---------|
| **Fastwork / Client Work** | รับทำระบบ AI, Automation, Research, HR, Payroll, Inventory | รายได้เร็ว |
| **DataClaw** | Market Intelligence + Research | สะสม Data Asset + Insight Report |
| **Investment** | ระบบลงทุน | สะสมทุน บริหารความเสี่ยง ทบต้น |

**หลักการทำงาน:**
- สร้าง asset ระยะยาว ไม่ใช่แค่ทำงานรับเงินรายครั้ง
- ระบบต้องขยายต่อได้ ไม่ใช่ one-off
- ลดความเสี่ยง ไม่ทำอะไรที่ยาก undo
- Solo Founder = ทรัพยากรมีจำกัด เลือก leverage สูงก่อนเสมอ

---

## 2. Standard Agent Lineup

ทุก project ใช้ชุดนี้เป็น default — เปลี่ยนได้เฉพาะถ้ามีเหตุผลชัดเจนใน GROUND_TRUTH.md

**Orchestrator:** Claude Code
**Workers:** Antigravity · Codex CLI

| Agent | Runtime | บทบาท | ห้าม |
|-------|---------|--------|------|
| **Claude Code** | Claude Code CLI | **ORCHESTRATOR** — Plan, Dispatch, Review, Approve | Self-approve, implement >20 บรรทัด |
| **Antigravity** | Antigravity IDE | UI · Frontend · Design · Browser E2E Test | แตะ backend/API, self-approve |
| **Codex** | Codex CLI | Backend · API · Logic · Testing · Deploy | แตะ UI/design files, self-approve |

**ดู orchestration rules เต็ม:** `CLAUDE.md` (root)
**ดู routing detail:** `OS/HERMES-OS/MODEL_ROUTING.md`

---

## 3. Routing Rule (Claude Code ใช้ตัดสินใจทุก task)

```
BUILD / FIX / SUPPORT
  Claude Code → PLAN → ตัดสินใจ routing:

  มี UI / Frontend / Design / Browser test?  → Antigravity
  มี Backend / API / Logic / Test / Deploy?  → Codex
  ทั้งสองอย่าง?  → Codex (backend ก่อน) → Antigravity (UI ต่อ)
  งานเล็กมาก (<20 บรรทัด)?  → Claude Code ทำเอง

ไม่แน่ใจ → Claude Code PLAN ก่อนเสมอ แล้วถาม Jakarin ถ้า scope ไม่ชัด
```

**Context ที่ต้องส่งให้ทุก Worker:**
```
- CLAUDE.md (root) — orchestration rules
- AGENTS.md — universal rules
- GROUND_TRUTH.md ของ project นั้น
- CURRENT_TASK.md (plan + scope + do not touch)
```

**ดู routing detail + prompt templates:** `CLAUDE.md` (root)

---

## 4. Universal Task Loop

ทุก task ทุก project ทำตาม loop นี้เสมอ — ห้ามข้ามขั้นตอน:

```
Cursor → เลือก task จาก Taskmaster → เขียน CURRENT_TASK.md (Phase: PLAN)
         └─ Taskmaster: set status = in-progress

Cursor → routing: Codex หรือ Claude Code?

[Agent] → อ่าน context → เขียน TASK_PLAN.md + CURSOR_PLAN_REQUEST.md → STOP ✋

Cursor → review plan → APPROVE: เขียน PLAN_APPROVAL.md, Phase: EXECUTE
                     → REJECT: แจ้ง agent แก้ plan

[Agent] → implement ตาม plan → เขียน TASK_RESULT.md + CURSOR_REVIEW_REQUEST.md → STOP ✋

Cursor → git diff + build + criteria → APPROVE: archive, Taskmaster done, commit
                                      → REJECT: แจ้ง agent แก้
```

**กฎเหล็ก:**
1. ไม่มี agent ไหน self-approve
2. ไม่มี agent ไหน start task ถัดไปเอง
3. ทุก task ผ่าน PLAN → APPROVE → EXECUTE → REVIEW เสมอ
4. Agent ที่ทำ PLAN ต้องเป็น agent เดียวกับที่ทำ EXECUTE

---

## 5. Universal Quality Gates

ทุก task ทุก project ต้องผ่านก่อน approve:

```bash
npm run build        # ต้อง pass เสมอ
npm run typecheck    # ต้อง pass เสมอ
npm run lint         # ต้อง pass เสมอ (0 errors)
```

ถ้า project ไม่ใช่ Node.js — ระบุ equivalent ใน GROUND_TRUTH.md

---

## 6. Universal DO NOT DO (ทุก project ทุกกรณี)

ห้ามทำสิ่งเหล่านี้โดยไม่มี user approve เป็นลายลักษณ์อักษร:

- ❌ เพิ่ม dependency ใหม่โดยไม่บอก
- ❌ แตะ auth / security / payment ถ้าไม่ใช่งานที่ assign
- ❌ ลบข้อมูลจาก database (hard delete)
- ❌ เปิด port / endpoint ใหม่โดยไม่บอก
- ❌ Commit ด้วย force push
- ❌ เก็บ secret / token ใน source code
- ❌ เริ่ม Phase ถัดไปก่อน user approve
- ❌ Refactor นอก scope ของ task ที่ assign
- ❌ สร้าง feature ที่ไม่ได้อยู่ใน task

---

## 7. Folder Structure มาตรฐาน (ทุก project)

```
project-root/
├── GROUND_TRUTH.md            ← @COMPANY_OS.md + project-specific
├── orchestration/
│   ├── CURRENT_TASK.md        ← active task + Phase
│   ├── REVIEW_STATUS.md       ← approval history
│   ├── AGENT_LOOP.md          ← loop rules (ถ้าต้องการ detail)
│   └── templates/
│       └── GOOD_TASK_GUIDE.md ← template task + plan
├── <app>/
│   └── _agent/
│       ├── TASK_PLAN.md
│       ├── PLAN_APPROVAL.md
│       ├── TASK_RESULT.md
│       └── archive/
└── reports/
    └── DELIVERY_READINESS_AUDIT.md
```

---

## 8. Taskmaster Setup (ทุก project ใหม่)

```bash
# 1. Init
task-master init

# 2. Parse PRD
task-master parse-prd --input=docs/PRD.md

# 3. ตรวจ
task-master list

# 4. Lock Phase 2+ tasks
task-master set-status --id=<id> --status=blocked
```

---

## 9. New Project Checklist

เมื่อเริ่ม project ใหม่ ต้องมีสิ่งเหล่านี้ก่อนเขียน code บรรทัดแรก:

- [ ] `GROUND_TRUTH.md` สร้างแล้ว — ระบุ `@COMPANY_OS.md` ที่ส่วนต้น
- [ ] Tech stack ระบุชัด — ไม่เพิ่มเครื่องมือใหม่โดยไม่มีเหตุผล
- [ ] Phase 1 scope ล็อคแล้ว — Phase 2+ เป็น LOCKED
- [ ] DO NOT BUILD list ระบุแล้ว
- [ ] Taskmaster initialized + PRD parsed
- [ ] CURRENT_TASK.md task แรกพร้อม Phase: PLAN
- [ ] `orchestration/REVIEW_STATUS.md` สร้างแล้ว (ว่างๆ ก็ได้)

---

## 10. Pre-Delivery Audit Protocol

ก่อน demo / handoff ทุกครั้ง:

1. รัน `workflow-skills/07-delivery-audit/SKILL.md` ด้วย `claude-opus-4-8`
2. ได้ `reports/DELIVERY_READINESS_AUDIT.md`
3. Verdict ต้องเป็น 🟢 หรือ 🟡 (พร้อม caveat ที่ acceptable) ก่อน demo

---

## 11. GROUND_TRUTH.md Template สำหรับ Project ใหม่

```markdown
# GROUND_TRUTH.md — [Project Name]

> @COMPANY_OS.md — ทุกกฎใน COMPANY_OS.md มีผลกับ project นี้ด้วย
> Override เฉพาะส่วนที่ระบุด้านล่างเท่านั้น

---

## 1. สิ่งที่กำลังสร้าง
[product + tech stack + flow หลัก]

## 2. App Structure
[paths + URL mapping]

## 3. Phase Status
| Phase | Status |
|-------|--------|
| Phase 1 | 🔄 IN PROGRESS |
| Phase 2+ | 🔒 LOCKED |

## 4. ห้ามสร้าง (Project-specific)
[เพิ่มจาก Universal DO NOT DO ใน COMPANY_OS.md]

## 5. Agent Override (ถ้ามี)
[ถ้า project นี้ไม่ใช้ Codex หรือเพิ่ม agent พิเศษ — ระบุที่นี่]
[ถ้าไม่มี: ใช้ standard lineup จาก COMPANY_OS.md]

## 6. Active Task
ดู: orchestration/CURRENT_TASK.md

## 7. Key Files
| ต้องการรู้เรื่อง | อ่านที่ |
|----------------|---------|
| งานปัจจุบัน | orchestration/CURRENT_TASK.md |
| Approval history | orchestration/REVIEW_STATUS.md |
| Architecture decisions | orchestration/DECISION_LOG.md |
```

---

---

## 12. Skill Protocol — ทุก Agent ทุก Task

**Skills อยู่ที่:** `orchestration/workflow-skills/`

### Cursor — เมื่อ Set Task ใหม่

อ่าน `orchestration/workflow-skills/02-cursor-set-task/SKILL.md` ก่อนเขียน CURRENT_TASK.md ทุกครั้ง

Routing table (เลือก skills ให้ครบก่อน commit):

| เงื่อนไข | Skills ที่ต้องระบุใน CURRENT_TASK.md |
|---------|--------------------------------------|
| ทุก task | `03-claude-plan` + `05-claude-execute` (บังคับเสมอ) |
| goal มีคำ: bug / fix / error / พัง | + `09-debug-session` |
| แตะ schema / table / RLS / migration | + `12-supabase-migration` |
| แตะ auth / API key / token | + `10-security-review` |
| ก่อน deploy production | + `14-deployment-checklist` |
| production ล่ม / down | `13-incident-playbook` (แทนที่ทุก skill) |
| เริ่ม project ใหม่ | `01-project-init` + `08-prd-to-tasks` |
| งาน client ใหม่ | `11-client-requirements` + `08-prd-to-tasks` |
| ก่อน demo / delivery | `07-delivery-audit` + `10-security-review` |

### Claude Code / Codex — เมื่อรับ Task

อ่าน skills ที่ระบุใน `## Skills to Load` ของ CURRENT_TASK.md ก่อนเริ่ม PLAN เสมอ

### Skill Index เต็ม

ดู `orchestration/workflow-skills/README.md`

---

*Last updated: 2026-06-19 — v3.0: Claude Code Orchestrator + Antigravity + Codex*
*Location: /Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md*
