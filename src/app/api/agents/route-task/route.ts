import { NextResponse } from 'next/server';
import { requireFeature } from '@/lib/entitlements/guards';
import { requireApiActor, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeAuditEvent } from '@/lib/server/audit';
import { queueAgentRun } from '@/lib/server/agentQueue';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RouteTaskBody = {
  taskType?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  context?: Record<string, unknown>;
};

const riskLevels = ['low', 'medium', 'high'] as const;

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

    const routeLocked = await requireFeature('agent_routes');

    if (routeLocked) {
      return routeLocked;
    }

    const body = (await request.json()) as RouteTaskBody;

    if (!body.taskType) {
      return NextResponse.json({ error: 'taskType is required' }, { status: 400 });
    }

    if (body.riskLevel && !riskLevels.includes(body.riskLevel)) {
      return NextResponse.json({ error: 'riskLevel must be low, medium, or high' }, { status: 400 });
    }

    const queued = await queueAgentRun({
      supabase,
      taskType: body.taskType,
      riskLevel: body.riskLevel,
      triggerSource: 'route_task_api',
      input: body.context ?? {},
    });

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'agent.route_selected',
      targetType: 'agent_run',
      targetId: queued.run.id,
      metadata: {
        taskType: body.taskType,
        riskLevel: queued.route.risk_level,
        agent: queued.agent.name,
        provider: queued.model.provider,
        model: queued.model.name,
        selectionReason: queued.model.selectionReason,
      },
    });

    return NextResponse.json({
      taskType: body.taskType,
      riskLevel: queued.route.risk_level,
      requiredCapability: queued.route.required_capability,
      agent: queued.agent,
      model: queued.model,
      run: queued.run,
    });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Route task failed',
      source: 'agent_route_task_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
