# Brand Database

## Purpose
To track specific brands, which may be distinct from the companies that own them. This allows for more granular analysis of market presence and consumer perception.

## Required Fields
- `brand_id`: Unique identifier for the brand.
- `brand_name`: The public name of the brand.
- `company_id`: The ID of the parent company that owns the brand (from `COMPANY_DATABASE`).
- `market_taxonomy_path`: The specific niche the brand operates in.
- `status`: Active, Discontinued, Rebranded.
- `confidence_score`: Overall confidence in the record's accuracy (1-10).
- `last_validated`: Date the record was last checked.

## AI Usage Rules
- The `Analyst Agent` is responsible for identifying brands associated with companies and adding them to this database.
- AI can be used to scan company websites and product listings to suggest potential brand-to-company relationships.
- The schema defined in `DATA_SCHEMA_RULES.md` must be followed.

## Practical Template
| brand_id | brand_name | company_id | market_taxonomy_path | status | confidence_score | last_validated |
|---|---|---|---|---|---|---|
| brand_001 | "Kid-Vitals" | comp_001 | `Consumer Goods > Food & Beverage > Snacks` | Active | 8 | {{DATE-5}} |
| brand_002 | "FocusFlow" | comp_002 | `Consumer Goods > Food & Beverage > Functional Beverages > Nootropic Drinks`| Active | 9 | {{DATE-2}} |
| brand_003 | "Glimmer" | comp_003 | `Consumer Goods > Beauty & Personal Care > Cosmetics`| Discontinued| 7 | {{DATE-30}}|
| brand_004 | "Super-C Boost" | comp_002 | `Consumer Goods > Food & Beverage > Functional Beverages > Energy Drinks`| Active | 8 | {{DATE-10}}|

## Success Metrics
- `Brand-to-Company Ratio`: The average number of brands tracked per company.
- `Database Coverage`: % of top 100 companies in a target market that have their brands fully mapped.
- `Insight Generation`: Number of insights generated per month that rely on brand-level data.
