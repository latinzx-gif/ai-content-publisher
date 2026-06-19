# Naming Convention & Update Process: Opportunities

## Purpose
To define how opportunity files are named and the workflow for their evaluation and promotion into formal strategies.

---

### Naming Convention

-   **Format:** Each opportunity is stored as a single, structured data file.
-   **File Name:** `[opportunity_id].yml`
-   **Example:** `opp_tesla_earnings_volatility.yml`

---

### Update Process

The opportunity pipeline is managed by the `Portfolio Manager`.

1.  **Idea Generation (`Opportunity Scout`):** The `Opportunity Scout` agent, or any team member, identifies a potential new opportunity. They create a new opportunity file in this directory with a status of `Idea`.
2.  **Initial Triage (`Portfolio Manager`):** The `Portfolio Manager` reviews all new `Idea` files weekly.
    -   If an idea is clearly unviable or out of scope, it is moved to `Rejected`.
    -   If an idea has merit, it is moved to `Under-Review` and a `review_date` is set.
3.  **Deep Dive Review (`Portfolio Manager`):** On the `review_date`, the `Portfolio Manager` performs a deeper analysis of the opportunity. This may involve light backtesting or scenario analysis.
4.  **Decision:**
    -   **Promote to Strategy:** If the opportunity is promising and looks repeatable, the `Portfolio Manager` changes the status to `Approved-for-Strategy`. This triggers the creation of a new, corresponding file in the `/strategies` directory with a status of `Research`. The opportunity has now officially entered the strategy development pipeline.
    -   **Reject:** If the analysis shows the opportunity is not viable, the status is changed to `Rejected`, and notes are added explaining why.
    -   **Shelve:** If the idea is good but not right for the current market, it can be left as `Under-Review` with a future `review_date`.
