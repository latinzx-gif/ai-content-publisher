# Priority Queue

## Purpose
Rank the next actions across all clients so agents execute the highest-value work first.

## Required Fields
- Rank
- Task
- Client
- Impact
- Operating zone
- Assigned agent
- Deadline
- Blocker
- Approval required

## AI Agent Usage Rules
- PM Agent owns ordering and routing.
- Dev, Research, QA, and Document Agents pull work from the top unless Hermes overrides.
- Sort first by cashflow impact, then deadline, then delivery unblock value.
- Green Zone tasks move directly to execution and audit-after-delivery.
- Yellow Zone tasks require owner notification, but execution continues if reversible and low risk.
- Red Zone tasks cannot start until manual approval is recorded.
- Escalate only pricing, contract, payment, production database, deleting data, security credentials, and final client delivery.

## Operating Zones
| Zone | Queue Behavior | Approval |
|---|---|---|
| Green | Pull immediately; do not wait | No |
| Yellow | Notify owner; continue if low risk | Usually no |
| Red | Park task until approved | Yes |

## Template
| Rank | Task | Client | Impact | Zone | Agent | Deadline | Blocker | Approval |
|---:|---|---|---|---|---|---|---|---|
| 1 |  |  | Cash / Delivery / Retention | Green / Yellow / Red |  |  | None | No |

## Daily Rule
Start each day by choosing the top 3 cashflow-positive tasks.
- Red Zone work does not block unrelated Green or Yellow work.
