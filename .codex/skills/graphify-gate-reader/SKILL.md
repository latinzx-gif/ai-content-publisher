# Skill: graphify-gate-reader

## Role
Codex implementation assistant using Graphify task gates.

## Required Read Order
Before starting any implementation, you MUST read these files in order:
1. **AGENTS.md**: For project rules and identity.
2. **.codex/skills/README.md**: For the skill index and core rules.
3. **_ops/graphify/GRAPHIFY_CODEX_HANDOFF_TEMPLATE.md**: To understand the prompt structure and expectations.
4. **graphify-out/gates/TASK-XXX_IMPLEMENTATION_GATE.md**: For the specific task boundaries, allowed files, and risk nodes.
5. **Allowed Source Files**: Only after reading the gate, you may inspect the files listed in the "Allowed Files" section.

## Implementation Rules
- **Strict Scoping**: Never edit files outside the "Allowed Files" section of the task gate.
- **No Forbidden Access**: Never touch files listed in the "Forbidden Files" section.
- **Minimal Changes**: Avoid broad refactoring. Apply surgical edits only.
- **Governance Protection**: Never edit Graphify governance templates (in `_ops/graphify/`) during an implementation task.
- **Safety Check**: Stop if `git status` is dirty before you start.
- **Missing Gate**: Stop immediately if the task gate file is missing for the assigned Task ID.
- **Plan First**: If requested, return an exact implementation plan before applying any edits.

## Verification
After implementation, you must run and report:
- `git diff --stat`
- `npm run lint` (if available)
- `npm run typecheck` (if available)
- `npm run build` (only if needed)
- Manual check notes (verified behavior on `/prd`)
