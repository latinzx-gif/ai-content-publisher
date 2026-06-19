# Naming Convention & Update Process: Agent Packs

## Purpose
To define how agent pack records are named and the workflow for their submission, review, and publication on the marketplace.

---

### Naming Convention

-   **Format:** Each agent pack is represented by a single, structured data file.
-   **File Name:** `[pack_id]_[version].yml`
-   **Example:** `pack_seo_content_auditor_v1.0.0.yml`
-   **Versioning:** A new file is created for each new version submitted by a creator, allowing for a full version history.

---

### Update Process (The Publishing Pipeline)

The agent pack lifecycle is managed by the `Marketplace Manager`.

1.  **Submission (`Creator`):** An `Active` creator submits a new agent pack (or a new version of an existing pack). A new record is created in the registry with a status of `Pending-Review`.
2.  **Review (`Marketplace Manager`):** The `Marketplace Manager` is notified of the new submission. They review the pack against two key documents:
    -   **`SUBMISSION_STANDARD.md`:** Does the pack include all the required components (code, documentation, manifest)?
    -   **`QUALITY_STANDARD.md`:** Does the pack function correctly? Is it useful, safe, and well-documented?
3.  **Decision:**
    -   **If Approved:** The manager changes the status to `Approved`. They may assign an internal `quality_score`. The creator is notified.
    -   **If Rejected:** The manager changes the status to `Rejected` and provides specific, actionable feedback to the creator based on the standards that were not met.
4.  **Publication (`Creator` or `Marketplace Manager`):** An `Approved` pack can be published. The creator or manager changes the status to `Live`. At this point, the agent pack becomes visible in the public marketplace and is available for download/purchase.
5.  **Archiving:** If a creator releases a new version (e.g., `v1.1.0`), the old version (`v1.0.0`) can be moved to `Archived` status. It is no longer publicly listed but its records are kept.
