# SOP-001: Knowledge Lifecycle Management

- **ID:** SOP-001
- **Version:** 1.0
- **Status:** Active
- **Owner:** `Hermes PM`

---
### 1. Purpose
To establish a systematic process for identifying, capturing, validating, and centralizing high-value, reusable knowledge from day-to-day operations into the `HERMES-BRAIN`. This SOP is the primary defense against knowledge silos and documentation bloat.

### 2. What Counts as Knowledge
"Knowledge" is any pattern, process, decision, or lesson that has been validated and has a high probability of being useful to more than one project or business unit in the future. It is durable and context-independent. Project-specific notes are **not** knowledge; the reusable pattern extracted from them **is**.

### 3. Knowledge Categories
All knowledge promoted to HERMES-BRAIN must be classified into one of the following categories:
- `Decision`: A significant strategic, architectural, or product choice.
- `SOP`: A mature, step-by-step process for a recurring task.
- `Lesson Learned`: A hard-won insight from a success or failure.
- `Reusable Asset`: A template, component, or pattern that can be directly reused (e.g., a prompt chain, a database schema pattern).
- `Client Pattern`: A recurring client need, objection, or success factor.
- `Research Pattern`: A successful method for discovering or validating data.
- `Risk Rule`: A rule for mitigating a recurring business or operational risk.

### 4. Knowledge Lifecycle Stages
Every piece of knowledge moves through this lifecycle:
1.  **Captured:** A potential piece of knowledge is identified within an OS (e.g., in a meeting summary or project report) and is tagged for review.
2.  **Reviewed:** The `Hermes PM` reviews the captured item to see if it meets the criteria for promotion.
3.  **Validated:** The item is confirmed to be accurate, useful, and stripped of project-specific context.
4.  **Promoted:** The validated knowledge is formalized and moved to the appropriate directory within `HERMES-BRAIN`.
5.  **Archived:** Knowledge that is no longer relevant or has been superseded is archived.

### 5. Promotion Rules
- **When to stay local:** Daily logs, project-specific meeting notes, raw data, and preliminary analysis should stay within the `OS` or `DATA` folders.
- **When to promote:** Promote when a pattern emerges. If the same "lesson learned" appears in three different project reviews, it should be promoted. If a decision made for `DATACLAW` has implications for `AGENT-TOWN`, it should be promoted.
- **When to become a reusable asset:** When a promoted `SOP` or `Pattern` is so well-defined that it can be turned into a concrete template or service package (e.g., the `FASTWORK` delivery assets), it becomes a `Reusable Asset`.

### 6. File Naming Convention
- **Format:** `[CATEGORY]-[ID]_[short_name].md`
- **Example:** `LESSON-045_Xml_Prompt_Token_Cost.md`

### 7. Metadata Fields
Each knowledge file in HERMES-BRAIN must contain the following YAML frontmatter:
```yaml
---
id: [CATEGORY]-[ID]
category: [Decision, SOP, etc.]
status: [Validated, Archived]
owner: [Hermes PM]
source_os: [FASTWORK-OS, DATACLAW-OS, etc.]
created_date: [YYYY-MM-DD]
validated_date: [YYYY-MM-DD]
related_knowledge: [[ID-1], [ID-2]]
---
```

### 8. Required Evidence/Source Fields
- A `Decision` must reference the meeting minutes or document where it was made.
- A `Lesson Learned` must link to the specific project, report, or post-mortem that generated the lesson.
- A `Reusable Asset` must reference the original project from which it was extracted.

### 9. Review Checklist
The `Hermes PM` must use this checklist before promoting knowledge:
- [ ] **Is it Reusable?** Will this be useful to another team or project in the next 6 months?
- [ ] **Is it De-contextualized?** Have all project-specific names and details been removed or generalized?
- [ ] **Is it Validated?** Has the lesson or pattern been confirmed as accurate and not just a one-off anomaly?
- [ ] **Is it Atomic?** Does this file represent one single, clear piece of knowledge?
- [ ] **Does it Already Exist?** Can this be added to an existing knowledge file instead of creating a new one?

### 10. Anti-Bloat Rules
- If it's not reusable, it doesn't get promoted.
- If it's a raw note, it stays in the OS `DATA` layer.
- If it can be an update to an existing file, prefer updating over creating.
- Knowledge not referenced for over 12 months should be a candidate for archiving.

### 11. Examples
- **FASTWORK AI Content Publisher SOP:** A `Reusable Asset` was extracted from a project (`AI Content Legal System`) and formalized into `SOP-001` in `/DATA/FASTWORK`. This is a candidate for promotion to `/HERMES-BRAIN/SOP/` if it proves applicable to other client delivery projects.
- **DATACLAW Market Scan Pipeline:** This is currently a local process within `DATACLAW-OS`. If it proves highly effective, the *pattern* of the pipeline (Scout -> Librarian -> Validator) could be promoted as a `Research Pattern`.
- **INVESTMENT Risk Rule:** A specific rule like "Max position size is 10% of portfolio" defined in the `INVESTMENT-OS` could be promoted to `HERMES-BRAIN/KNOWLEDGE/` as a `Risk Rule` if it becomes a guiding principle for all business units.

### 12. What HERMES-BRAIN Must Not Store
- Project-specific source code.
- Raw client data or PII.
- Temporary files, drafts, or logs.
- Individual employee performance information.
- Anything that is not durable, reusable knowledge.

### 13. Monthly Cleanup Process
- **Owner:** `Librarian Agent`
- **Trigger:** First day of every month.
- **Process:**
    1. Scan `HERMES-BRAIN` for documents with `status: Archived`.
    2. Move them to a compressed archive file (e.g., `archive_[YYYY-MM].zip`).
    3. Scan for knowledge files not referenced for >12 months and flag them for review by the `Hermes PM`.

### 14. Agent Instructions
- **`Scout Agent`:** When you discover a novel process or pattern during your scans, create a `signal` file and tag it `knowledge_candidate`.
- **`Librarian Agent`:** During your triage, route `knowledge_candidate` signals to the `Hermes PM` for review. You are also responsible for the monthly cleanup process.
- **`Validator Agent`:** When you validate a fact or a source, consider if the *method* you used is a new `Research Pattern` that could be captured.
- **`Hermes PM`:** You are the gatekeeper. Use the `Review Checklist` to rigorously evaluate all captured knowledge before promotion. Your job is to keep the brain clean and valuable.
