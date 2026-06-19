# Schema: Reports

## Purpose
To define the metadata structure for a finished intelligence report. This ensures that every report has consistent versioning, status, and linkage to the underlying data it was built from.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `report_id` | String | A unique, machine-readable identifier. | `rep_th_func_bev_map_2026_q3` |
| `product_id` | String | The ID of the product from the `PRODUCT_CATALOG.md` that this report fulfills. | `PROD-001` |
| `version` | String | A version identifier for the report, typically a date stamp. | `2026.09.15` |
| `title` | String | The full, customer-facing title of the report. | `Thai Functional Beverage Market Map - Q3 2026` |
| `status` | String | The production status. Must be one of: `In-Production`, `Needs-Review`, `Approved-for-Sale`. | `Approved-for-Sale` |
| `asset_snapshot`| Array[String]| A list of the key Data Asset IDs that were used to generate this report. This creates an audit trail. | `["DA-001", "DA-002", "DA-005"]`|
| `file_path` | String | The relative path to the final report file (e.g., PDF, CSV). | `/reports/published/rep_th_func_bev_map_2026_q3.pdf` |
| `author` | String | The lead agent or analyst responsible for producing the report. | `Analyst Agent` |

---

### Confidence & Quality Scoring

-   **No Direct Score:** The report itself does not have a single `confidence_score`. Its quality is a reflection of the confidence scores of the underlying data assets used to create it.
-   **Quality Control:** A report can only be moved to `Approved-for-Sale` status after a human review. The reviewer must check:
    1.  **Data Consistency:** Do the claims in the report align with the data in the `asset_snapshot`?
    2.  **Narrative Clarity:** Is the report easy to understand for the target customer?
    3.  **Template Adherence:** Does the report follow the correct template (e.g., `MARKET_MAP_TEMPLATE.md`)?
