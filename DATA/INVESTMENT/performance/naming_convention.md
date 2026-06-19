# Naming Convention & Update Process: Performance

## Purpose
To define how performance reports are named and the automated process for their generation.

---

### Naming Convention

-   **Format:** Each performance report is a single, structured data file.
-   **File Name:** `[report_scope]_[report_period].yml`
-   **Example:** `total_portfolio_2026_05.yml`, `strat_crypto_defi_yield_v1_2026_05.yml`

---

### Update Process

Performance reports are generated automatically by a script or agent at the end of each period.

1.  **Trigger:** At the end of each month (or week/day), an automated process is triggered.
2.  **Data Aggregation:** The process reads the entire `trade_log_master.csv` for the given period.
3.  **Metric Calculation:** It calculates each of the required metrics (`monthly_return_pct`, `max_drawdown_pct`, etc.) based on the PnL and dates of the trades.
    -   It can perform this calculation for the `Total Portfolio`.
    -   It can also group trades by `strategy_id` to generate a separate performance report for each active strategy.
4.  **Report Generation:** For each scope (portfolio and each strategy), the process generates a new performance file (e.g., `total_portfolio_2026_05.yml`) and saves it to this directory.
5.  **Dashboard Update:** The creation of a new `Total Portfolio` performance report can trigger an update to the `CAPITAL_DASHBOARD.md` in the `INVESTMENT-OS`.

This automated process ensures that performance is reviewed consistently and without manual calculation errors.
