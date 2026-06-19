# Schema: Sources

## Purpose
To define the mandatory data structure for a single source record. This schema ensures that every source is consistently evaluated and that its quality score is transparent and auditable.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `source_id` | String | A unique, machine-readable identifier, typically derived from the domain name. | `src_techcrunch` |
| `source_name` | String | The common name of the publication, website, or database. | `TechCrunch` |
| `root_url` | String | The root URL of the source. | `https://techcrunch.com` |
| `source_type` | String | The classification of the source. Must be one of: `News`, `Trade Publication`, `Government`, `Corporate Blog`, `Financial Filing`, `Forum`, `Social Media`. | `News` |
| `quality_score`| Integer | An overall quality score (1-10) based on the rubric in `SOURCE_QUALITY_RULES.md`. | `8` |
| `last_review_date`| Date | The last time the `Validator Agent` reviewed this source's quality score. | `2026-01-15` |
| `notes` | String | Any important context about the source. | `Strong for funding news, but can be promotional.`|

---

### Confidence & Quality Scoring

-   **Source Quality Score:** The `quality_score` is the central feature of this asset. It is determined by the `Validator Agent` by applying the detailed rubric found in `DATACLAW-OS/07_KNOWLEDGE/SOURCE_QUALITY_RULES.md`.
-   **Rubric Dimensions:** A source is scored based on four key dimensions:
    1.  **Primary vs. Secondary Nature:** Is it an original source or a report on a report?
    2.  **Timeliness:** How quickly does it report on events?
    3.  **Objectivity & Bias:** Does the source have an agenda that might distort the facts?
    4.  **Verifiability:** Are its claims generally supported by other sources?
-   **Impact:** This score directly influences the `confidence_score` of every `Fact` that cites this source. It is the first link in the quality chain.
