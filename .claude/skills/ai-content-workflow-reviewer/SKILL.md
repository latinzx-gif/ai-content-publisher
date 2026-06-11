---
name: ai-content-workflow-reviewer
description: >-
  Reviews the AI Content Publisher end-to-end workflow — brand setup through
  publish and status tracking. Checks draft transitions, approval logic, image
  triggers, schedule/publish, published/failed states, user-facing errors, and
  missing empty states. Use when auditing workflow bugs, reviewing Cursor or
  Codex task output, preparing QA summaries, or before INT-02, QA-01, CLOSE-01.
---

# AI Content Workflow Reviewer

## Purpose

Review the AI Content Publisher workflow.

## When to Use

- Auditing workflow integrity for one `post_id`
- Reviewing Cursor task output or Codex diffs that touch `src/lib/*` or workflow pages
- Checking if Codex changed scope beyond the active `CURRENT_TASK.md`
- Preparing QA summary before handoff

## Core Workflow

```text
Brand Setup
→ Generate Text
→ Review Text
→ Approve Text
→ Generate Images
→ Select Image
→ Approve Creative
→ Schedule / Publish
→ Status Tracking
```

### App route / file mapping

| Step | User-facing step | Route(s) | Primary files |
|------|------------------|----------|---------------|
| 1 | Brand Setup | `/create`, `/briefs`, `/rules`, `/settings` | `brief-builder.ts`, `rules-loader.ts` |
| 2 | Generate Text | `/content-generation` | `content-generator.ts` |
| 3 | Review Text | `/quality-check`, `/review` | `quality-checker.ts`, `ReviewDashboard.tsx` |
| 4 | Approve Text | `/review` | `review-actions.ts` — `approvePost`, `requestRevision`, `rejectPost` |
| 5 | Generate Images | `/image-prompts`, `/images` | `image-prompt-generator.ts`, `image-generator.ts` |
| 6 | Select Image | `/images`, `/review` | `image-generator.ts` (primary/secondary + `visual_concept_id`) |
| 7 | Approve Creative | `/review` | `review-actions.ts` — status must allow publish path |
| 8 | Schedule / Publish | `/publishing`, `/calendar` | `buffer-publisher.ts` |
| 9 | Status Tracking | `/dashboard`, `/calendar`, `/logs` | `dashboard-data.ts`, `calendar-data.ts`, `log-system.ts` |

Entry: `/create` assigns `post_id`. Downstream pages use `?post_id=...` (demo: `demo-001`).

Persistence: localStorage today → `acp_*` tables after INT-02 (`src/lib/supabase/types.ts`).

## Status Model

Canonical post status (calendar, dashboard, publishing):

```text
draft → revision_requested → approved → scheduled → published | failed
```

`review-actions.ts` also uses `rejected` and `publishing` — flag if UI/DB enums diverge.

## Check

Walk the core workflow for one `post_id` and verify each item:

### Draft state transition

- [ ] New post starts as `draft` after `/create`
- [ ] `saveDraft` / `requestRevision` set `draft` or `revision_requested`
- [ ] Status key `ai-content-publisher:status:{post_id}` updates consistently
- [ ] Dashboard and calendar reflect the same status string

### Approval logic

- [ ] `approvePost` sets `approved` before image/publish steps proceed
- [ ] `rejectPost` / `requestRevision` block publish without clear user message
- [ ] QC failures (`quality-checker.ts`) surface as warnings/fails — not silent pass
- [ ] Dual language intact: primary post + secondary first comment under same `post_id`

### Image generation trigger

- [ ] Content exists before image prompts run
- [ ] `image-prompt-generator.ts` runs only when prior steps have data
- [ ] `image-generator.ts` writes primary + secondary with shared `visual_concept_id`
- [ ] `addLog("image", ...)` fires on generate (not `post_id = "unknown"`)

### Schedule logic

- [ ] `schedulePost` requires `scheduled_at` — user-facing error if missing
- [ ] Status becomes `scheduled`; `ai-content-publisher:scheduled-at:{post_id}` set
- [ ] Calendar shows scheduled slot with correct date

### Published / failed state

- [ ] `publishNow` / schedule success → `published` or `scheduled` as intended
- [ ] Buffer mock failure path → `failed` with readable message (`buffer-publisher.ts`)
- [ ] `/logs` records `publish` type entries with `success` | `warn` | `error`

### User-facing errors

- [ ] No silent mock success when real API key missing (post INT-03/05)
- [ ] Errors are plain language — not raw JSON or stack traces in UI
- [ ] Missing prerequisites (no brief, no content, no approval) show actionable copy

### Missing empty states

Post-dependent pages **must** use `PostIdEmptyState` when `?post_id=` is absent:

- [ ] `/briefs`
- [ ] `/rules`
- [ ] `/content-generation`
- [ ] `/image-prompts`
- [ ] `/images`
- [ ] `/quality-check`
- [ ] `/review`

Reference: `src/components/PostIdEmptyState.tsx`

## Review Procedure

1. Read `../orchestration/CURRENT_TASK.md` — stay within active task scope when suggesting fixes.
2. Pick or create a `post_id` via `/create`.
3. Walk core workflow steps in order; record pass/fail per step.
4. Run `git diff head-office-app` if reviewing Codex/Cursor output.
5. Re-check status on `/dashboard`, `/calendar`, `/logs` after final step.
6. Default mode: **audit only** — do not fix unless task scope allows.

## Output

```markdown
## Workflow Review — [post_id]

### Workflow pass/fail
**Overall:** PASS | FAIL | PARTIAL

| Step | Pass? | Notes |
|------|-------|-------|
| Brand Setup | ✅/❌ | |
| Generate Text | ✅/❌ | |
| Review Text | ✅/❌ | |
| Approve Text | ✅/❌ | |
| Generate Images | ✅/❌ | |
| Select Image | ✅/❌ | |
| Approve Creative | ✅/❌ | |
| Schedule / Publish | ✅/❌ | |
| Status Tracking | ✅/❌ | |

### Broken steps
1. [step name] — [what fails and observed behavior]

### Files involved
- `path/to/file.ts` — [role in broken step]

### Risk level
Critical | Major | Minor

### Suggested fix prompt for Codex
> Fix [broken step] in ai-content-publisher.
> Scope: [CURRENT_TASK ID and allowed files only].
> Root cause: [one sentence].
> Files: [list].
> Acceptance: [status transition / empty state / error message / log entry].
> Validate: `npm run build && npm run typecheck && npm run lint`.
> Do not touch: [forbidden paths from CURRENT_TASK.md].
```

## Forbidden Actions

- Adding Phase 2/3 routes (`/sources`, `/knowledge`, `/learning-loop`, etc.)
- Changing status enum without migration plan
- Direct Meta/LinkedIn/Twitter APIs (Buffer only in Phase 1)
- Implementing fixes outside `CURRENT_TASK.md` allowed files during audit-only review
