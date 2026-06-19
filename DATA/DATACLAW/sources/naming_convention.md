# Naming Convention & Update Process: Sources

## Purpose
To define how source records are named and the process by which new sources are added and reviewed.

---

### Naming Convention

-   **Format:** Each source is stored as a single, structured data file.
-   **File Name:** `[source_id].yml`
-   **Example:** `src_techcrunch.yml`

---

### Update Process

The `sources` registry is a living database maintained by the `Validator Agent`.

1.  **Discovery (`Scout Agent`):** When the `Scout Agent` encounters a signal from a URL whose root domain is not in the `/sources` registry, it automatically creates a new task in the `PRIORITY_QUEUE` for the `Validator Agent`: "Review and score new source: `example.com`."
2.  **Review (`Validator Agent`):** The `Validator Agent` picks up the task. It navigates to the source's website and evaluates it against the four dimensions outlined in `SOURCE_QUALITY_RULES.md` (Primary Nature, Timeliness, Objectivity, Verifiability).
3.  **Scoring & Creation:** The agent assigns a score for each dimension, calculates the average to get the final `quality_score`, and creates a new source file (e.g., `src_example_com.yml`) in the `/sources` directory.
4.  **Quarterly Audit:** On a quarterly basis, the `Validator Agent` must perform an audit of the registry.
    -   It re-reviews a random sample of 10% of existing sources to check if their quality has changed.
    -   It flags any sources where `last_review_date` is older than one year for a mandatory re-review.

---

### Source Quality Scoring in the Pipeline

-   When the `Librarian Agent` processes new signals, it prioritizes signals from sources with a higher `quality_score`.
-   When the `Validator Agent` assesses a new `Fact`, the `quality_score` of the cited source is the starting point for determining the fact's final `confidence_score`.
-   The `Analyst Agent` is instructed to weigh facts from high-quality sources more heavily when synthesizing insights.
