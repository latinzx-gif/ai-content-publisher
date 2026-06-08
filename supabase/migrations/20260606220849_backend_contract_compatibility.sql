create or replace view public.content_jobs
with (security_invoker = true)
as
select
  ci.id,
  ci.title,
  ci.brief,
  ci.category,
  ci.service_area,
  ci.status as canonical_status,
  case ci.status
    when 'draft' then 'Brief Created'
    when 'source_search' then 'Source Search'
    when 'generating' then 'Generation'
    when 'ready_for_review' then 'Ready for Review'
    when 'in_review' then 'In Review'
    when 'approved' then 'Approved'
    when 'scheduled' then 'Publishing Queued'
    when 'published' then 'Posted'
    when 'failed' then 'Failed'
    else initcap(replace(ci.status, '_', ' '))
  end as workflow_stage,
  ci.risk_level,
  ci.created_by,
  ci.assigned_to,
  ci.scheduled_at,
  ci.published_at,
  ci.metadata,
  ci.created_at,
  ci.updated_at
from public.content_items ci;

grant select on public.content_jobs to authenticated, service_role;

create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  source text not null default 'system',
  severity text not null default 'low' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'succeeded' check (status in ('queued', 'running', 'succeeded', 'failed', 'open', 'resolved', 'audit')),
  target_type text,
  target_id uuid,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists system_logs_event_type_idx on public.system_logs(event_type);
create index if not exists system_logs_actor_profile_idx on public.system_logs(actor_profile_id);
create index if not exists system_logs_target_idx on public.system_logs(target_type, target_id);
create index if not exists system_logs_created_at_idx on public.system_logs(created_at desc);

alter table public.system_logs enable row level security;

drop policy if exists "system_logs_select_team" on public.system_logs;
create policy "system_logs_select_team"
on public.system_logs for select
to authenticated
using (
  public.is_admin()
  or public.can_review()
  or public.can_publish()
  or actor_profile_id = public.current_profile_id()
);

drop policy if exists "system_logs_insert_team" on public.system_logs;
create policy "system_logs_insert_team"
on public.system_logs for insert
to authenticated
with check (
  public.is_admin()
  or public.can_review()
  or public.can_publish()
  or actor_profile_id = public.current_profile_id()
);

grant select, insert on public.system_logs to authenticated;
grant select, insert, update, delete on public.system_logs to service_role;

create or replace function public.claim_next_agent_run()
returns public.agent_runs
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_run public.agent_runs%rowtype;
begin
  select *
  into v_run
  from public.agent_runs
  where status = 'queued'
  order by created_at asc
  for update skip locked
  limit 1;

  if not found then
    return null;
  end if;

  update public.agent_runs
  set
    status = 'running',
    started_at = now()
  where id = v_run.id
  returning * into v_run;

  return v_run;
end;
$$;

revoke all on function public.claim_next_agent_run() from public, anon, authenticated;
grant execute on function public.claim_next_agent_run() to service_role;
