export type KnowledgeSourceType =
  | 'pdf'
  | 'link'
  | 'google_drive'
  | 'obsidian'
  | 'internal_guideline'
  | 'template';

export type KnowledgeSourceStatus = 'uploaded' | 'processing' | 'indexed' | 'needs_review' | 'failed';

export type KnowledgeSource = {
  id: string;
  title: string;
  source_type: KnowledgeSourceType;
  category: string | null;
  origin: string | null;
  url: string | null;
  storage_path: string | null;
  status: KnowledgeSourceStatus;
  uploaded_by: string | null;
  last_indexed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type KnowledgeChunk = {
  id: string;
  knowledge_source_id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown>;
  token_count: number | null;
  created_at: string;
};
