# Cursor Review Request

## Status

**Review requested** — P1-FIX-01 workflow integrity fixes (2026-06-11), user-approved direct execution.

## What to review

`_agent/TASK_RESULT.md` — full change list (Batches A–D + image storage), audit findings F1–F11 all addressed.

Touched files:
- `src/app/publisher/review/ReviewDashboard.tsx`, `PostPreview.tsx`
- `src/app/publisher/images/ImageGenerator.tsx`
- `src/app/publisher/content-generation/ContentGenerator.tsx`
- `src/app/publisher/publishing/PublishQueue.tsx`
- `src/lib/publisher/{openai,image-generator,review-actions,db,log-system,buffer-publisher,facebook-publisher,publish-router}.ts`
- `src/lib/publisher/image-storage.ts` (new)
- `src/lib/publisher/supabase/types.ts`
- `supabase/migrations/20260611090000_acp_posts_status_rejected.sql` (new, NOT yet applied remotely)
- `supabase/migrations/20260611100000_acp_images_storage_bucket.sql` (new, NOT yet applied remotely)

## Verification snapshot

- tsc / eslint (touched files) / `npm run build`: ✅
- E2E gate: ✅ 13/13 (bypass off)
- E2E workflow: ⛔ blocked — Supabase project 503/paused (external)

## User actions needed

1. Restore Supabase project `luxegqsccaodcikxhwrm` (dashboard of owning account)
2. Approve applying the 2 new migrations
3. Decide on disabling `AI_CONTENT_DISABLE_API_AUTH` flags in `.env.local` for demo
