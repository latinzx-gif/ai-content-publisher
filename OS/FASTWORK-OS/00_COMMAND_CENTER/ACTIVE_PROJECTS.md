# Active Projects

## Purpose
Single view of all live Fastwork client projects, current owner, delivery status, and cashflow relevance.

## Required Fields
- Client name
- Project name
- Package / scope
- Status
- Priority
- Cashflow value
- Owner agent
- Next action
- Operating zone: Green / Yellow / Red
- Manual approval needed: yes/no
- Due date

## AI Agent Usage Rules
- Hermes keeps this file as the operating memory.
- PM Agent updates project status and next action after routing work.
- Use reduced approval gates to keep paid Fastwork work moving.
- Green Zone tasks auto execute and are audited later.
- Yellow Zone tasks notify the owner, then continue if the risk is low and reversible.
- Red Zone tasks stop until manual approval is recorded.
- Manual approval is required only for pricing, contract, payment, production database, deleting data, security credentials, and final client delivery.
- QA Agent may add audit notes after delivery.

## Operating Zones
| Zone | Rule | Examples | Action |
|---|---|---|---|
| Green | Auto execute + audit later | Drafts, research, layout edits, task cleanup, non-sensitive docs | Agent proceeds |
| Yellow | Notify owner + continue if low risk | Scope clarification, minor client preference changes, reversible configuration | PM notifies; agent proceeds if reversible |
| Red | Manual approval required | Pricing, contract, payment, production DB, deleting data, security credentials, final client delivery | Stop and wait |

## Template
| Client | Project | Scope | Status | Priority | Value | Owner | Next Action | Zone | Approval Needed | Due Date |
|---|---|---|---|---|---:|---|---|---|---|---|
|  |  |  | New / Active / Waiting / Delivered / Closed | High / Medium / Low |  |  |  | Green / Yellow / Red | No |  |
| law-ai-content | AI Content Legal System | Manage standalone Law AI Content project and extract reusable AI Content Publisher SaaS assets | Active | High | TBD | Hermes / PM Agent | Review current status and document reusable workflows | Green | No | TBD |

## Notes
- Cashflow first: prioritize paid work, near-close quotes, and delivery blockers.
- Do not let approval waiting consume delivery time unless the item is Red Zone.
