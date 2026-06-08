with seed_agents(name, purpose, provider, model, system_prompt, status) as (
  values
    (
      'Content Strategy Agent',
      'Plans weekly legal/accounting content themes and maps them to target audiences.',
      'openai',
      'gpt-5.4',
      'Plan content themes, calendar gaps, target audience angles, and service coverage. Use concise reasoning and route legal-risk claims to compliance review.',
      'online'
    ),
    (
      'RAG Research Agent',
      'Searches Knowledge Base, Google Drive, Obsidian, and official links before drafting.',
      'openai',
      'gpt-5.4',
      'Retrieve citation-backed facts from approved knowledge sources only. If no source is found, block generation and request a new source upload.',
      'online'
    ),
    (
      'Content Generation Agent',
      'Drafts multilingual legal/accounting content from approved briefs and cited sources.',
      'openai',
      'gpt-5.4',
      'Generate compliant, professional, citation-aware social content. Avoid exaggerated promises and preserve review notes.',
      'online'
    ),
    (
      'Legal Compliance Agent',
      'Checks legal claims, prohibited wording, citations, and professional ethics rules.',
      'openai',
      'gpt-5.5',
      'Review legal, tax, accounting, and ethics risk. Flag unsupported claims, prohibited promises, citation gaps, and high-risk wording.',
      'online'
    ),
    (
      'Tax & Accounting Agent',
      'Reviews tax/accounting accuracy, deadlines, document requirements, and risk language.',
      'openai',
      'gpt-5.4',
      'Validate tax and accounting content against approved sources. Highlight filing deadlines, assumptions, and missing supporting documents.',
      'online'
    ),
    (
      'Multilingual Localization Agent',
      'Translates and adapts Thai, English, Chinese, and Japanese content while preserving meaning.',
      'openai',
      'gpt-5.4-mini',
      'Translate and localize without changing legal meaning. Flag translation drift, cultural mismatch, and unsupported legal terms.',
      'online'
    ),
    (
      'Image & Layout Agent',
      'Finds image directions, selects mock image pool assets, and prepares carousel layouts.',
      'openai',
      'gpt-image-2',
      'Create image direction, carousel structure, and layout notes that match the content brief and brand rules.',
      'online'
    ),
    (
      'Publishing Agent',
      'Queues approved posts to LinkedIn, Facebook, WordPress, and Email Newsletter.',
      'openai',
      'gpt-5.4-mini',
      'Publish only approved content. Check token readiness, schedule conflicts, channel rules, and log every sync result.',
      'online'
    ),
    (
      'Analytics Insight Agent',
      'Summarizes reach, engagement, clicks, language performance, and topic trends.',
      'openai',
      'gpt-5.4-mini',
      'Summarize performance trends, winning services, language-level impact, and next best content actions.',
      'online'
    )
)
insert into public.agents (name, purpose, provider, model, system_prompt, status)
select name, purpose, provider, model, system_prompt, status
from seed_agents
where not exists (
  select 1
  from public.agents
  where public.agents.name = seed_agents.name
);

with route_seed(task_type, agent_name, fallback_name, capability, risk_level) as (
  values
    ('topic_planning', 'Content Strategy Agent', 'Content Generation Agent', 'analytics', 'low'),
    ('source_search', 'RAG Research Agent', 'Legal Compliance Agent', 'rag_search', 'medium'),
    ('draft_generation', 'Content Generation Agent', 'Legal Compliance Agent', 'rag_search', 'medium'),
    ('legal_review', 'Legal Compliance Agent', 'Tax & Accounting Agent', 'legal_review', 'high'),
    ('tax_review', 'Tax & Accounting Agent', 'Legal Compliance Agent', 'tax_review', 'high'),
    ('localization', 'Multilingual Localization Agent', 'Legal Compliance Agent', 'translation', 'medium'),
    ('image_layout', 'Image & Layout Agent', 'Content Generation Agent', 'image_generation', 'low'),
    ('publishing', 'Publishing Agent', 'Legal Compliance Agent', 'publishing', 'medium'),
    ('analytics_insight', 'Analytics Insight Agent', 'Content Strategy Agent', 'analytics', 'low')
)
insert into public.agent_routes (
  task_type,
  default_agent_id,
  fallback_agent_id,
  required_capability,
  risk_level,
  enabled
)
select
  route_seed.task_type,
  default_agent.id,
  fallback_agent.id,
  route_seed.capability,
  route_seed.risk_level,
  true
from route_seed
join public.agents default_agent on default_agent.name = route_seed.agent_name
left join public.agents fallback_agent on fallback_agent.name = route_seed.fallback_name
on conflict (task_type) do update set
  default_agent_id = excluded.default_agent_id,
  fallback_agent_id = excluded.fallback_agent_id,
  required_capability = excluded.required_capability,
  risk_level = excluded.risk_level,
  enabled = excluded.enabled;

with capability_seed(agent_name, capability) as (
  values
    ('Content Strategy Agent', 'analytics'),
    ('RAG Research Agent', 'rag_search'),
    ('Content Generation Agent', 'rag_search'),
    ('Legal Compliance Agent', 'legal_review'),
    ('Tax & Accounting Agent', 'tax_review'),
    ('Multilingual Localization Agent', 'translation'),
    ('Image & Layout Agent', 'image_generation'),
    ('Publishing Agent', 'publishing'),
    ('Analytics Insight Agent', 'analytics')
)
insert into public.agent_capabilities (agent_id, capability, enabled)
select agents.id, capability_seed.capability, true
from capability_seed
join public.agents on agents.name = capability_seed.agent_name
on conflict (agent_id, capability) do update set enabled = excluded.enabled;

with preference_seed(agent_name, provider, model, task_type, risk_level, priority) as (
  values
    ('Content Strategy Agent', 'openai', 'gpt-5.4', 'topic_planning', 'low', 10),
    ('RAG Research Agent', 'openai', 'gpt-5.4', 'source_search', 'medium', 10),
    ('Content Generation Agent', 'openai', 'gpt-5.4', 'draft_generation', 'medium', 10),
    ('Legal Compliance Agent', 'openai', 'gpt-5.5', 'legal_review', 'high', 10),
    ('Tax & Accounting Agent', 'openai', 'gpt-5.4', 'tax_review', 'high', 10),
    ('Multilingual Localization Agent', 'openai', 'gpt-5.4-mini', 'localization', 'medium', 10),
    ('Image & Layout Agent', 'openai', 'gpt-image-2', 'image_layout', 'low', 10),
    ('Publishing Agent', 'openai', 'gpt-5.4-mini', 'publishing', 'medium', 10),
    ('Analytics Insight Agent', 'openai', 'gpt-5.4-mini', 'analytics_insight', 'low', 10)
)
insert into public.agent_model_preferences (
  agent_id,
  provider,
  model,
  task_type,
  risk_level,
  priority
)
select
  agents.id,
  preference_seed.provider,
  preference_seed.model,
  preference_seed.task_type,
  preference_seed.risk_level,
  preference_seed.priority
from preference_seed
join public.agents on agents.name = preference_seed.agent_name
where not exists (
  select 1
  from public.agent_model_preferences existing
  where existing.agent_id = agents.id
    and existing.task_type = preference_seed.task_type
    and existing.risk_level = preference_seed.risk_level
    and existing.model = preference_seed.model
);
