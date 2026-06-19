# Pricing Database

## Purpose
To maintain a time-series database of product pricing information from various retailers. This asset is critical for competitive analysis and understanding market positioning.

## Required Fields
- `price_log_id`: Unique identifier for the price data point.
- `product_id`: The ID of the product being tracked.
- `retailer_id`: The ID of the retailer where the price was observed.
- `date_observed`: The date the price was recorded.
- `price`: The observed price.
- `currency`: The currency of the price (ISO 4217).
- `unit`: The unit of measurement (e.g., "per 100ml", "per kg", "each").
- `source_url`: The URL of the product page where the price was found.

## AI Usage Rules
- The `Scout Agent` is the primary owner, responsible for running automated scripts to collect this data.
- The agent must be programmed to be respectful of retail websites and adhere to their `robots.txt` policies.
- AI can be used to flag significant price-change anomalies (e.g., a >20% price drop overnight) for the `Analyst Agent` to review.

## Practical Template
| price_log_id | product_id | retailer_id | date_observed | price | currency | unit | source_url |
|---|---|---|---|---|---|---|---|
| pl_001 | prod_002 | ret_001 | 2026-05-10 | 75.00 | THB | each (250ml) | `https://tops.co.th/p/focusflow-matcha`|
| pl_002 | prod_002 | ret_002 | 2026-05-10 | 79.00 | THB | each (250ml) | `https://lazada.co.th/p/focusflow-matcha`|
| pl_003 | prod_001 | ret_001 | 2026-05-10 | 45.00 | THB | each (50g bar)| `https://tops.co.th/p/kid-vitals-bar`|
| pl_004 | prod_002 | ret_001 | 2026-05-17 | 72.00 | THB | each (250ml) | `https://tops.co.th/p/focusflow-matcha`|

## Success Metrics
- `Data Point Growth`: Number of new price points collected per day.
- `Product Coverage`: % of "In-Market" products in the `PRODUCT_DATABASE` that have at least one recent price point.
- `Pricing Volatility Insights`: Number of valuable insights generated about competitor pricing strategies.
