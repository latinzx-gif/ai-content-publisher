export type RagCitation = {
  chunkId: string;
  sourceId: string;
  title: string;
  sourceType: string;
  category: string | null;
  score: number;
};

export type RagMatch = RagCitation & {
  content: string;
  metadata: Record<string, unknown>;
};

export type RagChatResult = {
  answer: string;
  citations: RagCitation[];
  blocked: boolean;
  reason?: string;
};

export type RagSearchInput = {
  query: string;
  category?: string;
  limit?: number;
  minScore?: number;
};
