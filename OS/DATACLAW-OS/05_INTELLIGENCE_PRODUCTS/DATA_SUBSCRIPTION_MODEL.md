# Data Subscription Model

## Purpose
To define the structure, value proposition, and operating model for DataClaw's recurring revenue subscription products.

## Required Fields
- `Subscription ID`: A unique identifier for the subscription product.
- `Subscription Name`: The public-facing name of the product.
- `Target Customer`: The ideal customer profile for this subscription.
- `Value Proposition`: The core "job-to-be-done" that the subscription solves.
- `Deliverables`: A list of exactly what the customer receives (e.g., monthly report, database access).
- `Frequency`: How often deliverables are provided.
- `Pricing`: The monthly or annual price.

## AI Usage Rules
- AI can be used to generate the monthly report deliverables based on the associated templates.
- AI can monitor subscriber engagement (e.g., report downloads) to flag at-risk accounts.
- The `Product Manager` owns the definition and roadmap for all subscription products.

## Practical Template
| Field | Description |
|---|---|
| **Subscription ID** | `SUB-001` |
| **Subscription Name** | `Thailand Kids Nutrition Monthly Trend Report` |
| **Target Customer** | Product innovation, R&D, and marketing teams at CPG companies operating in or entering the Thai market. |
| **Value Proposition** | "Stay consistently ahead of the competition in the fast-moving Kids Nutrition market. We deliver a concise, data-driven monthly briefing directly to your inbox so you never miss a key trend, new product launch, or emerging signal." |
| **Deliverables** | - **1x Monthly Trend Report (PDF):** A 5-7 page report as defined in the `TREND_REPORT_TEMPLATE.md`.<br>- **1x Monthly Data Update (CSV):** A list of all new products, brands, and companies identified in the market that month. <br>- **Quarterly Analyst Q&A:** A group webinar with our lead analyst for the sector. |
| **Frequency** | Monthly |
| **Pricing** | $299/month or $2,990/year |

---
| Field | Description |
|---|---|
| **Subscription ID** | `SUB-002` |
| **Subscription Name** | `SEA Beauty & Personal Care Data Dashboard` |
| **Target Customer** | Investment analysts, M&A advisors, and corporate strategists focused on the SEA beauty market. |
| **Value Proposition** | "Get real-time access to our curated database of SEA beauty companies, brands, products, and funding. A continuously updated dashboard for tracking market momentum and identifying opportunities." |
| **Deliverables** | - **24/7 Access to a Live Data Dashboard** (e.g., Tableau, PowerBI). <br>- **Full export access** to the underlying `COMPANY_DATABASE` and `FUNDING_DATABASE` (CSV). <br>- **Weekly Email Digest** of key changes. |
| **Frequency** | Continuous |
| **Pricing** | $999/month per seat |

## Success Metrics
- `Monthly Recurring Revenue (MRR)`: The primary success metric.
- `Subscriber Churn Rate`: The percentage of subscribers who cancel each month.
- `Subscriber Engagement`: % of subscribers who download their report or log into the dashboard each month.
