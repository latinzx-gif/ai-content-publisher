# Skill: backend-contract-auditor

## Purpose
Use this skill when Codex needs to audit or fix backend contracts for `/prd`. It ensures that the data layer (Supabase), API routes, and agent outputs are correctly structured to support a high-quality user experience without technical leaks.

## Areas of Responsibility
-   **Task Trace Layer**: Ensure `agent_runs` is used as the primary task trace and workflow state tracker.
-   **Content Assets**: Audit `content_assets` for durable/transient/placeholder/failed states. Ensure real image output is prioritized over placeholders.
-   **API Payloads**: Standardize payloads for:
    -   `reviews` API
    -   `dashboard/overview` API
    -   `logs` API
-   **Output Separation**: Enforce strict separation between `user_facing_output` (readable) and `internal_payload` (debug/technical).
-   **Signal Normalization**: Ensure fields like `hasRealImageOutput` and `taskTrace` are accurately populated and used by the UI.
-   **Status Language**: Transition from technical codes to readable backend status and explicit degraded/error messages.

## Default Mode
-   **Audit Only** first.
-   **Audit + Fix** only when explicitly requested or a critical V1 blocker is found.

## Forbidden Actions
-   **No Schema Changes**: Do not modify Supabase migrations or tables unless explicitly approved.
-   **No New Tables**: Do not create a new `content_tasks` table; use the existing `agent_runs` structure.
-   **No UI Redesign**: Focus on the data contract, not the visual layout.
-   **No Tests**: Do not write tests unless requested or behavior is stable.

## Workflow
1.  **Inspect**: Check relevant files in `src/app/api/` and `src/lib/agents/`.
2.  **Identify Gaps**: Look for raw JSON leaks, missing task traces, or fake success signals.
3.  **Plan**: Draft a minimal fix that preserves backward compatibility with the existing schema.
4.  **Execute**: Apply targeted fixes to API routes or normalization logic.
5.  **Verify**: Ensure the API returns the correct shape and `npm run build` passes.

## Output Format
1.  **Backend files inspected**
2.  **Contract gaps identified**
3.  **Risk level (Critical/Major/Minor)**
4.  **Minimal fix plan**
5.  **Verification commands**
6.  **Next prompt for the user**
