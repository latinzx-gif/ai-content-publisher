# TASK PLAN: [TASK_ID] — [Task Name]

**Phase:** PLAN (no code changes in this phase)  
**Date:** [YYYY-MM-DD]

---

## Complexity & Model

| Field | Value |
|-------|-------|
| Complexity | low / medium / high |
| Recommended EXECUTE model | claude-fable-5 (default) |
| Rationale | [why — file count, migrations, auth, cross-layer] |

If **high** → ask Cursor to set in `CURRENT_TASK.md` before approval:

- `## Recommended Model` EXECUTE → `claude-fable-5` (default policy)
- `## Subagent Policy` Enabled → `yes`, Mode → `read-only`, Skills → list auditor skills

---

## Goal

[One paragraph — what this task achieves]

## Scope

### Will do
- [ ] ...
- [ ] ...

### Will NOT do
- [ ] ...

## Allowed Files (from CURRENT_TASK.md)

```
[list]
```

## Implementation Steps

1. ...
2. ...
3. ...

## Packages (if any)

| Package | Reason |
|---------|--------|
| ... | ... |

## Schema / API changes (if any)

[Tables, columns, client helpers]

## Validation plan

```bash
cd head-office-app
npm run build && npm run typecheck && npm run lint
```

## Risks

| Risk | Mitigation |
|------|------------|
| ... | ... |

## Estimated touch count

~[N] files

## Stop confirmation

I will STOP after writing `CURSOR_PLAN_REQUEST.md` and will NOT write code until Cursor approves this plan.
