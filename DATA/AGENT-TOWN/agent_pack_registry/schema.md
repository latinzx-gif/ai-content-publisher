# Schema: Agent Pack Registry

## Purpose
To define the mandatory data structure for a single agent pack record. This schema ensures that all products in our catalog are consistently defined, versioned, and linked to their creators.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `pack_id` | String | A unique, machine-readable identifier for the pack. | `pack_seo_content_auditor` |
| `pack_name` | String | The public-facing name of the agent pack. | `SEO Content Auditor` |
| `creator_id` | String | The ID of the creator from the `/creator_registry` who owns this pack. | `creator_jane_doe` |
| `version` | String | The semantic version number of the pack. | `1.0.0` |
| `category_id` | String | The primary category from the `/categories` directory. | `cat_marketing` |
| `status` | String | The current lifecycle status. Must be one of: `Draft`, `Pending-Review`, `Approved`, `Rejected`, `Live`, `Archived`. | `Live` |
| `description`| String | A short, one-sentence description of what the pack does. | `"Analyzes a piece of content against a target keyword and provides an SEO score and recommendations."`|
| `price_usd` | Float | The price for a one-time download or subscription. | `49.00` |
| `last_submitted`| Date | The date the pack was last submitted for review. | `2026-06-10` |
| `quality_score`| Integer | (Optional) An internal score (1-10) assigned during the review process, based on the `QUALITY_STANDARD.md`.| `9` |

---

### Scoring & Performance

-   **Quality Score:** This is an internal metric assigned by the `Marketplace Manager` during the review process. It is not shown to the public but is used to rank packs internally and provide feedback to creators.
-   **User Ratings:** Public-facing quality is determined by user-submitted ratings, which are stored in the `/reviews` data asset.
