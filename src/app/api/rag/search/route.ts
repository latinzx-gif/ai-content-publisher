import { NextResponse } from 'next/server';
import { requireFeature } from '@/lib/entitlements/guards';
import { buildCitationAnswer } from '@/lib/rag/buildAnswer';
import { searchKnowledge } from '@/lib/rag/searchKnowledge';
import { requireActiveTeamMember, requireApiActor } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RagSearchBody = {
  query?: string;
  category?: string;
  limit?: number;
  minScore?: number;
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

    const body = (await request.json()) as RagSearchBody;

    if (!body.query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const matches = await searchKnowledge({
      query: body.query,
      category: body.category,
      limit: body.limit,
      minScore: body.minScore,
    });
    const guardrail = buildCitationAnswer(body.query, matches);

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'rag.search',
      targetType: 'rag_query',
      targetId: null,
      metadata: { query: body.query, category: body.category ?? null, resultCount: matches.length },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'workflow.rag_search',
      source: 'rag_search_api',
      status: guardrail.blocked ? 'open' : 'succeeded',
      severity: guardrail.blocked ? 'medium' : 'low',
      message: guardrail.blocked ? guardrail.reason ?? 'RAG search blocked by guardrail.' : `RAG search returned ${matches.length} match(es).`,
      metadata: { query: body.query, category: body.category ?? null, resultCount: matches.length },
    });

    return NextResponse.json({ matches, guardrail });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'medium',
      status: 'open',
      message: error instanceof Error ? error.message : 'RAG search failed',
      source: 'rag_search_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
