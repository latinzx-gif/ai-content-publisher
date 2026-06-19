# SOP Registry and Asset Index

## Purpose
Central registry for Fastwork-OS SOPs and reusable assets so agents can find, reuse, audit, improve, or retire operating knowledge quickly.

## Required Fields
- SOP Name
- Category
- Status
- Last Updated
- Reuse Count
- Owner
- Notes

## AI Agent Usage Rules
- PM Agent selects the right SOP before routing work.
- Dev Agent follows the SOP unless project context requires adjustment.
- QA Agent audits output against the SOP.
- Document Agent updates SOPs after repeated lessons.
- Hermes reviews priority, reuse value, and stale assets.
- Red Zone steps must be clearly marked inside the SOP.
- Manual approval is required only for pricing, contract, payment, production database, deleting data, security credentials, and final client delivery.

## SOP Categories
- Website delivery
- AI content systems
- Inventory systems
- HRMS / internal tools
- Client onboarding
- QA and audit
- Handoff and support
- Research and requirements
- Internal operations

## SOP Status Tracking
| Status | Meaning | Action |
|---|---|---|
| Draft | Created but not proven | Use carefully and audit closely |
| Active | Proven and reusable | Use as default process |
| Needs Review | Outdated, unclear, or issue reported | Document Agent updates |
| Deprecated | No longer recommended | Do not use unless Hermes approves |

## Asset Tracking
- Track templates, checklists, prompts, setup guides, handoff notes, and requirement patterns.
- Store assets where agents will naturally look: 03_SOP, 04_DELIVERY, or 06_KNOWLEDGE.
- Remove client-sensitive details before reuse.
- Link assets to the SOP or service type they support.

## Reuse Metrics
- Increase reuse count when an SOP or asset is used for a client task.
- High reuse count means the asset should be kept clean and current.
- Low reuse count plus stale content means review or deprecate.
- Document Agent reports useful repeated assets to Hermes during weekly review.

## Deprecation Rules
- Deprecate SOPs that create errors, duplicate better guidance, or no longer match Fastwork delivery.
- Mark deprecated items clearly instead of deleting them immediately.
- Move useful fragments into the replacement SOP before deprecation.
- Hermes approves deprecation of high-use SOPs.

## Review Schedule
- Daily: add new lessons from delivery and audit.
- Weekly: review reuse count, stale SOPs, repeated bugs, and missing templates.
- Monthly: consolidate duplicates and retire low-value assets.
- After major client issue: review the related SOP immediately.

## Template
| SOP Name | Category | Status | Last Updated | Reuse Count | Owner | Notes |
|---|---|---|---|---:|---|---|
|  |  | Draft / Active / Needs Review / Deprecated |  | 0 |  |  |

## Asset Index
| Asset | Type | Related SOP | Location | Reuse Count | Owner | Notes |
|---|---|---|---|---:|---|---|
|  | Template / Checklist / Prompt / Guide / Handoff |  |  | 0 | Document Agent |  |
| AI Content Publisher SaaS | Core Asset | AI_CONTENT_SYSTEM_SOP.md | FASTWORK-OS/04_ASSETS/AI_CONTENT_PUBLISHER | 0 | Document Agent | Category: Content Automation. Source Project: AI Content Legal System. Reuse Goal: Law, Accounting, Real Estate, Healthcare, Education, and other content-generation clients. Status: Core Asset. |
