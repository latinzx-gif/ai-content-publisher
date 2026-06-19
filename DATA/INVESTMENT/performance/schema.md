# Schema: Performance

## Purpose
To define the data structure for a periodic performance report. This schema ensures that key metrics are calculated and tracked consistently over time.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `report_id` | String | A unique identifier for the performance report. | `perf_monthly_2026_05` |
| `report_period` | String | The timeframe this report covers. | `May 2026` |
| `report_scope` | String | The scope of the report (e.g., `Total Portfolio`, `strat_crypto_defi_yield_v1`). | `Total Portfolio` |
| `monthly_return_pct` | Float | The percentage return for the period. | `5.2` |
| `max_drawdown_pct` | Float | The maximum peak-to-trough decline during the period. | `-2.1` |
| `win_rate_pct` | Float | The percentage of closed trades that were profitable. | `65.0` |
| `profit_factor` | Float | Gross profits divided by gross losses. | `2.5` |
| `sharpe_proxy` | Float | A simplified Sharpe Ratio (e.g., avg daily return / std dev of daily return). A measure of risk-adjusted return. | `1.8` |
| `notes` | String | (Optional) Analyst notes on the period's performance. | `"Performance was strong, driven by the crypto yield strategy. Equity strategy was flat."` |

---

### Scoring

-   **Not Applicable:** Performance metrics are objective calculations, not scored for confidence. Their accuracy depends entirely on the integrity of the `/trade_logs` data.
