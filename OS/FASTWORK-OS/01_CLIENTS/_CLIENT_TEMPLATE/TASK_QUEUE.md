# Task Queue

## Purpose
Turn a new Fastwork client brief into clear executable tasks with priority, owner, delivery status, approval zone, and risk notes.

## Required Fields
- Task
- Client objective
- Scope
- Deliverable
- Task priority
- Assigned agent
- Delivery status
- Approval zone
- Risk notes
- Due date
- Output location

## AI Agent Usage Rules
- PM Agent routes tasks.
- Dev Agent executes implementation tasks.
- Research Agent handles discovery and references.
- QA Agent audits completed work.
- Document Agent captures reusable outputs.
- Low-risk tasks move through execution first and audit second.
- Green Zone = auto execute + audit later.
- Yellow Zone = notify owner + continue if low risk and reversible.
- Red Zone = manual approval required.
- Manual approval is required only for pricing, contract, payment, production database, deleting data, security credentials, and final client delivery.
- Keep tasks small enough that one agent can execute the next action.

## Template
| Task | Client Objective | Scope | Deliverable | Priority | Agent | Delivery Status | Approval Zone | Risk Notes | Due Date | Output |
|---|---|---|---|---|---|---|---|---|---|---|
|  |  | In Scope / Out of Scope |  | High / Medium / Low | PM / Dev / QA / Research / Document / Hermes | New / Doing / QA / Waiting Approval / Delivered / Audited | Green / Yellow / Red |  |  |  |
