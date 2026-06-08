export const OPENAI_AGENT_MODELS = ['gpt-5.4', 'gpt-5.4-mini', 'gpt-5.5', 'gpt-image-2'] as const;
export const OPENAI_TEXT_AGENT_MODELS = ['gpt-5.4', 'gpt-5.4-mini', 'gpt-5.5'] as const;

export type OpenAIAgentModel = (typeof OPENAI_AGENT_MODELS)[number];
export type OpenAITextAgentModel = (typeof OPENAI_TEXT_AGENT_MODELS)[number];

export function isOpenAIAgentModel(model: string): model is OpenAIAgentModel {
  return OPENAI_AGENT_MODELS.includes(model as OpenAIAgentModel);
}

export function isOpenAITextAgentModel(model: string): model is OpenAITextAgentModel {
  return OPENAI_TEXT_AGENT_MODELS.includes(model as OpenAITextAgentModel);
}

export function assertOpenAIAgentConfig(provider: string, model: string) {
  if (provider.toLowerCase() !== 'openai') {
    throw new Error('Only OpenAI provider is allowed for agents.');
  }

  if (!isOpenAIAgentModel(model)) {
    throw new Error(`Unsupported OpenAI agent model: ${model}`);
  }
}

export function normalizeOpenAIAgentProvider(provider: string) {
  assertOpenAIAgentConfig(provider, 'gpt-5.4-mini');
  return 'openai';
}
