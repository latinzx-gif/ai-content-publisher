# Company Database

## Purpose
To be the single source of truth for firmographic data on all companies tracked by DataClaw. This structured data is a core, reusable asset for building intelligence products.

## Required Fields
- `company_id`: Unique identifier.
- `company_name`: Legal name.
- `market_taxonomy_path`: Classification from `MARKET_TAXONOMY.md`.
- `country`: Country of HQ (ISO code).
- `founding_year`: Year founded.
- `status`: Active, Acquired, Inactive.
- `confidence_score`: Overall confidence in the record's accuracy (1-10).
- `last_validated`: Date the record was last checked by the `Validator Agent`.

## AI Usage Rules
- The `Librarian Agent` is the owner of this database and is responsible for adding new, structured entries.
- The `Scout Agent` can propose new companies, but they must be structured according to the schema defined in `DATA_SCHEMA_RULES.md`.
- The `Validator Agent` is responsible for periodically reviewing records and updating the `confidence_score` and `last_validated` fields.

## Practical Template
| company_id | company_name | market_taxonomy_path | country | founding_year | status | confidence_score | last_validated |
|---|---|---|---|---|---|---|---|
| comp_001 | "Healthy-Kids Nutrition Co." | `Consumer Goods > Food & Beverage > Snacks`| TH | 2022 | Active | 8 | {{DATE-5}} |
| comp_002 | "Future Beverage Tech" | `Consumer Goods > Food & Beverage > Functional Beverages`| SG | 2021 | Active | 9 | {{DATE-2}} |
| comp_003 | "BeautyBox SEA" | `Consumer Goods > Beauty & Personal Care > Cosmetics` | TH | 2019 | Acquired | 7 | {{DATE-30}}|
| comp_004 | "PetPal Logistics" | `Technology > Logistics > E-commerce Logistics`| VN | 2023 | Active | 8 | {{DATE-10}}|

## Success Metrics
- `Database Growth`: Number of new, validated companies added per week.
- `Data Completeness`: % of records that have all required fields populated.
- `Data Accuracy`: % of records confirmed to be accurate during spot-checks. Measured by the `Validator Agent`.
