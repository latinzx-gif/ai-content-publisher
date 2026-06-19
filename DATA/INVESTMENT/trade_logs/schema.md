# Schema: Trade Logs

## Purpose
To define the mandatory data structure for a single trade log entry. This schema ensures that every action is recorded with sufficient detail to allow for accurate performance tracking and later review.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `trade_id` | String | A unique, machine-readable identifier for the trade. | `trade_a1b2c3d4` |
| `strategy_id` | String | The ID of the strategy from `/strategies` that initiated this trade. | `strat_crypto_defi_yield_v1` |
| `trade_date` | DateTime | The ISO 8601 timestamp of when the trade was executed. | `2026-06-05T15:00:00Z` |
| `asset` | String | A clear identifier for the asset being traded. | `ETH/USDC Pool` |
| `action` | String | The type of action taken. Must be one of: `BUY`, `SELL`, `DEPOSIT`, `WITHDRAW`. | `DEPOSIT` |
| `entry_price` | Float | The price at which the position was entered. Null for actions like `DEPOSIT`. | `null` |
| `exit_price` | Float | The price at which the position was exited. Null for `BUY` or `DEPOSIT`.| `null` |
| `size` | Float | The size of the position in the asset's native unit. | `10.5` (e.g., 10.5 LP tokens) |
| `pnl_usd` | Float | The realized Profit and Loss in USD for this trade. Calculated upon exit. Null for entry trades. | `null` |
| `notes` | String | (Optional) Any specific notes about this trade from the executing agent or person. | `"Entering position as APY crossed the 5% threshold."` |

---

### Scoring

-   **No Confidence Score:** Trade logs are records of internal actions, not facts derived from external sources. They are considered ground truth by definition.
-   **Data Integrity:** The primary quality measure is data integrity. Automated checks should ensure that every `SELL` trade corresponds to a prior `BUY` trade for the same asset and strategy, and that PnL calculations are arithmetically correct.
