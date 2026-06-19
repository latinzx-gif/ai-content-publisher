# Data Schema Rules

## Purpose
To enforce a consistent structure for all data stored within DataClaw's core `DATA_ASSETS`. This ensures data is interoperable, queryable, and ready for use in intelligence products.

## Required Fields
- `Asset Name`: The specific data asset (e.g., `COMPANY_DATABASE`).
- `Field Name`: The name of a specific data field (e.g., `company_name`).
- `Data Type`: The expected data type (e.g., String, Integer, Date, Array).
- `Validation Rule`: A specific rule the data must adhere to (e.g., Not Null, Unique, ISO 8601 format).
- `Description & Example`: A clear explanation of the field and a sample value.

## AI Usage Rules
- The `Librarian Agent` and `Analyst Agent` MUST adhere to these schemas when adding or modifying data.
- Any data import that violates these rules must be rejected and flagged for manual review.
- AI can be used to generate data entry forms or validation scripts based on these rules.

## Practical Template
### **Asset: `COMPANY_DATABASE.md`**

| Field Name | Data Type | Validation Rule | Description & Example |
|---|---|---|---|
| `company_id` | String | Not Null, Unique | A unique identifier for the company. Ex: `comp_4a1b3c` |
| `company_name` | String | Not Null | The legal name of the company. Ex: `DataClaw Inc.` |
| `market_taxonomy_path` | String | Not Null, Must match `MARKET_TAXONOMY.md` | The market classification. Ex: `Technology > Software > B2B SaaS` |
| `country` | String | Not Null, ISO 3166-1 alpha-2 | The country of headquarters. Ex: `TH` |
| `founding_year`| Integer | Must be a 4-digit year | The year the company was founded. Ex: `2024` |
| `status` | String | Must be one of: `Active`, `Acquired`, `Inactive` | The current operational status. Ex: `Active` |
| `confidence_score`| Integer | 1-10 | An overall confidence score for the accuracy of the company record, based on source quality. Ex: `8`|

---
### **Asset: `FUNDING_DATABASE.md`**

| Field Name | Data Type | Validation Rule | Description & Example |
|---|---|---|---|
| `funding_id` | String | Not Null, Unique | A unique identifier for the funding event. Ex: `fund_9z8y7x` |
| `company_id` | String | Not Null, Must exist in `COMPANY_DATABASE` | The ID of the company that received funding. Ex: `comp_4a1b3c` |
| `funding_date` | Date | Not Null, ISO 8601 format | The date the funding was announced. Ex: `2026-05-15` |
| `funding_round`| String | Must be one of: `Pre-Seed`, `Seed`, `Series A`, `Series B`, etc. | The type of funding round. Ex: `Series A` |
| `amount_usd` | Integer | Not Null, > 0 | The funding amount in US Dollars. Ex: `10000000` |
| `source_url` | String | Not Null, Valid URL | The URL of the primary source announcing the funding. Ex: `https://techcrunch.com/...` |
| `source_confidence`| Integer | 1-10, based on `SOURCE_QUALITY_RULES.md` | The confidence score of the source. Ex: `9` |

## Success Metrics
- `Data Validation Error Rate`: % of data entries that fail schema validation upon submission. (Goal: <1%).
- `Data Interoperability`: Success rate of queries that join multiple data assets.
