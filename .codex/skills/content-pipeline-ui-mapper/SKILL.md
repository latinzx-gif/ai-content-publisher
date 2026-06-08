# Skill: content-pipeline-ui-mapper

## Purpose
Use this skill after backend contracts are stable to map the Content Pipeline UI to the underlying content workflow state. This ensures that the technical task traces from the agents are rendered as readable, actionable cards for the user.

## Workflow Mapping (Logical -> Visual)
Transform generic task board columns into content-specific workflow stages:
-   **Backlog / Draft** → **Brief / Draft**
-   **Todo** → **Text Ready** (Content text generated)
-   **In Progress** → **Image Pending** (Awaiting real image generation)
-   **In Review** → **Creative Ready / In Review** (Assets + Compliance complete)
-   **Done** → **Approved / Scheduled / Published**
-   **Blocked** → **Needs Fix** (Compliance failure or generation error)

## Required Mapping Fields
Ensure every card in the Content Pipeline uses these backend signals:
-   `taskTrace`: The current `agent_runs` chain.
-   `owner_agent`: Which agent is currently working on the item.
-   `step_label`: Human-readable name of the current step (e.g., "Drafting Post").
-   `status_label`: Clear status (e.g., "Image Gen Failed").
-   `user_facing_summary`: A readable 1-line summary of progress.
-   `image_status_label`: Explicitly state if images are "Generated", "Pending", or "Failed".
-   `hasRealImageOutput`: Boolean flag to prevent showing placeholder-only cards as "Ready".
-   `degraded_message`: Show why an asset is missing or low-quality.
-   `next_action_label`: Guide the user (e.g., "Wait for Agent", "Review Now").

## Rules
-   **No Redesign**: Do not rewrite the whole `/prd` dashboard; fix the data mapping in the existing components.
-   **No UUIDs**: Never show raw UUIDs, smoke test IDs, or raw JSON payloads as primary text.
-   **Readable Fallbacks**: If a title or caption is missing, provide a "Generating..." or "Untitled" fallback instead of an empty space or technical error.
-   **No Fake Success**: Do not move cards to "Done" or "Review" based on placeholder metadata alone.

## Workflow
1.  **Analyze**: Inspect the data source for the Content Pipeline (e.g., `src/app/api/dashboard/overview/route.ts`).
2.  **Map**: Define the transformation between the database row and the UI card model.
3.  **Implement**: Update the mapper logic in the API or the RTK slice.
4.  **Verify**: Check the `/prd` dashboard to ensure cards reflect real progress accurately.

## Output Format
1.  **Existing Content Pipeline data source**
2.  **Status mapping definition**
3.  **Card field mapping (Source → Target)**
4.  **Files to edit**
5.  **Minimal fix plan**
6.  **Remaining risks**
