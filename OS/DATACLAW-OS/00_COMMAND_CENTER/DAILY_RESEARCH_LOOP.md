# Daily Research Loop

## Purpose
To define the daily operational rhythm for the DataClaw team, ensuring a consistent and repeatable process for signal gathering, data enrichment, and analysis.

## Required Fields
- `Phase`: The stage of the loop (e.g., Scan, Log, Analyze, Validate).
- `Time Block`: The suggested time of day for the phase.
- `Owner`: The primary agent or role responsible.
- `Core Task`: The main activity to be performed.
- `Output`: The expected deliverable of the phase.
- `Tool`: The key document or system used.

## AI Usage Rules
- AI agents are the primary "doers" in this loop, executing their core tasks as defined.
- A human `DataClaw Director` or operator should oversee the loop, manage exceptions, and review the final output.
- AI can be used to generate the end-of-day summary report.

## Practical Template
### **DataClaw Daily Operating Rhythm**

| Phase | Time Block | Owner | Core Task | Output | Tool(s) |
|---|---|---|---|---|---|
| **1. Scan** | 08:00 - 10:00 | `Scout Agent` | Execute automated scans of pre-defined sources (news, social media, retail sites) based on active market priorities. | New raw signals and data points. | `MARKET_INDEX.md`, `SOURCE_REGISTRY.md` |
| **2. Log & Triage**| 10:00 - 11:00 | `Librarian Agent` | Log all new signals into the `SIGNAL_LOG.md`. Discard irrelevant noise and categorize signals by market. | A clean, categorized list of new signals for the day. | `SIGNAL_LOG.md` |
| **3. Analyze & Enrich** | 11:00 - 14:00 | `Analyst Agent` | Process signals from the log. Convert raw signals into structured facts and add them to the appropriate `DATA_ASSETS`. Identify insights, hypotheses, and unknowns. | Enriched Data Assets. New entries in `HYPOTHESIS_TRACKER.md` and `UNKNOWN_LIST.md`. | `DATA_ASSET_INDEX.md`, `SIGNAL_LOG.md` |
| **4. Validate** | 14:00 - 16:00 | `Validator Agent` | Review all new facts added today. Check sources against `SOURCE_QUALITY_RULES.md` and assign a confidence score. Flag contradictions. | Verified facts with confidence scores. New entries in `CONTRADICTION_LOG.md`.| `DATA_ASSETS`, `SOURCE_REGISTRY.md` |
| **5. Review & Prioritize**| 16:00 - 17:00 | `DataClaw Director` | Review the `INTELLIGENCE_DASHBOARD`. Assess the day's progress, resolve flagged contradictions, and adjust priorities in the `PRIORITY_QUEUE.md` for tomorrow. | An updated `PRIORITY_QUEUE.md` and a clear focus for the next day. | `INTELLIGENCE_DASHBOARD.md`, `PRIORITY_QUEUE.md`|

## Success Metrics
- `Daily Signals Processed`: Number of new signals successfully moved through the entire loop each day.
- `Fact Creation Rate`: Number of new, validated facts added to the Data Assets daily.
- `Loop Completion Rate`: % of days where all 5 phases are completed successfully.
