# Graphify Workflow Guide

This document defines the end-to-end stages of the Graphify Work Checker System.

## 3 Graph Levels

### LEVEL 1 — COMPANY GRAPH
**Purpose**:
- Whole HEAD-OFFICE overview.
- Company memory and long-term context.
- Maps docs, SOPs, and cross-project asset maps.
- Covers Fastwork, DataClaw, Investment, and Agent OS.
**Output**:
- `graphify-out-company/` (at organization root).

### LEVEL 2 — PROJECT GRAPH
**Purpose**:
- Specific project architecture and local dependencies.
- Identifies impacted files for a given feature area.
- Supports the creation of implementation gates.
**Output**:
- `project/graphify-out/`.

### LEVEL 3 — TASK GATE
**Purpose**:
- Fine-grained audit before Codex implementation.
- Defines allowed/forbidden files and risk nodes.
- Provides the exact handoff prompt and verification plan.
**Output**:
- `project/graphify-out/gates/TASK-XXX_IMPLEMENTATION_GATE.md`.

---

## Workflow Stages

### Stage 0: Safety Check
- Verify `git status` is clean.
- Verify latest commits.
- Verify backup patches exist if working tree was recently reset.

### Stage 1: Context Definition
- Define the system purpose and operational boundaries.
- Ensure `AGENTS.md` and `docs/AGENT_WORKFLOW_MAP.md` are accessible.

### Stage 2: System Creation
- Initialize the `_ops/graphify/` documentation and `scripts/` automation.

### Stage 3: Project Readiness & Graph Generation
- Run `scripts/graphify-check.sh` to confirm project health.
- Run `scripts/graphify-run-project.sh` to generate the dependency graph.

### Stage 4: Workflow Analysis
- Audit the mapping from UI surfaces to API routes, backend services, and storage layers.
- Identify risk nodes (monoliths, complex routing) and missing links.

### Stage 5: Implementation Gate
- Draft the `GRAPH_XXX_IMPLEMENTATION_GATE.md`.
- Declare "READY" or "NOT READY".
- Define Allowed and Forbidden files for the task.

### Stage 6: Implementation Handoff
- Generate the Codex Handoff Prompt using the template.
- Execute the task minimally and surgically.

### Stage 7: Post-Audit
- Perform the `GRAPHIFY_POST_AUDIT_TEMPLATE.md` review.
- Commit, fix, or revert.
