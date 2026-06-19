# Intelligence Dashboard

## Purpose
To provide a single source of truth for the real-time status of DataClaw's intelligence production, data asset health, and product pipeline.

## Required Fields
- `Dashboard Focus`: Current high-level priority.
- `Asset Status`: Health of core databases.
- `Pipeline Status`: Efficiency of research pipelines.
- `Product Status`: Progress of sellable intelligence products.
- `Revenue Status`: Key performance indicators for monetization.
- `Top Risks`: Critical blockers or uncertainties.
- `Key Decisions & Next Actions`: Actionable takeaways.

## AI Usage Rules
- Use AI to summarize status updates from other documents, but all metrics must be validated by a human owner.
- AI can flag anomalies (e.g., "Trend database has not been updated in 7 days").
- All "Next Actions" must be human-assigned.

## Practical Template
### **DataClaw Intelligence Dashboard**
*Last Updated: {{DATE}}*

**Current Focus:** Building the foundational "Functional Beverage in Thailand" data asset and launching the first Market Map product.

| Area | Status | Key Metric | Owner | Next Action |
|---|---|---|---|---|
| **Data Assets** | 🟡 | 150 companies in DB (Goal: 500) | Librarian Agent | Ingest new company list from `MARKET_SCAN_PIPELINE` |
| **Research Pipelines** | 🟢 | 12 market scans completed this week | Scout Agent | Begin `COMPETITOR_SCAN_PIPELINE` for top 5 beverage brands |
| **Intelligence Products**| 🟢 | Market Map Template v1 approved | Product Manager | Generate v1 "Functional Beverage Market Map" |
| **Revenue** | 🔴 | $0 MRR (Pre-launch) | DataClaw Director | Finalize pricing for the first Market Map |

### Top Risks
1.  **Source Quality:** Low-quality sources are slowing down the validation pipeline. (Mitigation: Refine `SOURCE_QUALITY_RULES.md`).
2.  **Product Scope Creep:** The first Market Map is becoming too complex. (Mitigation: Re-align with `PRODUCT_CATALOG.md` MVP definition).

### Key Decisions & Next Actions
- **Decision:** The "Functional Beverage Market Map" will be the first product to launch.
- **Action:** `Product Manager` to finalize the one-time sale price by end of week.
- **Action:** `Librarian Agent` to perform a data integrity check on the `COMPANY_DATABASE.md`.
