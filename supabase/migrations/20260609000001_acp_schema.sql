-- INT-01: ai-content-publisher schema
-- All tables use acp_ prefix (shared DB with head-office-app: luxegqsccaodcikxhwrm)
-- RLS: disabled now; enable + add policies in INT-06

-- ─── acp_posts ────────────────────────────────────────────────────────────────
-- One row per content creation session / post_id
create table if not exists public.acp_posts (
  post_id        text primary key,
  status         text not null default 'draft'
                 check (status in ('draft','revision_requested','approved','scheduled','published','failed')),
  brand          text,
  platform       text,
  primary_lang   text not null default 'Thai',
  secondary_lang text not null default 'English',
  scheduled_at   timestamptz,
  metadata       jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── acp_post_content ─────────────────────────────────────────────────────────
-- Brief + generated content (primary + secondary language versions)
create table if not exists public.acp_post_content (
  id             uuid primary key default gen_random_uuid(),
  post_id        text not null references public.acp_posts(post_id) on delete cascade,
  brief          jsonb,
  rules          jsonb,
  content        jsonb,
  image_prompts  jsonb,
  generated_at   timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists acp_post_content_post_id_idx
  on public.acp_post_content(post_id);

-- ─── acp_post_images ──────────────────────────────────────────────────────────
-- Generated image records; one row per image version
create table if not exists public.acp_post_images (
  id                 uuid primary key default gen_random_uuid(),
  post_id            text not null references public.acp_posts(post_id) on delete cascade,
  type               text not null check (type in ('primary','secondary')),
  version            integer not null default 1,
  visual_concept_id  text,
  image_url          text not null,
  is_placeholder     boolean not null default false,
  prompt             jsonb,
  generated_at       timestamptz not null default now()
);

create index if not exists acp_post_images_post_id_idx
  on public.acp_post_images(post_id);

-- ─── acp_audit_logs ───────────────────────────────────────────────────────────
-- Mirrors the localStorage log-system; written server-side when available
create table if not exists public.acp_audit_logs (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('generation','image','publish','error')),
  action     text not null,
  post_id    text not null,
  details    text,
  status     text not null check (status in ('success','warn','error')),
  agent      text,
  created_at timestamptz not null default now()
);

create index if not exists acp_audit_logs_post_id_idx
  on public.acp_audit_logs(post_id);
create index if not exists acp_audit_logs_created_at_idx
  on public.acp_audit_logs(created_at desc);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.acp_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger acp_posts_updated_at
  before update on public.acp_posts
  for each row execute function public.acp_set_updated_at();

create or replace trigger acp_post_content_updated_at
  before update on public.acp_post_content
  for each row execute function public.acp_set_updated_at();

-- ─── RLS placeholder (INT-06 will add policies) ───────────────────────────────
-- RLS is intentionally left disabled for Phase 1 service-role access.
-- Enable with: alter table public.acp_posts enable row level security;
-- (and add policies) in INT-06.
