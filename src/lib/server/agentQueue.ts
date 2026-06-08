import type { SupabaseClient } from '@supabase/supabase-js';
import { assertOpenAIAgentConfig, normalizeOpenAIAgentProvider } from '@/lib/agents/openaiModels';
import { selectAgentModel } from '@/lib/agents/modelPolicy';

type RiskLevel = 'low' | 'medium' | 'high';

type AgentRoute = {
  id: string;
  task_type: string;
  default_agent_id: string | null;
  fallback_agent_id: string | null;
  required_capability: string | null;
  risk_level: RiskLevel;
};

type Agent = {
  id: string;
  name: string;
  purpose: string | null;
  provider: string;
  model: string;
  system_prompt: string | null;
  status: string;
};

type ModelPreference = {
  provider: string;
  model: string;
  task_type: string | null;
  risk_level: RiskLevel;
  priority: number;
};

type QueueAgentRunInput = {
  supabase: SupabaseClient;
  taskType: string;
  riskLevel?: RiskLevel;
  targetId?: string | null;
  triggerSource: string;
  input?: Record<string, unknown>;
};

export async function queueAgentRun({
  supabase,
  taskType,
  riskLevel: requestedRiskLevel,
  targetId,
  triggerSource,
  input = {},
}: QueueAgentRunInput) {
  const { data: route, error: routeError } = await supabase
    .from('agent_routes')
    .select('id, task_type, default_agent_id, fallback_agent_id, required_capability, risk_level')
    .eq('task_type', taskType)
    .eq('enabled', true)
    .maybeSingle<AgentRoute>();

  if (routeError) {
    throw new Error(routeError.message);
  }

  if (!route?.default_agent_id) {
    throw new Error(`No enabled agent route configured for task type: ${taskType}`);
  }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, name, purpose, provider, model, system_prompt, status')
    .eq('id', route.default_agent_id)
    .maybeSingle<Agent>();

  if (agentError) {
    throw new Error(agentError.message);
  }

  if (!agent) {
    throw new Error(`Default agent not found for task type: ${taskType}`);
  }

  const riskLevel = requestedRiskLevel ?? route.risk_level;
  const { data: preferences, error: preferenceError } = await supabase
    .from('agent_model_preferences')
    .select('provider, model, task_type, risk_level, priority')
    .eq('agent_id', agent.id)
    .order('priority', { ascending: true })
    .returns<ModelPreference[]>();

  if (preferenceError) {
    throw new Error(preferenceError.message);
  }

  const preference =
    preferences?.find((item) => item.task_type === taskType && item.risk_level === riskLevel) ??
    preferences?.find((item) => item.task_type === taskType) ??
    preferences?.[0];

  const selectedModel = selectAgentModel({
    taskType,
    riskLevel,
    requiredCapability: route.required_capability,
    preferredModel: preference?.model ?? agent.model,
  });
  const provider = normalizeOpenAIAgentProvider(preference?.provider ?? selectedModel.provider);
  const model = selectedModel.model;
  assertOpenAIAgentConfig(provider, model);

  const { data: run, error: runError } = await supabase
    .from('agent_runs')
    .insert({
      agent_id: agent.id,
      trigger_source: triggerSource,
      target_type: taskType,
      target_id: targetId ?? null,
      status: 'queued',
      input: {
        ...input,
        routing: {
          provider,
          model,
          riskLevel,
          requiredCapability: route.required_capability,
          selectedBy: triggerSource,
          selectionReason: selectedModel.reason,
        },
      },
    })
    .select('id, agent_id, trigger_source, target_type, target_id, status, input, created_at')
    .single();

  if (runError) {
    throw new Error(runError.message);
  }

  return {
    run,
    route,
    agent: {
      id: agent.id,
      name: agent.name,
      purpose: agent.purpose,
      status: agent.status,
    },
    model: {
      provider,
      name: model,
      selectionReason: selectedModel.reason,
    },
  };
}
