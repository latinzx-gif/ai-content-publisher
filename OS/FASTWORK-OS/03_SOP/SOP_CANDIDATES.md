# SOP Candidates

## Purpose
To identify and document processes from a project that are good candidates for being turned into formal Standard Operating Procedures (SOPs). This is the first step in creating a repeatable, scalable operation.

## Format
Each candidate includes a description of the process and the potential value of standardizing it.

---

### **SOP-CANDIDATE-001: New Prompt Feature QA**

- **Source Process:** The quality assurance process performed after the V2.1 prompt architecture was implemented, as documented in `PROMPT_V2_1_QA_REPORT.md`.
- **Description:** A multi-step checklist to verify that a new prompt feature or architecture has been implemented correctly and safely.
    1.  **Scope Adherence:** Verify that only the intended files were modified.
    2.  **Feature Checklist:** Confirm that all specified technical requirements of the new feature are present in the code.
    3.  **Typecheck Validation:** Run the project's type checker (e.g., `npm run typecheck`) to ensure no new type errors were introduced.
    4.  **Risk Assessment:** Review the implementation for potential new risks (e.g., increased cost, latency, LLM confusion) and document them.
    5.  **Final Verdict:** Issue a formal `PASS`, `PASS_WITH_RISKS`, or `FAIL` verdict.
- **Value of Standardization:** Ensures that all changes to the mission-critical prompt engine are vetted with the same rigor, reducing the risk of deploying a broken or low-quality feature. This creates a gatekeeping process for prompt engineering.

---

### **SOP-CANDIDATE-002: Prompt Regression Testing**

- **Source Process:** The "Testing Checklist" section from the `IMPLEMENTATION_PLAN_V2_1.md` document.
- **Description:** A series of tests to run on the content generation system after any significant change to the prompt or a supporting component.
    1.  **Functional Testing (Quick Mode):** Can a user generate a post with minimal inputs?
    2.  **Functional Testing (Advanced Mode):** Can a user successfully override inferred defaults (e.g., change the CTA)?
    3.  **Prompt Injection Testing:** Verify that key conditional sections of the prompt (like a compliance guardrail) are correctly appearing in the final prompt string under the right conditions.
    4.  **Brand-Specific Testing:** For key client types (e.g., Law, Accounting), generate a batch of content and verify that it adheres to all brand-specific rules (disclaimers, tone, persona).
    5.  **Graceful Degradation Testing:** Test the system with an incomplete or old version of a Brand Profile. The system should handle missing data gracefully and not crash.
- **Value of Standardization:** Creates a safety net to catch regressions. Prevents a change that improves one part of the system from unexpectedly breaking another. This is essential for maintaining a stable, production-ready service.

---

### **SOP-CANDIDATE-003: Client Delivery & Onboarding**

- **Source Process:** Inferred from the overall structure of the AI Content Legal System project.
- **Description:** A checklist-driven process for setting up a new client.
    1.  **Create Brand Profile:** Work with the client to fill out all fields in the `BrandProfile` object (business type, audience, tone, website, etc.).
    2.  **Configure Integrations:** Securely receive and encrypt the client's API keys (OpenAI, Buffer, etc.).
    3.  **Run Calibration Tests:** Generate a batch of 5-10 posts for the client using their new profile.
    4.  **Review & Refine:** Review the test batch with the client and make minor adjustments to the `tone`, `personality`, or `content_rules` fields in their Brand Profile.
    5.  **Official Hand-off:** Provide the client with access and a brief training session on using Quick vs. Advanced modes.
- **Value of Standardization:** Makes the process of onboarding a new client fast, repeatable, and professional. Ensures no steps are missed and that the client's brand is correctly configured from day one, leading to higher satisfaction.
