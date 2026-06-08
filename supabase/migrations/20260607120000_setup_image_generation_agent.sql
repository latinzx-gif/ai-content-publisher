-- Ensure gpt-image-2 is registered and has proper routing
insert into public.agents (name, purpose, provider, model, system_prompt, status)
values (
  'Visual Asset Generator',
  'Generates real image files using DALL-E 3 based on visual briefs.',
  'openai',
  'gpt-image-2',
  'You are a Professional Visual Creator. Your job is to take a visual brief and generate a prompt for DALL-E 3. 
   The image should be professional, clean, and appropriate for legal/accounting content.',
  'online'
)
on conflict (name) do update set
  model = excluded.model,
  status = excluded.status;

-- Add route for image_generation
insert into public.agent_routes (
  task_type,
  default_agent_id,
  required_capability,
  risk_level,
  enabled
)
select
  'image_generation',
  agents.id,
  'image_generation',
  'low',
  true
from public.agents
where agents.name = 'Visual Asset Generator'
on conflict (task_type) do update set
  default_agent_id = excluded.default_agent_id,
  enabled = true;
