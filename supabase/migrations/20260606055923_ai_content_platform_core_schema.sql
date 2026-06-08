create extension if not exists pgcrypto;
create extension if not exists vector;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  about text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'lawyer', 'accountant', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  can_create boolean not null default false,
  can_review boolean not null default false,
  can_approve boolean not null default false,
  can_publish boolean not null default false,
  can_manage_settings boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select tm.role
  from public.team_members tm
  where tm.profile_id = public.current_profile_id()
    and tm.status = 'active'
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.can_review()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.profile_id = public.current_profile_id()
      and tm.status = 'active'
      and (tm.role in ('admin', 'lawyer', 'accountant') or tm.can_review)
  )
$$;

create or replace function public.can_publish()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.profile_id = public.current_profile_id()
      and tm.status = 'active'
      and (tm.role = 'admin' or tm.can_publish)
  )
$$;

create or replace function public.can_manage_settings()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.profile_id = public.current_profile_id()
      and tm.status = 'active'
      and (tm.role = 'admin' or tm.can_manage_settings)
  )
$$;

revoke all on function public.current_profile_id() from public, anon;
revoke all on function public.current_user_role() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.can_review() from public, anon;
revoke all on function public.can_publish() from public, anon;
revoke all on function public.can_manage_settings() from public, anon;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_review() to authenticated;
grant execute on function public.can_publish() to authenticated;
grant execute on function public.can_manage_settings() to authenticated;

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brief text,
  category text,
  service_area text,
  status text not null default 'draft' check (status in (
    'draft', 'source_search', 'generating', 'ready_for_review', 'in_review',
    'approved', 'rejected', 'scheduled', 'published', 'failed', 'archived'
  )),
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high')),
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  scheduled_at timestamptz,
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_translations (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  language text not null check (language in ('th', 'en', 'zh', 'ja')),
  title text not null,
  body text,
  hashtags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'generated', 'edited', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_item_id, language)
);

create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  asset_type text not null check (asset_type in ('image', 'pdf', 'carousel_slide', 'thumbnail', 'source_file')),
  layout_type text check (layout_type in ('single', 'grid', 'carousel')),
  url text,
  storage_path text,
  alt_text text,
  source text,
  sort_order int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version_number int not null,
  snapshot jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (content_item_id, version_number)
);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (source_type in ('pdf', 'link', 'google_drive', 'obsidian', 'internal_guideline', 'template')),
  category text,
  origin text,
  url text,
  storage_path text,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'indexed', 'needs_review', 'failed')),
  uploaded_by uuid references public.profiles(id) on delete set null,
  last_indexed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  knowledge_source_id uuid not null references public.knowledge_sources(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  token_count int,
  created_at timestamptz not null default now(),
  unique (knowledge_source_id, chunk_index)
);

create table public.knowledge_embeddings (
  id uuid primary key default gen_random_uuid(),
  knowledge_chunk_id uuid not null references public.knowledge_chunks(id) on delete cascade,
  embedding vector(1536),
  model text not null,
  created_at timestamptz not null default now()
);

create table public.rag_queries (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  answer text,
  citations jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.review_items (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  assigned_reviewer uuid references public.profiles(id) on delete set null,
  review_type text not null check (review_type in ('legal', 'tax', 'accounting', 'brand', 'translation')),
  status text not null default 'in_review' check (status in ('in_review', 'approved', 'rejected', 'changes_requested')),
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_item_id uuid not null references public.review_items(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  comment text not null,
  field_path text,
  created_at timestamptz not null default now()
);

create table public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  review_item_id uuid references public.review_items(id) on delete cascade,
  status text not null check (status in ('passed', 'warning', 'failed')),
  summary text,
  model text,
  created_at timestamptz not null default now()
);

create table public.compliance_findings (
  id uuid primary key default gen_random_uuid(),
  compliance_check_id uuid not null references public.compliance_checks(id) on delete cascade,
  severity text not null check (severity in ('low', 'medium', 'high')),
  finding text not null,
  source_reference text,
  suggested_fix text,
  created_at timestamptz not null default now()
);

create table public.approval_events (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  review_item_id uuid references public.review_items(id) on delete set null,
  action text not null check (action in ('approve', 'reject', 'request_changes', 'auto_queue')),
  profile_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text,
  provider text not null,
  model text not null,
  system_prompt text,
  status text not null default 'online' check (status in ('online', 'offline', 'unstable', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_permissions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  permission text not null,
  enabled boolean not null default true,
  unique (agent_id, permission)
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete set null,
  trigger_source text not null,
  target_type text,
  target_id uuid,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  token_usage jsonb not null default '{}'::jsonb,
  cost numeric(12, 6),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references public.agent_runs(id) on delete cascade,
  level text not null check (level in ('debug', 'info', 'warning', 'error')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique check (provider in (
    'google_drive', 'obsidian', 'facebook', 'instagram', 'buffer',
    'youtube', 'tiktok', 'wordpress', 'email_newsletter'
  )),
  display_name text not null,
  status text not null default 'available' check (status in ('available', 'disabled')),
  created_at timestamptz not null default now()
);

create table public.integration_accounts (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  connected_by uuid references public.profiles(id) on delete set null,
  account_name text,
  external_account_id text,
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'expired', 'failed')),
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  integration_account_id uuid references public.integration_accounts(id) on delete cascade,
  sync_type text not null,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.publishing_queue (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  platform text not null,
  status text not null default 'queued' check (status in ('queued', 'ready', 'syncing', 'published', 'failed', 'cancelled')),
  scheduled_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publishing_jobs (
  id uuid primary key default gen_random_uuid(),
  publishing_queue_id uuid not null references public.publishing_queue(id) on delete cascade,
  integration_account_id uuid references public.integration_accounts(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'running', 'published', 'failed', 'cancelled')),
  external_post_id text,
  attempt_count int not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.publishing_errors (
  id uuid primary key default gen_random_uuid(),
  publishing_job_id uuid references public.publishing_jobs(id) on delete cascade,
  error_code text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  platform text,
  event_type text not null check (event_type in ('reach', 'engagement', 'click', 'impression', 'share', 'comment')),
  value numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table public.content_metrics (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  platform text,
  language text,
  reach int not null default 0,
  engagement int not null default 0,
  clicks int not null default 0,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now()
);

create table public.report_exports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  format text not null check (format in ('pdf', 'excel', 'csv', 'json')),
  storage_path text,
  generated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.system_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  status text not null default 'succeeded' check (status in ('queued', 'running', 'succeeded', 'failed')),
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.error_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'ignored', 'reopened')),
  message text not null,
  source text,
  agent_run_id uuid references public.agent_runs(id) on delete set null,
  integration_account_id uuid references public.integration_accounts(id) on delete set null,
  publishing_job_id uuid references public.publishing_jobs(id) on delete set null,
  content_item_id uuid references public.content_items(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.feature_usage_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  feature_name text not null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.usage_rollups (
  id uuid primary key default gen_random_uuid(),
  rollup_date date not null,
  metric_name text not null,
  metric_value numeric not null default 0,
  dimension jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.log_exports (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references public.profiles(id) on delete set null,
  format text not null check (format in ('csv', 'json', 'pdf')),
  scope text not null check (scope in (
    'error_logs', 'agent_activity', 'user_activity', 'publishing_logs',
    'rag_queries', 'compliance_audit', 'usage_metrics'
  )),
  filters jsonb not null default '{}'::jsonb,
  status text not null default 'requested' check (status in ('requested', 'generating', 'ready', 'failed', 'expired')),
  storage_path text,
  created_at timestamptz not null default now(),
  ready_at timestamptz,
  expires_at timestamptz
);

create index content_items_status_idx on public.content_items(status);
create index content_items_category_idx on public.content_items(category);
create index content_items_scheduled_at_idx on public.content_items(scheduled_at);
create index content_translations_content_item_id_idx on public.content_translations(content_item_id);
create index content_assets_content_item_id_idx on public.content_assets(content_item_id);
create index knowledge_sources_status_idx on public.knowledge_sources(status);
create index knowledge_chunks_source_idx on public.knowledge_chunks(knowledge_source_id);
create index knowledge_embeddings_chunk_idx on public.knowledge_embeddings(knowledge_chunk_id);
create index review_items_status_idx on public.review_items(status);
create index review_items_assigned_reviewer_idx on public.review_items(assigned_reviewer);
create index agent_runs_agent_id_idx on public.agent_runs(agent_id);
create index agent_runs_status_idx on public.agent_runs(status);
create index publishing_queue_status_idx on public.publishing_queue(status);
create index publishing_queue_scheduled_at_idx on public.publishing_queue(scheduled_at);
create index analytics_events_content_item_id_idx on public.analytics_events(content_item_id);
create index content_metrics_content_item_id_idx on public.content_metrics(content_item_id);
create index audit_events_event_type_idx on public.audit_events(event_type);
create index audit_events_target_idx on public.audit_events(target_type, target_id);
create index error_events_status_idx on public.error_events(status);
create index error_events_severity_idx on public.error_events(severity);
create index feature_usage_events_feature_idx on public.feature_usage_events(feature_name);
create index usage_rollups_date_metric_idx on public.usage_rollups(rollup_date, metric_name);
create index log_exports_status_idx on public.log_exports(status);

insert into public.integrations (provider, display_name)
values
  ('google_drive', 'Google Drive'),
  ('obsidian', 'Obsidian'),
  ('facebook', 'Facebook'),
  ('instagram', 'Instagram'),
  ('buffer', 'Buffer'),
  ('youtube', 'YouTube'),
  ('tiktok', 'TikTok'),
  ('wordpress', 'WordPress'),
  ('email_newsletter', 'Email Newsletter')
on conflict (provider) do nothing;

alter table public.profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.content_items enable row level security;
alter table public.content_translations enable row level security;
alter table public.content_assets enable row level security;
alter table public.content_versions enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.knowledge_embeddings enable row level security;
alter table public.rag_queries enable row level security;
alter table public.review_items enable row level security;
alter table public.review_comments enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.compliance_findings enable row level security;
alter table public.approval_events enable row level security;
alter table public.agents enable row level security;
alter table public.agent_permissions enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_logs enable row level security;
alter table public.integrations enable row level security;
alter table public.integration_accounts enable row level security;
alter table public.sync_logs enable row level security;
alter table public.publishing_queue enable row level security;
alter table public.publishing_jobs enable row level security;
alter table public.publishing_errors enable row level security;
alter table public.analytics_events enable row level security;
alter table public.content_metrics enable row level security;
alter table public.report_exports enable row level security;
alter table public.audit_events enable row level security;
alter table public.system_events enable row level security;
alter table public.error_events enable row level security;
alter table public.feature_usage_events enable row level security;
alter table public.usage_rollups enable row level security;
alter table public.log_exports enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (auth_user_id = auth.uid() or public.is_admin());

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth_user_id = auth.uid());

create policy "profiles_update_own_or_admin"
on public.profiles for update
to authenticated
using (auth_user_id = auth.uid() or public.is_admin())
with check (auth_user_id = auth.uid() or public.is_admin());

create policy "team_members_admin_all"
on public.team_members for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "team_members_select_own"
on public.team_members for select
to authenticated
using (profile_id = public.current_profile_id() or public.is_admin());

create policy "content_items_select_team"
on public.content_items for select
to authenticated
using (
  public.is_admin()
  or created_by = public.current_profile_id()
  or assigned_to = public.current_profile_id()
  or status in ('approved', 'scheduled', 'published')
  or public.can_review()
);

create policy "content_items_insert_creators"
on public.content_items for insert
to authenticated
with check (
  public.is_admin()
  or created_by = public.current_profile_id()
);

create policy "content_items_update_allowed"
on public.content_items for update
to authenticated
using (
  public.is_admin()
  or created_by = public.current_profile_id()
  or assigned_to = public.current_profile_id()
  or public.can_review()
  or public.can_publish()
)
with check (
  public.is_admin()
  or created_by = public.current_profile_id()
  or assigned_to = public.current_profile_id()
  or public.can_review()
  or public.can_publish()
);

create policy "content_children_select_team"
on public.content_translations for select
to authenticated
using (exists (
  select 1 from public.content_items ci
  where ci.id = content_item_id
));

create policy "content_children_write_team"
on public.content_translations for all
to authenticated
using (public.is_admin() or public.can_review() or exists (
  select 1 from public.content_items ci
  where ci.id = content_item_id and ci.created_by = public.current_profile_id()
))
with check (public.is_admin() or public.can_review() or exists (
  select 1 from public.content_items ci
  where ci.id = content_item_id and ci.created_by = public.current_profile_id()
));

create policy "assets_select_team"
on public.content_assets for select
to authenticated
using (public.is_admin() or public.can_review() or exists (
  select 1 from public.content_items ci
  where ci.id = content_item_id
    and (ci.created_by = public.current_profile_id() or ci.status in ('approved', 'scheduled', 'published'))
));

create policy "assets_write_creators"
on public.content_assets for all
to authenticated
using (public.is_admin() or exists (
  select 1 from public.content_items ci
  where ci.id = content_item_id and ci.created_by = public.current_profile_id()
))
with check (public.is_admin() or exists (
  select 1 from public.content_items ci
  where ci.id = content_item_id and ci.created_by = public.current_profile_id()
));

create policy "versions_select_team"
on public.content_versions for select
to authenticated
using (public.is_admin() or public.can_review() or created_by = public.current_profile_id());

create policy "versions_insert_team"
on public.content_versions for insert
to authenticated
with check (public.is_admin() or public.can_review() or created_by = public.current_profile_id());

create policy "knowledge_sources_select_indexed_or_team"
on public.knowledge_sources for select
to authenticated
using (status = 'indexed' or uploaded_by = public.current_profile_id() or public.can_review() or public.is_admin());

create policy "knowledge_sources_write_team"
on public.knowledge_sources for all
to authenticated
using (public.is_admin() or public.can_review() or uploaded_by = public.current_profile_id())
with check (public.is_admin() or public.can_review() or uploaded_by = public.current_profile_id());

create policy "knowledge_chunks_select_reviewers"
on public.knowledge_chunks for select
to authenticated
using (public.is_admin() or public.can_review() or exists (
  select 1 from public.knowledge_sources ks
  where ks.id = knowledge_source_id and ks.status = 'indexed'
));

create policy "knowledge_chunks_write_admin"
on public.knowledge_chunks for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "knowledge_embeddings_deny_client"
on public.knowledge_embeddings for all
to authenticated
using (false)
with check (false);

create policy "rag_queries_select_own_or_admin"
on public.rag_queries for select
to authenticated
using (created_by = public.current_profile_id() or public.is_admin() or public.can_review());

create policy "rag_queries_insert_own"
on public.rag_queries for insert
to authenticated
with check (created_by = public.current_profile_id() or public.is_admin());

create policy "review_items_select_reviewers"
on public.review_items for select
to authenticated
using (public.is_admin() or public.can_review() or assigned_reviewer = public.current_profile_id());

create policy "review_items_write_reviewers"
on public.review_items for all
to authenticated
using (public.is_admin() or public.can_review())
with check (public.is_admin() or public.can_review());

create policy "review_comments_reviewers"
on public.review_comments for all
to authenticated
using (public.is_admin() or public.can_review() or profile_id = public.current_profile_id())
with check (public.is_admin() or public.can_review() or profile_id = public.current_profile_id());

create policy "compliance_select_reviewers"
on public.compliance_checks for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "compliance_write_reviewers"
on public.compliance_checks for all
to authenticated
using (public.is_admin() or public.can_review())
with check (public.is_admin() or public.can_review());

create policy "findings_select_reviewers"
on public.compliance_findings for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "findings_write_reviewers"
on public.compliance_findings for all
to authenticated
using (public.is_admin() or public.can_review())
with check (public.is_admin() or public.can_review());

create policy "approval_events_select_reviewers"
on public.approval_events for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "approval_events_insert_reviewers"
on public.approval_events for insert
to authenticated
with check (public.is_admin() or public.can_review());

create policy "agents_select_team"
on public.agents for select
to authenticated
using (public.is_admin() or public.can_review() or created_by = public.current_profile_id());

create policy "agents_admin_all"
on public.agents for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "agent_permissions_select_team"
on public.agent_permissions for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "agent_permissions_admin_all"
on public.agent_permissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "agent_runs_select_related"
on public.agent_runs for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "agent_runs_insert_team"
on public.agent_runs for insert
to authenticated
with check (public.is_admin() or public.can_review());

create policy "agent_runs_update_admin"
on public.agent_runs for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "agent_logs_select_team"
on public.agent_logs for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "agent_logs_insert_team"
on public.agent_logs for insert
to authenticated
with check (public.is_admin() or public.can_review());

create policy "integrations_select_team"
on public.integrations for select
to authenticated
using (true);

create policy "integrations_admin_all"
on public.integrations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "integration_accounts_admin_all"
on public.integration_accounts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "sync_logs_select_team"
on public.sync_logs for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "sync_logs_insert_admin"
on public.sync_logs for insert
to authenticated
with check (public.is_admin());

create policy "publishing_queue_select_team"
on public.publishing_queue for select
to authenticated
using (public.is_admin() or public.can_publish() or created_by = public.current_profile_id() or public.can_review());

create policy "publishing_queue_write_publishers"
on public.publishing_queue for all
to authenticated
using (public.is_admin() or public.can_publish())
with check (public.is_admin() or public.can_publish());

create policy "publishing_jobs_select_team"
on public.publishing_jobs for select
to authenticated
using (public.is_admin() or public.can_publish() or public.can_review());

create policy "publishing_jobs_write_publishers"
on public.publishing_jobs for all
to authenticated
using (public.is_admin() or public.can_publish())
with check (public.is_admin() or public.can_publish());

create policy "publishing_errors_select_team"
on public.publishing_errors for select
to authenticated
using (public.is_admin() or public.can_publish() or public.can_review());

create policy "publishing_errors_insert_publishers"
on public.publishing_errors for insert
to authenticated
with check (public.is_admin() or public.can_publish());

create policy "analytics_select_team"
on public.analytics_events for select
to authenticated
using (public.is_admin() or public.can_review() or public.can_publish());

create policy "analytics_insert_admin"
on public.analytics_events for insert
to authenticated
with check (public.is_admin());

create policy "metrics_select_team"
on public.content_metrics for select
to authenticated
using (public.is_admin() or public.can_review() or public.can_publish());

create policy "metrics_write_admin"
on public.content_metrics for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "report_exports_select_team"
on public.report_exports for select
to authenticated
using (public.is_admin() or generated_by = public.current_profile_id());

create policy "report_exports_insert_team"
on public.report_exports for insert
to authenticated
with check (public.is_admin() or generated_by = public.current_profile_id());

create policy "audit_events_select_relevant"
on public.audit_events for select
to authenticated
using (public.is_admin() or actor_profile_id = public.current_profile_id() or public.can_review());

create policy "audit_events_insert_team"
on public.audit_events for insert
to authenticated
with check (actor_profile_id = public.current_profile_id() or public.is_admin());

create policy "system_events_admin_select"
on public.system_events for select
to authenticated
using (public.is_admin());

create policy "error_events_select_relevant"
on public.error_events for select
to authenticated
using (public.is_admin() or public.can_review() or public.can_publish());

create policy "error_events_write_admin"
on public.error_events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "feature_usage_insert_own"
on public.feature_usage_events for insert
to authenticated
with check (profile_id = public.current_profile_id() or profile_id is null);

create policy "feature_usage_select_admin"
on public.feature_usage_events for select
to authenticated
using (public.is_admin());

create policy "usage_rollups_select_team"
on public.usage_rollups for select
to authenticated
using (public.is_admin() or public.can_review() or public.can_publish());

create policy "usage_rollups_write_admin"
on public.usage_rollups for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "log_exports_select_relevant"
on public.log_exports for select
to authenticated
using (public.is_admin() or requested_by = public.current_profile_id() or public.can_review());

create policy "log_exports_insert_allowed"
on public.log_exports for insert
to authenticated
with check (public.is_admin() or requested_by = public.current_profile_id());

create policy "log_exports_update_admin"
on public.log_exports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
