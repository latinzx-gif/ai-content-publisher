# Priority Queue

## Purpose
To maintain a clear, prioritized list of all major research tasks, asset creation efforts, and product development initiatives. This ensures the team is always focused on the most valuable work.

## Required Fields
- `Task ID`: A unique identifier.
- `Task Name`: A clear, concise description.
- `Category`: Research / Asset / Product / Internal.
- `Priority`: P1 (Urgent) / P2 (High) / P3 (Normal).
- `Status`: Queued / Active / Blocked / Done.
- `Owner`: The agent or person responsible.
- `Success Criteria`: What "done" looks like.

## AI Usage Rules
- AI can be used to suggest task breakdowns for a new, large initiative (e.g., "Break down 'Create Beauty Market Report'").
- AI can monitor the queue for tasks that have been "Active" for too long and flag them for review.
- Priority assignment must be done by the `DataClaw Director`.

## Practical Template
| Task ID | Task Name | Category | Priority | Status | Owner | Success Criteria |
|---|---|---|---|---|---|---|
| RES-001 | Scan for new "Functional Beverage" product launches in Thailand | Research | P1 | Active | Scout Agent | List of 20+ new products added to `SIGNAL_LOG.md` |
| ASSET-001| Build v1 `COMPANY_DATABASE` for Healthcare in SEA | Asset | P1 | Librarian Agent | Database contains 1,000+ verified companies with basic firmographics |
| PROD-001 | Design `MARKET_MAP_TEMPLATE.md` v1 | Product | P1 | Product Manager | Template is approved and ready for use |
| RES-002 | Identify top 50 influencers in the "Kids Nutrition" space | Research | P2 | Queued | Scout Agent | List of influencers with follower counts and engagement rates |
| ASSET-002| Validate sources for all claims in the "Pet Food" market | Asset | P2 | Blocked | Validator Agent | All facts in the Pet Food market file have a `Source Confidence` > 8/10 |
| INT-001 | Refine `FACT_INSIGHT_HYPOTHESIS_UNKNOWN.md` framework | Internal | P3 | Done | DataClaw Director| Framework v1.1 is published |

## Success Metrics
- `Queue Velocity`: Average number of P1/P2 tasks completed per week.
- `Time in Queue`: Average time a task spends in "Queued" status before becoming "Active".
- `% of Tasks Completed on Time`: Ratio of tasks completed by their target date (if applicable).
