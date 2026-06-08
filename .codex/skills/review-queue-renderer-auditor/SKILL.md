# Skill: review-queue-renderer-auditor

## Purpose
Use this skill to audit and fix the Review Queue rendering. The goal is to ensure that human reviewers see readable content (text, images, layout briefs) and can make approval decisions without being exposed to raw JSON or technical provider payloads.

## Audit Checklist
-   **Visual Brief**: Is the creative direction summarized as a readable text card?
-   **Content Text**: Does the post caption/body render as a preview? Are Thai/English tabs working correctly?
-   **Image/Assets**: Is there a real image preview? If not, is the degraded state (e.g., "Generation Failed") clearly explained?
-   **Compliance Checker**: Are findings presented as readable recommendations?
-   **Approval Decision**: Is the UI for approving/rejecting clean and actionable?
-   **Package Handoff**: Does the final "Approved" package contain all necessary assets and text?
-   **Logs/Activity**: Is agent activity shown as a readable timeline?

## Rules
-   **No Raw JSON**: Raw JSON must never be the primary output in the review flow.
-   **Provider Payloads**: Hide OpenAI/provider-specific payloads in a "Debug" or "Internal" tab, or exclude them entirely from user-facing views.
-   **Real Assets Only**: Do not show placeholder slots as "Completed" images.
-   **Content-First**: Prioritize the actual post content (caption, body) over agent metadata.
-   **Explicit Failure**: If image generation fails, show a "Missing Asset" warning with the reason, not a broken image or a technical error code.

## Workflow
1.  **Surfaces**: Inspect `src/app/prd/page.tsx` (Review Queue section) and `src/app/api/reviews/route.ts`.
2.  **Root Cause**: Identify if the leak is in the API payload or the UI renderer component.
3.  **Mapper Plan**: Create a mapping function to convert the backend `internal_payload` into a `user_facing_output` object if the API hasn't already done so.
4.  **Fix**: Apply minimal surgical edits to the renderer components.
5.  **Verify**: Open a review item in `/prd` and confirm it looks like a final product, not a developer log.

## Output Format
1.  **Surfaces inspected**
2.  **Raw JSON root cause**
3.  **Renderer mapping plan**
4.  **Backend dependencies found**
5.  **Minimal fix plan**
6.  **Verification steps**
