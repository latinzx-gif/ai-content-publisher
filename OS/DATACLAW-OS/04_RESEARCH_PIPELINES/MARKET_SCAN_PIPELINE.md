# Market Scan Pipeline

- **ID:** PIPE-001
- **Version:** 1.0
- **Status:** Active
- **Owner:** `Scout Agent`, `Librarian Agent`, `Validator Agent`

---

### 1. Purpose
To provide a systematic, repeatable workflow for performing a broad scan of a defined market. The goal is to discover and ingest new **Facts** (Companies, Brands, Products) and **Signals** (news, discussions) into the DATA layer, forming the foundation for all future analysis.

### 2. When to Use This Pipeline
- When a new market is added to `DATACLAW-OS/01_MARKETS/`.
- During a scheduled quarterly refresh of an existing market to find new entrants.
- When tasked by the `Product Manager` to build the initial data asset for a new intelligence product.

### 3. Inputs Required
- `market_name`: The target market (e.g., "Thailand Kids Functional Beverage").
- `keywords`: An array of primary search keywords (e.g., `["DHA drink kids", "brain health supplement child", "นมเด็กบำรุงสมอง"]`).
- `initial_sources`: An array of `source_id`s from the `/DATA/DATACLAW/sources/` registry to start the scan (e.g., `["src_bangkokpost", "src_lazada_th"]`).

### 4. Output Artifacts
- New records in `/DATA/DATACLAW/signals/`.
- New `pending_review` records in `/DATA/DATACLAW/companies/`, `/brands/`, and `/products/`.
- A summary report (`market_scan_report_[date].md`) listing the number of signals and new entities found.

### 5. Step-by-Step Workflow

**Phase 1: Scouting (Owner: `Scout Agent`)**
1.  **[ ] Source Expansion:** From the `initial_sources`, perform secondary searches to find 10-20 additional relevant sources (e.g., industry forums, trade publications, e-commerce category pages). Log any new domains for the `Validator Agent` to score later.
2.  **[ ] Keyword Execution:** For each source, execute searches using the provided `keywords`.
3.  **[ ] Signal Capture:** For every relevant search result (a news article, a product page, a company website), create a new "signal" file in `/DATA/DATACLAW/signals/`. The `raw_content` should be a concise summary or snippet (e.g., "Found company 'Brainy-Tots Co.' at URL xyz.com, describes itself as 'DHA-enriched milk tablets'").

**Phase 2: Structuring (Owner: `Librarian Agent`)**
4.  **[ ] Triage Signals:** Review all `New` signals in the `/signals` directory for the given `market_name`. Discard irrelevant signals (change status to `Discarded`).
5.  **[ ] Entity Registration:** For each valid signal, check if the mentioned company, brand, or product already exists in the `/DATA/DATACLAW/entity_registry/`.
6.  **[ ] Create Pending Records:**
    - If an entity is new, first create a record in the `entity_registry`.
    - Then, create a new, structured record in the `pending_review` folder of the appropriate data directory (e.g., `/companies/pending_review/comp_brainy_tots.yml`).
    - Link the record back to the `signal_id`. Set its initial `confidence_score` to `0`.
7.  **[ ] Update Signal Status:** Once processed, change the signal's status to `Processed`.

**Phase 3: Validation (Owner: `Validator Agent`)**
8.  **[ ] Review Pending Queue:** Process all files in the `pending_review` folders.
9.  **[ ] Source & Fact Check:** For each record, review the original source URL. Score the source if it's new. Attempt to corroborate the key facts with one other independent source.
10. **[ ] Assign Confidence:** Assign a final `confidence_score` to the record based on the source quality and corroboration.
11. **[ ] Promote to Main:** If the record passes validation (`confidence_score` > 5), move it from `/pending_review` into the main data directory (e.g., `/companies/`).

### 6. Source Quality Rules
- This pipeline adheres to the rules defined in `DATACLAW-OS/07_KNOWLEDGE/SOURCE_QUALITY_RULES.md`.
- Priority is always given to primary sources (company websites, government registries) over secondary sources (news articles, blogs).

### 7. Fact / Insight / Hypothesis / Unknown Separation
- This pipeline's primary purpose is to generate **Facts** (validated companies, products, etc.) from **Signals**.
- If the `Scout Agent` or `Analyst Agent` cannot verify a piece of information, it should be logged as an **Unknown** (e.g., "Unknown: What is the price of product X?").
- If a pattern is observed during the scan (e.g., "Multiple new companies are using 'Ginkgo Biloba'"), it should be logged as a **Hypothesis** for later analysis, not as an Insight. This pipeline does not create Insights.

### 8. Signal Scoring System
- To prioritize the `Librarian Agent`'s work, incoming signals are given a simple priority score: `(Source Quality Score) + (Keyword Relevance Score)`.
- A signal from a known, high-quality source that contains multiple keywords is processed first.

### 9. Data Capture Format
- All created records MUST strictly adhere to the schemas defined in their respective `/DATA/DATACLAW/[entity]/schema.md` files.

### 10. Validation Checklist
- [ ] Is the source URL valid and accessible?
- [ ] Does the entity name match the source?
- [ ] Is the entity's category correctly assigned from the `MARKET_TAXONOMY`?
- [ ] Has the source been scored according to the quality rubric?
- [ ] Can at least one key fact be corroborated elsewhere?
- [ ] Has a final `confidence_score` been assigned?

### 11. Stop Conditions
- The pipeline run is considered complete when all initial sources have been scanned and all resulting `New` signals have been moved to `Processed` or `Discarded` status.

### 12. Example Run
- **Topic:** Thailand Kids Brain Drink / DHA / Functional Beverage
- **Inputs:** `market_name: "TH Kids Brain Health"`, `keywords: ["DHA for kids", "อาหารเสริมบำรุงสมองเด็ก", "นม DHA สูง"]`, `initial_sources: ["src_lazada_th", "src_shopee_th"]`
- **Expected Workflow:**
    1. `Scout Agent` scans Lazada and Shopee for the keywords.
    2. It finds 30 product listings. It creates 30 `signal` files.
    3. `Librarian Agent` discards 5 irrelevant signals. It processes the remaining 25. It identifies 10 new products, 8 new brands, and 3 new companies.
    4. It creates records for these entities in the `pending_review` folders.
    5. `Validator Agent` reviews the pending records. It validates 9/10 products, 7/8 brands, and 3/3 companies, assigning confidence scores.
    6. `Librarian Agent` moves the validated records into the main `products/`, `brands/`, and `companies/` directories.
- **Output:** 9 new product records, 7 new brand records, 3 new company records.

### 13. How Outputs Should Be Promoted
- **DATA Layer:** Validated records (facts) created by this pipeline are immediately promoted into the main `/DATA/DATACLAW` directories and are considered durable assets.
- **HERMES-BRAIN:** This pipeline does **not** directly promote anything to HERMES-BRAIN. However, if the `Validator Agent` repeatedly encounters a new, high-quality source type, it can create a proposal to update the `SOURCE_QUALITY_RULES.md` in `DATACLAW-OS/07_KNOWLEDGE/`, which may later be promoted to `HERMES-BRAIN/KNOWLEDGE/`.

### 14. What This Pipeline Must Not Do
- This pipeline **must not** generate analytical insights. It is a data collection and structuring workflow only.
- It **must not** contact any company or person directly. All data is gathered from public, open sources.
- It **must not** create customer-facing `reports`. It only creates the raw data assets.
