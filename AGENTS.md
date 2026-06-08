<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Head Office App Agent Manual

## 1. Project Identity

- Project name: `Head Office App`
- Project root: `/Users/jakarinosk/HEAD-OFFICE/head-office-app`
- Primary product surface: `/prd`
- Primary entry route: `/login`
- Product purpose: agent-assisted content operations for legal/accounting workflows, including drafting, image generation, review, publishing support, and runtime monitoring
- Current V1 focus: make the `/prd` workflow reliable end to end for content creation, real asset generation, review readiness, publishing support, and logs

Scope rules:
- `/prd` is the main operating surface
- `editor-canvas2` has been removed from this project
- Do not reference, restore, rebuild, or include `editor-canvas2` unless the user explicitly asks for it

## 2. Current Product Goal

The realistic V1 goal is to make the `/prd` workflow usable for agent-driven content creation, image generation, review/approval, publishing support, and runtime monitoring.

Do not treat marketplace features, payments, multi-tenant expansion, or full automation ambitions as V1 unless they are explicitly implemented and proven in the current code.

## 3. Core Product Flow

Intended V1 flow:

`Login`
-> `/prd Dashboard`
-> `Create Post`
-> `Content Text Agent`
-> `Image Generation Agent`
-> `Layout / Creative Preparation`
-> `Review Queue`
-> `Approval Agent`
-> `Publishing Queue`
-> `Publishing Agent`
-> `Logs / Runtime Monitor`

Required workflow rules:
- Placeholder assets must not count as completed image output
- Review readiness must depend on real asset output where image generation is required
- Degraded or failed image generation states must be explicit
- Review Queue must not imply visual completion from placeholder staging alone

## 4. Agent System Responsibilities

### 1. Content Text Agent
- Creates or assists with post text
- Produces captions, drafts, rewrites, and content variants
- Supports the Create Post workflow inside `/prd`

### 2. Image Generation Agent
- Produces real image output
- Must persist or reference visible image assets
- Must not treat placeholder metadata as completed output
- Must return explicit degraded or failed state when real image output is unavailable

### 3. Layout Image Agent
- Prepares visual structure, layout plan, asset slots, or creative brief
- Layout placeholders are planning artifacts only
- Placeholder asset rows may exist for slot tracking, not for final completion

### 4. Approval Agent
- Checks readiness, quality, compliance, and approval state before publishing
- Must not approve publish readiness from fake or partial success signals

### 5. Publishing Agent
- Supports queue, schedule, publish, retry, and publishing readiness
- Must surface degraded states and publish blockers clearly

### 6. Logs / Runtime Monitor
- Records agent status, failure, degraded states, and workflow events
- Must preserve enough evidence to audit handoff and queue progression

## 5. Documentation Routing Rules

Read the minimum relevant docs first.

Before planning or scope decisions:
- `docs/AS_BUILT_PRD.md`
- `docs/GAP_ANALYSIS.md`

Before route or navigation decisions:
- `docs/AS_BUILT_SITEMAP.md`

Before quality or audit decisions:
- `docs/GAP_ANALYSIS.md`

Before inspecting current implementation:
- `docs/CURRENT_APP_INVENTORY.md`

Do not scan all docs unless the task actually requires it.

## 6. Token Efficiency Rules

Use `rtk` when available.

Prefer:
- `rtk ls`
- `rtk find`
- `rtk grep`
- `rtk read`
- `rtk git status`
- `rtk git diff`
- `rtk git log -n 10`
- `rtk next build`
- `rtk tsc`
- `rtk lint`
- `rtk test <command>`

Avoid:
- raw full-file dumps
- raw `git log`
- raw `git diff` on large files
- reading all of `src/app/prd/page.tsx` unless the task needs it
- scanning the full repository without a narrow target
- dumping full build or test logs into context

Workflow:
1. Locate files with `rtk find` or `rtk grep`
2. Read only focused slices with `rtk read`
3. Summarize findings before editing
4. Edit only files directly related to the task
5. Run minimal safe verification

If `rtk` is unavailable:
- use focused `rg`, `find`, `sed`, and similar commands
- avoid full dumps
- say that `rtk` was unavailable and continue with focused shell reads

## 7. Source Code Safety Rules

General rules:
- Make minimal changes
- Do not refactor unrelated code
- Do not create new routes unless explicitly requested
- Do not touch auth unless the task requires it
- Do not touch publishing unless the task requires it
- Do not change database schema unless explicitly approved
- Do not install packages unless explicitly approved
- Do not expose secrets or env values
- Do not remove fallback or error states unless replaced with safer behavior

Special route rules:
- `/prd` is the primary product surface
- `/login` is the primary entry
- `editor-canvas2` is removed and out of scope unless explicitly requested

## 8. Image / Asset Rules

The image generation path is a critical V1 quality area.

Rules:
- Placeholder `content_assets` rows are allowed only for slot tracking
- Placeholder assets must not be treated as completed generated images
- Real visual output must be a valid URL, data URL, storage path, or another user-visible asset reference
- Review Queue must not show fake image completion
- Image generation failure must produce explicit degraded or error state
- Any image-generation fix must preserve review-flow integrity

Known remaining risks:
- Real asset output should be normalized into durable storage
- `src/lib/agents/openaiImages.ts` still needs production alignment for the provider/model bridge

## 9. Testing / Verification Rules

Before closing source-code work, run safe verification if available.

Prefer:
- `npm run build`

Also use if available:
- `npm run lint`
- `npm run typecheck`
- `npm run test`

Rules:
- Do not invent missing commands
- If a command is missing, mark it `NOT AVAILABLE`
- If a command is unsafe, explain why it was not run
- For large logs, summarize only the relevant errors
- If build fails, fix only task-related errors unless unrelated failures need to be documented clearly

Current command reality from `package.json`:
- `npm run build`: available
- `npm run lint`: available
- `npm run typecheck`: not defined
- `npm run test`: not defined

## 10. Work Modes

### A. Inventory Only
- Inspect and document
- No source changes

### B. Documentation Only
- Update docs or `AGENTS.md` only
- No source changes

### C. Audit Only
- Inspect source and report issues
- No source changes

### D. Audit + Fix
- Inspect
- identify root cause
- apply minimal fix
- verify

### E. Release Audit
- Check readiness, blockers, risks, and handoff notes
- No broad refactor

Default:
- If the user does not explicitly request fixes, use `Audit Only` or `Documentation Only`

## 11. Severity Rules

### Critical
- Blocks the V1 core flow
- Fake success state
- Data loss or security risk
- Build failure
- User cannot complete review, approval, or publishing path

### Major
- Important feature incomplete
- Confusing UX
- Integration not proven
- Partial or mock-backed behavior in the V1 path

### Minor
- Copy
- spacing
- polish
- small layout issue
- non-blocking improvement

## 12. Output Format

Every Codex run should return:
1. What was inspected
2. Root cause or finding
3. Files changed
4. What was fixed or documented
5. Verification result
6. Remaining risks
7. Next recommended action

For `Documentation Only`:
1. File updated
2. Sections added or changed
3. Scope decisions recorded
4. Risks or unknowns added
5. Recommended next document or action

## 13. Current Priority

Current priority after Critical Fix 1:

1. Provider/storage bridge
- Persist generated image output to durable storage
- Align `src/lib/agents/openaiImages.ts` with the actual production model/API contract

2. Reduce mock/fallback ambiguity in `/prd`
- Make mock-backed states explicit
- Prevent fake readiness

3. Publishing readiness
- Prove publishing queue behavior
- Ensure failure and degraded states are visible

4. Final test matrix
- Only after the critical V1 flow is stable

## 14. Forbidden Drift

Do not drift into:
- marketplace
- payment
- multi-tenant enterprise expansion
- full campaign factory work
- Google Drive RAG expansion
- restoring or redesigning `editor-canvas2`
- UI polish before critical flow stability
- writing tests before target behavior is stable

## 15. Graphify Gate Workflow

Before any feature implementation or surgical code change, the following workflow is mandatory:

1. **Gate Review**: Codex must read the relevant task gate file at `graphify-out/gates/TASK-XXX_IMPLEMENTATION_GATE.md`.
2. **Boundary Compliance**: Codex must strictly follow the **Allowed Files** and **Forbidden Files** sections of the gate.
3. **Scope Control**: Codex must not broaden the scope or refactor unrelated code.
4. **Pre-Implementation Audit**: Run a quick audit of the allowed files to confirm the analysis remains accurate before making edits.
5. **Handoff Documentation**: Codex must return a summary of changed files and verification results (lint, build, diff) upon completion.
6. **Role Separation**: Gemini handles File Ops, Docs, and Gate Preparation. Codex is the primary agent for source code implementation.
