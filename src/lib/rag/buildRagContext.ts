import { buildCitationAnswer } from '@/lib/rag/buildAnswer';
import { searchKnowledge } from '@/lib/rag/searchKnowledge';
import type { RagChatResult, RagMatch } from '@/types/rag';

type BuildAgentRagContextInput = {
  query: string;
  category?: string | null;
  strictCitation?: boolean;
  limit?: number;
};

export type AgentRagContext = RagChatResult & {
  query: string;
  matches: RagMatch[];
};

export async function buildAgentRagContext({
  query,
  category,
  strictCitation = true,
  limit = 8,
}: BuildAgentRagContextInput): Promise<AgentRagContext> {
  const matches = await searchKnowledge({
    query,
    category: category ?? undefined,
    limit,
    minScore: strictCitation ? 0.35 : 0,
  });
  const result = buildCitationAnswer(query, matches);

  return {
    ...result,
    query,
    matches,
  };
}
