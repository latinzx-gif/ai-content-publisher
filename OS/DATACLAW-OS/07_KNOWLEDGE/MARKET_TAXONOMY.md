# Market Taxonomy

## Purpose
To create a standardized, hierarchical classification system for all markets, industries, and sectors that DataClaw tracks. This ensures data can be aggregated, compared, and analyzed consistently across the entire OS.

## Required Fields
- `Taxonomy Version`: The version of this document.
- `Level 1`: Broad industry group (e.g., Consumer Goods, Technology).
- `Level 2`: Specific market (e.g., Food & Beverage, Software).
- `Level 3`: Niche or sub-market (e.g., Functional Beverages, B2B SaaS).
- `Level 4`: Micro-niche (e.g., Nootropic Drinks, Vertical SaaS for Hospitality).
- `Inclusion/Exclusion Criteria`: Clear rules for what belongs in a given category.

## AI Usage Rules
- All new companies, products, and brands MUST be tagged with a valid taxonomy path (e.g., `Consumer Goods > Food & Beverage > Functional Beverages`).
- AI agents (`Scout Agent`, `Librarian Agent`) MUST use this document as the source of truth for categorization.
- AI can suggest new taxonomy categories when it encounters a signal that doesn't fit the existing structure, but a human must approve the addition.

## Practical Template
**Taxonomy Version:** 1.0

| Level 1 | Level 2 | Level 3 | Level 4 | Inclusion/Exclusion Criteria |
|---|---|---|---|---|
| **Consumer Goods** | | | | Products sold directly to consumers for personal use. |
| | **Food & Beverage** | | | Edible goods and drinks. Excludes pet food. |
| | | **Functional Beverages**| | Drinks marketed with specific health or cognitive benefits. |
| | | | `Nootropic Drinks` | Beverages containing ingredients claimed to boost cognitive function. |
| | | | `Energy Drinks` | Beverages with high levels of stimulants like caffeine. |
| | | **Snacks** | | |
| | | **Beauty & Personal Care** | | Cosmetics, skincare, haircare, etc. |
| | | | `Skincare` | |
| | | | `Cosmetics` | |
| | **Pet Products** | | | Products for domesticated animals. |
| | | **Pet Food** | | |
| | | **Pet Care Services**| | |
| **Technology** | | | | Software, hardware, and IT services. |
| | **Software** | | | |
| | | **B2B SaaS** | | Software-as-a-Service sold to other businesses. |
| | | | `Vertical SaaS` | SaaS tailored for a specific industry (e.g., hospitality, legal).|
| | **Healthcare Tech** | | | Technology solutions for the healthcare industry. |
| | | **Telemedicine** | | |
| **Healthcare** | | | | Medical services, pharmaceuticals, etc. Excludes Healthcare Tech. |
| | **Providers** | | | Hospitals, clinics, etc. |
| | **Pharmaceuticals** | | | |

## Success Metrics
- `Taxonomy Coverage`: % of data assets that are correctly tagged with a taxonomy path.
- `Query Accuracy`: Success rate of queries that rely on the taxonomy to filter or aggregate data.
- `New Category Requests`: Number of monthly requests for new categories, indicating the need for expansion.
