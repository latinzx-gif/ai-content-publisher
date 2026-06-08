# Create Post Real Workflow Test Plan

This plan locks today's work to Create Post only. Do not expand other pages until this flow is tested with real queue behavior.

## Objective

Make Create Post behave like a real production workflow, not a mock demo. The user should be able to enter requirements, choose sources, generate text, prepare image/layout, move the package through agent queues, and stop before publishing.

## Locked model and connector settings

### Codex runtime models

- Agent Orchestrator: `GPT-5.4-Mini`
- Content Strategy Agent: `GPT-5.4`
- Legal Compliance Agent: `GPT-5.5`
- Image & Layout Agent: `GPT-5.4`
- Publishing Agent: `GPT-5.4-Mini`

### Image generation connector

- Provider: OpenAI Images API
- Default model: `gpt-image-2`
- Advanced snapshot: `gpt-image-2-2026-04-21`
- Thai text rule: generate background/visual only. Thai text must be overlaid by the app composer using a Thai font.

## Required Create Post flow

1. Topic & Brief
   - User enters requirement, audience, platform, language, post count, image count, and layout.
   - No agent should generate final output yet.

2. Source Search
   - User chooses Knowledge Base, Google Drive, Obsidian, official links, or Auto Search.
   - If official links are selected, user can add URLs.
   - Content generation is blocked if no reliable source context exists.

3. Generation Text
   - Content Strategy Agent generates the content text package first.
   - The generated text must match selected languages and brand voice.
   - Topic anchor must come from user requirement, not fixed mock text.

4. Image & Layout
   - Image & Layout Agent reads final/generated text.
   - It creates visual brief, image prompt, platform layout rule, and composer instructions.
   - OpenAI Images API uses `gpt-image-2` for visual/background generation.
   - Thai text is overlaid by app composer, not generated inside the image.

5. Ready for Review
   - Final package contains text, sources, visual brief, generated image/background references, layout, and agent queue trail.
   - Package moves to Review Queue.
   - Publishing remains blocked until human approval or explicit Auto Queue.

## Real-time agent queue expectations

- Orchestrator creates/claims the job.
- Content Strategy Agent receives text task and marks it done.
- Image & Layout Agent receives visual task only after text is done.
- Legal Compliance Agent receives compliance task and records pass/fail.
- Publishing Agent receives a hold task, not publish task, until approval exists.
- Every queue item needs created time, updated time, owner, status, and handoff target.

## Mock data cleanup rule

Mock data can remain for empty states, but it must not obscure the real workflow test.

During Create Post testing:

- Newly created workflow should appear at the top of queues.
- Agent queue should highlight current workflow before fallback jobs.
- Dashboard/Review/Publishing should use the same workflow ID.
- If backend/Codex connection is missing, UI must label the run as dry-run clearly.
- If real-time Codex bridge works, UI must label the run as live.

## Stop conditions

Stop and report before moving to other pages if any of these fail:

- Create Post Next button cannot advance all required steps.
- Source selection does not affect generated prompt/context.
- Language selection does not affect draft output.
- Image count/layout does not affect visual brief.
- Agent queue does not show receive/send handoff.
- Publishing starts before approval.
- Codex connection cannot be confirmed as dry-run or live.
