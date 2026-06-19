# Task Queue

## Purpose
Track Fastwork-OS management tasks for the AI Content Legal System without modifying the source project.

## Required Fields
- Task
- Priority
- Assigned agent
- Delivery status
- Approval zone
- Risk notes
- Due date
- Output location

## AI Agent Usage Rules
- Documentation tasks are Green Zone unless they expose credentials, pricing, contract, payment, production database, deleting data, or final delivery.
- Keep source code untouched.
- Store all outputs inside FASTWORK-OS.
- PM Agent updates status and blockers.
- Document Agent converts completed work into reusable assets and SOPs.

## Template
| Task | Priority | Agent | Delivery Status | Approval Zone | Risk Notes | Due Date | Output |
|---|---|---|---|---|---|---|---|
| Review current AI Content Legal System status | P1 | PM Agent / QA Agent | New | Green | Read-only review; do not edit source files | TBD | DELIVERY_LOG.md / asset docs |
| Document reusable workflows | P1 | Document Agent | New | Green | Use structure and docs only; avoid secrets | TBD | FASTWORK-OS/04_ASSETS/AI_CONTENT_PUBLISHER/REUSABLE_WORKFLOWS.md |
| Document reusable prompts | P1 | Document Agent / Research Agent | New | Green | Capture prompt architecture, not private keys or client secrets | TBD | FASTWORK-OS/04_ASSETS/AI_CONTENT_PUBLISHER/REUSABLE_PROMPTS.md |
| Document reusable UI/database/deployment patterns | P1 | Document Agent / QA Agent | New | Yellow | Database and credentials references must stay non-sensitive | TBD | FASTWORK-OS/04_ASSETS/AI_CONTENT_PUBLISHER/REUSABLE_COMPONENTS.md / DEPLOYMENT_PATTERN.md |
| Extract AI Content Publisher SOP | P2 | Document Agent | New | Green | Mark Red Zone steps clearly | TBD | FASTWORK-OS/03_SOP/AI_CONTENT_SYSTEM_SOP.md |
| Identify future client customization points | P2 | Research Agent / Document Agent | New | Green | Keep reusable and industry-neutral | TBD | ASSET_OVERVIEW.md |
| Create reusable proposal/package outline | P3 | PM Agent / Research Agent | New | Red for pricing | Pricing requires owner approval before use | TBD | Future quote/proposal doc |
