import { isOpenAIAgentModel, isOpenAITextAgentModel, type OpenAIAgentModel } from '@/lib/agents/openaiModels';

type SelectAgentModelInput = {
  taskType: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiredCapability?: string | null;
  preferredModel?: string | null;
};

type SelectAgentModelResult = {
  provider: 'openai';
  model: OpenAIAgentModel;
  reason: string;
};

function resolveDefaultModel(): OpenAIAgentModel {
  const configuredModel = process.env.OPENAI_AGENT_TEXT_MODEL;

  if (!configuredModel) {
    return 'gpt-5.4';
  }

  if (configuredModel === 'gpt-5.4-mini' || configuredModel === 'gpt-5.5') {
    return configuredModel;
  }

  return isOpenAITextAgentModel(configuredModel) ? configuredModel : 'gpt-5.4';
}

const DEFAULT_MODEL: OpenAIAgentModel = resolveDefaultModel();

export function selectAgentModel({
  taskType,
  riskLevel,
  requiredCapability,
  preferredModel,
}: SelectAgentModelInput): SelectAgentModelResult {
  const normalizedTask = taskType.toLowerCase();
  const normalizedCapability = requiredCapability?.toLowerCase() ?? '';

  if (normalizedCapability === 'image_generation' || normalizedTask.includes('image')) {
    return {
      provider: 'openai',
      model: 'gpt-image-2',
      reason: 'image_generation_requires_image_model',
    };
  }

  if (riskLevel === 'high' || normalizedCapability.includes('review') || normalizedTask.includes('review')) {
    return {
      provider: 'openai',
      model: 'gpt-5.5',
      reason: 'high_risk_or_review_requires_stronger_reasoning',
    };
  }

  if (normalizedCapability === 'rag_search' || normalizedTask.includes('source') || normalizedTask.includes('rag')) {
    return {
      provider: 'openai',
      model: 'gpt-5.4',
      reason: 'rag_and_source_tasks_need_source_reasoning',
    };
  }

  if (normalizedCapability.includes('publishing') || normalizedTask.includes('publish')) {
    return {
      provider: 'openai',
      model: 'gpt-5.4-mini',
      reason: 'publishing_queue_steps_prefer_fast_deterministic_model',
    };
  }

  if (normalizedTask.includes('classif') || normalizedTask.includes('tag') || normalizedTask.includes('route')) {
    return {
      provider: 'openai',
      model: 'gpt-5.4-mini',
      reason: 'fast_low_cost_routing_or_classification',
    };
  }

  if (preferredModel && isOpenAIAgentModel(preferredModel)) {
    return {
      provider: 'openai',
      model: preferredModel,
      reason: 'database_preference_allowed_by_policy',
    };
  }

  return {
    provider: 'openai',
    model: DEFAULT_MODEL,
    reason: 'default_balanced_text_model',
  };
}

export function resolveExecutionModel(requestedModel: string): {
  model: OpenAIAgentModel;
  requestedModel: string;
  fallbackApplied: boolean;
  fallbackReason: string | null;
} {
  if (requestedModel === 'gpt-image-2') {
    return {
      model: 'gpt-image-2',
      requestedModel,
      fallbackApplied: false,
      fallbackReason: null,
    };
  }

  if (!isOpenAIAgentModel(requestedModel)) {
    return {
      model: DEFAULT_MODEL,
      requestedModel,
      fallbackApplied: true,
      fallbackReason: `Invalid routing model "${requestedModel}" was replaced with runtime text default.`,
    };
  }

  return {
    model: requestedModel,
    requestedModel,
    fallbackApplied: false,
    fallbackReason: null,
  };
}
