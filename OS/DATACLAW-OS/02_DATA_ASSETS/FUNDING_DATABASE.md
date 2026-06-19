# Funding Database

## Purpose
To be the central repository for all corporate funding, investment, and M&A activities within the markets we track. This is a high-value asset for strategic intelligence.

## Required Fields
- `funding_id`: Unique identifier for the event.
- `company_id`: The ID of the company involved.
- `event_date`: The date the event was announced.
- `event_type`: Funding Round / M&A / Grant.
- `details`: A structured object with relevant details (e.g., `{ round: "Series A", amount_usd: 10000000, investors: ["VC A", "VC B"] }`).
- `source_url`: The URL of the primary source.
- `source_confidence`: Confidence score (1-10) of the source, based on `SOURCE_QUALITY_RULES.md`.

## AI Usage Rules
- The `Scout Agent` scans for funding announcements and creates draft entries.
- The `Librarian Agent` structures and logs the entry according to the schema.
- The `Validator Agent` verifies the source and assigns the final confidence score.
- All amounts should be normalized to USD.

## Practical Template
| funding_id | company_id | event_date | event_type | details | source_url | source_confidence |
|---|---|---|---|---|---|---|
| fund_001 | comp_001 | 2026-04-20 | Funding Round | `{ "round": "Seed", "amount_usd": 2000000, "investors": ["Alpha Ventures"] }` | `https://example.com/news1`| 9 |
| fund_002 | comp_003 | 2026-03-15 | M&A | `{ "acquirer": "Global Beauty Inc.", "amount_usd": 50000000 }` | `https://example.com/news2`| 9 |
| fund_003 | comp_002 | 2026-05-01 | Funding Round | `{ "round": "Series A", "amount_usd": 10000000, "investors": ["Momentum Capital", "Investor B"] }`| `https://example.com/news3`| 8 |

## Success Metrics
- `Funding Events Captured`: Number of new funding events added per week.
- `Data-to-Insight Conversion`: Number of insights in the `HYPOTHESIS_TRACKER` that are validated or refuted using data from this database.
- `Completeness`: % of tracked companies in a market for which we have funding data.
