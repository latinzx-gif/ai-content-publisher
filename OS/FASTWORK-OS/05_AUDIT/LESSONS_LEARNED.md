# Lessons Learned

## Purpose
To document key takeaways, unexpected outcomes, and hard-won knowledge from a project. This helps future projects avoid the same pitfalls and replicate successes.

## Format
Each lesson should be stated clearly with context and a recommended action for the future.

---

### **Lesson 001: Verbose Prompts are a Double-Edged Sword**

- **Context:** The move to a highly structured, XML-based prompt (V2.1) dramatically improved the quality, consistency, and safety of the AI's output.
- **Lesson:** However, it also significantly increased the token count for each API call. This has a direct impact on both **cost** (higher per-generation fee) and **latency** (longer wait times for the user).
- **Recommendation:** When designing new prompt systems, build them modularly. Create functions that can conditionally include or exclude verbose sections of the prompt based on the user's needs or pricing tier. Do not assume all context is required for every call.

---

### **Lesson 002: LLMs Can "Hallucinate" Structure**

- **Context:** During testing of the V2.1 XML prompts, we observed instances where the LLM would either fail to follow the JSON output format correctly or, more subtly, include XML tags *within* its own generated caption text (e.g., "This is great because `<strategy>...</strategy>").
- **Lesson:** Complex structural requirements in a prompt can sometimes confuse the model, causing it to "hallucinate" or misinterpret the boundary between instructions and the desired output.
- **Recommendation:** Keep prompt instructions as clean as possible. Use clear delimiters (like `---` or `JSON OUTPUT STRUCTURE:`) to separate instructions from the desired output format. Implement robust, schema-based parsing (like Zod) on the backend to catch any structural errors and provide a graceful failure message to the user.

---

### **Lesson 003: Backward Compatibility Creates Technical Debt**

- **Context:** To ensure a smooth rollout of the V2.1 prompt system, we maintained the old function signatures and data structures to avoid breaking existing code that called the generation service.
- **Lesson:** While necessary for a non-disruptive launch, this "compatibility layer" added significant complexity and technical debt. The code had to handle both old and new data shapes, and the inference logic became more convoluted.
- **Recommendation:** When introducing a major breaking change, plan for a two-phase deprecation.
    1.  **Phase 1 (Compatibility):** Support both old and new systems, but log warnings whenever the old system is used.
    2.  **Phase 2 (Deprecation):** After a set period (e.g., one quarter), actively migrate all remaining callers to the new system and then remove the compatibility layer completely. Do not let it live on indefinitely.

---

### **Lesson 004: Inference Engines Require Explicit User Feedback**

- **Context:** The "AI Inference Engine" in V2.1 automatically selected frameworks (AIDA/PAS) and CTAs for the user in Quick Mode. This was powerful but also opaque.
- **Lesson:** Users were sometimes confused about *why* a certain CTA or tone was used. The "magic" of the inference engine made the system feel unpredictable.
- **Recommendation:** When the system makes an intelligent choice for the user, the UI must reflect it. Display small, non-intrusive tags or tooltips like *"Auto-selected: AIDA Framework (based on your 'SaaS' business type)"* or *"CTA inferred from 'Lead Generation' goal."* This builds trust and makes the system's behavior understandable.
