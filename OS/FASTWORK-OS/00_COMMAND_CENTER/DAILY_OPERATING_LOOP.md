# Daily Operating Loop

## Purpose
Run multiple Fastwork client projects with cashflow-first prioritization, reduced approval gates, and audit-after-delivery for low-risk work.

## Required Fields
- Date
- Top cashflow tasks
- Routed tasks
- Green / Yellow / Red decisions
- Deliveries logged
- Audit findings
- SOP assets extracted
- Owner review items

## AI Agent Usage Rules
- Hermes directs priorities and keeps memory.
- PM Agent selects and routes tasks.
- Dev, Research, QA, and Document Agents execute their assigned work.
- Green Zone = auto execute + audit later.
- Yellow Zone = notify owner + continue if low risk and reversible.
- Red Zone = manual approval required.
- Manual approval is required only for pricing, contract, payment, production database, deleting data, security credentials, and final client delivery.
- Red Zone work must not block unrelated Green or Yellow work.

## 1. Morning Task Selection
- Review ACTIVE_PROJECTS.md and PRIORITY_QUEUE.md.
- Pick the top 3 tasks by cashflow, deadline, and delivery unblock value.
- Separate Red Zone items so they can be approved without slowing other work.

## 2. Task Routing
- PM Agent assigns each task to the right agent.
- Each task must have owner, due date, zone, and next action.
- Agents start Green tasks immediately.

## 3. Green / Yellow / Red Handling
| Zone | Rule | Action |
|---|---|---|
| Green | Auto execute + audit later | Proceed, log output, send to QA when done |
| Yellow | Notify owner + continue if low risk | Notify, proceed only if reversible, log reason |
| Red | Manual approval required | Stop, request approval, record approver and scope |

## 4. Delivery Logging
- Record completed work in the client DELIVERY_LOG.md.
- Note version, owner, QA status, and follow-up.
- Final client delivery requires manual approval before sending.

## 5. End-of-Day Audit
- QA Agent checks completed Green and Yellow work.
- Verify Red Zone items had approval before action.
- Record bugs, risks, fixes, and tomorrow priorities in DAILY_AUDIT.md or DAILY_AUDIT_TEMPLATE.md.

## 6. SOP Extraction
- Document Agent identifies repeated tasks, fixes, prompts, setup steps, and client-ready language.
- Add reusable material to 03_SOP, 04_DELIVERY, or 06_KNOWLEDGE.
- Remove client-sensitive details before reuse.

## 7. Owner Review Checklist
- Were the top 3 cashflow tasks moved forward?
- Are any Red Zone approvals waiting?
- Did any client delivery happen without final approval?
- Are blockers specific and assigned?
- Were completed tasks logged?
- Did QA find risks that affect tomorrow's priorities?
- Did Document Agent extract reusable assets?

## Daily Template
## Date

## Top 3 Tasks
1. 
2. 
3. 

## Routed Work
| Task | Client | Agent | Zone | Next Action |
|---|---|---|---|---|
|  |  |  | Green / Yellow / Red |  |

## Deliveries Logged
- 

## Audit Notes
- 

## SOP / Knowledge Updates
- 

## Owner Review
- 
