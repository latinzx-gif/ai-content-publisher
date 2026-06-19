# Schema: Brands

## Purpose
To define the mandatory data structure for a single brand record. This ensures that brand-level information is consistent, high-quality, and can be reliably linked to its parent company.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `brand_id` | String | A unique, machine-readable identifier. | `brand_kid_vitals_th` |
| `brand_name` | String | The public name of the brand. | `Kid-Vitals` |
| `company_id` | String | The ID of the parent company from the `/companies` asset, linking this brand to its owner. | `comp_healthy_kids_co_th` |
| `market_taxonomy_path` | String | The specific market niche this brand competes in. | `Consumer Goods > Food & Beverage > Snacks` |
| `status` | String | The current market status. Must be one of: `Active`, `Discontinued`, `Rebranded`. | `Active` |
| `source_id` | String | The ID of the primary source where this brand was identified. | `src_company_website_2026_01_10`|
| `confidence_score`| Integer | An overall confidence score (1-10) for the accuracy of this brand record. | `9` |

---

### Confidence Scoring

The `confidence_score` for a brand record is determined by the `Validator Agent` and is based on:
- **Source Quality:** How reliable is the source that mentions this brand? A company's official website is a high-quality source. A forum post is not.
- **Brand-Company Link:** How certain are we that this brand is owned by the specified `company_id`? An "About Us" page provides high certainty. An analyst's report provides medium certainty.
- **Clarity:** Is the brand clearly distinct from other brands owned by the same company?
