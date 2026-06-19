# Schema: Strategies

## Purpose
To define the mandatory data structure for a single strategy document. This schema ensures that every strategy is well-defined, with clear rules for execution and risk management, before any capital is deployed.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `strategy_id` | String | A unique, machine-readable identifier. | `strat_crypto_defi_yield_v1` |
| `strategy_name`| String | A human-readable name for the strategy. | `DeFi Stablecoin Yield Farming v1` |
| `asset_class` | String | The primary asset class for this strategy (e.g., `Crypto`, `Equities`, `Bonds`). | `Crypto` |
| `status` | String | The current status of the strategy. Must be one of: `Research`, `Approved`, `Active`, `Paused`, `Deprecated`. | `Active` |
| `strategy_thesis`| String | A clear, concise explanation of why this strategy is expected to be profitable. | `"This strategy earns yield by providing liquidity to audited, blue-chip stablecoin pairs (USDC/USDT) on decentralized exchanges. The thesis is that the yield from trading fees will outweigh the risk of impermanent loss over a >30 day period."` |
| `entry_rules` | Array[String]| A specific, non-ambiguous checklist of conditions that must be met to enter a position. | `["1. APY is > 5%", "2. Protocol TVL is > $100M", "3. Protocol has been audited by a top-tier firm."]` |
| `exit_rules` | Array[String]| A specific, non-ambiguous checklist of conditions that trigger the exit of a position. | `["1. APY drops below 3%", "2. A critical security vulnerability is announced.", "3. Target profit of 10% is reached."]` |
| `risk_rules` | Array[String]| Specific risk management rules for this strategy. | `["1. Max position size is 5% of total portfolio.", "2. Never use unaudited protocols."]` |

---

### Scoring

-   **No Confidence Score:** A strategy is a plan, not a fact, so a confidence score is not applicable.
-   **Performance Score:** The success of a strategy is not scored here but is calculated in the `/performance` directory by analyzing the PnL of all trades associated with this `strategy_id` in the `trade_logs`.
