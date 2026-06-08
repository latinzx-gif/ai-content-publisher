# Graphify Work Checker System

The **Graphify Work Checker System** is a standardized operational layer for the Head Office App project. It separates architectural analysis from code implementation to ensure high-quality, safe, and verifiable changes.

## System Purpose
To provide a repeatable "Implementation Gate" that validates proposed changes against the project's dependency graph, core rules (`AGENTS.md`), and safety boundaries.

## When to Use It
- Before starting any new implementation task.
- Before applying a draft or backup patch.
- When the codebase architecture has changed significantly.
- Before client handoffs.

## When NOT to Use It
- For trivial documentation edits.
- For isolated research inquiries that don't involve code changes.

## Roles
- **Gemini (Orchestrator/Analyst)**: Performs Stages 0-4 (Safety, Context, Availability, Analysis). Generates the Implementation Gate decision and the Codex Handoff Prompt.
- **Codex (Implementation Agent)**: Performs Stage 6 (Implementation) using the provided prompt and skills.
- **Hermes (Auditor)**: Performs Stage 7 (Post-Audit) to verify the implementation.

## System Index
- [Workflow Guide](./GRAPHIFY_WORKFLOW.md)
- [Project Checklist](./GRAPHIFY_PROJECT_CHECKLIST.md)
- [Implementation Gate](./GRAPHIFY_IMPLEMENTATION_GATE.md)
- [Codex Handoff Template](./GRAPHIFY_CODEX_HANDOFF_TEMPLATE.md)
- [Post-Audit Protocol](./GRAPHIFY_POST_AUDIT.md)
