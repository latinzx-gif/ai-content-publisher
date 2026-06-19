# Schema: Insights

## Purpose
To define the mandatory data structure for an insight record. This schema ensures every insight is evidence-based, auditable, and clearly articulated.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `insight_id` | String | A unique, machine-readable identifier. | `ins_investment_accel_func_bev_q4` |
| `created_date`| DateTime | The ISO 8601 timestamp of when the insight was created. | `2026-05-22T14:00:00Z` |
| `title` | String | A concise, headline-style summary of the insight. | `Investment in Thai Functional Beverage Market is Accelerating` |
| `summary` | String | A paragraph explaining the insight, its context, and its implications. | `"A synthesis of recent funding announcements shows a 50% increase in total capital raised by functional beverage startups in Q4 vs. the previous year, suggesting growing investor confidence in the sector."` |
| `evidence` | Array[String]| An array of `Fact IDs` from other data assets that support this insight. An insight MUST have evidence. | `["fact_funding_01", "fact_funding_02", "fact_product_launch_55"]` |
| `source_references`| Array[String]| An array of the original `source_id`s from the supporting facts, for easy reference. | `["src_techcrunch", "src_bangkok_post"]` |
| `related_entities` | Array[String]| An array of `entity_id`s from the `/entity_registry` that are relevant to this insight. | `["comp_future_bev", "brand_focus_flow", "tech_nootropics"]`|
| `confidence_score`| Integer | The analyst's confidence (1-10) in the validity of the insight, based on the quality and quantity of evidence. | `8` |
| `analyst_notes` | String | (Optional) Internal notes from the analyst about the insight, its limitations, or areas for further investigation. | `"This insight is strong, but currently only reflects publicly announced deals. The true investment level may be higher."`|

---

### Confidence Scoring

The `confidence_score` for an insight is assigned by the `Analyst Agent` and reviewed by a human. It is determined by:
- **Strength of Evidence:** How high are the confidence scores of the underlying facts in the `evidence` array?
- **Quantity of Evidence:** Is the insight based on two facts or twenty?
- **Clarity of Correlation:** How directly and logically do the facts support the summary?
