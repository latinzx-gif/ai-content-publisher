# Schema: Products

## Purpose
To define the mandatory data structure for a single product (SKU) record. This schema is designed to capture not just what the product is, but also the specific features that drive its market positioning.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `product_id` | String | A unique, machine-readable identifier. | `prod_kid_vitals_apple_bar` |
| `product_name` | String | The full public name of the product. | `Kid-Vitals Apple & Cinnamon Bar` |
| `brand_id` | String | The ID of the brand from the `/brands` asset that owns this product. | `brand_kid_vitals_th` |
| `product_category` | String | A granular category within the brand's market. | `Snack Bar` |
| `status` | String | The current market status. Must be one of: `Announced`, `In-Market`, `Discontinued`.| `In-Market` |
| `key_features` | Array[String] | An array of key features, claims, or ingredients. This is a critical field for trend analysis. | `["Organic", "No Added Sugar", "Vitamins A, C, D"]`|
| `source_id` | String | The ID of the primary source where this product was identified (e.g., retail site, press release). | `src_tops_online_2026_01_11` |
| `confidence_score`| Integer | An overall confidence score (1-10) for the accuracy of this product record. | `7` |

---

### Confidence Scoring

The `confidence_score` for a product record is determined by the `Validator Agent` and is based on:
- **Source Quality:** Is the product listed on an official brand website (high quality) or a third-party marketplace with user-generated content (lower quality)?
- **Data Richness:** How complete is the `key_features` list? Does it capture the most important attributes of the product?
- **Recency:** When was this product listing last seen or verified? A product verified yesterday is more reliable than one last seen a year ago.
