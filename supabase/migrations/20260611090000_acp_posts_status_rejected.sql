-- Align acp_posts.status CHECK with the UI ReviewStatus model.
-- review-actions.ts writes 'rejected' (Reject button) and the model includes
-- 'publishing'; both were missing from the original INT-01 constraint, so
-- rejectPost failed with a check violation against the live database.

alter table public.acp_posts drop constraint if exists acp_posts_status_check;

alter table public.acp_posts add constraint acp_posts_status_check
  check (status in (
    'draft',
    'revision_requested',
    'approved',
    'rejected',
    'scheduled',
    'publishing',
    'published',
    'failed'
  ));
