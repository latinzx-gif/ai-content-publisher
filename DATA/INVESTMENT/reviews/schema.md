# Schema: Reviews

## Purpose
To define the data structure for a single review meeting's minutes. This ensures that every review is structured, captures key insights, and results in actionable tasks.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `review_id` | String | A unique, machine-readable identifier. | `review_weekly_2026_w23` |
| `review_date` | Date | The date the review took place. | `2026-06-06` |
| `review_type` | String | The type of review. Must be one of: `Weekly`, `Monthly`, `Quarterly-Strategy`, `Post-Mortem`. | `Weekly` |
| `attendees` | Array[String]| A list of the roles or individuals present. | `["Investment Director", "Portfolio Manager"]` |
| `performance_summary` | String | A brief, qualitative summary of the performance during the period. | `"The portfolio was up 1.5% this week, primarily driven by the 'strat_crypto_defi_yield_v1' strategy. The equity book was flat."` |
| `lessons_learned` | Array[String]| A list of specific, durable lessons learned during the review. | `["Lesson: We are exiting profitable trades too early in the current trend.", "Lesson: The risk model for Strategy X did not account for weekend volatility."]` |
| `action_items` | Array[Object]| A list of concrete action items, each with an owner and due date. | `[{"action": "Adjust exit rules for 'strat_long_term_equity'", "owner": "Portfolio Manager", "due": "2026-06-12"}]` |

---

### Scoring

-   **Not Applicable:** Review documents are qualitative summaries and do not have a confidence score. Their value is in the quality of the `lessons_learned` and the completion rate of the `action_items`.
