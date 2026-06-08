import { NextResponse } from 'next/server';
import { requireFeature } from '@/lib/entitlements/guards';
import { buildCitationAnswer } from '@/lib/rag/buildAnswer';
import { searchKnowledge } from '@/lib/rag/searchKnowledge';
import { requireActiveTeamMember, requireApiActor } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RagChatBody = {
  question?: string;
  category?: string;
  strictCitation?: boolean;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireActiveTeamMember(supabase, actor);

    if (forbidden) {
      return forbidden;
    }

    const locked = await requireFeature('rag_queries');

    if (locked) {
      return locked;
    }

    const body = (await request.json()) as RagChatBody;

    if (!body.question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const matches = await searchKnowledge({
      query: body.question,
      category: body.category,
      limit: 8,
      minScore: body.strictCitation ? 0.35 : 0,
    });
    const result = buildCitationAnswer(body.question, matches);

    const { data: ragQuery, error: ragQueryError } = await supabase
      .from('rag_queries')
      .insert({
        query: body.question,
        answer: result.answer,
        citations: result.citations,
        created_by: actor.profileId,
      })
      .select('id')
      .single();

    if (ragQueryError) {
      throw new Error(ragQueryError.message);
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'rag.query_created',
      targetType: 'rag_query',
      targetId: ragQuery.id,
      metadata: { question: body.question, category: body.category ?? null, blocked: result.blocked },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'workflow.rag_chat',
      source: 'rag_chat_api',
      status: result.blocked ? 'open' : 'succeeded',
      severity: result.blocked ? 'medium' : 'low',
      targetType: 'rag_query',
      targetId: ragQuery.id,
      message: result.blocked ? result.reason ?? 'RAG chat blocked by guardrail.' : 'RAG chat answered with citations.',
      metadata: {
        question: body.question,
        category: body.category ?? null,
        citationCount: result.citations.length,
      },
    });

    if (result.blocked) {
      await supabase.from('error_events').insert({
        type: 'rag_miss',
        severity: 'medium',
        status: 'open',
        message: result.reason ?? 'RAG response blocked by guardrail',
        source: 'rag_chat_api',
        metadata: { question: body.question, category: body.category ?? null },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'RAG chat failed',
      source: 'rag_chat_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
