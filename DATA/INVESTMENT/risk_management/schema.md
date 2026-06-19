# Schema: Risk Management

## Purpose
To define the data structure for the global risk policy document. This ensures all critical risk parameters are explicitly defined and can be referenced by automated systems.

---

### Required Fields

A single `global_risk_policy` record is maintained.

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `policy_version` | String | The version of the current risk policy. | `1.1` |
| `last_updated` | DateTime | The ISO 8601 timestamp of when this policy was last updated. | `2026-06-01T10:00:00Z` |
| `max_portfolio_drawdown_pct`| Float | The maximum acceptable drawdown for the total portfolio over any period. A "kill switch" trigger. | `20.0` |
| `max_daily_loss_pct` | Float | The maximum acceptable loss for the total portfolio in a single 24-hour period. | `5.0` |
| `exposure_limits` | Array[Object] | A set of rules defining maximum allocation to any single asset, sector, or strategy. | `[{"type": "single_strategy", "limit_pct": 25}, {"type": "single_asset", "limit_pct": 10}]` |
| `stop_rules` | Array[String]| Global rules for stop-losses that can apply to individual trades, even if not in the strategy. | `["All single-stock equity trades must have a hard stop-loss at -15% of entry price."]` |
| `kill_switch_rules` | Array[String]| A checklist of events that trigger an immediate, automated "kill switch" to move all positions to cash. | `["1. `max_portfolio_drawdown_pct` is breached.", "2. `max_daily_loss_pct` is breached.", "3. The Investment Director issues a manual kill switch command."]` |

---

### Scoring

-   **Not Applicable:** This is a policy document and does not have a confidence score. Its effectiveness is measured by the performance metrics in the `/performance` directory (i.e., by the absence of catastrophic drawdowns).
