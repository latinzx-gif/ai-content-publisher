# Schema: Opportunities

## Purpose
To define the data structure for a single opportunity record. This schema ensures that every new idea is evaluated against a consistent set of strategic and risk-based criteria.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `opportunity_id` | String | A unique, machine-readable identifier. | `opp_tesla_earnings_volatility`|
| `opportunity_name` | String | A short, descriptive name for the idea. | `Short-term volatility play on TSLA earnings` |
| `status` | String | The current status. Must be one of: `Idea`, `Under-Review`, `Approved-for-Strategy`, `Rejected`.| `Under-Review` |
| `opportunity_thesis` | String | A brief explanation of why this opportunity might be profitable. | `"TSLA implied volatility is historically high leading into earnings. A short options strangle could profit from post-earnings volatility crush."` |
| `asset_class` | String | The asset class involved (e.g., `Equities`, `Options`, `Crypto`). | `Options` |
| `expected_return_pct` | Float | A rough, back-of-the-envelope estimate of the potential return. | `15` |
| `risk_score` | Integer | A subjective score (1-10) of the perceived risk, where 10 is highest risk. | `8` |
| `review_date` | Date | The date this opportunity is scheduled to be reviewed by the `Portfolio Manager`. | `2026-06-10` |
| `notes` | String | (Optional) Any links, charts, or further thoughts. | `"Requires careful management of position sizing due to high gamma risk."`|

---

### Scoring

-   **Risk Score:** This is a subjective score assigned by the `Opportunity Scout` or `Portfolio Manager` upon creation. It is based on factors like asset volatility, complexity of the thesis, and potential max loss. An opportunity with a `risk_score` > 8 requires approval from the `Investment Director` before being developed into a strategy.
