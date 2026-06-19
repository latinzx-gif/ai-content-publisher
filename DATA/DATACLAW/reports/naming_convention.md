# Naming Convention & Update Process: Reports

## Purpose
To define how final report files are named and the workflow for their production and approval.

---

### Naming Convention

-   **Format:** The final, customer-facing file should be named clearly and include versioning.
-   **File Name:** `[product_id]_[version].[ext]`
-   **Example:** `PROD-001_2026_Q3.pdf` (for the Thai Functional Beverage Market Map)

A metadata file for the report should also be created.
-   **Metadata File Name:** `[report_id].yml`
-   **Example:** `rep_th_func_bev_map_2026_q3.yml`

---

### Update Process (Report Production)

The production of a report is a high-level workflow managed by the `Product Manager`.

1.  **Initiation (`Product Manager`):** The `Product Manager` initiates a new report by creating a task in the `PRIORITY_QUEUE.md`. Example: "Produce Q3 version of PROD-001".
2.  **Execution (`REPORT_PRODUCTION_PIPELINE.md`):** The `Analyst Agent` follows the defined pipeline for that product type.
    -   It queries the necessary `DATA_ASSETS` to get the latest validated facts.
    -   It synthesizes insights and generates the narrative and visualizations.
    -   It populates the appropriate template (e.g., `MARKET_MAP_TEMPLATE.md`).
    -   It saves the draft report file and creates a metadata file with `status: Needs-Review`.
3.  **Review (Human Analyst/Editor):** A human reviews the draft report.
    -   They check for errors, clarity, and narrative flow.
    -   They provide feedback or make edits.
    -   If the report is accurate and meets quality standards, they approve it.
4.  **Finalization (`Product Manager`):**
    -   The reviewer updates the report's metadata file to `status: Approved-for-Sale`.
    -   The `Product Manager` moves the final PDF/CSV file to the `/published` sub-directory, making it available for sale.

---

### Source Quality Scoring

-   The quality of a report is a direct function of the quality of the underlying data assets it is built upon.
-   The `REPORT_PRODUCTION_PIPELINE.md` for any given product **must** include a rule to "Exclude any facts with a `confidence_score` below 6."
-   Any insights or claims in the report derived from lower-confidence data must be explicitly called out with a disclaimer (e.g., "This analysis is based on preliminary data...").
