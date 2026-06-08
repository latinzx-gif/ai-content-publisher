# Codex Skills for Head Office App

This directory contains a focused Codex Skills pack for the Head Office App. These skills are designed to help Codex work efficiently on the `/prd` surface, ensuring high-quality, human-readable output and reliable agent-driven workflows.

## Skill Index

1. **[backend-contract-auditor](./backend-contract-auditor/SKILL.md)**: Use when auditing or fixing backend API contracts, persistence layers (Supabase), and data shapes between agents and the UI.
2. **[agent-workflow-auditor](./agent-workflow-auditor/SKILL.md)**: Use to trace the end-to-end content creation workflow, from "Create Post" to "Publishing".
3. **[content-pipeline-ui-mapper](./content-pipeline-ui-mapper/SKILL.md)**: Use to map backend task traces and agent statuses to readable UI states in the Content Pipeline.
4. **[review-queue-renderer-auditor](./review-queue-renderer-auditor/SKILL.md)**: Use to ensure the Review Queue renders content (text, images, layout) in a human-readable format, avoiding raw JSON leaks.
5. **[release-quality-auditor](./release-quality-auditor/SKILL.md)**: Use before finishing a task or preparing for client handoff to ensure stability, quality, and clean state.

## Recommended Usage Order (After Codex Reset)

When resuming work after a weekly limit reset, follow this order to ensure a stable foundation:

1.  **backend-contract-auditor**: Verify that the data layer and API contracts are stable and correctly separating `user_facing_output` from `internal_payload`.
2.  **agent-workflow-auditor**: Confirm the workflow trace is intact and agents are correctly handoff-ing tasks.
3.  **content-pipeline-ui-mapper**: Ensure the Content Pipeline UI accurately reflects the backend state using the `taskTrace` model.
4.  **review-queue-renderer-auditor**: Verify the Review Queue is readable and provides a high-quality human approval experience.
5.  **release-quality-auditor**: Perform a final quality check before concluding the session.

## Core Rules

-   **Read AGENTS.md First**: Always refer to the root `AGENTS.md` for the latest project identity, rules, and priorities.
-   **Use RTK**: When searching or reading, prefer the `rtk` (or equivalent optimized) tools to minimize token usage.
-   **No Raw JSON**: Never allow raw JSON or technical provider payloads to be the primary output on user-facing `/prd` surfaces.
-   **No Source Drift**: Stay focused on the `/prd` surface. Do not refactor unrelated code or restore removed features (like `editor-canvas2`).
-   **Test-Driven Execution**: Only write tests after the target behavior is stable and confirmed.
-   **Commit Quality**: Ensure `npm run build` passes before considering a task complete.
