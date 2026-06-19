# Naming Convention & Update Process: Risk Management

## Purpose
To define how the global risk policy document is named and the formal process for its review and update.

---

### Naming Convention

-   **Format:** There is only one active risk policy document.
-   **File Name:** `global_risk_policy.yml`
-   **Archiving:** Before any changes are made, the existing file should be copied and archived with a version or date stamp (e.g., `global_risk_policy_v1.1.yml`).

---

### Update Process

The risk policy is a top-level governance document and is updated with extreme care.

1.  **Trigger for Review:** A review of the risk policy can be triggered by:
    -   A scheduled quarterly review.
    -   A major market event.
    -   The portfolio approaching a drawdown limit.
    -   A recommendation from the `Risk Manager` or `Portfolio Manager`.
2.  **Proposal:** A proposed change to any rule (e.g., changing `max_daily_loss_pct` from 5% to 7%) is drafted and presented to the investment committee. The proposal must include a rationale and a stress-test analysis.
3.  **Approval (`Investment Director`):** The `Investment Director` must give final approval for any change to the `global_risk_policy.yml` file. This is a critical decision and must be logged in the `/reviews` directory.
4.  **Implementation:**
    -   The `global_risk_policy.yml` file is updated with the new rule.
    -   The `policy_version` is incremented (e.g., from 1.1 to 1.2).
    -   Any automated trading or monitoring agents are immediately restarted to ensure they are operating on the new risk parameters.

This strict, human-in-the-loop process ensures that the core risk framework of the portfolio cannot be changed without formal review and approval.
