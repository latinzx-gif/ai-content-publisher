# Naming Convention & Update Process: Insights

## Purpose
To define how insight files are named and the workflow for their creation, which is a core analytical function of the DataClaw OS.

---

### Naming Convention

-   **Format:** Each insight is stored as a single, structured data file.
-   **File Name:** `[insight_id].yml`
-   **Example:** `ins_investment_accel_func_bev_q4.yml`

---

### Update Process

The creation of an insight is a synthesis task performed by the `Analyst Agent`, often prompted by a `Hypothesis` or a task from the `PRIORITY_QUEUE`.

1.  **Tasking (`Product Manager` or `Analyst Agent`):** A task is created, such as "Analyze Q4 funding data for the functional beverage market" or "Investigate hypothesis `hyp_001`."
2.  **Evidence Gathering (`Analyst Agent`):** The `Analyst Agent` queries the various `/DATA` assets (e.g., `/companies`, `/funding`, `/trends`) to gather all relevant, high-confidence `Facts`.
3.  **Synthesis & Creation:** The agent analyzes the collected facts for patterns, correlations, or surprising connections. If a meaningful conclusion can be drawn, the agent:
    -   Creates a new insight file in a `pending_review` sub-folder.
    -   Writes a clear `title` and `summary`.
    -   Populates the `evidence` array with the `Fact IDs` it used.
    -   Populates `related_entities` and `source_references`.
    -   Assigns a `confidence_score` based on the strength of the evidence.
4.  **Human Review:** A human analyst **must** review every new insight before it can be used in a product.
    -   The reviewer checks the logic: Does the evidence truly support the summary?
    -   The reviewer adjusts the `confidence_score` if necessary.
    -   If approved, the reviewer moves the insight file to the main `/insights` directory.
5.  **Product Integration:** Once approved, the insight is now a reusable asset that can be pulled into `Insight Reports`, `Market Maps`, and other intelligence products.
