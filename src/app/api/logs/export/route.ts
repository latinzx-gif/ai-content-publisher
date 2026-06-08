import { NextResponse } from 'next/server';
import { requireFeature } from '@/lib/entitlements/guards';
import { requireApiActor, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type LogExportBody = {
  format?: 'csv' | 'json' | 'pdf';
  scope?:
    | 'error_logs'
    | 'agent_activity'
    | 'user_activity'
    | 'publishing_logs'
    | 'rag_queries'
    | 'compliance_audit'
    | 'usage_metrics';
  filters?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const forbidden = await requireTeamPermission(supabase, actor, 'can_manage_settings');

    if (forbidden) {
      return forbidden;
    }

    const locked = await requireFeature('log_exports');

    if (locked) {
      return locked;
    }

    const body = (await request.json()) as LogExportBody;

    const { data: exportJob, error: exportError } = await supabase
      .from('log_exports')
      .insert({
        format: body.format ?? 'csv',
        scope: body.scope ?? 'error_logs',
        filters: body.filters ?? {},
        status: 'requested',
        requested_by: actor.profileId,
      })
      .select()
      .single();

    if (exportError) {
      throw new Error(exportError.message);
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'logs.export_requested',
      targetType: 'log_export',
      targetId: exportJob.id,
      metadata: {
        format: body.format ?? 'csv',
        scope: body.scope ?? 'error_logs',
      },
    });

    return NextResponse.json({ export: exportJob }, { status: 202 });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Log export failed',
      source: 'log_export_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
