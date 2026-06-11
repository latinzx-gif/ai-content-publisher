import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { executeAgentRun } from '@/lib/agents/executeAgentRun';
import { normalizeAgentRuntimePreference, type AgentRuntimePreference } from '@/lib/agents/runtimeDiscovery';
import { queueAgentRun } from '@/lib/server/agentQueue';
import { requireApiActor, requireTeamPermission } from '@/lib/server/apiSecurity';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ExecuteAgentBody = {
  runId?: string;
  maxRuns?: number;
  providerPreference?: AgentRuntimePreference;
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

    const body = (await request.json().catch(() => ({}))) as ExecuteAgentBody;

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

    const runId = normalizeOptionalUuid(body.runId);

    if (body.runId && !runId) {
      return NextResponse.json({ error: 'runId must be a UUID when provided' }, { status: 400 });
    }

    if (runId) {
      const result = await executeAgentRun({
        supabase,
        runId,
        actorProfileId: actor.profileId,
        providerPreference,
      });

      return NextResponse.json(result);
    }

    const maxRuns = normalizeMaxRuns(body.maxRuns);
    const reconciled = await reconcileRunnableBacklog(supabase, actor.profileId);
    const results = [];

    for (let index = 0; index < maxRuns; index += 1) {
      const result = await executeAgentRun({
        supabase,
        actorProfileId: actor.profileId,
        providerPreference,
      });

      results.push(result);

      if (result.status === 'idle' || result.status === 'already_claimed') {
        break;
      }
    }

    return NextResponse.json({
      status: results.some((result) => result.status === 'succeeded') ? 'processed' : results[0]?.status ?? 'idle',
      processed: results.filter((result) => result.status === 'succeeded').length,
      reconciled,
      results,
    });
  } catch (error) {
    await supabase.from('error_events').insert({
      type: 'api_error',
      severity: 'high',
      status: 'open',
      message: error instanceof Error ? error.message : 'Agent execute failed',
      source: 'agent_execute_api',
      metadata: {},
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function normalizeMaxRuns(value: unknown) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 1;

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(parsed), 1), 10);
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type RunnableContentItem = {
  id: string;
  title: string | null;
  status: string | null;
  risk_level: 'low' | 'medium' | 'high' | null;
  service_area: string | null;
  category: string | null;
  metadata: Record<string, unknown> | null;
};

async function reconcileRunnableBacklog(supabase: SupabaseClient, actorProfileId: string) {
  const { data: items, error } = await supabase
    .from('content_items')
    .select('id,title,status,risk_level,service_area,category,metadata')
    .in('status', ['draft', 'source_search', 'generating', 'text_ready', 'assets_ready'])
    .order('created_at', { ascending: false })
    .limit(20)
    .returns<RunnableContentItem[]>();

  if (error) {
    throw new Error(error.message);
  }

  for (const item of items ?? []) {
    const nextTask = inferNextRunnableTask(item);

    if (!nextTask) {
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from('agent_runs')
      .select('id')
      .eq('target_id', item.id)
      .eq('target_type', nextTask)
      .in('status', ['queued', 'running'])
      .limit(1);

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing?.length) {
      return { status: 'already_pending', taskType: nextTask, contentItemId: item.id, runId: existing[0].id };
    }

    const metadata = item.metadata ?? {};
    const queued = await queueAgentRun({
      supabase,
      taskType: nextTask,
      riskLevel: item.risk_level ?? 'low',
      targetId: item.id,
      triggerSource: 'agent_orchestrator_reconcile',
      input: {
        contentJobId: item.id,
        title: item.title,
        category: item.category ?? item.service_area,
        languages: metadata.languages,
        platforms: metadata.platforms,
        sourcePolicy: metadata.sourcePolicy,
        layout: metadata.layout,
        imageCount: metadata.imageCount,
        selectedAssets: metadata.selectedAssets,
        assetLayoutPlan: metadata.assetLayoutPlan,
        facebookLayoutRule: metadata.facebookLayoutRule,
      },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId,
      eventType: 'workflow.orchestrator_reconcile_queued',
      source: 'agent_orchestrator',
      status: 'queued',
      targetType: 'content_item',
      targetId: item.id,
      message: `Agent Orchestrator queued ${nextTask} for a runnable backlog item.`,
      metadata: {
        contentItemStatus: item.status,
        taskType: nextTask,
        queuedRunId: queued.run.id,
        agent: queued.agent.name,
      },
    });

    return { status: 'queued', taskType: nextTask, contentItemId: item.id, runId: queued.run.id, agent: queued.agent.name };
  }

  return { status: 'idle' };
}

function inferNextRunnableTask(item: RunnableContentItem) {
  const metadata = item.metadata ?? {};
  const status = item.status ?? '';
  const sourceSearch = normalizeRecord(metadata.sourceSearch);
  const sourceSearchCompleted = typeof sourceSearch?.completedAt === 'string';
  const sourceSearchBlocked = sourceSearch?.blocked === true;
  const contentOrchestration = normalizeRecord(metadata.contentOrchestration);
  const contentOrchestrationCompleted = typeof contentOrchestration?.completedAt === 'string';
  const draftGeneration = normalizeRecord(metadata.draftGeneration);
  const draftCompleted = typeof draftGeneration?.completedAt === 'string';
  const imageLayout = normalizeRecord(metadata.imageLayout);
  const imageCompleted = typeof imageLayout?.completedAt === 'string';
  const compliance = normalizeRecord(metadata.compliance);
  const complianceCompleted = typeof compliance?.completedAt === 'string';

  if (status === 'draft') {
    return 'source_search';
  }

  if (status === 'source_search') {
    if (sourceSearchBlocked) {
      return null;
    }

    if (!sourceSearchCompleted) {
      return 'source_search';
    }

    if (metadata.isLongForm && !contentOrchestrationCompleted) {
      return 'content_orchestration';
    }

    return 'draft_generation';
  }

  if (status === 'generating' && !draftCompleted) {
    if (metadata.isLongForm && !contentOrchestrationCompleted) {
      return 'content_orchestration';
    }
    return 'draft_generation';
  }

  if (status === 'text_ready' && !imageCompleted) {
    return 'image_layout';
  }

  if ((status === 'text_ready' || status === 'assets_ready') && imageCompleted && !complianceCompleted) {
    return item.service_area?.toLowerCase().includes('tax') || item.category?.toLowerCase().includes('tax') ? 'tax_review' : 'legal_review';
  }

  return null;
}

function normalizeRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}
