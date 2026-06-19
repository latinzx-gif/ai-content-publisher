# Trend Database

## Purpose
To create a structured registry of emerging and established market trends. This asset allows DataClaw to move beyond static data and provide forward-looking intelligence.

## Required Fields
- `trend_id`: Unique identifier.
- `trend_name`: A short, descriptive name for the trend.
- `market_taxonomy_path`: The primary market this trend affects.
- `trend_type`: Macro / Micro.
- `status`: Emerging / Growing / Mature / Declining.
- `evidence`: An array of `Fact IDs` or `Signal IDs` that support the existence of this trend.
- `confidence_score`: Confidence in the validity and trajectory of the trend (1-10).
- `last_updated`: Date the trend status was last reviewed.

## AI Usage Rules
- The `Analyst Agent` is the primary owner, responsible for identifying and defining trends based on clusters of facts and signals.
- AI can be used to suggest potential trends by finding correlations in the `PRODUCT_DATABASE` (e.g., "A growing number of products feature 'Mushroom Extracts' as a key ingredient").
- The `status` and `confidence_score` must be reviewed by a human analyst quarterly.

## Practical Template
| trend_id | trend_name | market_taxonomy_path | trend_type | status | evidence | confidence_score | last_updated |
|---|---|---|---|---|---|---|---|
| trend_001 | "Plant-Based Protein in Kids Snacks" | `Consumer Goods > Food & Beverage > Snacks` | Growing | `[FACT-101, FACT-105, SIG-203]` | 8 | {{DATE-10}} |
| trend_002 | "Nootropics in Ready-to-Drink Beverages" | `Consumer Goods > Food & Beverage > Functional Beverages` | Growing | `[FACT-110, PROD-002, PROD-004]`| 9 | {{DATE-5}} |
| trend_003 | "Hyper-Personalized Skincare" | `Consumer Goods > Beauty & Personal Care > Skincare` | Emerging | `[SIG-301, HYP-005]` | 6 | {{DATE-20}} |
| trend_004 | "Subscription Models for Pet Food" | `Consumer Goods > Pet Products > Pet Food` | Mature | `[COMP-004, COMP-008]` | 9 | {{DATE-45}}|

## Success Metrics
- `Predictive Accuracy`: % of "Growing" trends that become "Mature".
- `Trend-Based Product Sales`: Revenue from intelligence products that are primarily focused on trend analysis.
- `New Trends Identified`: Number of new, validated "Emerging" trends identified per quarter.
