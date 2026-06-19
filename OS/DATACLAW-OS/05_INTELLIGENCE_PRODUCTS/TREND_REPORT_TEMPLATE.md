# Trend Report Template

## Purpose
To define the standard structure for all trend-focused intelligence products. This template is functionally identical to the `INSIGHT_REPORT_TEMPLATE` but is kept separate to allow for future divergence if needed.

## Required Fields
- `Report Title`: The full title (e.g., "Thailand Kids Nutrition Monthly Trend Report").
- `Month/Year`: The reporting period.
- `Executive Summary`: A one-paragraph summary of the most critical findings.
- `Section 1: Key Trends in Focus`: A deep dive into 2-3 significant, growing trends.
- `Section 2: New & Noteworthy Launches`: A curated gallery of recent product launches that exemplify the trends.
- `Section 3: Weak Signals & Future Watch`: Analysis of emerging signals that could become future trends.
- `Section 4: Data Dashboard`: A collection of key charts and data points for the month.
- `Methodology & Disclaimer`: Explanation of how the data was gathered and its limitations.

## AI Usage Rules
- The `Analyst Agent` is the primary author of this report.
- AI can generate the first draft of each section based on structured data from the `DATA_ASSETS` and `SIGNAL_REGISTRY`.
- For example, "Summarize the top 3 trends from the `TREND_DATABASE` for the 'Kids Nutrition' market" or "Describe the key features of these 5 new `product_ids`."
- A human editor MUST review the entire report for narrative flow, clarity, and accuracy before publication.

## Practical Template
---
### **[Report Title] - [Month/Year]**

**1. Executive Summary**
*   [A brief paragraph summarizing the month's key movements. Example: "This month, the Thai kids nutrition market saw a significant push towards plant-based protein snacks from two major incumbents, while three new startups launched products featuring low-sugar, natural sweeteners. We are also tracking a weak signal around fortified juices for cognitive development..."]

---

**2. Key Trends in Focus**

*   **Trend 1: [Trend Name, e.g., "Plant-Based Protein Integration"]**
    *   **What it is:** [Description of the trend].
    - **Why it matters:** [Analysis of the market impact].
    - **Supporting Data:** [Chart showing growth, or list of supporting `Fact IDs`].

*   **Trend 2: [Trend Name, e.g., "Sugar Reduction & Natural Sweeteners"]**
    *   [...analysis...]

---

**3. New & Noteworthy Launches**

*   **Product 1: [Product Name]** by [Brand Name]
    *   **Image/Link:** [URL to product]
    *   **Analysis:** [Brief on its positioning, key features, and potential impact].

*   **Product 2: [Product Name]** by [Brand Name]
    *   [...analysis...]

---

**4. Weak Signals & Future Watch**
*   **Signal 1: [Signal Description, e.g., "Increased mention of 'cognitive health' on parenting forums"]**
    *   **Hypothesis:** [Our hypothesis, e.g., "We believe there is an emerging demand for kids' products that support focus and learning."].
    *   **What we are watching:** [Specific data points we will track to validate this].

---

**5. Data Dashboard**
*   [Chart: Top 5 Ingredients Mentioned in New Launches This Month]
*   [Table: Average Price per 100g for Kids Snacks, by Brand]

---

**Methodology & Disclaimer**
*   [Standard text explaining that data is gathered from public sources, tracked in the DataClaw OS, and analyzed by our team of agents and analysts. Includes standard disclaimers.]
