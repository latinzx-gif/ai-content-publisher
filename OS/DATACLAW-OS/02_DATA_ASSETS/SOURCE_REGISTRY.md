# Source Registry

## Purpose
To act as a centralized, vetted library of all information sources used by DataClaw. This registry is key to maintaining data quality and research efficiency.

## Required Fields
- `source_id`: Unique identifier for the source.
- `source_name`: The name of the publication, website, or database.
- `source_url`: The root URL of the source.
- `source_type`: News, Trade Publication, Government, Corporate Blog, etc.
- `overall_quality_score`: An average score (1-10) based on the `SOURCE_QUALITY_RULES.md`, updated periodically.
- `last_review_date`: The last time the `Validator Agent` reviewed this source's quality.
- `notes`: Any important context (e.g., "Requires subscription", "Known political bias").

## AI Usage Rules
- Before processing a fact from a new URL, the `Scout Agent` and `Analyst Agent` MUST check if the root domain exists in this registry.
- If a source is not in the registry, it must be submitted for review by the `Validator Agent`.
- The `Validator Agent` is the owner of this registry.
- Facts from sources with a `overall_quality_score` below 5 should be treated with skepticism.

## Practical Template
| source_id | source_name | source_url | source_type | overall_quality_score | last_review_date | notes |
|---|---|---|---|---|---|---|
| src_001 | "TechCrunch" | `https://techcrunch.com` | News | 8 | 2026-01-15 | Strong for funding, but can be promotional. |
| src_002 | "Thailand Food & Drug Admin" | `https://www.fda.moph.go.th` | Government | 9 | 2026-03-20 | Primary source for official product registrations. |
| src_003 | "Brand Buffet" | `https://www.brandbuffet.in.th` | Trade Publication | 7 | 2026-02-10 | Good for local marketing news, less so for deep data. |
| src_004 | "Krungsri Research" | `https://www.krungsri.com/en/research`| Financial Institution | 9 | 2026-04-05 | High-quality macroeconomic reports. |
| src_005 | "Some Random Blog" | `https://random-blog.example.com`| Blog | 3 | 2026-05-01 | **DEPRECATED**. Use only for signals, not facts. |

## Success Metrics
- `Registry Coverage`: % of all facts in the OS that come from sources listed in this registry.
- `Low-Quality Source Reduction`: % decrease in the number of facts ingested from sources with a score < 5.
- `Review Cadence`: % of sources in the registry that have been reviewed in the last 6 months.
