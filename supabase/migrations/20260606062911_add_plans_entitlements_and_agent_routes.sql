create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  max_agents int not null default 4,
  max_agent_runs_monthly int not null default 100,
  can_create_custom_agents boolean not null default false,
  can_choose_model boolean not null default false,
  can_edit_agent_prompt boolean not null default false,
  can_export_logs boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.account_subscriptions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'cancelled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feature_entitlements (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default false,
  limit_value int,
  created_at timestamptz not null default now(),
  unique (plan_id, feature_key)
);

create table public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  feature_key text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  used_count int not null default 0,
  limit_count int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_capabilities (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  capability text not null check (capability in (
    'rag_search', 'legal_review', 'tax_review', 'translation',
    'image_generation', 'publishing', 'analytics', 'debugging'
  )),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (agent_id, capability)
);

create table public.agent_routes (
  id uuid primary key default gen_random_uuid(),
  task_type text not null,
  default_agent_id uuid references public.agents(id) on delete set null,
  fallback_agent_id uuid references public.agents(id) on delete set null,
  required_capability text,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (task_type)
);

create table public.agent_model_preferences (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  provider text not null,
  model text not null,
  task_type text,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  priority int not null default 100,
  created_at timestamptz not null default now()
);

create index feature_entitlements_feature_key_idx on public.feature_entitlements(feature_key);
create index usage_counters_feature_period_idx on public.usage_counters(feature_key, period_start, period_end);
create index agent_capabilities_capability_idx on public.agent_capabilities(capability);
create index agent_routes_task_type_idx on public.agent_routes(task_type);
create index agent_model_preferences_agent_idx on public.agent_model_preferences(agent_id);

alter table public.plans enable row level security;
alter table public.account_subscriptions enable row level security;
alter table public.feature_entitlements enable row level security;
alter table public.usage_counters enable row level security;
alter table public.agent_capabilities enable row level security;
alter table public.agent_routes enable row level security;
alter table public.agent_model_preferences enable row level security;

create policy "plans_select_authenticated"
on public.plans for select
to authenticated
using (true);

create policy "plans_admin_all"
on public.plans for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "account_subscriptions_select_admin"
on public.account_subscriptions for select
to authenticated
using (public.is_admin());

create policy "account_subscriptions_admin_all"
on public.account_subscriptions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "feature_entitlements_select_authenticated"
on public.feature_entitlements for select
to authenticated
using (true);

create policy "feature_entitlements_admin_all"
on public.feature_entitlements for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "usage_counters_select_own_or_admin"
on public.usage_counters for select
to authenticated
using (profile_id = public.current_profile_id() or public.is_admin());

create policy "usage_counters_admin_all"
on public.usage_counters for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "agent_capabilities_select_team"
on public.agent_capabilities for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "agent_capabilities_admin_all"
on public.agent_capabilities for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "agent_routes_select_team"
on public.agent_routes for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "agent_routes_admin_all"
on public.agent_routes for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "agent_model_preferences_select_team"
on public.agent_model_preferences for select
to authenticated
using (public.is_admin() or public.can_review());

create policy "agent_model_preferences_admin_all"
on public.agent_model_preferences for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.plans (
  name,
  slug,
  max_agents,
  max_agent_runs_monthly,
  can_create_custom_agents,
  can_choose_model,
  can_edit_agent_prompt,
  can_export_logs,
  metadata
)
values
  (
    'Basic',
    'basic',
    4,
    100,
    false,
    false,
    false,
    false,
    '{"description":"Default agents only. Custom agents are locked for upsell."}'::jsonb
  ),
  (
    'Pro',
    'pro',
    12,
    2000,
    true,
    true,
    true,
    true,
    '{"description":"Custom agents, model selection, prompt editing, and log exports."}'::jsonb
  ),
  (
    'Business',
    'business',
    50,
    10000,
    true,
    true,
    true,
    true,
    '{"description":"Advanced teams, higher quotas, routing, and premium support."}'::jsonb
  )
on conflict (slug) do nothing;

insert into public.feature_entitlements (plan_id, feature_key, enabled, limit_value)
select id, feature_key, enabled, limit_value
from public.plans
cross join lateral (
  values
    ('custom_agents', slug in ('pro', 'business'), case when slug = 'basic' then 0 when slug = 'pro' then 8 else 46 end),
    ('model_selection', slug in ('pro', 'business'), null),
    ('agent_routes', slug in ('pro', 'business'), null),
    ('agent_prompt_editing', slug in ('pro', 'business'), null),
    ('log_exports', slug in ('pro', 'business'), case when slug = 'basic' then 0 when slug = 'pro' then 100 else 1000 end),
    ('rag_queries', true, case when slug = 'basic' then 200 when slug = 'pro' then 5000 else 50000 end),
    ('publishing_integrations', slug in ('pro', 'business'), case when slug = 'basic' then 1 when slug = 'pro' then 5 else 20 end),
    ('advanced_analytics', slug in ('pro', 'business'), null)
) as entitlements(feature_key, enabled, limit_value)
on conflict (plan_id, feature_key) do nothing;

create or replace function public.current_plan_slug()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.slug
  from public.account_subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.status in ('trialing', 'active')
  order by s.created_at desc
  limit 1
$$;

create or replace function public.has_feature(feature_key_input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select fe.enabled
    from public.account_subscriptions s
    join public.feature_entitlements fe on fe.plan_id = s.plan_id
    where s.status in ('trialing', 'active')
      and fe.feature_key = feature_key_input
    order by s.created_at desc
    limit 1
  ), false)
$$;

revoke all on function public.current_plan_slug() from public, anon;
revoke all on function public.has_feature(text) from public, anon;
grant execute on function public.current_plan_slug() to authenticated;
grant execute on function public.has_feature(text) to authenticated;
