import type { RagMatch } from '@/types/rag';

export type GuardrailResult = {
  blocked: boolean;
  reason?: string;
};

export function evaluateRagGuardrails(matches: RagMatch[], minScore = 0.35): GuardrailResult {
  if (matches.length === 0) {
    return {
      blocked: true,
      reason: 'No indexed source matched the question.',
    };
  }

  const bestScore = Math.max(...matches.map((match) => match.score));

  if (bestScore < minScore) {
    return {
      blocked: true,
      reason: 'Retrieved sources were below the confidence threshold.',
    };
  }

  return { blocked: false };
}
