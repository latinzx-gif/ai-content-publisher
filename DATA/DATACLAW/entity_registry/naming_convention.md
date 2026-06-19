# Naming Convention & Update Process: Entity Registry

## Purpose
To define how entities are named and to establish the workflow for registering a new entity, which is a critical first step before adding it to any other data asset.

---

### Naming Convention

-   **Format:** Each entity is stored as a single, structured data file.
-   **File Name:** `[entity_id].yml`
-   **Example:** `comp_apple_inc.yml`
-   **ID Structure:** The `entity_id` should be prefixed with a short code for its type (e.g., `comp_`, `brand_`, `ingr_`) followed by a URL-safe version of its name.

---

### Update Process

The entity registration process is a prerequisite for data entry elsewhere.

1.  **Check for Existence (`Librarian Agent`):** Before creating a new record in any data asset (e.g., adding a new company), the `Librarian Agent` MUST first search the `entity_registry` to see if the entity already exists.
2.  **Creation (If New):**
    -   If the entity does **not** exist, the `Librarian Agent` creates a new entity file in this directory first.
    -   It generates a new `entity_id`.
    -   It fills in the `canonical_name`, `entity_type`, and a brief `description`.
    -   The `related_asset_id` is left null for now.
3.  **Linkage:**
    -   The `Librarian Agent` then proceeds to create the full record in the appropriate data asset directory (e.g., `/companies`).
    -   The new record in the `/companies` directory will use the `entity_id` generated in the previous step.
    -   Finally, the agent updates the `related_asset_id` field in the `/entity_registry` file to point to the new, detailed record, completing the two-way link.

This "register-then-create" process prevents duplicates and ensures that every piece of data in the DataClaw OS can be linked back to a canonical entity.
