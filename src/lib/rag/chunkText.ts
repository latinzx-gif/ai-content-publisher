export type ChunkTextOptions = {
  chunkSize?: number;
  overlap?: number;
};

export type TextChunk = {
  chunkIndex: number;
  content: string;
  tokenCount: number;
};

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 180;

export function chunkText(text: string, options: ChunkTextOptions = {}): TextChunk[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const content = normalized.slice(start, end).trim();

    if (content) {
      chunks.push({
        chunkIndex: chunks.length,
        content,
        tokenCount: estimateTokenCount(content),
      });
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export function estimateTokenCount(text: string) {
  return Math.ceil(text.length / 4);
}
