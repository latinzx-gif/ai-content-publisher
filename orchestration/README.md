# Agent Orchestration

This directory houses the "Control Plane" for the Head Office autonomous agent loops. It manages task definition, phase tracking, and routing between different models and subagents.

**Claude Code default model:** `claude-fable-5` (Fable 5) — see `MODEL_ROUTING.md`.

## Core Files

- [CURRENT_TASK.md](CURRENT_TASK.md): The single source of truth for the active task, phase (PLAN/EXECUTE), and file boundaries.
- [AGENT_LOOP.md](AGENT_LOOP.md): Rules and procedures for the autonomous agent workflow.
- [REVIEW_STATUS.md](REVIEW_STATUS.md): Tracking table for task approvals and review history.
- [CURSOR_DECISIONS.md](CURSOR_DECISIONS.md): Log of locked architectural decisions and infrastructure.

## Multi-agent routing

- [AGENT_TASK_ROUTING.md](AGENT_TASK_ROUTING.md) — who does what (Cursor / Claude / Gemini / Antigravity / User)
- [PHASE_1_1_TASK_QUEUE.md](PHASE_1_1_TASK_QUEUE.md) — task queue + copy-paste prompts

## Scripts

Located in [scripts/](scripts/):
- `run-claude-task.sh`: Interactive or `--print` one-shot Claude task runner.
- `run-claude-background.sh`: **Background** plan/execute (for Cursor fire-and-forget). See `head-office-app/_agent/CURSOR_CLAUDE_DISPATCH.md`.
- `run-gemini-task.sh`: Gemini **audit** (read-only by default).
- `run-antigravity-task.sh`: Antigravity **UI** tasks (requires CLI installed).
- `tmux-claude.sh` / `tmux-gemini.sh` / `tmux-antigravity.sh`: Dispatch to tmux panes.
- `tmux-head-office.sh`: Start tmux session (claude, gemini, antigravity, dev) — pane 0.1 previously Codex, now unused.
- `verify-acp-schema.sh`: Remote `acp_*` table check.
- `post-linear-task.sh`: Linear issue comment after each task.

## Workflow

1. **PLAN**: Define implementation strategy in `head-office-app/_agent/TASK_PLAN.md`.
2. **Review**: Cursor reviews the plan and updates `PLAN_APPROVAL.md`.
3. **EXECUTE**: Implementation of the approved plan.
4. **Finalize**: Verification and review before moving to the next task.

---
*Task artifacts for the main app are stored in [head-office-app/_agent/](../head-office-app/_agent/).*
