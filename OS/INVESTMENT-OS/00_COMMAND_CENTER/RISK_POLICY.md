# Risk Policy

## Purpose
Set hard rules for capital preservation, exposure, drawdown control, and kill switches.

## Required Fields
- Rule
- Applies to
- Limit
- Trigger
- Required action
- Review owner

## Operating Rules
- Capital preservation first.
- Max loss and exposure limits must be defined before deployment.
- Kill switch rules override return targets.
- If risk cannot be measured, capital cannot be deployed.

## Template
| Rule | Applies To | Limit | Trigger | Required Action | Owner |
|---|---|---|---|---|---|
| Emergency cash reserve | All capital |  | Reserve below target | Stop new deployments | Investment Director |
| Max loss per strategy | Each strategy |  | Loss limit hit | Pause and review | Risk Manager |
| Max exposure per asset class | Portfolio |  | Exposure above limit | Rebalance / reduce | Risk Manager |
| Drawdown rule | Portfolio / strategy |  | Drawdown threshold hit | Reduce risk | Risk Manager |
| Kill switch | High-risk strategies |  | Severe loss / platform risk / exploit | Exit or freeze | Investment Director |
