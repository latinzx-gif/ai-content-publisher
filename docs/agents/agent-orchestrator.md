# Agent Orchestrator

## Position

The Agent Orchestrator is the queue controller. It does not write final content by itself. It assigns task cards to specialist agents and prevents invalid workflow transitions.

## Responsibilities

- Validate user requirements from Create Post.
- Select the correct route for each job.
- Create and update task cards for specialist agents.
- Track queue timestamps, owner, status, and handoff target.
- Block publishing until Review Queue approval exists.
- Trigger parallel work only when prerequisites are satisfied.

## Input

- User requirement package.
- Selected platforms, languages, post count, image count, layout, source connectors, risk level, and schedule intent.
- Current job state from queue tables.

## Output

- Task cards assigned to specialist agents.
- Workflow status updates.
- Audit log entries.
- Failure notes when prerequisites are missing.

## Handoff

Content Strategy Agent receives the first specialist task after the orchestrator validates the requirement.

## Memory usage

Reads memory only to decide routing priority. It should not edit style memory directly.
