# Graphify Workflow Guide

This document defines the end-to-end stages of the Graphify Work Checker System.

## Stage 0: Safety Check
- Verify `git status` is clean.
- Verify latest commits.
- Verify backup patches exist if working tree was recently reset.

## Stage 1: Context Definition
- Define the system purpose and operational boundaries.
- Ensure `AGENTS.md` and `docs/AGENT_WORKFLOW_MAP.md` are accessible.

## Stage 2: System Creation
- Initialize the `_ops/graphify/` documentation and `scripts/` automation.

## Stage 3: Project Readiness & Graph Generation
- Run `scripts/graphify-check.sh` to confirm project health.
- Run `scripts/graphify-run-project.sh` to generate the dependency graph (if available) or simulate it via manual analysis.

## Stage 4: Workflow Analysis
- Audit the mapping from UI surfaces to API routes, backend services, and storage layers.
- Identify risk nodes (monoliths, complex routing) and missing links.

## Stage 5: Implementation Gate
- Draft the `GRAPHIFY_IMPLEMENTATION_GATE.md`.
- Declare "READY" or "NOT READY".
- Define Allowed and Forbidden files for the task.

## Stage 6: Implementation Handoff
- Generate the Codex Handoff Prompt using the `GRAPHIFY_CODEX_HANDOFF_TEMPLATE.md`.
- Execute the task minimally and surgically.

## Stage 7: Post-Audit
- Perform the `GRAPHIFY_POST_AUDIT.md` review.
- Commit, fix, or revert.
