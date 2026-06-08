import type { RagChatResult, RagMatch } from '@/types/rag';
import { evaluateRagGuardrails } from './guardrails';

export function buildBlockedAnswer(reason: string): RagChatResult {
  return {
    answer: 'I could not find enough indexed source material to answer this safely. Please upload a source or connect an official link first.',
    citations: [],
    blocked: true,
    reason,
  };
}

export function buildCitationAnswer(question: string, matches: RagMatch[]): RagChatResult {
  const guardrail = evaluateRagGuardrails(matches);

  if (guardrail.blocked) {
    return buildBlockedAnswer(guardrail.reason ?? 'RAG guardrail blocked this answer.');
  }

  const topMatches = matches.slice(0, 4);
  const sourceSummary = topMatches
    .map((match, index) => `${index + 1}. ${match.title}: ${match.content.slice(0, 240)}`)
    .join('\n\n');

  return {
    answer: `Draft answer for: "${question}"\n\nUse the following cited source material before generating final copy:\n\n${sourceSummary}`,
    citations: topMatches.map((match) => ({
      chunkId: match.chunkId,
      sourceId: match.sourceId,
      title: match.title,
      sourceType: match.sourceType,
      category: match.category,
      score: match.score,
    })),
    blocked: false,
  };
}
