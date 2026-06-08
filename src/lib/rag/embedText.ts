const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';

type OpenAIEmbeddingResponse = {
  data?: Array<{
    embedding?: number[];
  }>;
  error?: {
    message?: string;
  };
};

export async function embedText(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL,
      input: text,
    }),
  });

  const payload = (await response.json()) as OpenAIEmbeddingResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Embedding request failed');
  }

  const embedding = payload.data?.[0]?.embedding;

  if (!embedding?.length) {
    throw new Error('Embedding response did not include a vector');
  }

  return embedding;
}
