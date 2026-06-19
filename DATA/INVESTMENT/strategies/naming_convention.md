# Naming Convention & Update Process: Strategies

## Purpose
To define how strategy documents are named and the workflow for their research, approval, and activation.

---

### Naming Convention

-   **Format:** Each strategy is stored as a single, structured data file.
-   **File Name:** `[strategy_id].yml`
-   **Example:** `strat_crypto_defi_yield_v1.yml`
-   **Versioning:** The `strategy_id` should include a version number (e.g., `_v1`). If a strategy's core rules are significantly changed, it should be saved as a new version (e.g., `_v2`) to allow for clean performance attribution.

---

### Update Process

Strategies follow a rigorous lifecycle from idea to execution.

1.  **Research (`Opportunity Scout`):** The `Opportunity Scout` agent identifies a potential new strategy and creates a new strategy file with a status of `Research`. It fills in a draft of the `strategy_thesis` and potential rules.
2.  **Backtesting & Analysis (`Portfolio Manager`):** The `Portfolio Manager` (a human role in this case) reviews the research. They may perform historical backtesting or paper trading to validate the thesis. They refine the `entry_rules`, `exit_rules`, and `risk_rules`.
3.  **Approval (`Investment Director`):** Once the strategy is fully defined and analyzed, it is presented to the `Investment Director` for approval. The Director assesses if the strategy aligns with the overall portfolio goals and risk policy. If approved, the status is changed to `Approved`.
4.  **Activation:** An `Approved` strategy can now be allocated capital according to the `master_portfolio_allocation.yml`. Once the first trade is executed using this strategy, its status changes to `Active`.
5.  **Review & De-activation:** All `Active` strategies are reviewed quarterly. If a strategy is consistently underperforming or if its underlying thesis is no longer valid, the `Investment Director` can move its status to `Paused` (no new positions allowed) or `Deprecated` (all existing positions should be exited).
