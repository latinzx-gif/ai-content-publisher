# Schema: Entity Registry

## Purpose
To define a generic, lightweight schema that can be used to register any type of named entity, ensuring a consistent identification system across the OS.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `entity_id` | String | A unique, machine-readable identifier, prefixed by type. | `comp_apple_inc` |
| `canonical_name` | String | The official or most common name for the entity. | `Apple Inc.` |
| `entity_type` | String | The classification of the entity. Must be one of: `Company`, `Brand`, `Product`, `Ingredient`, `Retailer`, `Technology`, `Claim`, `Person`.| `Company` |
| `description` | String | A brief, one-sentence description to disambiguate the entity. | `An American multinational technology company headquartered in Cupertino, California.` |
| `related_asset_id`| String | (Optional) The ID of the full record for this entity in another data asset. | `comp_apple` (from `/companies`) |

---

### Confidence & Quality Scoring

-   **No Confidence Score:** An entity record itself does not have a confidence score. It is simply a pointer. The confidence is stored in the `related_asset_id` record within its respective data directory (e.g., the confidence for `Apple Inc.` is stored in its record in the `/companies` data).
-   **Source Quality:** The source for creating an entity should be of high quality, but the scoring is formally attached to the more detailed record in the other data assets, not here.
