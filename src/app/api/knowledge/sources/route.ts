import { NextResponse } from 'next/server';
import { requireApiActor, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type CreateKnowledgeSourceBody = {
  title?: string;
  sourceType?: string;
  category?: string;
  origin?: string;
  url?: string;
  storagePath?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_create');

    if (forbidden) {
      return forbidden;
    }

    const body = (await request.json()) as CreateKnowledgeSourceBody;

    if (!body.title || !body.sourceType) {
      return NextResponse.json({ error: 'title and sourceType are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert({
        title: body.title,
        source_type: body.sourceType,
        category: body.category ?? null,
        origin: body.origin ?? null,
        url: body.url ?? null,
        storage_path: body.storagePath ?? null,
        uploaded_by: actor.profileId,
        status: 'uploaded',
        metadata: body.metadata ?? {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await supabase.from('system_events').insert({
      event_type: 'knowledge_source_uploaded',
      status: 'succeeded',
      message: `Knowledge source uploaded: ${body.title}`,
      metadata: { knowledgeSourceId: data.id },
    });

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'knowledge_source.uploaded',
      targetType: 'knowledge_source',
      targetId: data.id,
      metadata: { title: body.title, sourceType: body.sourceType },
    });

    return NextResponse.json({ source: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
