# AGENT_TASK_ROUTING.md — แบ่งงานตาม Agent + Review/Cleanup

**Orchestrator:** Cursor (คุณสั่ง `next` / `review`)  
**Product:** `head-office-app` — PRD `/` + Publisher `/publisher/*` (`:3001`)

---

## ใครทำอะไร

| Agent | เหมาะกับ | ห้าม / จำกัด |
|-------|----------|--------------|
| **Cursor** | ตั้ง `CURRENT_TASK.md`, plan review, task review, cleanup, Linear, STOP/blocker, verify P0 | ไม่ implement code โดยตรง (ยกเว้น hotfix เล็กน้อยเมื่อ blocker) |
| **Claude Code** | PLAN + EXECUTE — model **`claude-fable-5` (Fable 5)** | ห้าม code ก่อน plan approved; ห้ามเกิน Allowed Files |
| **Gemini CLI** | Audit โครงสร้าง repo, second review, doc drift, security skim, large-context scan | **Read-only โดย default** — ไม่แก้ code จนกว่า Cursor ตั้ง task EXECUTE + allowed files |
| **Antigravity CLI** | UI/visual — layout, spacing, component polish, mockup | ไม่ตัดสิน scope; ไม่แตะ auth/DB; ใช้หลัง structure ชัด (มักหลัง Claude) |
| **User** | Supabase SQL Editor, auth callback, secrets (Buffer, DB password) | — |

**tmux `head-office` (4 pane):**

| Pane | Agent | คำสั่ง |
|------|-------|--------|
| 0.0 | Claude | `claude` |
| 0.1 | Codex / Antigravity | `codex` หรือ `antigravity` (UI task) |
| 0.2 | Gemini | `gemini` |
| 0.3 | Dev server | `npm run dev` |

เริ่ม session: `./orchestration/scripts/tmux-head-office.sh`

---

## Loop มาตรฐาน (ทุก task — ห้ามข้าม)

```text
Cursor ตั้ง CURRENT_TASK (ระบุ Primary Agent + Phase)
    ↓
[PLAN] ถ้าเป็นงาน code → Claude เขียน TASK_PLAN → STOP
    ↓
User → Cursor: "review plan [TASK_ID]"
    ↓
Cursor → PLAN_APPROVAL (APPROVED/REJECTED) + cleanup checklist § plan
    ↓
[EXECUTE] Implementer ทำตาม plan / task brief เท่านั้น → TASK_RESULT → STOP
    ↓
User → Cursor: "review task [TASK_ID] — review and cleanup"
    ↓
Cursor: validate + TASK_CLEANUP_CHECKLIST.md + Linear + ตั้ง task ถัดไป
```

**Audit-only (Gemini):** ข้าม PLAN_APPROVAL ถ้า `Phase: AUDIT` และ `Write: no` — แต่ยังต้อง **review + cleanup** เสมอ

รายละเอียด: `AGENT_LOOP.md`, `CURSOR_REVIEW_GATE.md`, `TASK_CLEANUP_CHECKLIST.md`

---

## คำสั่งด่วน

```bash
cd ~/HEAD-OFFICE

# Claude (primary)
./orchestration/scripts/run-claude-background.sh plan
./orchestration/scripts/run-claude-background.sh execute
./orchestration/scripts/tmux-claude.sh plan|execute|review

# Gemini (audit)
./orchestration/scripts/run-gemini-task.sh audit
./orchestration/scripts/tmux-gemini.sh audit

# Antigravity (UI — ต้องติดตั้ง CLI ก่อน)
./orchestration/scripts/run-antigravity-task.sh ui
./orchestration/scripts/tmux-antigravity.sh ui

# Verify / Linear
./orchestration/scripts/verify-acp-schema.sh
./orchestration/scripts/post-linear-task.sh --task ID --status done --summary "..." 
```

---

## Task queue ปัจจุบัน

Phase 1.1 CLOSED (2026-06-10) — ดู `PHASE_1_1_TASK_QUEUE.md` สำหรับ archive  
Active queue: `POST_PHASE_1_1_QUEUE.md` | Active task: `CURRENT_TASK.md`

### Phase 1.1 (ทั้งหมด CLOSED ✅)

| ID | งาน | Agent | Status |
|----|-----|-------|--------|
| P0-UNBLOCK | Migrations + auth callback | User | ✅ done |
| P0-VERIFY | verify schema + smoke 12-step | Cursor | ✅ done |
| P1-01 | Fix lint `no-explicit-any` (2 files) | Claude | ✅ done |
| P1-02 | `orchestration/.env.local` Linear | Cursor | ✅ done |
| P1-03 | Playwright E2E publisher | Claude | ✅ done |
| P1-04 | Split `page.tsx` → `features/prd/` foundation | Claude | ✅ done |
| P1-04c | Extract Sidebar | Claude | ✅ done |
| P1-04d | Extract MobileSidebarDrawer | Claude | ✅ done |
| P1-04e–r | TopBar, primitives, WorkspaceView, loading fallback | Cursor/Claude | ✅ done |
| P1-04s | Extract SafetyConfirmationDialog | Cursor | ✅ done |

### Active (Phase 1 refactor)

| ID | งาน | Agent | Status |
|----|-----|-------|--------|
| **P1-04t** | Extract EndToEndWorkflowSimulation | **Claude** / Cursor `next` | 🔄 **PLAN** |

### Queue รอ (blocker)

| ID | งาน | Agent | Blocker |
|----|-----|-------|---------|
| P1-E2E-02 | Authenticated 12-step Playwright flow | Claude | User saves `playwright/.auth/publisher.json` |
| P1-BUFFER-01 | Live Buffer publish | Claude | `BUFFER_ACCESS_TOKEN` valid token |
| P2-01 | Sources MVP (Phase 2 entry) | Claude | User approves Phase 2 scope |

---

## เลือก Agent อย่างไร (กฎสั้น)

| สัญญาณ | ใช้ |
|--------|-----|
| แก้ `.ts`/`.tsx`, API, Supabase migration **files**, tests | **Claude** |
| สำรวจทั้ง repo, หา drift, second opinion, ไม่แตะไฟล์ | **Gemini** |
| สี, spacing, component look, landing polish | **Antigravity** |
| รัน SQL บน production Supabase, ใส่ secret | **User** |
| อนุมัติ plan, merge ความเห็น agent, ตั้ง task ถัดไป | **Cursor** |

---

## STOP — หยุดรอ user

เมื่อเจอข้อใดข้อหนึ่ง → อัปเดต `P0_STOP.md` / `CURRENT_TASK.md` สถานะ **STOPPED** + Linear `blocked`:

- Remote ไม่มี `acp_*` tables
- ไม่มีสิทธิ์ Supabase CLI / DB password
- Auth callback ยังไม่ตั้ง
- `BUFFER_ACCESS_TOKEN` ไม่ valid (publish live)
- Agent CLI ไม่ติดตั้ง (เช่น `antigravity`)

---

## ไฟล์ที่ agent ต้องเขียน

| Phase | Claude | Gemini | Antigravity |
|-------|--------|--------|-------------|
| PLAN | `TASK_PLAN.md`, `CURSOR_PLAN_REQUEST.md` | — | — |
| EXECUTE | `TASK_RESULT.md`, `CURSOR_REVIEW_REQUEST.md` | — | `ANTIGRAVITY_RESULT.md`, `CURSOR_REVIEW_REQUEST.md` |
| AUDIT | — | `GEMINI_AUDIT_RESULT.md`, `CURSOR_REVIEW_REQUEST.md` | — |

Cursor หลัง review: `reports/task-reviews/{ID}_REVIEW.md` + archive ตาม `TASK_CLEANUP_CHECKLIST.md`

---

## Related

- `PHASE_1_1_TASK_QUEUE.md` — queue + prompts
- `MODEL_ROUTING.md` — Fable 5 default (`claude-fable-5`)
- `SUBAGENT_ROUTING.md` — read-only research (complex tasks)
- `templates/prompts/` — prompt สำเร็จรูปต่อ task
