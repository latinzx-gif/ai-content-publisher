# GROUND_TRUTH.md — Project North Star

> @/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md — กฎทั้งหมดใน COMPANY_OS.md มีผลกับ project นี้ด้วย
> ไฟล์นี้ระบุเฉพาะส่วนที่ต่างจาก COMPANY_OS.md เท่านั้น

**อ่านไฟล์นี้ก่อนทุก session ก่อนตัดสินใจ scope หรือเริ่มงานใดๆ**

---

## 1. สิ่งที่กำลังสร้าง

**AI Content Publisher** — ระบบสร้าง ตรวจสอบ และ publish social media content แบบ semi-automated สำหรับ law/accounting firm

เส้นทางหลัก (V1 flow):

```
Create Post → Brief Builder → Rule Loader → Content Generation (TH+EN)
→ Image Prompt → Image Generation → Quality Check → Review & Approval
→ Calendar → Publishing (Buffer) → Logs / Dashboard
```

- **ภาษา:** Dual-language (Thai primary + English secondary)
- **Publishing channel:** Buffer API เท่านั้น (ไม่มี direct Meta/LinkedIn/Twitter)
- **AI:** OpenAI เท่านั้น (text = GPT, image = DALL-E 3)
- **Database:** Supabase project `ai-auto-tools` / `luxegqsccaodcikxhwrm` — prefix `acp_`
- **Auth:** Supabase magic link (`/publisher/login`), password (`/login`)

---

## 2. App Structure

| Surface | Path | URL |
|---------|------|-----|
| PRD Dashboard | `src/app/page.tsx` | `http://localhost:3001/` |
| Publisher workflow | `src/app/publisher/*` | `http://localhost:3001/publisher/` |

- Monorepo root: `/Users/jakarinosk/HEAD-OFFICE/`
- App root: `/Users/jakarinosk/HEAD-OFFICE/head-office-app/`
- **ไม่มี** `apps/ai-content-publisher/` แล้ว — merged เข้า `head-office-app` แล้ว
- **ไม่มี** `editor-canvas2` — removed ออกไปแล้ว อย่าสร้างใหม่

---

## 3. Phase Status (2026-06-11)

| Phase | Status | หมายเหตุ |
|-------|--------|----------|
| **Phase 1 MVP** | ✅ **CLOSED** | 12 modules built + integrated (FIX-01 → CLOSE-01) |
| **Phase 1.1** | ✅ **CLOSED** | Lint, tests, auth, docs synced |
| **Phase 1 refactor** | ✅ **CLOSED** | `page.tsx` เหลือ 13 บรรทัด (thin shell) — components ทั้งหมดอยู่ใน `src/features/prd/components/` รวม `EndToEndWorkflowSimulation.tsx`, `TopBar.tsx` |
| **Phase 2** | 🔒 LOCKED | ห้ามเริ่มจนกว่า user จะ approve |
| **Phase 3** | 🔒 LOCKED | ห้ามเริ่มจนกว่า user จะ approve |

**Phase 1 สิ่งที่ built แล้ว (ครบทุกข้อ):**
- Supabase schema `acp_posts`, `acp_post_content`, `acp_post_images`, `acp_audit_logs`
- localStorage → Supabase migration สมบูรณ์
- OpenAI text generation (brief + content + QC)
- DALL-E 3 image generation
- Buffer publish/schedule/retry
- Supabase magic-link auth + RLS
- 13 gate tests pass, lint 0 errors, build clean

---

## 4. Active Task

**P1-DEMO-FINAL — Content OS demo readiness — สถานะ: DEMO READY**

| Field | Value |
|-------|-------|
| Phase | **DEMO READY** |
| งานที่ปิดไปแล้ว (2026-06-11) | P1-04 refactor (รวม P1-04t), P1-FIX-01 workflow integrity (commit `764d659`), P1-LINT-01 (commit `afe6af3`) |
| รายละเอียด P1-FIX-01 | `head-office-app/_agent/archive/P1-FIX-01/TASK_RESULT.md` |

ดูรายละเอียดเต็ม: `orchestration/CURRENT_TASK.md`

**งานค้าง / Queue ถัดไป:**

| ID | งาน | Blocker |
|----|-----|---------|
| P1-FIX-01 follow-up | ยืนยัน migration `20260611090000_acp_posts_status_rejected.sql` บน live + รัน E2E ซ้ำ | User apply migration ใน dashboard (หน้าต่าง 1 ของ PARALLEL_PLAN_2026-06-11 ดูแลอยู่) |
| P1-BUFFER-01 | Live Buffer publish | User adds valid `BUFFER_ACCESS_TOKEN` (Buffer paused) |
| P2-01 | Sources MVP (Phase 2 entry) | User approves Phase 2 scope |

---

## 5. ห้ามสร้าง (ทุก Phase)

สิ่งเหล่านี้ **ห้ามแตะ** ไม่ว่าจะมีเหตุผลอะไร จนกว่า user จะ approve เป็นลายลักษณ์อักษร:

- ❌ Marketplace / payments / multi-tenant
- ❌ Sources / RSS / Tavily / Brave search
- ❌ Google Drive RAG / pgvector / embeddings
- ❌ Competitor monitoring
- ❌ Advanced analytics pipeline
- ❌ Drag-and-drop calendar / yearly view
- ❌ Direct Meta / LinkedIn / Twitter API
- ❌ Multi-model AI routing (OpenAI only)
- ❌ Custom auth system (Supabase only)
- ❌ `editor-canvas2` (removed — do not restore)
- ❌ UI polish ก่อน critical flow stable
- ❌ Tests ก่อน target behavior stable

---

## 6. Agent Roles (Updated: 2026-06-18 — Hermes 2.0)

> ใช้ Hermes team ตาม COMPANY_OS.md — ดูรายละเอียด: `OS/HERMES-OS/AGENT_TEAM.md`

| Agent | Runtime | Model | หน้าที่ |
|-------|---------|-------|---------|
| **Hermes** | — | — | Orchestrator — set task, route, review, approve |
| **Planner** | Codex CLI | `gpt-5.4-mini` | PLAN phase ทุก task |
| **Builder A** | Antigravity | `Gemini 3.5 Flash` | Full-stack, UI, E2E browser test |
| **Builder B** | Codex CLI | `gpt-5.3-codex-spark` | New file, API, script (isolated) |
| **Debugger** | Codex CLI | `gpt-5.5` | Root cause analysis |
| **Researcher** | Gemini CLI | `gemini-3.1-pro-preview` | Large context scan, audit |
| **Auditor** | Codex CLI | `gpt-5.5` | Pre-delivery audit |

**Ponytail mindset:** เขียนน้อยที่สุดที่ยังถูกต้อง — ดู `HEAD-OFFICE/AGENTS.md`
**Routing เต็ม:** `OS/HERMES-OS/MODEL_ROUTING.md`

---

## 7. Loop สำหรับทุก Task

```
Hermes → CURRENT_TASK.md (Phase: PLAN)
Planner → TASK_PLAN.md → STOP ✋
Hermes → approve → PLAN_APPROVAL.md → Phase: EXECUTE
Builder/Patcher → implement → TASK_RESULT.md → STOP ✋
Hermes → quality gate → review → archive + commit
```

กฎเหล็ก: **ไม่มี agent ไหน self-approve หรือ start task ถัดไปเอง**

ดู loop detail: `orchestration/AGENT_LOOP.md`  
ดู review process: `orchestration/CURSOR_REVIEW_GATE.md`

---

## 8. Key Files Map

| ต้องการรู้เรื่อง | อ่านที่ |
|----------------|---------|
| งานปัจจุบัน | `orchestration/CURRENT_TASK.md` |
| สถานะ approval | `orchestration/REVIEW_STATUS.md` |
| Scope ที่ lock แล้ว | `orchestration/PHASE_1_SCOPE_LOCK.md` |
| Infrastructure decisions | `orchestration/CURSOR_DECISIONS.md` |
| Agent rules (ฉบับเต็ม) | `head-office-app/AGENTS.md` |
| Demo readiness | `reports/DEMO_READINESS_REPORT.md` |
| Phase 1 sign-off | `reports/PHASE_1_SIGNOFF.md` |

---

## 9. Reading Protocol — อ่านอะไร ลำดับไหน

### Claude Code — PLAN session

อ่านตามลำดับ ห้ามข้าม:

```
0. /Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md ← company rules (อ่านก่อนสุด)
1. orchestration/GROUND_TRUTH.md          ← scope + forbidden (อ่านก่อนเสมอ)
2. orchestration/REVIEW_STATUS.md         ← ตรวจว่า previous task APPROVED แล้ว
3. orchestration/CURRENT_TASK.md          ← goal + allowed files + acceptance criteria
4. head-office-app/AGENTS.md              ← codebase rules
5. [Allowed Files จาก CURRENT_TASK.md]   ← อ่านเฉพาะ section ที่เกี่ยวข้อง ไม่ dump ทั้งไฟล์
6. src/features/prd/README.md             ← ถ้า task แตะ features/prd/
```

จากนั้นเขียน:
- `_agent/TASK_PLAN.md` — ดูรูปแบบที่ `orchestration/templates/GOOD_TASK_GUIDE.md`
- `_agent/CURSOR_PLAN_REQUEST.md` → **STOP**

---

### Claude Code — EXECUTE session

```
0. /Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md ← ถ้ายังไม่ได้อ่านใน session นี้
1. orchestration/CURRENT_TASK.md          ← ยืนยัน Phase: EXECUTE
2. head-office-app/_agent/PLAN_APPROVAL.md ← ต้องเป็น APPROVED เท่านั้น
3. head-office-app/_agent/TASK_PLAN.md    ← implement ตามนี้เท่านั้น ห้าม improvise
4. [Allowed Files]                        ← อ่านเฉพาะที่ต้องแก้จริง
```

จากนั้น implement → เขียน `_agent/TASK_RESULT.md` + `_agent/CURSOR_REVIEW_REQUEST.md` → **STOP**

---

### Cursor — เขียน task ใหม่

```
0. /Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md ← routing rules + universal forbidden
1. orchestration/GROUND_TRUTH.md          ← phase status + forbidden
2. orchestration/REVIEW_STATUS.md         ← previous task approved?
3. orchestration/POST_PHASE_1_1_QUEUE.md  ← next task ในคิว
4. head-office-app/_agent/TASK_RESULT.md  ← output จาก task ที่แล้ว (ถ้ามี)
```

จากนั้นเขียน `orchestration/CURRENT_TASK.md` — ดูรูปแบบที่ `orchestration/templates/GOOD_TASK_GUIDE.md`

---

### Cursor — Review task

```
1. head-office-app/_agent/TASK_RESULT.md
2. head-office-app/_agent/CURSOR_REVIEW_REQUEST.md
3. git diff (allowed files only)
4. npm run build && npm run typecheck && npm run lint
5. orchestration/TASK_CLEANUP_CHECKLIST.md
```

---

*Last updated: 2026-06-11 — Docs sync (PARALLEL_PLAN_2026-06-11 หน้าต่าง 2)*
