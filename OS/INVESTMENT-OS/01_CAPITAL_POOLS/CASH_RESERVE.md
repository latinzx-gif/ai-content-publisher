# Cash Reserve

## Purpose
Protect emergency liquidity and prevent forced selling during drawdowns.

## Required Fields
- Target reserve
- Current reserve
- Currency
- Location
- Liquidity
- Shortfall / excess
- Action

## Operating Rules
- Cash reserve is not trading capital.
- Do not deploy below emergency reserve target.
- Keep liquidity high and counterparty risk low.

## Template
| Currency | Amount | Location | Liquidity | Target | Gap | Action |
|---|---:|---|---|---:|---:|---|
|  |  | Bank / Broker / Money Market / Stablecoin | Immediate / T+1 / T+2 |  |  | Add / Hold / Reduce |
