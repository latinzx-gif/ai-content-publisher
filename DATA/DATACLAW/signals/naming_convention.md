# Naming Convention & Update Process: Signals

## Purpose
To define how raw signals are captured, named, and processed through the initial stage of the intelligence pipeline.

---

### Naming Convention

-   **Format:** Each signal is stored as a single, lightweight file.
-   **File Name:** `[timestamp]_[signal_id].yml`
-   **Example:** `2026-05-15T103000Z_sig_a1b2c3d4e5f6.yml`

The timestamp in the filename allows for easy chronological sorting and processing.

---

### Update Process

The signal workflow is the very first step in the `DAILY_RESEARCH_LOOP`.

1.  **Capture (`Scout Agent`):** The `Scout Agent` runs its pre-defined scans (`MARKET_SCAN_PIPELINE`, etc.). For every potentially relevant piece of information it finds, it creates a new signal file in the `signals` directory with a status of `New`.
2.  **Triage (`Librarian Agent`):** The `Librarian Agent` reads all `New` signals.
    -   If a signal is clearly irrelevant or spam, its status is changed to `Discarded`.
    -   If a signal is relevant, the Librarian proceeds to the next step.
3.  **Processing (`Librarian Agent` & `Analyst Agent`):**
    -   The agent takes the `raw_content` from the signal.
    -   It creates a new, structured data record in the appropriate data asset's `pending_review` folder (e.g., a new file in `/companies/pending_review/`).
    -   Once the new, structured record is created, the original signal's status is changed to `Processed`.
4.  **Archiving:** At the end of each day, all signals with a status of `Processed` or `Discarded` are moved to an archive folder (e.g., `/signals/archive/YYYY-MM-DD/`) to keep the main directory clean.

This process ensures that every piece of raw information is captured and that there is a clear, auditable trail from a raw signal to a structured, validated fact.
