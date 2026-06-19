# Naming Convention & Update Process: Reviews

## Purpose
To define how review documents are named and the process for conducting and recording review meetings.

---

### Naming Convention

-   **Format:** Each review's output is stored as a single, structured data file.
-   **File Name:** `[review_type]_[review_date].yml`
-   **Example:** `weekly_2026_06_06.yml`, `quarterly_strategy_2026_q2.yml`

---

### Update Process

The review process is a recurring, scheduled event on the OS calendar.

1.  **Preparation (Automated):** Before the meeting, an agent prepares a draft review document.
    -   It creates a new file with the correct name.
    -   It pre-populates the `review_date` and `attendees`.
    -   It pulls the latest report from the `/performance` directory and uses an LLM to generate a draft `performance_summary`.
    -   It lists the action items from the previous week's review.
2.  **Meeting (`Investment Director` & `Portfolio Manager`):** The team conducts the review meeting using the draft document as an agenda.
    -   They discuss the performance summary.
    -   They analyze specific trades from the `trade_logs`.
    -   They discuss what went right and what went wrong, and articulate the key `lessons_learned`.
    -   They agree on a set of `action_items` for the upcoming week or month.
3.  **Finalization:** Immediately after the meeting, the `Portfolio Manager` updates the review file with the final `lessons_learned` and `action_items`. The file is then committed and serves as the official record of the meeting.
4.  **Action Tracking:** Action items from the review are automatically added to the `OPPORTUNITY_QUEUE` or a similar task management system to ensure they are tracked to completion.
