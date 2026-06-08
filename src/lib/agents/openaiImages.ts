/**
 * Bridge between internal product model names and actual OpenAI API models.
 */
export const IMAGE_MODEL_BRIDGE: Record<string, string> = {
  'gpt-image-2': 'dall-e-3',
  'dall-e-3': 'dall-e-3',
  'dall-e-2': 'dall-e-2',
};

/**
 * Returns true if the model is a recognized image generation model.
 */
export function isImageModel(model: string): boolean {
  return Object.keys(IMAGE_MODEL_BRIDGE).includes(model);
}

/**
 * Maps an internal model name to a valid OpenAI model name.
 */
export function mapToOpenAIImageModel(model: string): string {
  return IMAGE_MODEL_BRIDGE[model] || 'dall-e-3';
}

type OpenAIImagePayload = {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  error?: {
    message?: string;
  };
};

type RunOpenAIImageInput = {
  model: string;
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
  n?: number;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
};

export async function runOpenAIImage({ 
  model, 
  prompt, 
  size = '1024x1024', 
  n = 1,
  quality = 'standard',
  style = 'vivid'
}: RunOpenAIImageInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  // Map internal model name to actual OpenAI model
  const apiModel = mapToOpenAIImageModel(model);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: apiModel,
      prompt,
      n,
      size,
      quality,
      style,
    }),
  });

  const payload = (await response.json()) as OpenAIImagePayload;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'OpenAI image generation failed');
  }

  return {
    created: payload.created,
    images: payload.data,
  };
}
