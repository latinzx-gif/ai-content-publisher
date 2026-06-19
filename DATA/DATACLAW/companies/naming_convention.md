# Naming Convention & Update Process: Companies

## Purpose
To define how company data files are named and how records are updated, ensuring a predictable and auditable data management process.

---

### Naming Convention

-   **Format:** Each company should be stored as a single, structured data file (e.g., YAML, JSON, or a row in a master CSV).
-   **File Name:** `[company_id].yml`
-   **Example:** `comp_healthy_kids_co_th.yml`

This convention ensures that every file has a unique, predictable name that directly links to its ID in the schema.

---

### Update Process

The creation and updating of company records follow a strict, multi-step workflow rooted in the `DAILY_RESEARCH_LOOP`.

1.  **Signal Identification (`Scout Agent`):** The `Scout Agent` identifies a potential new company from a raw data source and logs it in the `/signals` directory.
2.  **Structuring (`Librarian Agent`):** The `Librarian Agent` takes the raw signal and structures it into a new company file according to the `schema.md`. The file is placed in a `pending_review` sub-folder. At this stage, the `confidence_score` is `0`.
3.  **Validation (`Validator Agent`):** The `Validator Agent` picks up the file from the queue. It performs the following checks:
    -   **Source Verification:** It checks the original source against the `SOURCE_QUALITY_RULES.md` and assigns a score.
    -   **Fact Corroboration:** It attempts to find at least one other independent source to verify the company's existence and key details.
    -   **Scoring:** It assigns the final `confidence_score` to the record.
4.  **Finalization:** If the record passes validation (e.g., `confidence_score` >= 5), it is moved into the main `companies` directory. If it fails, it is moved to an `archived` or `quarantined` folder for review.

---

### Source Quality Scoring

-   Every company record **must** be tied to a primary source via its `source_id`.
-   The quality of this source is the primary input for the record's `confidence_score`.
-   The rubric for scoring a source is defined in `DATACLAW-OS/07_KNOWLEDGE/SOURCE_QUALITY_RULES.md`. A source is evaluated on its timeliness, objectivity, and verifiability.
