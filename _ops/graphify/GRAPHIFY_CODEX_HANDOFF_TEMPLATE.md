# Codex Handoff Prompt Template

Use this template to generate the final prompt for the implementation phase.

---

> **IMPLEMENTATION HANDOFF: [TASK NAME]**
>
> **Objective**: [Clear 1-sentence goal]
>
> **Context**:
> Read `AGENTS.md` and `.codex/skills/README.md`.
> Use the `[REQUIRED_SKILL]` skill.
>
> **Strict Boundaries**:
> - **Allowed Files**: [File 1], [File 2]
> - **Forbidden Files**: `src/app/prd/page.tsx`, `supabase/migrations/*`
> - **Rules**: Do not redesign UI. Do not install packages. Keep changes minimal.
>
> **Task List**:
> 1. [Step 1]
> 2. [Step 2]
> 3. [Step 3]
>
> **Verification**:
> - Run `npm run lint`.
> - Provide `git diff --stat` in the final summary.
