import { NextResponse } from 'next/server';
import { requireActiveTeamMember, requireApiActor } from '@/lib/server/apiSecurity';
import { buildLogPresentation } from '@/lib/prdPresentation';
import { buildWorkflowTraceFromSystemLog } from '@/lib/server/workflowTrace';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const allowedSeverities = ['low', 'medium', 'high', 'critical'] as const;

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? '80');
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 80;
    const severity = searchParams.get('severity')?.toLowerCase();

    let systemQuery = supabase
      .from('system_logs')
      .select('id,event_type,source,severity,status,message,target_type,target_id,metadata,created_at')
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (allowedSeverities.includes(severity as (typeof allowedSeverities)[number])) {
      systemQuery = systemQuery.eq('severity', severity);
    }

    const [systemLogsResult, errorEventsResult] = await Promise.all([
      systemQuery,
      supabase
        .from('error_events')
        .select('id,type,severity,status,message,source,metadata,created_at')
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

    if (systemLogsResult.error) {
      throw new Error(systemLogsResult.error.message);
    }

    if (errorEventsResult.error) {
      throw new Error(errorEventsResult.error.message);
    }

    return NextResponse.json({
      systemLogs: (systemLogsResult.data ?? []).map((row) => ({
        ...row,
        presentation: buildLogPresentation({
          eventType: row.event_type,
          source: row.source,
          severity: row.severity,
          status: row.status,
          message: row.message,
          targetType: row.target_type,
          targetId: row.target_id,
          metadata: row.metadata,
          createdAt: row.created_at,
        }),
        taskTrace: buildWorkflowTraceFromSystemLog({
          id: row.id,
          event_type: row.event_type,
          status: row.status,
          message: row.message,
          target_type: row.target_type,
          target_id: row.target_id,
          metadata: row.metadata,
          created_at: row.created_at,
        }),
      })),
      errorEvents: (errorEventsResult.data ?? []).map((row) => ({
        ...row,
        presentation: buildLogPresentation({
          eventType: row.type,
          source: row.source,
          severity: row.severity,
          status: row.status,
          message: row.message,
          metadata: row.metadata,
          createdAt: row.created_at,
        }),
        taskTrace: buildWorkflowTraceFromSystemLog({
          id: row.id,
          event_type: row.type,
          status: row.status,
          message: row.message,
          target_type: null,
          target_id: null,
          metadata: row.metadata,
          created_at: row.created_at,
        }),
      })),
      summary: summarizeLogs(systemLogsResult.data ?? [], errorEventsResult.data ?? []),
    });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Logs query failed',
      source: 'logs_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function summarizeLogs(
  systemLogs: Array<{ severity: string; status: string; event_type: string }>,
  errorEvents: Array<{ severity: string; status: string }>,
) {
  const highOrCritical = systemLogs.filter((log) => log.severity === 'high' || log.severity === 'critical').length + errorEvents.filter((log) => log.severity === 'high' || log.severity === 'critical').length;
  const open = systemLogs.filter((log) => log.status === 'open' || log.status === 'failed').length + errorEvents.filter((log) => log.status === 'open' || log.status === 'failed').length;
  const agentRuns = systemLogs.filter((log) => log.event_type.includes('agent')).length;

  return {
    total: systemLogs.length + errorEvents.length,
    systemLogs: systemLogs.length,
    errorEvents: errorEvents.length,
    agentRuns,
    highOrCritical,
    open,
  };
}
