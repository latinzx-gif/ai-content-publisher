# Capital Allocation

## Purpose
Define how capital is allocated across core investments, yield, trading, cash reserve, and experiments.

## Required Fields
- Capital pool
- Target allocation
- Current allocation
- Drift
- Rebalance action
- Review date

## Operating Rules
- Never deploy capital without a pool, strategy, risk score, exit rule, and review date.
- Do not increase high-risk allocation during drawdown.
- Keep emergency cash separate from investment and trading capital.

## Template
| Pool | Target % | Current % | Drift | Action | Review Date |
|---|---:|---:|---:|---|---|
| Cash Reserve |  |  |  | Hold / Add / Reduce |  |
| Investment Capital |  |  |  | DCA / Rebalance / Hold |  |
| Trading Capital |  |  |  | Deploy / Reduce / Pause |  |
| Experiment Capital |  |  |  | Test / Stop / Review |  |
