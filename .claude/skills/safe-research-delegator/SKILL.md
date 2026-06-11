---
name: safe-research-delegator
description: >-
  Delegates read-only research sub-passes for complex ai-content-publisher tasks
  without writing code or touching src. Use when CURRENT_TASK.md Subagent Policy
  is enabled, Recommended Model is opus, or PLAN/EXECUTE complexity is high and
  you need parallel investigation before the lead agent edits files.
---

# Safe Research Delegator — ai-content-publisher

## Purpose

When Cursor marks a task **complex**, the **lead agent** implements code. **Research passes** (sub-agents / skill audits) investigate first — **read-only** — so files are not corrupted by overlapping writes.

**Golden rule:** หนึ่ง session เขียน code ได้คนเดียว (lead). Sub-agent / research pass **ห้าม** Write, Edit, Delete ใดๆ ใน repo.

---

## When to Use

Read `../orchestration/CURRENT_TASK.md` → `## Subagent Policy`.

| `Enabled` | Action |
|-----------|--------|
| `yes` | Run research pass **before** first code edit (PLAN or EXECUTE) |
| `optional` | Run if stuck after 1 failed attempt or scope unclear |
| `no` | Do not delegate; lead agent only |

Also auto-trigger when:

- `Recommended Model` EXECUTE = `opus`
- `TASK_PLAN.md` complexity = **high**

---

## Research Pass Protocol (mandatory for sub-agents)

### 1. Announce

Tell user:

```text
Research pass (read-only) — skill: [name]. No file writes.
```

### 2. Allowed tools / commands

| Allowed | Examples |
|---------|----------|
| Read files | `Read`, `Grep`, `Glob` |
| Read-only bash | `git diff`, `git status`, `npm run build`, `npm run typecheck`, `npm run lint`, `curl` API probes |
| Load auditor skills | Read-only sections of skills listed in Subagent Policy |

### 3. Forbidden (sub-agent / research pass)

| Forbidden | Why |
|-----------|-----|
| `Write`, `Edit`, `Delete` on any path | Prevents file corruption |
| `src/**`, `supabase/migrations/**` | Lead agent only |
| `package.json`, lockfile | No installs during research |
| `../orchestration/CURRENT_TASK.md`, orchestration docs | Cursor-owned |
| `TASK_RESULT.md`, `CURSOR_*` during research | Lead agent writes at end |
| `npm install`, migrations apply | Side effects |

### 4. Output — conversation only

Deliver a **Research Report** in chat (not a new repo file):

```markdown
## Research Report — [TASK_ID] — [skill]

### Question
…

### Files inspected
- path:line — finding

### Risks for lead agent
1. …

### Recommended edit order (lead only)
1. file A — reason
2. file B — reason

### Open questions
- …
```

### 5. Hand back to lead agent

After report: **STOP**. Lead agent (same or resumed session) implements using **Allowed Files** only, one file at a time, following edit order.

---

## Skill routing (which sub-pass to run)

| Problem domain | Skill to load (read-only) |
|----------------|---------------------------|
| Scope / task gate | `project-context-reviewer` |
| App Router / RSC | `nextjs-app-router-auditor` |
| Supabase / RLS / auth | `supabase-rls-security-auditor` |
| Workflow / publish flow | `ai-content-workflow-reviewer` |
| Build / tsc / lint errors | `build-debugger` — **diagnose only**; lead applies fix |

Run **at most 2** research passes per task unless user approves more.

---

## Claude Code: invoking a sub-agent safely

If Claude Code supports spawning a sub-agent / child session:

```text
Read-only research sub-agent.

Task: [one specific question]
Skills: [skill name]
Rules:
- DO NOT write, edit, or delete any file
- DO NOT run npm install
- Return Research Report in chat only
- Inspect: [paths]

Question: …
```

If sub-agent spawn is **not** available: run this protocol **yourself** in a dedicated turn — complete research, output report, **then** start a **new** turn for implementation.

**Never** run research and implementation in the same turn while parallel editors (Codex, Gemini, Cursor) may touch the same files.

---

## Coordination with other panes (tmux)

| Pane | Role |
|------|------|
| Claude (lead) | Only pane that writes `src/**` for current task |
| Codex / Gemini | **Pause** or read-only while Claude EXECUTE is active |
| Cursor | Reviews; does not implement INT tasks |

If another agent may be editing: run `git status --short head-office-app` first. If dirty outside Allowed Files → **STOP** and ask user.

---

## Failure modes

| Symptom | Action |
|---------|--------|
| Sub-agent wrote files | `git checkout -- <files>` or ask user; do not continue blind |
| Research vs plan conflict | Update plan request; do not code until Cursor approves |
| Two skills disagree | Escalate in Research Report; user or Cursor decides |

---

## Related

- `../../SUBAGENT_ROUTING.md` — Cursor policy + CURRENT_TASK template
- `../../MODEL_ROUTING.md` — opus vs sonnet
- `../orchestration/AGENT_LOOP.md` — lead agent STOP rules
