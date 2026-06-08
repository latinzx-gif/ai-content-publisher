import { NextResponse } from 'next/server';
import { chunkText } from '@/lib/rag/chunkText';
import { embedText } from '@/lib/rag/embedText';
import { requireApiActor, requireKnowledgeSourceAccess } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ProcessKnowledgeSourceBody = {
  knowledgeSourceId?: string;
  text?: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  let knowledgeSourceId: string | undefined;

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const body = (await request.json()) as ProcessKnowledgeSourceBody;
    knowledgeSourceId = body.knowledgeSourceId;

    if (!knowledgeSourceId || !body.text) {
      return NextResponse.json({ error: 'knowledgeSourceId and text are required for this scaffold endpoint' }, { status: 400 });
    }

    const forbidden = await requireKnowledgeSourceAccess(supabase, actor, knowledgeSourceId);

    if (forbidden) {
      return forbidden;
    }

    await supabase.from('knowledge_sources').update({ status: 'processing' }).eq('id', knowledgeSourceId);

    const chunks = chunkText(body.text);

    for (const chunk of chunks) {
      const { data: insertedChunk, error: chunkError } = await supabase
        .from('knowledge_chunks')
        .insert({
          knowledge_source_id: knowledgeSourceId,
          chunk_index: chunk.chunkIndex,
          content: chunk.content,
          token_count: chunk.tokenCount,
          metadata: {},
        })
        .select()
        .single();

      if (chunkError) {
        throw chunkError;
      }

      const embedding = await embedText(chunk.content);
      const { error: embeddingError } = await supabase.from('knowledge_embeddings').insert({
        knowledge_chunk_id: insertedChunk.id,
        embedding,
        model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
      });

      if (embeddingError) {
        throw embeddingError;
      }
    }

    await supabase
      .from('knowledge_sources')
      .update({ status: 'indexed', last_indexed_at: new Date().toISOString() })
      .eq('id', knowledgeSourceId);

    await supabase.from('system_events').insert({
      event_type: 'knowledge_source_indexed',
      status: 'succeeded',
      message: `Knowledge source indexed with ${chunks.length} chunks`,
      metadata: { knowledgeSourceId, chunkCount: chunks.length },
    });

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'knowledge_source.indexed',
      targetType: 'knowledge_source',
      targetId: knowledgeSourceId,
      metadata: { chunkCount: chunks.length },
    });

    return NextResponse.json({ knowledgeSourceId, chunkCount: chunks.length });
  } catch (error) {
    if (knowledgeSourceId) {
      await supabase.from('knowledge_sources').update({ status: 'failed' }).eq('id', knowledgeSourceId);
      await supabase.from('error_events').insert({
        type: 'source_parse_failed',
        severity: 'high',
        status: 'open',
        message: error instanceof Error ? error.message : 'Knowledge source processing failed',
        source: 'knowledge_process_api',
        metadata: { knowledgeSourceId },
      });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
