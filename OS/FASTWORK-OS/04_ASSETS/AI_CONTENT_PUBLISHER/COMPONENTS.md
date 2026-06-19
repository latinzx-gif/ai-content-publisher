# Reusable Components: Prompt Engine

## Purpose
To document the reusable, modular functions used to construct the V2.1 Content Generation Prompt. These components form a scalable and maintainable "Prompt Engine."

## Components
These functions are sourced from `src/prompts/generate-posts.ts` in the original project.

---

### 1. `buildBrandContext()`

- **Purpose:** Creates the `<brand_context>` XML block, which contains the core identity of the brand.
- **Inputs:** `brand: BrandProfile`, `options: GeneratePromptOptions`
- **Output:** A string containing the `<brand_context>` block.
- **Key Logic:**
    - Merges the default brand `tone` and `personality` with any user overrides.
    - Injects a `<negative_constraints>` sub-block if the `forbidden_topics` field is present in the brand profile.
- **Reusable Value:** Encapsulates all brand identity logic into a single, predictable component.

---

### 2. `buildAudienceContext()`

- **Purpose:** Creates the `<audience>` XML block, instructing the AI on who to write for.
- **Inputs:** `brand: BrandProfile`, `options: GeneratePromptOptions`
- **Output:** A string containing the `<audience>` block.
- **Key Logic:**
    - Uses the `audience` from the advanced options if available, otherwise falls back to the `target_audience` from the brand profile.
    - Includes a static instruction to "Write FOR them, not just about the topic."
- **Reusable Value:** Standardizes the critical instruction of audience adaptation.

---

### 3. `buildComplianceContext()`

- **Purpose:** Creates the dynamic `<compliance>` XML block, which acts as a safety guardrail for regulated industries.
- **Inputs:** `brand: BrandProfile`
- **Output:** A string containing the `<compliance>` block, or an empty string if not applicable.
- **Key Logic:**
    - Checks if the `brand.business_type` is in a predefined list of regulated industries (e.g., `['Legal', 'Accounting', 'Medical']`).
    - If it is, it injects a block with critical instructions about using disclaimers, avoiding definitive claims, and not creating a professional-client relationship.
- **Reusable Value:** This is a mission-critical safety component that can be applied to any prompt generation workflow to reduce risk.

---

### 4. `buildStrategyContext()`

- **Purpose:** Creates the `<strategy>` XML block, which contains the high-level strategic goals for the content.
- **Inputs:** `options: GeneratePromptOptions`
- **Output:** A string containing the `<strategy>` block.
- **Key Logic:**
    - Conditionally includes lines for `persona`, `objective`, `angle`, `framework`, and `cta` if they are present in the generation options.
- **Reusable Value:** Separates high-level strategy from brand identity and formatting rules, making the prompt easier for the AI to parse.

---

### 5. `buildGenerationRules()`

- **Purpose:** Creates the `<generation_rules>` XML block, which defines the "how" of the output format and style.
- **Inputs:** `options: GeneratePromptOptions`
- **Output:** A string containing the `<generation_rules>` block.
- **Key Logic:**
    - Defines the output language.
    - Specifies the required word count.
    - Defines the number of hashtags to generate.
    - Includes explicit instructions for creating a compelling "hook" and aligning the content with the CTA.
- **Reusable Value:** A single component to manage all output formatting requirements, ensuring consistency across all generated content.
