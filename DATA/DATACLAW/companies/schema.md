# Schema: Companies

## Purpose
To define the mandatory data structure for a single company record. Enforcing this schema ensures data consistency, quality, and interoperability across the entire OS.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `company_id` | String | A unique, machine-readable identifier. | `comp_healthy_kids_co_th` |
| `company_name` | String | The legal or most common name of the company. | `Healthy-Kids Nutrition Co.` |
| `market_taxonomy_path` | String | The classification from `MARKET_TAXONOMY.md`. | `Consumer Goods > Food & Beverage > Snacks` |
| `country` | String | The two-letter ISO code for the HQ country. | `TH` |
| `founding_year`| Integer | The 4-digit year the company was founded. | `2022` |
| `status` | String | The current operational status. Must be one of: `Active`, `Acquired`, `Inactive`. | `Active` |
| `source_id` | String | The ID of the primary source record from the `/sources` directory. | `src_techcrunch_2026_01_05`|
| `confidence_score`| Integer | An overall confidence score (1-10) for the accuracy of this entire record, based on source quality and verifiability. | `8` |

---

### Confidence Scoring

The `confidence_score` for a company record is determined by the `Validator Agent` and is based on a blend of factors:
- **Source Quality:** The score of the primary `source_id`. A fact from a government registry is more reliable than one from an unverified blog.
- **Verifiability:** Can the key facts (e.g., company name, founding year) be confirmed across multiple independent, high-quality sources?
- **Data Completeness:** Is the record fully populated according to the schema?

A score below 5 indicates the record is speculative and should not be used in sellable products without a disclaimer.
