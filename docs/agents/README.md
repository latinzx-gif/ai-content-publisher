# Agent Team Operating Manual

This folder is the source of truth for the AI Content Publisher agent team. The product should behave like an Operations Command Center + Content Studio: the user creates requirements, the orchestrator routes work, specialist agents complete their task cards, and publishing stays locked until approval.

## Core workflow

1. Agent Orchestrator validates the job, selects the route, and creates specialist task cards.
2. Content Strategy Agent turns the user's requirement into topic anchor, post plan, platform direction, and draft instructions.
3. RAG Research Agent gathers source context from Knowledge Base, Google Drive, Obsidian, official links, and approved web search.
4. Brand Memory Agent retrieves approved writing style and user preferences for this topic, audience, platform, and language.
5. Content Strategy Agent generates the content text package using source context and memory constraints.
6. Multilingual Localization Agent translates or adapts approved draft structure across Thai, English, Chinese, and Japanese when requested.
7. Image & Layout Agent converts final text into image prompts, layout rules, visual brief, and asset composer instructions.
8. Legal Compliance Agent and Tax & Accounting Agent run specialist checks depending on risk/category.
9. Review Queue keeps the human approval gate. The user can approve, reject, regenerate, or auto queue.
10. Publishing Agent schedules approved work only. It must not publish unapproved content.
11. Analytics Insight Agent summarizes performance and sends improvement signals back to the memory loop.

## Queue rules

- Every task card must have one owner agent, current status, created time, updated time, and next handoff target.
- Agents can run in parallel only after prerequisites are complete. Example: Image/Layout and Compliance can run after text package exists.
- If source grounding fails, text generation must stop instead of guessing.
- If compliance fails, publishing must stay blocked.
- Publishing is never automatic before human approval unless an explicit Auto Queue decision is recorded.

## Memory policy

Brand Memory Agent owns style memory. It should learn only from explicit user-approved signals:

- Content approved in Review Queue.
- Text the user manually edits and saves.
- Repeated wording, tone, CTA, structure, or formatting that the user keeps using.
- Rejected wording patterns that should be avoided.
- Language-specific preferences, especially Thai legal/accounting tone.

Memory must be stored as reusable rules, not as private raw conversations. Each memory item should include source, confidence, scope, and last confirmed date.

## Recommended memory fields

- `scope`: global, brand, service, platform, language, audience, or user.
- `pattern`: the reusable writing preference.
- `examples`: short approved examples.
- `avoid`: wording or style to avoid.
- `source_event`: approval, manual edit, rejection, or analytics learning.
- `confidence`: low, medium, high.
- `last_confirmed_at`: timestamp.

## Built-in agents

- Agent Orchestrator
- Content Strategy Agent
- RAG Research Agent
- Brand Memory Agent
- Multilingual Localization Agent
- Image & Layout Agent
- Legal Compliance Agent
- Tax & Accounting Agent
- Publishing Agent
- Analytics Insight Agent

## MVP active agent policy

For the first production test, the UI should expose only 5 active core agents. Specialist agents remain documented and available for future expansion, but they are hidden from the main Agents table to reduce operational complexity.

### Active now

1. Agent Orchestrator
2. Content Strategy Agent
3. Legal Compliance Agent
4. Image & Layout Agent
5. Publishing Agent

### Hidden for later

- RAG Research Agent: currently folded into Content Strategy Agent for MVP.
- Brand Memory Agent: currently implemented as memory logic/service under Content Strategy Agent.
- Multilingual Localization Agent: currently folded into Content/Review flow.
- Tax & Accounting Agent: currently folded into Legal Compliance Agent review gate.
- Analytics Insight Agent: currently treated as reporting module, not active workflow agent.

### Upsell direction

When usage grows, the hidden specialist agents can be unlocked as Pro/Business capabilities. Good unlock triggers include high Content Agent usage, frequent compliance failures, multi-language volume, or publishing scale across many platforms.

## Codex model routing policy

The MVP should prefer Codex runtime models for agent workflow work and use the smallest capable model for each task.

### Default model fit

- Agent Orchestrator: `GPT-5.4-Mini` for routing, queue ownership, status updates, and simple handoffs.
- Content Strategy Agent: `GPT-5.4` for requirement analysis, source-aware drafting, tool use, and multi-step content planning.
- Legal Compliance Agent: `GPT-5.5` for high-risk legal/tax checks; downgrade to `GPT-5.4` for low-risk review when cost matters.
- Image & Layout Agent: `GPT-5.4` for visual brief, image prompt, platform layout reasoning, and composer instructions. Actual image generation should be handled by a separate image connector when available.
- Publishing Agent: `GPT-5.4-Mini` for queue status, connector checks, retry decisions, and publishing logs.

### Hidden specialist model fit

- RAG Research Agent: `GPT-5.4` when unlocked as a separate retrieval/reasoning worker.
- Brand Memory Agent: `GPT-5.4-Mini` for classifying approved edits into style memory.
- Multilingual Localization Agent: `GPT-5.4-Mini` for normal localization; escalate to `GPT-5.4` for legal meaning drift checks.
- Tax & Accounting Agent: `GPT-5.4` for specialist tax/accounting review.
- Analytics Insight Agent: `GPT-5.4-Mini` for performance summaries and memory suggestions.

### Escalation rules

- Use `GPT-5.4-Mini` for fast deterministic workflow steps.
- Use `GPT-5.4` when the task needs tool use, source reasoning, or multi-step content generation.
- Use `GPT-5.5` only for high-risk compliance, complex legal/tax interpretation, or repeated failure cases.
- Use image generation connectors only after text is ready and the visual brief is derived from final content. `GPT-5.3-Codex-Spark` is hidden for larger packages and should not be exposed in the MVP selector.

### Codex model selector shown in MVP

Only these models should appear in the MVP selector because they match the current Codex UI:

- `GPT-5.5`
- `GPT-5.4`
- `GPT-5.4-Mini`

`GPT-5.3-Codex-Spark` is reserved for larger packages and should stay hidden unless the plan/upsell layer unlocks it.

## Current execution lock

Before expanding any other page, finish the Create Post real workflow test in `create-post-real-test-plan.md`.

Current image generation setup:

- OpenAI Images API default: `gpt-image-2`
- Snapshot option: `gpt-image-2-2026-04-21`
- Thai text must be overlaid by the app composer, not generated directly inside AI images.

Create Post must prove agent handoff and queue movement before publishing features are expanded.
