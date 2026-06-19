# Intelligence Product Catalog

## Purpose
To serve as the master catalog of all sellable intelligence products offered by DataClaw. This is the "storefront" that connects our data assets to revenue.

## Required Fields
- `Product ID`: Unique identifier.
- `Product Name`: The public-facing name of the product.
- `Product Type`: Market Map, Insight Report, Database, etc.
- `Description`: A brief, compelling description for use on a sales page.
- `Status`: Idea / In Development / For Sale / Deprecated.
- `Price`: The price for a one-time sale or monthly subscription.
- `Owner`: The Product Manager responsible for the product.

## AI Usage Rules
- AI can be used to generate a draft `Description` for a new product based on its underlying data assets and target customer.
- AI can analyze the `REVENUE_TRACKER.md` to suggest which products should be marked as "Deprecated" due to low sales.
- The `Product Manager` must give final approval for any product to be moved to "For Sale" status.

## Practical Template
| Product ID | Product Name | Product Type | Description | Status | Price | Owner |
|---|---|---|---|---|---|---|
| **PROD-001** | **Thai Functional Beverage Market Map 2026** | Market Map | A one-page visual overview of the key players, emerging challengers, and white space opportunities in the Thai functional beverage market. | In Development | $499 (one-time) | `Product Manager` |
| **PROD-002** | **SEA Beauty & Personal Care Company Database Q3 2026**| Company Database | A curated, validated database of 500+ companies in the SEA beauty sector. Includes firmographics, funding, and brand data. Perfect for M&A and lead generation. | Scoping | $1,499 (one-time)| `Product Manager` |
| **SUB-001** | **Thailand Kids Nutrition Monthly Trend Report** | Trend Report (Subscription)| A monthly intelligence briefing on emerging trends, new product launches, and weak signals in the Thai kids nutrition space. | Scoping | $299/month | `Product Manager` |
| PROD-003 | Pet Food Competitive Landscape | Competitive Landscape | An in-depth report analyzing the market position, product portfolio, and pricing strategies of the top 10 pet food companies in Thailand. | Idea | $799 (one-time) | `Product Manager` |

## Success Metrics
- `Product Sales Velocity`: Number of units sold per product per month.
- `Total Product Revenue`: Total revenue generated from this catalog, tracked in `REVENUE_TRACKER.md`.
- `Product Mix`: The percentage of total revenue coming from one-time sales vs. recurring subscriptions.
