# Naming Convention & Update Process: Brands

## Purpose
To define how brand data files are named and how brand records are created and maintained, ensuring a clear and auditable linkage to parent companies.

---

### Naming Convention

-   **Format:** Each brand is stored as a single, structured data file.
-   **File Name:** `[brand_id].yml`
-   **Example:** `brand_kid_vitals_th.yml`

This convention ensures each brand file is uniquely identifiable and can be easily retrieved.

---

### Update Process

The creation of a brand record typically follows the creation of a company record.

1.  **Linkage Identification (`Analyst Agent`):** After a company has been validated, the `Analyst Agent` is tasked to "Identify all brands for `company_id`." The agent scans the company's website, product pages, and official announcements.
2.  **Structuring (`Librarian Agent`):** For each identified brand, the `Librarian Agent` creates a new, structured brand file in a `pending_review` sub-folder. The `company_id` field is populated, creating the critical link between the two assets. The initial `confidence_score` is `0`.
3.  **Validation (`Validator Agent`):** The `Validator Agent` reviews the pending brand file.
    -   It verifies the source that confirms the brand's existence and its ownership by the specified company.
    -   It assigns a `confidence_score` based on the strength of this evidence.
4.  **Finalization:** If the brand record is validated, it is moved to the main `brands` directory. If the link between brand and company cannot be confidently established, the file is quarantined for further review.

---

### Source Quality Scoring

-   The confidence in a brand record is highly dependent on the quality of the source that establishes its link to a parent company.
-   An official company website or a financial filing provides a **High-Quality** source (Score: 8-10).
-   A reputable news article or trade publication provides a **Medium-Quality** source (Score: 6-7).
-   A third-party retail site listing the brand under a company name is a **Low-Quality** source (Score: 4-5), as it could be a distributor relationship, not an ownership one.
-   The rubric for scoring sources is defined in `DATACLAW-OS/07_KNOWLEDGE/SOURCE_QUALITY_RULES.md`.
