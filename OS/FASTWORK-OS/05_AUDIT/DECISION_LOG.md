# Key Decision Log

## Purpose
To maintain a record of significant architectural and product decisions made during the lifecycle of a project. This provides context for future development and prevents the team from re-litigating past decisions.

## Format
Each entry should include the decision, the context/problem, the outcome, and the "why."

---

### **DECISION-001: Adopt a Structured, XML-Based Prompt Architecture (V2)**

- **Date:** circa May 2026
- **Context:** The initial V1 prompts were simple text templates, which led to generic, inconsistent, and sometimes off-brand AI-generated content. The system lacked fine-grained control over strategic elements like tone, call-to-action, and compliance.
- **Decision:** To move to a highly-structured prompt format using XML-like tags (`<brand_context>`, `<strategy>`, etc.). Each section of the prompt would have a clear purpose and be built by a dedicated helper function.
- **Outcome:** This allowed for more precise control over the AI's output, enabling features like dynamic compliance rules and goal-oriented CTAs. While it increased prompt length and complexity, the resulting increase in content quality and safety was deemed a worthwhile trade-off.

---

### **DECISION-002: Implement a Dual-Mode UX ("Quick" vs. "Advanced")**

- **Date:** circa June 2026
- **Context:** As the prompt architecture became more powerful (V2), the number of user-facing controls increased, leading to high cognitive load. Most users did not need to fine-tune every single parameter for every generation.
- **Decision:** To create two user experiences: a default "Quick Mode" that hides complexity and infers settings, and an "Advanced Mode" that exposes all granular controls for power users.
- **Outcome:** This decision aimed to simplify the UX for the 80% case, making the tool faster and more approachable, while still providing the deep control required for specific tasks.

---

### **DECISION-003: Create a Backend "AI Inference Engine"**

- **Date:** circa June 2026
- **Context:** To make "Quick Mode" effective, the system needed to be able to make intelligent choices on behalf of the user. Simply hiding the controls was not enough.
- **Decision:** To build a logic layer on the backend (within a server action) that infers the optimal settings (e.g., `Content Framework`, `CTA`) based on the user's high-level goal and their saved Brand Profile (`business_type`).
- **Outcome:** This engine became the "brain" of Quick Mode, automatically applying strategic frameworks (like AIDA or PAS) and relevant CTAs, turning a simple user intent into a sophisticated, strategic prompt.

---

### **DECISION-004: Enforce "Compliance by Default" for Regulated Industries**

- **Date:** circa June 2026
- **Context:** The system was being used to generate content for regulated professional fields like law and accounting. A single non-compliant post could create significant legal and business risk for the client.
- **Decision:** Compliance cannot be a user-configurable option. A non-negotiable "Compliance Guardrail" must be automatically injected into the prompt for any brand identified as being in a regulated industry.
- **Outcome:** This made safety a core, automated feature of the system, dramatically reducing the risk of generating harmful or non-compliant content. It became a key selling point for professional service clients.
