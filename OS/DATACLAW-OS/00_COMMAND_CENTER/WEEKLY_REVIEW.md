# Weekly Review

## Purpose
To provide a structured format for the weekly team-wide review meeting. The goal is to assess progress against quarterly goals, resolve strategic blockers, and set the high-level focus for the upcoming week.

## Required Fields
- `Meeting Date`: The date of the review.
- `Attendees`: Roles or individuals present.
- `Quarterly Goal Check-in`: Review of progress against the big picture.
- `Last Week's Metrics`: Performance of core KPIs.
- `Product & Asset Review`: Demo of new assets or products.
- `Strategic Discussion`: Deep dive into a key risk or opportunity.
- `This Week's Priorities`: High-level goals for the next 5 days.

## AI Usage Rules
- AI can be used to pre-populate the "Last Week's Metrics" section by summarizing data from the `INTELLIGENCE_DASHBOARD.md` and `REVENUE_TRACKER.md`.
- AI can transcribe the meeting and summarize key decisions and action items.
- All strategic decisions and priority settings must be human-led.

## Practical Template
### **DataClaw Weekly Strategic Review**

**Meeting Date:** {{DATE}}
**Attendees:** `DataClaw Director`, `Product Manager`, Lead Analyst

---

**1. Quarterly Goal Check-in**
*   **Goal:** Launch 3 intelligence products by end of quarter.
*   **Status:** 🟡 At Risk. Only 1 product (`Market Map`) is on track. The other two have not been started.

---

**2. Last Week's Metrics Review**
*   `Weekly Revenue`: $0 (Pre-launch)
*   `New Facts Validated`: 350 (Target: 500/week)
*   `Data Asset Coverage (Functional Beverage)`: 45% (Target: 80%)
*   `Pipeline Velocity`: 8 tasks/week (Target: 10)

---

**3. Product & Asset Demo**
*   `Product Manager` presents the final v1 `MARKET_MAP_TEMPLATE.md`.
*   Feedback is gathered and one minor change is requested.

---

**4. Strategic Discussion**
*   **Topic:** "New Fact Validation" metric is below target.
*   **Root Cause:** The `Validator Agent` is spending too much time on low-quality sources identified by the `Scout Agent`.
*   **Decision:** We will dedicate one research cycle this week to overhaul the `SOURCE_REGISTRY.md` and deprecate all sources with a quality score below 5/10.

---

**5. This Week's Top 3 Priorities**
1.  **Launch Product #1:** Generate and list the "Functional Beverage Market Map" for sale.
2.  **Improve Source Quality:** Complete the `SOURCE_REGISTRY.md` overhaul.
3.  **Start Product #2:** Define the MVP for the "Thai Beauty Market Company Database" product.

## Success Metrics
- `Action Item Completion Rate`: % of action items from the previous week's meeting that were completed.
- `Strategic Decisions Made`: Number of key decisions made per meeting that unblock the team.
