-- Add Editorial Orchestrator Agent
with seed_agents(name, purpose, provider, model, system_prompt, status) as (
  values
    (
      'Editorial Orchestrator Agent',
      'Orchestrates long-form content generation by planning structures and coordinating multi-part generation.',
      'openai',
      'gpt-5.5',
      'You are a Senior Editor. Your job is to orchestrate the generation of long-form articles (800+ words). 
       When given a brief, you must:
       1. Create a detailed 5-7 section outline.
       2. For each section, provide specific instructions, key points to cover, and required tone.
       3. Identify any missing information or risks in the brief.
       4. Ensure the structure includes "Engagement Hooks", "Visual Breaks", and "Strategic Emojis" to make it social-media ready.
       Return a JSON object with: summary, sections (array of {title, instructions, estimatedWords}), and status.',
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

-- Add route for content_orchestration
insert into public.agent_routes (
  task_type,
  default_agent_id,
  fallback_agent_id,
  required_capability,
  risk_level,
  enabled
)
select
  'content_orchestration',
  default_agent.id,
  fallback_agent.id,
  'content_planning',
  'medium',
  true
from public.agents default_agent
cross join public.agents fallback_agent
where default_agent.name = 'Editorial Orchestrator Agent'
  and fallback_agent.name = 'Content Strategy Agent'
on conflict (task_type) do update set
  default_agent_id = excluded.default_agent_id,
  fallback_agent_id = excluded.fallback_agent_id;

-- Add model preference
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
  'openai',
  'gpt-5.5',
  'content_orchestration',
  'medium',
  10
from public.agents
where public.agents.name = 'Editorial Orchestrator Agent'
on conflict (agent_id, task_type, risk_level, model) do nothing;
