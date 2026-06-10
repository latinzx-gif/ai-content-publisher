# MODEL_ROUTING.md — Claude Code Model Selection

**Owner:** Cursor sets per task in `CURRENT_TASK.md`  
**Consumer:** Claude Code + `scripts/run-claude-task.sh`

**User policy (locked):** Claude Code uses **Fable 5** (`claude-fable-5`) for PLAN and EXECUTE unless a task explicitly overrides.

---

## Default

| Setting | Value |
|---------|--------|
| **CLI `--model`** | `claude-fable-5` |
| **Script fallback** | `CLAUDE_DEFAULT_MODEL=claude-fable-5` |
| **Override** | `CLAUDE_MODEL=...` env or `## Recommended Model` in `CURRENT_TASK.md` |

Fable 5 fits this monorepo: large `page.tsx`, multi-file publisher work, long context for research passes.

---

## Tiers (when Cursor overrides)

| Tier | Model | Use when |
|------|-------|----------|
| **default** | `claude-fable-5` | All standard PLAN/EXECUTE (policy) |
| **fast** | `claude-sonnet-4-6` | Tiny bounded fix only if user asks for speed/cost |
| **deep** | `claude-opus-4-8` | Rare: user explicitly requests Opus |

Do **not** downgrade from Fable 5 without user approval.

---

## How Cursor assigns (`CURRENT_TASK.md`)

```markdown
## Recommended Model

| Phase | Model | Rationale |
|-------|-------|-----------|
| PLAN | claude-fable-5 | … |
| EXECUTE | claude-fable-5 | … |
```

Omit the table → scripts use `claude-fable-5` automatically.

---

## How Claude Code should behave

1. Read `## Recommended Model` in `CURRENT_TASK.md` (expect `claude-fable-5`).
2. If session model differs: tell user `/model claude-fable-5` or re-run `./orchestration/scripts/run-claude-background.sh plan|execute`.
3. Do not switch models mid-EXECUTE without user approval.

---

## Commands

```bash
# Auto-picks model from CURRENT_TASK.md (default claude-fable-5)
./orchestration/scripts/run-claude-task.sh --plan
./orchestration/scripts/run-claude-background.sh execute

# Interactive
/model claude-fable-5

# Force override
CLAUDE_MODEL=claude-sonnet-4-6 ./orchestration/scripts/run-claude-task.sh --execute
```

---

## Subagents

When `## Subagent Policy` → `Enabled: yes` on a Fable 5 task:

1. Load `safe-research-delegator` skill
2. Research pass = read-only
3. Lead agent (Fable 5) writes allowed files only

See `SUBAGENT_ROUTING.md`.

---

## Related

- `AGENT_LOOP.md`
- `CURRENT_TASK.md`
- `TASK_PLAN_TEMPLATE.md`
