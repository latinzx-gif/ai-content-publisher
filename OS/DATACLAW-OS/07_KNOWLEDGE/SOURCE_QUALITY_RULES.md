# Source Quality Rules

## Purpose
To establish a consistent and transparent methodology for evaluating the reliability and trustworthiness of information sources. This ensures all facts within the DataClaw OS are built on a foundation of quality.

## Required Fields
- `Rule ID`: A unique identifier for the rule.
- `Dimension`: The aspect of quality being measured (e.g., Timeliness, Objectivity).
- `Standard`: The specific, measurable standard for that dimension.
- `Scoring Rubric`: How to assign a score (1-10) for that dimension.
- `Example`: A practical example of applying the rule.

## AI Usage Rules
- The `Validator Agent` MUST use this rubric to assign a `Source Confidence Score` to every new Fact.
- AI can be trained to automatically provide a *suggested* score for a new source, but a human must perform the final validation for sources not already in the `SOURCE_REGISTRY.md`.
- The overall `Source Confidence Score` is an average of the dimension scores.

## Practical Template
### Source Confidence Scoring Rubric

A source's overall **Confidence Score (1-10)** is the average of the scores from the following four dimensions:

| Rule ID | Dimension | Standard | Scoring Rubric (1-10) |
|---|---|---|---|
| **SQ-1** | **Primary vs. Secondary** | Facts should come from primary sources (company announcements, official filings, direct interviews) whenever possible. | **10:** Official company press release or government filing. <br> **7:** Reporting from a highly reputable news outlet known for fact-checking (e.g., Bloomberg, Reuters). <br> **5:** A second-hand report, blog, or aggregator site. <br> **2:** An anonymous forum post or unverified social media account. |
| **SQ-2** | **Timeliness** | The information should be as current as possible relative to the event it describes. | **10:** Published within 24 hours of the event. <br> **7:** Published within one week of the event. <br> **5:** Published within one year of the event. <br> **2:** Older than one year or date is unknown. |
| **SQ-3** | **Objectivity & Bias** | The source should present information factually and without a clear promotional, political, or financial agenda that could distort the facts. | **10:** A neutral, data-focused report or filing. <br> **7:** Reputable journalism with clear separation of news and opinion. <br> **5:** A company's own marketing content (e.g., a blog post about their own success). <br> **2:** A clearly biased opinion piece or paid promotional content. |
| **SQ-4** | **Verifiability** | The claims within the source can be cross-referenced with other independent sources. | **10:** Claims are directly supported by at least two other independent, high-quality sources. <br> **7:** Claims are plausible and generally consistent with other known information. <br> **5:** Claims are difficult to verify but not implausible. <br> **2:** Claims are extraordinary and cannot be verified elsewhere. |

### Overall Score Calculation
- A new Fact's `Source Confidence Score` = `(SQ-1 + SQ-2 + SQ-3 + SQ-4) / 4`
- Any source that scores below 5 is considered **"Low Quality"** and should be used with extreme caution and explicit caveats.
- High-value Insights should only be derived from Facts with a `Source Confidence Score` of 7 or higher.
