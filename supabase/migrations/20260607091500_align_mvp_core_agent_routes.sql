do $$
declare
  content_strategy_agent_id uuid;
  legal_compliance_agent_id uuid;
begin
  select id into content_strategy_agent_id
  from public.agents
  where name = 'Content Strategy Agent'
  limit 1;

  select id into legal_compliance_agent_id
  from public.agents
  where name = 'Legal Compliance Agent'
  limit 1;

  if content_strategy_agent_id is null or legal_compliance_agent_id is null then
    raise notice 'Skipping MVP core agent route alignment because required agents are missing.';
    return;
  end if;

  update public.agent_routes
  set
    default_agent_id = content_strategy_agent_id,
    fallback_agent_id = legal_compliance_agent_id,
    required_capability = 'rag_search',
    risk_level = 'medium',
    enabled = true
  where task_type = 'source_search';

  update public.agent_routes
  set
    default_agent_id = content_strategy_agent_id,
    fallback_agent_id = legal_compliance_agent_id,
    required_capability = 'rag_search',
    risk_level = 'medium',
    enabled = true
  where task_type = 'draft_generation';

  update public.agent_routes
  set
    default_agent_id = legal_compliance_agent_id,
    fallback_agent_id = content_strategy_agent_id,
    required_capability = 'legal_review',
    risk_level = 'high',
    enabled = true
  where task_type in ('legal_review', 'tax_review');

  insert into public.agent_capabilities (agent_id, capability, enabled)
  values
    (content_strategy_agent_id, 'rag_search', true)
  on conflict (agent_id, capability)
  do update set enabled = excluded.enabled;

  update public.agent_model_preferences
  set provider = 'openai', model = 'gpt-5.4', priority = 5
  where agent_id = content_strategy_agent_id
    and task_type = 'source_search'
    and risk_level = 'medium';

  if not exists (
    select 1
    from public.agent_model_preferences
    where agent_id = content_strategy_agent_id
      and task_type = 'source_search'
      and risk_level = 'medium'
  ) then
    insert into public.agent_model_preferences (
      agent_id,
      provider,
      model,
      task_type,
      risk_level,
      priority
    )
    values (content_strategy_agent_id, 'openai', 'gpt-5.4', 'source_search', 'medium', 5);
  end if;

  update public.agent_model_preferences
  set provider = 'openai', model = 'gpt-5.4', priority = 5
  where agent_id = content_strategy_agent_id
    and task_type = 'draft_generation'
    and risk_level = 'medium';

  if not exists (
    select 1
    from public.agent_model_preferences
    where agent_id = content_strategy_agent_id
      and task_type = 'draft_generation'
      and risk_level = 'medium'
  ) then
    insert into public.agent_model_preferences (
      agent_id,
      provider,
      model,
      task_type,
      risk_level,
      priority
    )
    values (content_strategy_agent_id, 'openai', 'gpt-5.4', 'draft_generation', 'medium', 5);
  end if;

  update public.agent_model_preferences
  set provider = 'openai', model = 'gpt-5.5', priority = 5
  where agent_id = legal_compliance_agent_id
    and task_type = 'legal_review'
    and risk_level = 'high';

  if not exists (
    select 1
    from public.agent_model_preferences
    where agent_id = legal_compliance_agent_id
      and task_type = 'legal_review'
      and risk_level = 'high'
  ) then
    insert into public.agent_model_preferences (
      agent_id,
      provider,
      model,
      task_type,
      risk_level,
      priority
    )
    values (legal_compliance_agent_id, 'openai', 'gpt-5.5', 'legal_review', 'high', 5);
  end if;

  update public.agent_model_preferences
  set provider = 'openai', model = 'gpt-5.5', priority = 5
  where agent_id = legal_compliance_agent_id
    and task_type = 'tax_review'
    and risk_level = 'high';

  if not exists (
    select 1
    from public.agent_model_preferences
    where agent_id = legal_compliance_agent_id
      and task_type = 'tax_review'
      and risk_level = 'high'
  ) then
    insert into public.agent_model_preferences (
      agent_id,
      provider,
      model,
      task_type,
      risk_level,
      priority
    )
    values (legal_compliance_agent_id, 'openai', 'gpt-5.5', 'tax_review', 'high', 5);
  end if;
end $$;
