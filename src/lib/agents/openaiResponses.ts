import { isOpenAITextAgentModel, type OpenAITextAgentModel } from '@/lib/agents/openaiModels';

type OpenAIResponsesPayload = {
  id?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  usage?: Record<string, unknown>;
  error?: {
    message?: string;
  };
};

type RunOpenAIResponseInput = {
  model: string;
  instructions?: string | null;
  input: Record<string, unknown>;
  responseFormat?: 'json' | 'text';
};

export async function runOpenAIResponse({ model, instructions, input, responseFormat = 'text' }: RunOpenAIResponseInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  if (!isOpenAITextAgentModel(model)) {
    throw new Error(`Agent executor currently supports text models only: ${model}`);
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model satisfies OpenAITextAgentModel,
      instructions: buildInstructions(instructions, responseFormat),
      input: buildAgentInput(input),
    }),
  });

  const payload = (await response.json()) as OpenAIResponsesPayload;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'OpenAI response request failed');
  }

  return {
    responseId: payload.id ?? null,
    text: extractOutputText(payload),
    usage: payload.usage ?? {},
    raw: payload,
  };
}

function buildInstructions(instructions: string | null | undefined, responseFormat: 'json' | 'text') {
  if (responseFormat !== 'json') {
    return instructions ?? undefined;
  }

  return [
    instructions,
    'Return only valid JSON. Do not wrap it in Markdown. The JSON must include: summary, status, confidence, nextRecommendedTask, artifacts, riskNotes, and citations.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildAgentInput(input: Record<string, unknown>) {
  return [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: JSON.stringify(input, null, 2),
        },
      ],
    },
  ];
}

function extractOutputText(payload: OpenAIResponsesPayload) {
  if (payload.output_text) {
    return payload.output_text;
  }

  const chunks =
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((content) => content.type === 'output_text' && content.text)
      .map((content) => content.text) ?? [];

  return chunks.join('\n').trim();
}
