# Fact, Insight, Hypothesis, and Unknown Framework

## Purpose
To establish a rigorous epistemological framework for all information within DataClaw. This ensures that we maintain the highest standard of intellectual honesty, clearly distinguishing between what we know, what we think, and what we need to find out. This is a core principle of the entire OS.

## Required Fields
- `Type`: Fact / Insight / Hypothesis / Unknown.
- `Definition`: A clear, non-ambiguous definition for each type.
- `Rules`: Strict rules for how each type of information is created, stored, and used.
- `Example`: A practical example for each type.

## AI Usage Rules
- AI agents MUST classify all new information into one of these four types.
- An AI agent CANNOT create an "Insight" without citing at least two underlying "Facts".
- An AI agent CANNOT present a "Hypothesis" as a "Fact".
- AI can be used to scan for "Facts" that might support or refute an existing "Hypothesis".

## Practical Template
### The FIHU Framework

**1. Fact**
- **Definition:** A discrete, verifiable piece of information from a specific, cited source. It is objective and contains no analysis or opinion.
- **Rules:**
    - Must have a `Source URL` and a `Source Confidence Score`.
    - Must be stored in a structured `DATA_ASSET`.
    - Must not contain speculative language.
- **Example:**
    - `Fact`: "Company A announced a $10M Series A funding round on Jan 5, 2026."
    - `Source`: "TechCrunch, https://techcrunch.com/..."
    - `Confidence`: 9/10

**2. Insight**
- **Definition:** A conclusion, correlation, or "so what" that is derived from synthesizing two or more Facts. It is a logical leap based on evidence.
- **Rules:**
    - Must cite the underlying `Fact IDs` that support it.
    - Must include an `Insight Confidence Score` based on the strength of the underlying facts and the logic of the synthesis.
    - Stored within `INSIGHT_REPORT_TEMPLATE` or as part of a product's narrative.
- **Example:**
    - `Insight`: "Investment in the Thai 'functional beverage' market is accelerating, with a 50% increase in total funding in Q4 2025 compared to Q4 2024."
    - `Supporting Facts`: [FACT-010, FACT-015, FACT-021]
    - `Confidence`: 8/10

**3. Hypothesis**
- **Definition:** A testable prediction or a potential explanation for a phenomenon that is not yet supported by sufficient facts. It is a forward-looking statement about what *might* happen or *could* be true.
- **Rules:**
    - Must be logged in the `HYPOTHESIS_TRACKER.md`.
    - Must be framed as a question or a testable statement (e.g., "We believe X will happen because of Y").
    - Must have a clear "Validation Condition" (what would need to be true to turn it into an insight or fact).
- **Example:**
    - `Hypothesis`: "The entry of Brand Z into the Thai market will cause a >15% price drop in competing energy drinks within 6 months."
    - `Validation Condition`: Track pricing data for competing products for 6 months post-launch.

**4. Unknown**
- **Definition:** A specific, critical question that the organization needs to answer to reduce risk or identify an opportunity. It is a known gap in our knowledge.
- **Rules:**
    - Must be logged in the `UNKNOWN_LIST.md`.
    - Must be specific and actionable. "What is the market size?" is a bad Unknown. "What was the total 2025 revenue for Brand X's 'Healthy Kids' snack line in Thailand?" is a good Unknown.
    - Answering a high-priority "Unknown" should become a task in the `PRIORITY_QUEUE.md`.
- **Example:**
    - `Unknown`: "What is the specific distribution network (number of stores, key distributors) for Company A's products in upcountry Thailand?"
