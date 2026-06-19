# Naming Convention & Update Process: Capital Allocation

## Purpose
To define how capital allocation files are named and the process for reviewing and updating the portfolio's strategic targets.

---

### Naming Convention

-   **Format:** There should be only one master allocation file for the active portfolio.
-   **File Name:** `master_portfolio_allocation.yml`
-   **Archive:** At the end of each quarter or after a major strategy change, the current file should be archived with a date stamp (e.g., `master_portfolio_allocation_2026_q2.yml`).

---

### Update Process

The capital allocation is a strategic document updated through a formal review process.

1.  **Quarterly Review:** The `Investment Director` and `Portfolio Manager` conduct a mandatory quarterly review of the investment strategy.
2.  **Proposal:** Based on market conditions and past performance, the `Investment Director` proposes new `target_allocation` percentages. This might involve increasing allocation to successful strategies or reducing exposure to underperforming ones.
3.  **Update `target_allocation`:** The `target_allocation` field in the `master_portfolio_allocation.yml` file is updated with the new percentages. The `last_updated` field is also updated.
4.  **Automatic Update of `actual_allocation`:** A scheduled script or agent (`Portfolio Manager` agent) runs daily. It reads all open positions from the `trade_logs`, calculates their current market value, and updates the `actual_allocation` field in this file to reflect the real-time state of the portfolio.
5.  **Rebalancing Trigger:** If the calculated `deviation_score` (the difference between target and actual allocation) exceeds a predefined threshold (e.g., 5%), an alert is sent to the `Investment Director` to consider rebalancing activities.
