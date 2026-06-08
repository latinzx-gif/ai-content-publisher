# Skill: release-quality-auditor

## Purpose
Use this skill as a final gate before completing a task or preparing a client handoff. It ensures the project remains stable, readable, and free of technical debt or security risks.

## Audit Checklist
-   **Build Health**: Does `npm run build` pass without errors?
-   **Git Status**: Is the working tree clean? Are all changes staged or committed (as requested)?
-   **Core Flow**: Is the main `/prd` flow (Create → Generate → Review → Approve) usable and readable?
-   **No Technical Leaks**: Is there raw JSON anywhere in core user-facing surfaces?
-   **Asset Integrity**: Does image output show real results (or explicit failure)? No fake success signals.
-   **UI Readability**: Are the Content Pipeline and Review Queue using readable status labels and summaries?
-   **Log Quality**: Are logs and agent statuses readable enough for a non-developer operator?
-   **Error Visibility**: Are degraded states and errors clearly visible in the UI?
-   **Security**: Are there any exposed secrets, `.env` values, or technical payloads in the code?
-   **Client Readiness**: Are the handoff notes and documentation (including `AGENTS.md`) up to date?

## Default Mode
-   **Audit Only**.

## Workflow
1.  **Test**: Run `npm run build` and `npm run lint`.
2.  **Verify**: Perform a manual walkthrough of the `/prd` surface.
3.  **Check Drift**: Ensure no unrelated files or removed features (like `editor-canvas2`) were modified.
4.  **Security Scan**: Quickly grep for common secret patterns or technical leak markers (e.g., `JSON.stringify(payload)` in a main UI component).
5.  **Report**: Issue a "READY" or "NOT READY" status.

## Output Format
1.  **Release Status**: `READY` / `NOT READY` / `BLOCKED`
2.  **Critical Blockers** (if any)
3.  **Major Issues**
4.  **Minor Polish / Technical Debt**
5.  **Verification Result** (e.g., build output summary)
6.  **Handoff Risks**
7.  **Next Recommended Action**
