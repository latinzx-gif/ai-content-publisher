# Skill: agent-workflow-auditor

## Purpose
Use this skill to trace and audit the end-to-end agent workflow: **Create Post → Agents → Outputs → Logs**. This skill ensures that the handoff between agents is reliable and that every step persists the necessary state for auditing and UI rendering.

## Core Workflow Map
1.  **Create Post**: Triggered via `/api/content/jobs`. Creates `content_items` and first `agent_runs` (`source_search`).
2.  **Source Search**: Orchestrator handoff to `draft_generation`.
3.  **Draft Generation**: **Content Strategy Agent** produces `content_translations` and text metadata.
4.  **Layout Planning**: **Image & Layout Agent** creates visual brief and placeholder slots.
5.  **Image Generation**: **Image & Layout Agent** produces real assets in `content_assets` or explicit degraded state.
6.  **Compliance QC**: **Legal Compliance Agent** writes findings and readiness recommendation.
7.  **Review Queue**: **Agent Orchestrator** creates `review_items` when image + compliance are ready.
8.  **Human Review**: Reviewer interacts via `/api/reviews/action`.
9.  **Publishing**: **Publishing Agent** manages the `publishing_queue` and sync logs.

## Areas of Responsibility
-   **Owner Identification**: Confirm which agent owns each step.
-   **Input/Output Validation**: Ensure the output of one agent is the correct input for the next.
-   **Persistence Check**: Verify data is written to the correct tables (`content_items`, `agent_runs`, `content_assets`, etc.).
-   **Status Monitoring**: Track status transitions (e.g., `generating` → `text_ready` → `assets_ready`).
-   **Log Audit**: Verify that `system_logs` and `agent_logs` contain enough evidence for auditing.

## Agent Roles
-   **Agent Orchestrator**: Routing, handoffs, and review gatekeeper.
-   **Content Strategy Agent**: Text drafting and localization.
-   **Image & Layout Agent**: Creative brief, layout planning, and image generation.
-   **Legal Compliance Agent**: QC, readiness, and compliance findings.
-   **Publishing Agent**: Queue management and platform sync.

## Default Mode
-   **Audit Only / Documentation Only**.

## Workflow
1.  **Trace**: Follow a specific workflow ID through the database and logs.
2.  **Map**: Identify where the chain breaks or where metadata is being overloaded.
3.  **Analyze**: Use the **Task Ownership Matrix** in `docs/AGENT_WORKFLOW_MAP.md` as a reference.
4.  **Report**: Highlight gaps in handoffs or missing persistence.

## Output Format
1.  **Workflow summary**
2.  **Task ownership matrix (updates if needed)**
3.  **Output handoff map**
4.  **Log/status map**
5.  **Critical gaps identified**
6.  **Next fix prompt**
