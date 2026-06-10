# AGENT_ROLES.md — HeadOffice Workspace

---

## Hermes / Codex — RETIRED (2026-06-10)

Project นี้ใช้ Cursor + Claude Code แทนแล้ว ไม่มี Hermes หรือ Codex

---

## Gemini CLI

**Role:** Audit & Review Agent (Secondary)

**Responsibilities:**
- Read-only repo / E2E coverage audits
- Second opinion after Claude EXECUTE
- Large-context scans (doc drift, stale paths)
- Write `head-office-app/_agent/GEMINI_AUDIT_RESULT.md` only

**Used when:**
- Task `Phase: AUDIT` in `CURRENT_TASK.md`
- Post-task verification (e.g. after P1-03 Playwright)
- Monorepo hygiene (`AUDIT-01`)

**Dispatch:**
```bash
./orchestration/scripts/run-gemini-task.sh audit
./orchestration/scripts/tmux-gemini.sh audit
```

**Does NOT:** Implement features or edit source without Cursor setting Allowed Files + plan

---

## Antigravity / UI Agent

**Role:** UI/Visual Specialist (On Demand)

**Responsibilities:**
- Publisher page visual polish (spacing, typography, empty states)
- Tailwind/CSS in allowed UI paths only
- Write `head-office-app/_agent/ANTIGRAVITY_RESULT.md`

**Used when:**
- Task `UI-*` in `PHASE_1_1_TASK_QUEUE.md`
- Structure already exists (usually after Claude)

**Dispatch:**
```bash
./orchestration/scripts/run-antigravity-task.sh ui
./orchestration/scripts/tmux-antigravity.sh ui
```

**Fallback:** If CLI not installed → assign UI work to Claude with tight Allowed Files

**Does NOT:** Auth, API, Supabase, scope decisions

---

## Cursor

**Role:** Orchestrator + Review Gate

**Responsibilities:**
- Set `CURRENT_TASK.md` (agent, phase, allowed files, model)
- Plan review → `PLAN_APPROVAL.md`
- Task review + `TASK_CLEANUP_CHECKLIST.md` after every task
- Linear updates, P0 verify, STOP on heavy blockers

**User commands:** `next` (advance), `review` (plan or task review)