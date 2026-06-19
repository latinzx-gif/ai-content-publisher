# Schema: Trends

## Purpose
To define the mandatory data structure for a trend record. This schema ensures that every trend is evidence-based and that its trajectory and significance are clearly articulated.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `trend_id` | String | A unique, machine-readable identifier. | `trend_plant_based_kids_snacks` |
| `trend_name` | String | A short, descriptive name for the trend. | `Plant-Based Protein in Kids Snacks` |
| `market_taxonomy_path` | String | The primary market this trend affects. | `Consumer Goods > Food & Beverage > Snacks` |
| `trend_type` | String | The scope of the trend. Must be one of: `Macro`, `Micro`. | `Micro` |
| `status` | String | The current maturity of the trend. Must be one of: `Emerging`, `Growing`, `Mature`, `Declining`.| `Growing` |
| `evidence` | Array[String] | An array of `Fact IDs` (from other data assets) or `Signal IDs` that support the existence and trajectory of this trend. | `["fact_101", "fact_105", "sig_203"]` |
| `confidence_score`| Integer | Confidence in the **validity and stated trajectory** of the trend (1-10). | `8` |
| `last_reviewed` | Date | The date the trend's `status` and `confidence_score` were last reviewed by an analyst. | `2026-05-20` |

---

### Confidence Scoring

The `confidence_score` for a trend is a more subjective measure assigned by the `Analyst Agent` and is based on:
- **Quality of Evidence:** A trend supported by multiple high-confidence facts is stronger than one based on a few weak signals.
- **Quantity of Evidence:** How many data points support this trend?
- **Velocity:** Is the frequency of new, related signals increasing over time?
- **Coherence:** Do the pieces of evidence logically support the trend's narrative?
