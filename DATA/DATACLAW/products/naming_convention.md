# Naming Convention & Update Process: Products

## Purpose
To define how individual product data files are named and how they are discovered, structured, and validated.

---

### Naming Convention

-   **Format:** Each product is stored as a single, structured data file.
-   **File Name:** `[product_id].yml`
-   **Example:** `prod_kid_vitals_apple_bar.yml`

This convention allows for easy lookup and management of millions of potential SKUs.

---

### Update Process

The product discovery process is a key activity of the `Scout Agent`.

1.  **Product Discovery (`Scout Agent`):** The `Scout Agent` is tasked to "Scan retailer X for new products in category Y" or "Scan brand website Z for its product catalog." It scrapes product names, features, and other details from these sources. Each finding is logged as a raw signal in the `/signals` directory.
2.  **Structuring (`Librarian Agent`):** The `Librarian Agent` takes the raw product signals, cleans the data (e.g., normalizes feature names), links the product to a known `brand_id`, and creates a structured product file in the `pending_review` sub-folder.
3.  **Validation (`Validator Agent`):** The `Validator Agent` reviews the pending product file.
    -   It verifies that the `brand_id` link is correct.
    -   It spot-checks the `key_features` against the source URL to ensure accuracy.
    -   It assigns a final `confidence_score`.
4.  **Finalization:** Validated product files are moved to the main `products` directory. Products that cannot be verified or appear to be duplicates are quarantined.

---

### Source Quality Scoring

-   Product data is often noisy, so source quality is critical.
-   An **official brand or corporate website** is the highest quality source (Score: 9-10).
-   A **major, well-structured e-commerce platform** (e.g., Amazon, Lazada) is a medium-high quality source (Score: 7-8).
-   A **smaller, independent retail website** is a medium quality source (Score: 5-6).
-   A **press release or news article** mentioning the product is a medium quality source (Score: 5-7).
-   A **social media post or price aggregator site** is a low-quality source (Score: 2-4) and should primarily be used for signal generation, not for creating the base record.
-   The rubric for scoring sources is defined in `DATACLAW-OS/07_KNOWLEDGE/SOURCE_QUALITY_RULES.md`.
