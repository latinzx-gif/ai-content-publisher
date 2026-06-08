import { NextResponse } from 'next/server';
import { executeAgentRun } from '@/lib/agents/executeAgentRun';
import { normalizeAgentRuntimePreference, type AgentRuntimePreference } from '@/lib/agents/runtimeDiscovery';
import { requireApiActor, requireContentAccess, requireTeamPermission } from '@/lib/server/apiSecurity';
import { queueAgentRun } from '@/lib/server/agentQueue';
import { writeAuditEvent } from '@/lib/server/audit';
import { writeSystemLogBestEffort } from '@/lib/server/systemLog';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type CreateContentJobBody = {
  title?: string;
  brief?: string;
  category?: string;
  serviceArea?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  reviewType?: 'legal' | 'tax' | 'accounting' | 'brand' | 'translation';
  autoPipeline?: boolean;
  mode?: 'manual' | 'quick';
  languages?: string[];
  platforms?: string[];
  sourcePolicy?: string;
  scheduledAt?: string;
  queueAgents?: boolean;
  autoExecuteAgents?: boolean;
  agentExecutionMaxRuns?: number;
  providerPreference?: AgentRuntimePreference;
  metadata?: Record<string, unknown>;
};

const riskLevels = ['low', 'medium', 'high'] as const;
const defaultAgentTasks = ['source_search'] as const;
const providerPreferences = ['auto', 'multica', 'codex', 'openai'] as const;

type ReviewType = NonNullable<CreateContentJobBody['reviewType']>;

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Number(searchParams.get('limit') ?? '50');
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50;
    let query = supabase
      .from('content_jobs')
      .select('id,title,brief,category,service_area,canonical_status,workflow_stage,risk_level,scheduled_at,metadata,created_at,updated_at')
      .order('updated_at', { ascending: false })
      .limit(safeLimit);

    if (status) {
      query = query.eq('canonical_status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ jobs: data ?? [], count: data?.length ?? 0 });
  } catch (error) {
    await writeSystemLogBestEffort(supabase, {
      eventType: 'content_jobs.list_failed',
      source: 'content_jobs_api',
      severity: 'high',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Content jobs list failed',
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

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

    const body = (await request.json()) as CreateContentJobBody;

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (body.riskLevel && !riskLevels.includes(body.riskLevel)) {
      return NextResponse.json({ error: 'riskLevel must be low, medium, or high' }, { status: 400 });
    }

    if (body.scheduledAt && !isIsoDateTime(body.scheduledAt)) {
      return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string' }, { status: 400 });
    }

    if (body.providerPreference && !providerPreferences.includes(body.providerPreference)) {
      return NextResponse.json({ error: 'providerPreference must be auto, multica, codex, or openai' }, { status: 400 });
    }

    const riskLevel = body.riskLevel ?? 'low';
    const shouldQueueAgents = body.queueAgents !== false;
    const shouldAutoExecuteAgents = shouldQueueAgents && body.autoExecuteAgents !== false;
    const agentExecutionMaxRuns = normalizeAgentExecutionMaxRuns(body.agentExecutionMaxRuns);
    const providerPreference = normalizeAgentRuntimePreference(body.providerPreference);
    const sourcePolicy = normalizeSourcePolicy(body.sourcePolicy);
    const resolvedReviewType = resolveReviewTypeFromInput({
      reviewType: body.reviewType,
      category: body.category,
      serviceArea: body.serviceArea,
      title: body.title,
      languages: body.languages,
    });

    const metadataForReview = { ...(body.metadata ?? {}) } as Record<string, unknown>;
    for (const key of [
      'createdBy',
      'created_by',
      'createdByName',
      'created_by_name',
      'creator',
      'creatorName',
      'creator_name',
      'owner',
      'createdAt',
      'created_at',
      'createdAtIso',
      'created_at_iso',
    ]) {
      delete metadataForReview[key];
    }

    const reviewMetadata = {
      mode: body.mode ?? 'manual',
      languages: body.languages ?? ['th', 'en'],
      platforms: body.platforms ?? [],
      autoPipeline: body.autoPipeline ?? body.mode === 'quick',
      sourcePolicy,
      plannedReviewType: resolvedReviewType,
      owner: 'Agent Orchestrator',
      createdBy: actor.displayName,
      createdAt: Date.now(),
      createdAtIso: new Date().toISOString(),
      layout: typeof body.metadata?.layout === 'string' ? body.metadata.layout : null,
      imageCount: typeof body.metadata?.imageCount === 'number' ? body.metadata.imageCount : null,
      assetLayoutPlan: Array.isArray(body.metadata?.assetLayoutPlan) ? body.metadata.assetLayoutPlan : [],
      facebookLayoutRule: body.metadata?.facebookLayoutRule ?? null,
      ...metadataForReview,
    };

    const { data: contentItem, error: insertError } = await supabase
      .from('content_items')
      .insert({
        title: body.title.trim(),
        brief: body.brief ?? null,
        category: body.category ?? null,
        service_area: body.serviceArea ?? null,
        status: shouldQueueAgents ? 'source_search' : 'draft',
        risk_level: riskLevel,
        created_by: actor.profileId,
        assigned_to: actor.profileId,
        scheduled_at: body.scheduledAt ?? null,
        metadata: reviewMetadata,
      })
      .select('id,title,status,risk_level,metadata,created_at')
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const queuedRuns = [];
    if (shouldQueueAgents) {
      for (const taskType of defaultAgentTasks) {
        const queued = await queueAgentRun({
          supabase,
          taskType,
          riskLevel,
          targetId: contentItem.id,
          triggerSource: 'content_jobs_api',
          input: {
            contentJobId: contentItem.id,
            title: body.title,
            brief: body.brief ?? '',
            category: body.category ?? null,
            languages: body.languages ?? ['th', 'en'],
            platforms: body.platforms ?? [],
            sourcePolicy,
          },
        });
        queuedRuns.push(queued.run);

        await writeSystemLogBestEffort(supabase, {
          actorProfileId: actor.profileId,
          eventType: 'workflow.orchestrator_dispatch',
          source: 'content_jobs_api',
          status: 'queued',
          targetType: 'content_item',
          targetId: contentItem.id,
          message: 'Agent Orchestrator assigned initial content pipeline task from Create Post.',
          metadata: {
            pipelineOwner: 'Agent Orchestrator',
            pipelinePhase: 'create_post_to_source_search',
            pipelinePosition: '0',
            sourceTask: 'create_post',
            destinationTask: 'source_search',
            destinationAgent: queued.agent.name,
            destinationModel: queued.model.name,
            destinationRunId: queued.run.id,
            destinationTaskType: taskType,
            assignedAt: new Date().toISOString(),
            triggerTask: taskType,
          },
        });
      }
    }

    const executedRuns = shouldAutoExecuteAgents
      ? await executeContentJobAgentRuns({
          supabase,
          actorProfileId: actor.profileId,
          contentItemId: contentItem.id,
          maxRuns: agentExecutionMaxRuns,
          providerPreference,
        })
      : [];

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'content_job.created',
      targetType: 'content_item',
      targetId: contentItem.id,
      metadata: {
        title: contentItem.title,
        queuedRuns: queuedRuns.map((run) => run.id),
        contract: 'POST /api/content/jobs',
      },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'workflow.content_job_created',
      source: 'content_jobs_api',
      status: 'queued',
      targetType: 'content_item',
      targetId: contentItem.id,
      message: `Content job created and ${queuedRuns.length} agent run(s) queued.`,
      metadata: {
        contentJobId: contentItem.id,
        queuedRuns: queuedRuns.map((run) => run.id),
        executedRuns: executedRuns.map((result) => ({
          status: result.status,
          runId: result.runId,
        })),
      },
    });

    return NextResponse.json(
      {
        job: {
          ...contentItem,
          status: contentItem.status,
        },
        queuedRuns,
        executedRuns,
        review: null,
      },
      { status: 201 },
    );
  } catch (error) {
    await writeSystemLogBestEffort(supabase, {
      eventType: 'content_jobs.create_failed',
      source: 'content_jobs_api',
      severity: 'high',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Content job create failed',
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { actor, response } = await requireApiActor(request, supabase);

    if (response) {
      return response;
    }

    const url = new URL(request.url);
    const contentItemId = (url.searchParams.get('id') ?? '').trim();

    if (!contentItemId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const forbidden = await requireContentAccess(supabase, actor, contentItemId);

    if (forbidden) {
      return forbidden;
    }

    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    const { data: reviewItems, error: reviewItemsError } = await supabase
      .from('review_items')
      .select('id')
      .eq('content_item_id', contentItemId);

    if (reviewItemsError) {
      throw new Error(reviewItemsError.message);
    }

    const reviewItemIds = (reviewItems ?? []).map((item) => item.id);

    const { data: agentRuns, error: agentRunsError } = await supabase
      .from('agent_runs')
      .select('id')
      .eq('target_id', contentItemId);

    if (agentRunsError) {
      throw new Error(agentRunsError.message);
    }

    const agentRunIds = (agentRuns ?? []).map((run) => run.id);

    const { data: complianceChecks, error: complianceChecksError } = await supabase
      .from('compliance_checks')
      .select('id')
      .eq('content_item_id', contentItemId);

    if (complianceChecksError) {
      throw new Error(complianceChecksError.message);
    }

    const complianceCheckIds = (complianceChecks ?? []).map((item) => item.id);

    if (complianceCheckIds.length > 0) {
      const { error: findingsError } = await supabase.from('compliance_findings').delete().in('compliance_check_id', complianceCheckIds);
      if (findingsError) {
        throw new Error(findingsError.message);
      }
    }

    const deleteSteps = [
      supabase.from('content_assets').delete().eq('content_item_id', contentItemId),
      supabase.from('content_translations').delete().eq('content_item_id', contentItemId),
      supabase.from('publishing_queue').delete().eq('content_item_id', contentItemId),
      supabase.from('review_items').delete().eq('content_item_id', contentItemId),
      supabase.from('compliance_checks').delete().eq('content_item_id', contentItemId),
      agentRunIds.length > 0 ? supabase.from('agent_logs').delete().in('agent_run_id', agentRunIds) : Promise.resolve({ error: null }),
      supabase.from('agent_runs').delete().eq('target_id', contentItemId),
      supabase.from('content_items').delete().eq('id', contentItemId),
    ];

    for (const step of deleteSteps) {
      const { error } = await step;
      if (error) {
        throw new Error(error.message);
      }
    }

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'content_job.deleted',
      targetType: 'content_item',
      targetId: contentItemId,
      metadata: {
        reason: reason || null,
        reviewItemIds,
        complianceCheckIds,
        contract: 'DELETE /api/content/jobs',
      },
    });

    await writeSystemLogBestEffort(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'workflow.content_job_deleted',
      source: 'content_jobs_api',
      status: 'resolved',
      targetType: 'content_item',
      targetId: contentItemId,
      message: `Content job deleted${reason ? ` · Reason: ${reason}` : ''}`,
      metadata: {
        contentJobId: contentItemId,
        reason: reason || null,
        reviewItemIds,
        complianceCheckIds,
      },
    });

    return NextResponse.json({ deleted: true, id: contentItemId }, { status: 200 });
  } catch (error) {
    await writeSystemLogBestEffort(supabase, {
      eventType: 'content_jobs.delete_failed',
      source: 'content_jobs_api',
      severity: 'high',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Content job delete failed',
    });

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function isIsoDateTime(value: string) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}

function normalizeAgentExecutionMaxRuns(value: unknown) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 1;

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(parsed), 1), 6);
}

async function executeContentJobAgentRuns({
  supabase,
  actorProfileId,
  contentItemId,
  maxRuns,
  providerPreference,
}: {
  supabase: ReturnType<typeof createSupabaseServerClient>;
  actorProfileId: string;
  contentItemId: string;
  maxRuns: number;
  providerPreference: AgentRuntimePreference;
}) {
  const results: Array<{ status: string; runId: string | null; message?: string }> = [];

  for (let index = 0; index < maxRuns; index += 1) {
    const { data: nextRun, error } = await supabase
      .from('agent_runs')
      .select('id')
      .eq('target_id', contentItemId)
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<{ id: string }>();

    if (error) {
      await writeSystemLogBestEffort(supabase, {
        actorProfileId,
        eventType: 'workflow.agent_auto_execute_lookup_failed',
        source: 'content_jobs_api',
        severity: 'high',
        status: 'failed',
        targetType: 'content_item',
        targetId: contentItemId,
        message: error.message,
      });
      break;
    }

    if (!nextRun?.id) {
      break;
    }

    const execution = await executeAgentRun({
      supabase,
      runId: nextRun.id,
      actorProfileId,
      providerPreference,
    });

    results.push({
      status: execution.status,
      runId: nextRun.id,
      message: execution.message,
    });

    if (execution.status !== 'succeeded') {
      break;
    }
  }

  if (results.length === 0) {
    await writeSystemLogBestEffort(supabase, {
      actorProfileId,
      eventType: 'workflow.agent_auto_execute_idle',
      source: 'content_jobs_api',
      status: 'open',
      targetType: 'content_item',
      targetId: contentItemId,
      message: 'No queued agent run was available for this content job after Create Post.',
    });
  }

  return results;
}

function normalizeReviewText(value?: string | null) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function inferReviewTypeFromText(value?: string | null): ReviewType | null {
  const text = normalizeReviewText(value);

  if (!text) {
    return null;
  }

  if (text.includes('tax') || text.includes('vat') || text.includes('ภาษี') || text.includes('pdpa')) {
    return 'tax';
  }

  if (text.includes('accounting') || text.includes('บัญชี') || text.includes('financial') || text.includes('finance') || text.includes('invoice')) {
    return 'accounting';
  }

  if (text.includes('translation') || text.includes('translate') || text.includes('แปล') || text.includes('translation')) {
    return 'translation';
  }

  if (text.includes('brand') || text.includes('voice') || text.includes('tone') || text.includes('แบรนด์') || text.includes('แบรนด') || text.includes('คอนเทนต์สไตล์')) {
    return 'brand';
  }

  if (text.includes('legal') || text.includes('law') || text.includes('กฎหมาย') || text.includes('compliance') || text.includes('complianc')) {
    return 'legal';
  }

  return null;
}

function resolveReviewTypeFromInput(input: {
  reviewType?: CreateContentJobBody['reviewType'];
  category?: string | null;
  serviceArea?: string | null;
  title?: string | null;
  languages?: string[];
}) {
  if (input.reviewType) {
    return input.reviewType;
  }

  if (Array.isArray(input.languages) && input.languages.some((language) => language !== 'th' && language !== 'en')) {
    return 'translation';
  }

  const candidates = [input.category, input.serviceArea, input.title];
  for (const candidate of candidates) {
    const inferredType = inferReviewTypeFromText(candidate);
    if (inferredType) {
      return inferredType;
    }
  }

  return 'legal';
}

function normalizeSourcePolicy(value: string | undefined) {
  const normalized = value?.toLowerCase() ?? '';

  if (normalized.includes('strict') || normalized.includes('required') || normalized.includes('knowledge')) {
    return 'knowledge_base_required';
  }

  if (normalized.includes('light')) {
    return 'citation_optional';
  }

  return 'citation_preferred';
}
