import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { RagMatch, RagSearchInput } from '@/types/rag';
import { embedText } from './embedText';

type MatchKnowledgeChunkRow = {
  chunk_id: string;
  source_id: string;
  source_title: string;
  source_type: string;
  category: string | null;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
};

export async function searchKnowledge(input: RagSearchInput): Promise<RagMatch[]> {
  const supabase = createSupabaseServerClient();
  const embedding = await embedText(input.query);

  const { data, error } = await supabase.rpc('match_knowledge_chunks', {
    query_embedding: embedding,
    match_count: input.limit ?? 8,
    category_filter: input.category ?? null,
    min_score: input.minScore ?? 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as MatchKnowledgeChunkRow[]).map((row) => ({
    chunkId: row.chunk_id,
    sourceId: row.source_id,
    title: row.source_title,
    sourceType: row.source_type,
    category: row.category,
    content: row.content,
    metadata: row.metadata ?? {},
    score: row.score,
  }));
}
