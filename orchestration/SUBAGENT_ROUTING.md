# SUBAGENT_ROUTING.md — Read-Only Research Delegation

**Owner:** Cursor sets per task in `CURRENT_TASK.md`  
**Consumer:** Claude Code lead agent + `safe-research-delegator` skill

---

## Problem

งานซับซ้อน (opus) มักต้องสำรวจหลายไฟล์ / layer ก่อนแก้ code ถ้าให้หลาย agent เขียนพร้อมกัน → **ไฟล์ชนกัน เสียหาย**

## Solution

| Role | เขียน code? | เมื่อไหร่ |
|------|-------------|----------|
| **Lead agent** (Claude EXECUTE) | ✅ Allowed Files เท่านั้น | หลัง research pass เสร็จ |
| **Research pass / sub-agent** | ❌ ห้ามเด็ดขาด | ก่อนแก้ไฟล์แรก |
| **Cursor** | ❌ (review only) | หลัง STOP |
| **Codex / Gemini** | ⏸ หยุดระหว่าง Claude EXECUTE | ป้องกัน conflict |

---

## Cursor: set in `CURRENT_TASK.md`

```markdown
## Subagent Policy

| Field | Value |
|-------|-------|
| Enabled | yes / optional / no |
| Mode | read-only |
| Skills | safe-research-delegator, supabase-rls-security-auditor |
| Max passes | 2 |
```

### Defaults by complexity

| Task type | Enabled | Skills |
|-----------|---------|--------|
| FIX / single-file | `no` | — |
| INT-05 style (bounded) | `optional` | `project-context-reviewer` |
| INT-06 auth + RLS | `yes` | `safe-research-delegator`, `supabase-rls-security-auditor`, `nextjs-app-router-auditor` |
| QA-01 blocked | `optional` | `ai-content-workflow-reviewer`, `build-debugger` (diagnose only) |

When `Enabled: yes` → keep EXECUTE model `claude-fable-5` in `## Recommended Model` (Fable 5 policy).

---

## Lead agent workflow

```text
1. Read CURRENT_TASK → Subagent Policy + Allowed Files
2. If Enabled yes/optional and not yet researched:
     → Load safe-research-delegator skill
     → Run research pass (read-only)
     → Output Research Report in chat ONLY
3. Implement per TASK_PLAN — one allowed file at a time
4. TASK_RESULT + CURSOR_REVIEW_REQUEST → STOP
```

---

## Research pass output

- **In chat only** — no `SUBAGENT_*.md` in repo (avoids git noise + conflicts)
- Exception: **PLAN phase** may cite findings in `TASK_PLAN.md` (lead writes plan files only)

---

## Scripts

`run-claude-task.sh` and `tmux-claude.sh` remind lead agent to check Subagent Policy when Enabled ≠ no.

---

## Skill location

`head-office-app/.claude/skills/safe-research-delegator/SKILL.md`

Auditor skills (read-only when used via delegator):

- `project-context-reviewer`
- `nextjs-app-router-auditor`
- `supabase-rls-security-auditor`
- `ai-content-workflow-reviewer`
- `build-debugger` (diagnose only — lead applies fixes)

---

## Related

- `MODEL_ROUTING.md`
- `AGENT_LOOP.md`
- `CURSOR_REVIEW_GATE.md`
