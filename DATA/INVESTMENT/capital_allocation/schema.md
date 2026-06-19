# Schema: Capital Allocation

## Purpose
To define the data structure for the portfolio's allocation targets. This schema allows for a clear comparison between the planned strategy and the current state of the portfolio.

---

### Required Fields

A single `portfolio_allocation` record is maintained.

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `portfolio_id` | String | A unique identifier for this allocation plan. | `main_portfolio_2026` |
| `last_updated` | DateTime | The ISO 8601 timestamp of when this allocation was last updated. | `2026-06-01T09:00:00Z` |
| `target_allocation` | Array[Object] | An array of objects defining the desired allocation percentage for each strategy or asset class. The sum of all `percentage` values should be 100. | `[{"strategy_id": "strat_long_term_equity", "percentage": 60}, {"strategy_id": "strat_crypto_yield", "percentage": 20}]` |
| `actual_allocation` | Array[Object] | An array of objects showing the current, real-time allocation percentage. This is calculated automatically by a script that aggregates positions from `trade_logs`. | `[{"strategy_id": "strat_long_term_equity", "percentage": 62.5}, {"strategy_id": "strat_crypto_yield", "percentage": 17.5}]` |
| `notes` | String | Any high-level notes from the `Investment Director` about the current allocation strategy. | `"Slightly overweight equities due to recent market momentum. Plan to rebalance if deviation exceeds 5%."`|

---

### Scoring

-   **No Confidence Score:** This is a top-level planning document, not a record derived from external sources, so a confidence score is not applicable.
-   **Deviation Score:** A `deviation_score` can be calculated automatically as the sum of the absolute differences between `target_allocation` and `actual_allocation` for each strategy. A high score triggers a rebalancing alert.
