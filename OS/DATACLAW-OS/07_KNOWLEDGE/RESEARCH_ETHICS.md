# Research Ethics

## Purpose
To establish a clear set of ethical guidelines for all research and data collection activities at DataClaw. This ensures we operate with integrity and respect for privacy, and maintain the trust of our sources, customers, and the public.

## Required Fields
- `Principle`: A core ethical principle.
- `Guideline`: Specific, actionable rules that support the principle.
- `Violation Example`: A clear example of what would violate the guideline.
- `Consequence`: The action to be taken in case of a violation.

## AI Usage Rules
- AI agents MUST operate within these ethical boundaries.
- Any AI-driven research pipeline (`Scout Agent`, etc.) must have its source list and methods audited against these rules.
- AI cannot be used to de-anonymize private data or attempt to access non-public information.
- AI-generated text for reports must be reviewed for plagiarism and proper attribution.

## Practical Template
### **DataClaw Code of Research Ethics**

| Principle | Guideline | Violation Example | Consequence |
|---|---|---|---|
| **1. Respect for Privacy** | We will not collect, store, or publish Personally Identifiable Information (PII) unless it has been made explicitly public by the individual for a professional purpose (e.g., a LinkedIn profile). | Scraping a private social media group for member information. | Immediate termination of the research task. Purge of the collected data. |
| **2. Transparency of Sources** | We will always cite our sources. All facts in our system must be traceable to a public or permissibly obtained source. | Stating a company's revenue as a "Fact" without linking to the financial report or press release where it was found. | The "Fact" is reclassified as an "Unknown" until a source is provided. The responsible agent is flagged for review. |
| **3. Intellectual Honesty** | We will rigorously uphold the `FIHU` framework, never presenting hypotheses as facts or insights without supporting evidence. We will acknowledge uncertainties and contradictions. | Publishing a "Market Map" that shows a company as a "Leader" based on opinion or incomplete data, without stating the limitations. | The product is recalled for revision. A post-mortem is conducted by the `DataClaw Director`. |
| **4. Avoidance of Deception** | Our research methods will be honest. We will not use deceptive means (e.g., fake identities, social engineering) to obtain information. | A `Scout Agent` using a fake persona to join a private industry Slack channel to gather information. | Immediate deactivation of the agent. A full audit of the agent's past activities. |
| **5. Respect for Copyright** | We will respect intellectual property. Large-scale scraping of copyrighted content for verbatim inclusion in our products is forbidden. Data should be extracted, transformed, and cited. | Copying and pasting an entire analyst report from another firm into one of our own reports. | The product is recalled. Legal review is initiated. |

## Success Metrics
- `Ethical Violations Reported`: Number of reported ethical violations per quarter. (Goal: 0).
- `Source Citation Rate`: % of facts in the database with a valid source URL. (Goal: 100%).
- `PII Scan Results`: Number of PII instances found during routine audits of the database. (Goal: 0).
