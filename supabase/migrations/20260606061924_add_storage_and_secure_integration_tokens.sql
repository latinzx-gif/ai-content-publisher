create table public.integration_tokens (
  id uuid primary key default gen_random_uuid(),
  integration_account_id uuid not null references public.integration_accounts(id) on delete cascade,
  token_type text not null check (token_type in ('access_token', 'refresh_token', 'api_key', 'webhook_secret')),
  encrypted_token text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index integration_tokens_account_idx on public.integration_tokens(integration_account_id);
create index integration_tokens_expires_at_idx on public.integration_tokens(expires_at);

alter table public.integration_tokens enable row level security;

create policy "integration_tokens_deny_client_select"
on public.integration_tokens for select
to authenticated
using (false);

create policy "integration_tokens_deny_client_insert"
on public.integration_tokens for insert
to authenticated
with check (false);

create policy "integration_tokens_deny_client_update"
on public.integration_tokens for update
to authenticated
using (false)
with check (false);

create policy "integration_tokens_deny_client_delete"
on public.integration_tokens for delete
to authenticated
using (false);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'knowledge-files',
    'knowledge-files',
    false,
    52428800,
    array[
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'content-assets',
    'content-assets',
    false,
    52428800,
    array[
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf'
    ]
  ),
  (
    'report-exports',
    'report-exports',
    false,
    52428800,
    array[
      'application/pdf',
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  )
on conflict (id) do nothing;

create policy "knowledge_files_authenticated_read"
on storage.objects for select
to authenticated
using (bucket_id = 'knowledge-files');

create policy "knowledge_files_reviewers_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'knowledge-files'
  and (public.is_admin() or public.can_review())
);

create policy "content_assets_authenticated_read"
on storage.objects for select
to authenticated
using (bucket_id = 'content-assets');

create policy "content_assets_authenticated_write"
on storage.objects for insert
to authenticated
with check (bucket_id = 'content-assets');

create policy "report_exports_authenticated_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'report-exports'
  and (public.is_admin() or public.can_review() or public.can_publish())
);

create policy "report_exports_admin_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'report-exports'
  and (public.is_admin() or public.can_review())
);
