# Retail Database

## Purpose
To track key physical and online retailers within target markets, providing a crucial layer of distribution and channel intelligence.

## Required Fields
- `retailer_id`: Unique identifier.
- `retailer_name`: The name of the retail chain or e-commerce site.
- `channel_type`: Physical Retail / E-commerce / Social Commerce.
- `market_focus`: The primary market categories the retailer serves.
- `country_presence`: An array of countries (ISO codes) where the retailer operates.
- `confidence_score`: Overall confidence in the record's accuracy.
- `last_validated`: Date the record was last checked.

## AI Usage Rules
- The `Scout Agent` is responsible for identifying and adding new retailers to this database.
- AI can be used to scan for articles about retail expansions or new e-commerce platform launches.
- All entries must be validated by a human analyst before being used to generate insights.

## Practical Template
| retailer_id | retailer_name | channel_type | market_focus | country_presence | confidence_score | last_validated |
|---|---|---|---|---|---|---|
| ret_001 | "Tops Market" | Physical Retail | `["Groceries", "Consumer Goods"]` | `["TH"]` | 9 | {{DATE-15}} |
| ret_002 | "Lazada" | E-commerce | `["General Merchandise"]` | `["TH", "SG", "VN", "MY"]`| 9 | {{DATE-10}} |
| ret_003 | "BeautyBuffet.shop" | E-commerce | `["Beauty & Personal Care"]` | `["TH"]` | 8 | {{DATE-5}} |
| ret_004 | "LINE SHOPPING" | Social Commerce | `["General Merchandise"]`| `["TH"]` | 8 | {{DATE-20}}|

## Success Metrics
- `Channel Coverage`: % of top brands in a market whose key retail channels are documented.
- `Distribution Insights`: Number of insights generated related to product distribution strategies (e.g., "Brand X is gaining market share by focusing on Social Commerce channels").
