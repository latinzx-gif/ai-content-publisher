# AGENT_LOOP.md — Claude Plan → Approve → Execute → Review

**App:** `head-office-app` (PRD `/` + Publisher `/publisher/*`)  
**Orchestrator:** Cursor  
**Primary implementer:** Claude Code (tmux pane 0.0)  
**Secondary:** Gemini CLI (audit, pane 0.2), Antigravity CLI (UI, pane 0.1 on demand)  
**Routing table + prompts:** `AGENT_TASK_ROUTING.md`, `PHASE_1_1_TASK_QUEUE.md`

---

## Full Loop (every task)

```text
┌──────────────────────────────────────────────────────────────┐
│ 1. CURSOR: Set orchestration/CURRENT_TASK.md (Phase: PLAN)    │
│    Set ## Recommended Model (default: claude-fable-5) per MODEL_ROUTING  │
│    Set ## Subagent Policy if complex (read-only, SUBAGENT_ROUTING) │
│    Update orchestration/REVIEW_STATUS.md → Loop Phase: PLAN    │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. CLAUDE: Read task → write head-office-app/_agent/TASK_PLAN.md │
│            write CURSOR_PLAN_REQUEST.md → STOP (no code)       │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. USER → CURSOR: "Review plan for [TASK_ID]"                │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. CURSOR: Review plan → write head-office-app/_agent/PLAN_APPROVAL.md │
│    APPROVED: set orchestration/CURRENT_TASK.md Phase: EXECUTE   │
│    Keep claude-fable-5 unless user approves a different model   │
│    REJECTED: set Phase: PLAN (fix instructions)                │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. USER → CLAUDE: run ./orchestration/scripts/run-claude-task.sh --execute │
│    (or background: ./orchestration/scripts/run-claude-background.sh execute) │
│    CLAUDE: Implement per approved TASK_PLAN.md only            │
│            write TASK_RESULT.md + CURSOR_REVIEW_REQUEST.md     │
│            STOP                                                │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. USER → CURSOR: "Review task [TASK_ID] — review and cleanup" │
│    CURSOR: validate, archive, set next task Phase: PLAN        │
│    CURSOR: post Linear update (orchestration/scripts/linear-task-update.mjs) │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
                         (repeat)
```

---

## Phase States (`orchestration/REVIEW_STATUS.md`)

| Loop Phase | Who acts | Output files |
|------------|----------|--------------|
| `PLAN` | Claude plans | `head-office-app/_agent/TASK_PLAN.md`, `head-office-app/_agent/CURSOR_PLAN_REQUEST.md` |
| `PLAN_REVIEW` | Cursor reviews plan | `head-office-app/_agent/PLAN_APPROVAL.md` |
| `EXECUTE` | Claude implements | `head-office-app/_agent/TASK_RESULT.md`, `head-office-app/_agent/CURSOR_REVIEW_REQUEST.md` |
| `TASK_REVIEW` | Cursor reviews work | `reports/task-reviews/{ID}_REVIEW.md` |
| `CLEANUP` | Cursor | trackers updated, next task set to `PLAN` |

---

## Hard Rules

### Claude — PLAN phase
- ❌ No code changes
- ❌ No package installs
- ❌ No migrations applied
- ✅ Read files, write plan into `head-office-app/_agent/`
- ✅ STOP after `CURSOR_PLAN_REQUEST.md`

### Claude — EXECUTE phase
- ❌ Start if `head-office-app/_agent/PLAN_APPROVAL.md` ≠ APPROVED
- ❌ Deviate from approved `TASK_PLAN.md` without new plan
- ✅ Only Allowed Files in `orchestration/CURRENT_TASK.md`
- ✅ If `Subagent Policy` enabled → research pass (read-only) before first code edit
- ❌ Sub-agents / research passes must NOT Write/Edit/Delete (see `orchestration/SUBAGENT_ROUTING.md`)
- ✅ STOP after `head-office-app/_agent/CURSOR_REVIEW_REQUEST.md`

### Cursor
- Sets `orchestration/CURRENT_TASK.md` and `orchestration/REVIEW_STATUS.md`
- Approves/rejects plans before any execution
- Reviews + cleans up after every execution
- Never lets Claude self-approve

---

## Terminal Commands

### Step 1 — Cursor sets task (already done in CURRENT_TASK.md)

### Step 2 — Claude plans

```bash
cd ~/HEAD-OFFICE
./orchestration/scripts/run-claude-task.sh --plan
```

Background (Cursor fire-and-forget):

```bash
./orchestration/scripts/run-claude-background.sh plan
./orchestration/scripts/run-claude-background.sh status
./orchestration/scripts/run-claude-background.sh follow
```

Or tmux:

```bash
./orchestration/scripts/tmux-claude.sh plan
```

### Step 3 — User to Cursor

```text
Review plan for INT-01 — approve or reject.
```

### Step 4 — Cursor approves → updates PLAN_APPROVAL.md + Phase EXECUTE

### Step 5 — Claude executes

```bash
./orchestration/scripts/run-claude-task.sh --execute
```

Background:

```bash
./orchestration/scripts/run-claude-background.sh execute
```

Or tmux:

```bash
./orchestration/scripts/tmux-claude.sh execute
```

### Step 6 — User to Cursor

```text
Review task INT-01 for head-office-app — review and cleanup.
```

---

## File Map

| File | Location | Owner | When |
|------|----------|-------|------|
| `CURRENT_TASK.md` | `orchestration/` | Cursor | Each task; `Phase` + `Recommended Model` table |
| `MODEL_ROUTING.md` | `orchestration/` | Cursor | Model tier rules + queue defaults |
| `SUBAGENT_ROUTING.md` | `orchestration/` | Cursor | Read-only sub-agent / research pass rules |
| `TASK_PLAN.md` | `head-office-app/_agent/` | Claude | PLAN phase |
| `CURSOR_PLAN_REQUEST.md` | `head-office-app/_agent/` | Claude | End of PLAN phase |
| `PLAN_APPROVAL.md` | `head-office-app/_agent/` | Cursor | After plan review |
| `TASK_RESULT.md` | `head-office-app/_agent/` | Claude | End of EXECUTE phase |
| `CURSOR_REVIEW_REQUEST.md` | `head-office-app/_agent/` | Claude | End of EXECUTE phase |
| `REVIEW_STATUS.md` | `orchestration/` | Cursor | Always |
| `TASK_CLEANUP_CHECKLIST.md` | `orchestration/` | Cursor | After task review |

---

## Related Docs

- `orchestration/CURSOR_REVIEW_GATE.md` — review + cleanup detail
- `orchestration/CLOSURE_TASK_QUEUE.md` — all tasks FIX-01 → CLOSE-01
- `orchestration/templates/TASK_PLAN_TEMPLATE.md` — plan format
- `orchestration/MODEL_ROUTING.md` — Claude Code model (default **Fable 5** / `claude-fable-5`)
- `head-office-app/AGENTS.md` — agent manual
- `head-office-app/CLAUDE.md` — app scope
