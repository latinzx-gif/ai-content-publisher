alter table public.content_items
  drop constraint if exists content_items_status_check;

alter table public.content_items
  add constraint content_items_status_check
  check (
    status in (
      'draft',
      'source_search',
      'generating',
      'text_ready',
      'assets_ready',
      'ready_for_review',
      'in_review',
      'approved',
      'rejected',
      'scheduled',
      'published',
      'failed',
      'archived'
    )
  );
