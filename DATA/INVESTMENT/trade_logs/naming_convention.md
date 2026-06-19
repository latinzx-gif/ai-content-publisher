# Naming Convention & Update Process: Trade Logs

## Purpose
To define how trade log files are named and the immutable, append-only process for recording trades.

---

### Naming Convention

-   **Format:** Trade logs should be stored in a way that is easy to query and aggregate. A single, append-only master file is preferred over many small files.
-   **File Name:** `trade_log_master.csv` or a database table.
-   **Archiving:** At the end of each month, the log can be rolled over, with the previous month's log being archived.
    -   `trade_log_2026_05.csv`
    -   `trade_log_2026_06.csv`

---

### Update Process

The trade log is an **append-only** ledger.

1.  **Trade Execution:** An agent or human executes a trade based on the rules of an `Active` strategy from the `/strategies` playbook.
2.  **Immediate Logging:** Immediately after the trade is confirmed by the exchange or protocol, a new entry is appended to the `trade_log_master.csv`.
    -   All fields (`trade_id`, `strategy_id`, `asset`, `action`, `entry_price`, `size`, etc.) are populated.
3.  **No Modification:** Once a record is written, it **cannot be altered or deleted**.
4.  **Handling Errors:** If an error is made in a trade or a log entry, it is corrected by appending a new, counteracting trade. For example, if a `BUY` was logged incorrectly, a corresponding `SELL` is logged at the same price to neutralize the position in the records, along with a note explaining the correction.
5.  **Closing Positions:** When a position is closed (a `SELL` or `WITHDRAW` action), the `pnl_usd` is calculated (`(exit_price - entry_price) * size`) and populated for that closing trade's record.

This immutable, append-only process ensures a fully auditable and trustworthy history of all investment activities, which is the foundation for all performance analysis.
