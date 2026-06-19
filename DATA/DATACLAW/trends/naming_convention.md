# Naming Convention & Update Process: Trends

## Purpose
To define how trend data files are named and how they are identified, created, and maintained over time.

---

### Naming Convention

-   **Format:** Each trend is stored as a single, structured data file.
-   **File Name:** `[trend_id].yml`
-   **Example:** `trend_plant_based_kids_snacks.yml`

---

### Update Process

The identification of trends is a primary function of the `Analyst Agent` and is a key part of the `WEEKLY_REVIEW` process.

1.  **Trend Spotting (`Analyst Agent`):** On a continuous basis, the `Analyst Agent` looks for clusters of related information across the data assets. It may be tasked to "Find trends in the `/products` data where `key_features` include 'plant-based'".
2.  **Hypothesis Creation:** When a potential trend is spotted, it is first logged as a `Hypothesis` in the `HYPOTHESIS_TRACKER.md` (e.g., "Hypothesis: 'Plant-based' is a growing trend in kids' snacks.").
3.  **Evidence Gathering (`Scout Agent` & `Analyst Agent`):** A task is added to the `PRIORITY_QUEUE.md` to find evidence that supports or refutes the hypothesis. The `Scout Agent` looks for more signals, and the `Analyst Agent` looks for more connections between existing facts.
4.  **Trend Formalization (`Analyst Agent`):** Once sufficient evidence is gathered (e.g., 5+ strong facts), the `Analyst Agent` formalizes the trend. It creates a new trend file in the `/trends` directory, populating the `evidence` array with the supporting `Fact IDs` and `Signal IDs`. It assigns an initial `status` (usually `Emerging` or `Growing`) and a `confidence_score`.
5.  **Quarterly Review:** All trends in a `Growing` or `Mature` state must be reviewed quarterly by a human analyst. The analyst re-evaluates the evidence, updates the `status` and `confidence_score`, and sets the `last_reviewed` date. Trends that are no longer supported by new evidence may be downgraded to `Declining`.

---

### Source Quality Scoring

-   The confidence score of a trend is **indirectly** affected by source quality.
-   A trend is only as strong as the evidence supporting it. If the `evidence` array consists of facts that themselves have low `confidence_scores` (because they came from poor sources), then the `confidence_score` for the trend itself must also be low.
-   The `Analyst Agent` must factor in the aggregate quality of its sources when determining the trend's confidence.
