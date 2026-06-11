import { NextResponse } from 'next/server';
import { executeAgentRun } from '@/lib/agents/executeAgentRun';
import { normalizeAgentRuntimePreference, type AgentRuntimePreference } from '@/lib/agents/runtimeDiscovery';
import { requireApiActor, requireTeamPermission } from '@/lib/server/apiSecurity';
import { queueAgentRun } from '@/lib/server/agentQueue';
import { writeAuditEvent } from '@/lib/server/audit';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type AgentRunBody = {
  runId?: string;
  taskType?: string;
  targetId?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  input?: Record<string, unknown>;
  execute?: boolean;
  providerPreference?: AgentRuntimePreference;
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

    const body = (await request.json().catch(() => ({}))) as AgentRunBody;

    if (
      body.providerPreference &&
      body.providerPreference !== 'auto' &&
      body.providerPreference !== 'multica' &&
      body.providerPreference !== 'claude' &&
      body.providerPreference !== 'codex' &&
      body.providerPreference !== 'openai'
    ) {
      return NextResponse.json({ error: 'providerPreference must be auto, multica, claude, codex, or openai' }, { status: 400 });
    }

    const providerPreference = normalizeAgentRuntimePreference(body.providerPreference);

    if (body.riskLevel && !riskLevels.includes(body.riskLevel)) {
      return NextResponse.json({ error: 'riskLevel must be low, medium, or high' }, { status: 400 });
    }

    const runId = normalizeOptionalUuid(body.runId);

    if (body.runId && !runId) {
      return NextResponse.json({ error: 'runId must be a UUID when provided' }, { status: 400 });
    }

    if (runId && body.execute) {
      const result = await executeAgentRun({
        supabase,
        runId,
        actorProfileId: actor.profileId,
        providerPreference,
      });

      return NextResponse.json(result);
    }

    if (!body.taskType) {
      return NextResponse.json({ error: 'taskType is required when no executable runId is provided' }, { status: 400 });
    }

    if (body.targetId && !isUuid(body.targetId)) {
      return NextResponse.json({ error: 'targetId must be a UUID when provided' }, { status: 400 });
    }

    const queued = await queueAgentRun({
      supabase,
      taskType: body.taskType,
      riskLevel: body.riskLevel,
      targetId: body.targetId ?? null,
      triggerSource: 'agents_run_api',
      input: body.input ?? {},
    });

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'agent.run_queued',
      targetType: 'agent_run',
      targetId: queued.run.id,
      metadata: {
        contract: 'POST /api/agents/run',
        taskType: body.taskType,
        targetId: body.targetId ?? null,
        agent: queued.agent.name,
        model: queued.model.name,
      },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'workflow.agent_run_queued',
      source: 'agents_run_api',
      status: 'queued',
      targetType: 'agent_run',
      targetId: queued.run.id,
      message: `Queued ${queued.agent.name} for ${body.taskType}.`,
      metadata: {
        targetId: body.targetId ?? null,
        model: queued.model,
      },
    });

    if (body.execute) {
      const execution = await executeAgentRun({
        supabase,
        runId: queued.run.id,
        actorProfileId: actor.profileId,
        providerPreference,
      });

      return NextResponse.json({ queued, execution }, { status: 202 });
    }

    return NextResponse.json(queued, { status: 202 });
  } catch (error) {
    await writeSystemLogBestEffort(supabase, {
      eventType: 'agent.run_failed_to_queue',
      source: 'agents_run_api',
      severity: 'high',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Agent run route failed',
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeOptionalUuid(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return null;
  }

  return isUuid(normalized) ? normalized : null;
}
