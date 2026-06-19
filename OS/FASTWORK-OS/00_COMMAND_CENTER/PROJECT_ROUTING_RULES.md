# Project Routing Rules

## Purpose
Define how Hermes routes Fastwork-OS work across agents while protecting revenue, deadlines, quality, and reduced approval gates.

## Required Fields
- Task category
- Assigned primary agent
- Secondary agent
- Escalation condition
- Priority mapping
- Zone mapping
- Capacity note

## AI Agent Usage Rules
- Hermes owns routing decisions and overrides.
- PM Agent converts routed work into executable tasks.
- Each task gets one primary owner and one clear next action.
- Red Zone work must not block unrelated Green or Yellow work.

## Task Categories
| Task Category | Assigned Primary Agent | Secondary Agent | Escalation Conditions |
|---|---|---|---|
| Development | Dev Agent | QA Agent | Production database, deleting data, security credentials |
| Research | Research Agent | PM Agent | Unverified client-facing claims or proposal-critical uncertainty |
| QA | QA Agent | Dev Agent | Critical bug, final delivery risk, Red Zone action without approval |
| Documentation | Document Agent | QA Agent | Client-sensitive details or final client delivery docs |
| Client Communication | PM Agent | Hermes | Pricing, contract, payment, dispute, or final delivery |
| Proposal Creation | PM Agent | Research Agent | Pricing, contract, payment, unclear scope |
| Delivery | QA Agent | PM Agent | Final client delivery requires manual approval |
| Revenue Follow-up | PM Agent | Hermes | Payment, overdue invoice, pricing change, contract term |

## Priority Mapping
| Priority | Rule | Examples |
|---|---|---|
| 1 | Revenue generating work | Paid delivery, payment follow-up, proposal close |
| 2 | Client deadlines | Due deliverables, urgent client blockers |
| 3 | Reusable assets and SOPs | Repeatable workflow, template, checklist |
| 4 | Internal improvements | Dashboard cleanup, process refinement |
| 5 | Experiments | New offers, tools, non-urgent tests |

## Green / Yellow / Red Zone Mapping
| Zone | Routing Rule | Examples |
|---|---|---|
| Green | Route immediately; audit later | Research, drafts, QA checks, internal docs, reversible edits |
| Yellow | Notify owner; continue if low risk and reversible | Ambiguous request, small scope clarification, client preference |
| Red | Stop until manual approval | Pricing, contract, payment, production database, deleting data, security credentials, final client delivery |

## Capacity Overflow Rules
- If one agent is overloaded, PM Agent breaks work into smaller tasks and Hermes reassigns what can move.
- Revenue and deadline work gets capacity before SOPs, internal improvements, or experiments.
- Blocked agents should switch to independent Green or Yellow tasks.
- Do not assign multiple owners to the same task.

## Reassignment Rules
- Reassign when a task is blocked, overdue, misrouted, or lower priority than incoming revenue work.
- Hermes records the reason for reassignment.
- PM Agent updates ACTIVE_PROJECTS.md and the client TASK_QUEUE.md after reassignment.
- QA Agent must still validate work before final client delivery.

## Routing Template
| Task | Category | Priority | Zone | Primary Agent | Secondary Agent | Escalation | Next Action |
|---|---|---|---|---|---|---|---|
|  | Development / Research / QA / Documentation / Client Communication / Proposal / Delivery / Revenue | 1 / 2 / 3 / 4 / 5 | Green / Yellow / Red |  |  |  |  |
