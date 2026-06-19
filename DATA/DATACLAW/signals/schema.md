# Schema: Signals

## Purpose
To define the minimum required structure for a "signal" record. The schema is lightweight to allow for rapid logging of diverse information types.

---

### Required Fields

| Field Name | Data Type | Description | Example |
|---|---|---|---|
| `signal_id` | String | A unique, machine-readable identifier, typically a hash of the source URL and timestamp. | `sig_a1b2c3d4e5f6` |
| `timestamp` | DateTime | The ISO 8601 timestamp of when the signal was captured. | `2026-05-15T10:30:00Z` |
| `source_url` | String | The precise URL where the information was found. | `https://example.com/news/article-123`|
| `source_id` | String | The ID of the source from the `/sources` registry, if known. | `src_techcrunch` |
| `signal_type` | String | The type of information captured. Must be one of: `Company`, `Brand`, `Product`, `Trend`, `Funding`, `Other`. | `Funding` |
| `raw_content` | String | The raw text snippet, data point, or observation that was captured. | `"ABC Startup just announced it has raised a $5M seed round led by Alpha Ventures."` |
| `status` | String | The processing status. Must be one of: `New`, `Processed`, `Discarded`. | `New` |

---

### Confidence & Quality Scoring

-   **No Confidence Score:** Individual signals do **not** have a `confidence_score`. They are raw and unverified by definition. Confidence is only assigned later in the workflow when a signal is processed into a `Fact`.
-   **Source Quality Scoring:** While the signal itself isn't scored, the `source_id` links to the `/sources` registry, which has a quality score. The `Librarian Agent` uses the source quality score to prioritize which `New` signals to process first. Signals from high-quality sources are processed before those from low-quality sources.
