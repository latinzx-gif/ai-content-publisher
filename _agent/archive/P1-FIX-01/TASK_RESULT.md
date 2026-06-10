# TASK RESULT: P1-FIX-01 — Workflow integrity fixes

**Date:** 2026-06-11
**Agent:** Claude Code (`claude-fable-5`) + 3 sub-agents
**Approved by:** User (direct approval, bypassing Cursor plan gate)
**Source:** Full workflow audit (ai-content-workflow-reviewer) — findings F1–F11

## What was fixed

### Batch A — Human review gate (Critical)
- `ReviewDashboard.tsx`: auto-run now fires **only on `draft`** — `revision_requested`/`rejected` are human stop decisions and require an explicit "Run Agent Pipeline" click. Default `autoPublish` changed `true` → `false` (both `useState` init and `loadRequirements`).
- `ReviewDashboard.tsx`: QC-fail and missing-brief paths now persist `revision_requested` to `acp_posts` (previously local state only → dashboard/calendar mismatch).
- `ReviewDashboard.tsx`: `runAction` wrapped in try/catch with readable error message.
- `review-actions.ts` + `supabase/types.ts`: `rejected` added to `AcpPostStatus`; unsafe cast removed.
- **New migration** `20260611090000_acp_posts_status_rejected.sql`: extends `acp_posts.status` CHECK with `rejected` + `publishing` (Reject button previously failed the constraint at runtime).

### Batch B — Image truth (Critical)
- `openai.ts`: `generateImageAIWithFallback` now returns `{ image_url, is_placeholder, error? }`; placeholder fallback logs **error** (was warn) with explicit "Degraded" wording. `serverLog` takes type/agent params — image events now log as `type: "image"` / "Image Composer Agent" (was "generation"/"Content Agent").
- `image-generator.ts`: `GeneratedImage` carries `is_placeholder`; DB rows mapped through.
- `ImageGenerator.tsx` (Images page): renders the **real image** via `next/image` (was a text box), saves `is_placeholder` truthfully, shows red PLACEHOLDER badge + failure message; copy no longer claims "placeholder records".
- `PostPreview.tsx` (Review page): PLACEHOLDER badge on degraded images.
- `ReviewDashboard.tsx` pipeline: if any current image is a placeholder, the pipeline **blocks** (status → `revision_requested`, audit `image_degraded`) instead of queueing for publish.
- **New** `image-storage.ts` + migration `20260611100000_acp_images_storage_bucket.sql`: DALL-E output is copied to Supabase Storage bucket `acp-images` (public read; service-role writes); falls back to ephemeral URL if upload fails.

### Batch C — Publish honesty (Major) [sub-agent]
- `buffer-publisher.ts` / `facebook-publisher.ts`: mock paths no longer write `published`/`scheduled` status; logs are `warn` not `success`; `[MOCK]` messages and `mock: true` returns kept. Mock schedule still records `scheduled_at` without status change.
- `publish-router.ts`: server-side gate — publish/schedule/retry refuse posts that are missing or not in `approved | scheduled | failed`.

### Batch D — Misc (Minor) [sub-agent]
- `ContentGenerator.tsx`: upserts `acp_posts` before `acp_post_content` (FK safety when Briefs step is skipped).
- `log-system.ts`: localStorage fallback now applies `dateRange` filter.
- `PublishQueue.tsx`: copy states Facebook-only queue while Buffer is paused.
- `db.ts`: pre-existing fixes — `useLocalStoreOnly` → `localStoreOnly` (12 react-hooks lint errors), null-array cast on `listAllPostContent`.

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npx eslint` (all touched files) | ✅ clean |
| `npm run build` | ✅ pass |
| `npm run lint` (repo-wide) | ⚠️ 8 pre-existing errors remain in out-of-scope files (PRD/auth components: setState-in-effect, `<a>` nav) — untouched, documented |
| E2E gate suite (13 tests) | ✅ 13/13 pass — must run with auth bypass OFF: `AI_CONTENT_DISABLE_API_AUTH=false NEXT_PUBLIC_AI_CONTENT_DISABLE_API_AUTH=false npm run test:e2e:all` |
| E2E workflow suite (13 tests) | ⛔ BLOCKED — Supabase project `luxegqsccaodcikxhwrm` is returning 503 on all endpoints (auth + REST); likely paused. Not caused by this change. Re-run after the project is restored. |

## Remaining / blockers

0. **Supabase project `luxegqsccaodcikxhwrm` is DOWN (503, likely paused)** — workflow E2E, auth-state regeneration, and migration apply are all blocked until the owning account restores it from the Supabase dashboard. Neither the local Supabase CLI account nor the MCP connection has access to this project.
0b. `.env.local` has `AI_CONTENT_DISABLE_API_AUTH=true` + `NEXT_PUBLIC_AI_CONTENT_DISABLE_API_AUTH=true` — this disables the auth gate AND switches `db.ts` to localStorage-only (no Supabase writes) in dev. Must be set to false for a client demo with real data. Left untouched pending user decision.
1. **Remote DB migrations NOT applied** — permission gate requires explicit user approval for production DB changes. Files ready:
   - `supabase/migrations/20260611090000_acp_posts_status_rejected.sql` (Reject button stays broken on live DB until applied)
   - `supabase/migrations/20260611100000_acp_images_storage_bucket.sql` (image storage falls back to ephemeral URLs until applied)
2. Pre-existing repo-wide lint errors (8) in PRD/auth components — separate task.
3. Behavior change to flag for demo: autoPublish now defaults OFF; pipeline ends at `approved` and a human queues publish.
