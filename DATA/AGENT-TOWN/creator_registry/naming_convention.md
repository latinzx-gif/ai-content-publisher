# Naming Convention & Update Process: Creators

## Purpose
To define how creator records are named and the workflow for onboarding, managing, and offboarding creators from the marketplace.

---

### Naming Convention

-   **Format:** Each creator's record is stored as a single, structured data file.
-   **File Name:** `[creator_id].yml`
-   **Example:** `creator_jane_doe.yml`

---

### Update Process

The creator lifecycle is managed by the `Creator Manager`.

1.  **Application:** A prospective creator applies to join the marketplace. This creates a new creator file with a status of `Pending-Review`.
2.  **Vetting (`Creator Manager`):** The `Creator Manager` reviews the application, checking the creator's background, expertise, and potential value to the marketplace.
3.  **Approval:** If the creator is approved, their status is changed to `Active`, the `join_date` is set, and they are guided through the process of setting up their `payout_info` (e.g., connecting a Stripe account).
4.  **Performance Updates (Automated):** A scheduled script runs daily or weekly. It aggregates data from the `/downloads` and `/revenue` directories to update the `total_downloads` and `total_revenue_usd` fields for each creator.
5.  **Status Changes (`Creator Manager`):**
    -   If a creator violates the platform's terms of service, their status may be changed to `Suspended`.
    -   If a creator chooses to leave the platform, their status is changed to `Retired`. Their agent packs may be transferred or delisted.

This process ensures that there is a clear, managed pipeline for the supply side of the marketplace.
