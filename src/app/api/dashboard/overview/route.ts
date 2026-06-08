import { NextResponse } from 'next/server';
import { requireActiveTeamMember, requireApiActor } from '@/lib/server/apiSecurity';
import { buildPrdPresentation } from '@/lib/prdPresentation';
import { writeAuditEvent } from '@/lib/server/audit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ContentItemRow = {
  id: string;
  title: string;
  service_area: string | null;
  status: string;
  risk_level: string;
  scheduled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  assigned_to: string | null;
  metadata: Record<string, unknown> | null;
};

type ReviewItemRow = {
  id: string;
  content_item_id: string;
  status: string;
  created_at: string | null;
};

type ContentTranslationRow = {
  content_item_id: string;
  language: string;
  title: string | null;
  body: string | null;
  status: string | null;
  created_at: string | null;
};

type ContentAssetRow = {
  content_item_id: string;
  asset_type: string;
  layout_type: string | null;
  url: string | null;
  storage_path: string | null;
  alt_text: string | null;
  source: string | null;
  sort_order: number;
  metadata: Record<string, unknown> | null;
};

type AgentRow = {
  id: string;
  name: string;
  status: string;
  purpose: string | null;
};

type AgentRunRow = {
  id: string;
  agent_id: string | null;
  target_type: string | null;
  status: string;
  created_at: string | null;
};

type AuditEventRow = {
  id: string;
  actor_profile_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type ErrorEventRow = {
  id: string;
  type: string;
  severity: string;
  message: string;
  source: string | null;
  created_at: string;
};

type DashboardBoardItem = {
  id: string;
  title: string;
  owner: string;
  channel: string;
  due: string;
  risk: 'Low' | 'Medium' | 'High';
  tone: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  stage?: string;
  contentItemStatus?: string;
  generatedDrafts?: unknown;
  generatedAssets?: ContentAssetRow[];
  imageCount?: number;
  selectedAssets?: string[];
  assetLayoutPlan?: string[];
  layout?: string;
  visualBrief?: string;
  wordCount?: number;
  presentation?: Record<string, unknown>;
  debug?: Record<string, unknown>;
};

type DashboardBoardColumn = {
  column: string;
  count: number;
  items: DashboardBoardItem[];
};

type DashboardAgent = {
  name: string;
  state: 'Online' | 'Idle' | 'Offline';
  task: string;
  runs: number;
  load: number;
};

type DashboardActivity = {
  message: string;
  actorName?: string | null;
  createdAt: string;
  source?: 'audit' | 'error';
  presentation?: Record<string, unknown>;
};

type DashboardApiResponse = {
  generatedAt: string;
  stats: {
    label: string;
    value: string;
    change: string;
    tone: 'blue' | 'amber' | 'emerald' | 'slate';
    icon: 'Layers3' | 'ShieldCheck' | 'Clock3' | 'Zap';
  }[];
  board: DashboardBoardColumn[];
  agents: DashboardAgent[];
  activity: DashboardActivity[];
};

const RISK_ORDER: ReadonlyArray<DashboardBoardItem['risk']> = ['Low', 'Medium', 'High'];
const WORKING_STATUSES = new Set(['draft', 'source_search', 'generating', 'text_ready', 'assets_ready', 'ready_for_review', 'in_review', 'approved', 'scheduled']);
const IN_REVIEW_STATUSES = new Set(['in_review']);
const DONE_STATUSES = new Set(['published', 'archived']);
const HIGH_RISK = 'high';
const MEDIUM_RISK = 'medium';

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

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [contentItemsResult, reviewItemsResult, agentResult, agentRunsResult, auditResult, errorResult] = await Promise.all([
      supabase
        .from('content_items')
        .select('id,title,service_area,status,risk_level,scheduled_at,created_at,updated_at,created_by,assigned_to,metadata')
        .order('updated_at', { ascending: false }),
      supabase.from('review_items').select('id,content_item_id,status,created_at').order('created_at', { ascending: false }),
      supabase.from('agents').select('id,name,status,purpose').order('name'),
      supabase
        .from('agent_runs')
        .select('id,agent_id,target_type,status,created_at')
        .order('created_at', { ascending: false })
        .limit(400),
      supabase
        .from('audit_events')
        .select('id,actor_profile_id,event_type,metadata,created_at')
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('error_events')
        .select('id,type,severity,message,source,created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    if (contentItemsResult.error) {
      throw new Error(contentItemsResult.error.message);
    }

    if (reviewItemsResult.error) {
      throw new Error(reviewItemsResult.error.message);
    }

    if (agentResult.error) {
      throw new Error(agentResult.error.message);
    }

    if (agentRunsResult.error) {
      throw new Error(agentRunsResult.error.message);
    }

    if (auditResult.error) {
      throw new Error(auditResult.error.message);
    }

    if (errorResult.error) {
      throw new Error(errorResult.error.message);
    }

    const contentItems = (contentItemsResult.data ?? []) as ContentItemRow[];
    const reviewItems = (reviewItemsResult.data ?? []) as ReviewItemRow[];
    const agents = (agentResult.data ?? []) as AgentRow[];
    const agentRuns = (agentRunsResult.data ?? []) as AgentRunRow[];
    const auditEvents = (auditResult.data ?? []) as AuditEventRow[];
    const errorEvents = (errorResult.data ?? []) as ErrorEventRow[];
    const contentItemIds = contentItems.map((item) => item.id);
    const translationsByContentItem = new Map<string, ContentTranslationRow[]>();
    const assetsByContentItem = new Map<string, ContentAssetRow[]>();

    if (contentItemIds.length > 0) {
      const [translationsResult, assetsResult] = await Promise.all([
        supabase
          .from('content_translations')
          .select('content_item_id,language,title,body,status,created_at')
          .in('content_item_id', contentItemIds)
          .order('created_at', { ascending: true }),
        supabase
          .from('content_assets')
          .select('content_item_id,asset_type,layout_type,url,storage_path,alt_text,source,sort_order,metadata')
          .in('content_item_id', contentItemIds)
          .order('sort_order', { ascending: true }),
      ]);

      if (translationsResult.error) {
        throw new Error(translationsResult.error.message);
      }

      if (assetsResult.error) {
        throw new Error(assetsResult.error.message);
      }

      for (const row of (translationsResult.data ?? []) as ContentTranslationRow[]) {
        const current = translationsByContentItem.get(row.content_item_id) ?? [];
        current.push(row);
        translationsByContentItem.set(row.content_item_id, current);
      }

      for (const row of (assetsResult.data ?? []) as ContentAssetRow[]) {
        const current = assetsByContentItem.get(row.content_item_id) ?? [];
        current.push(row);
        assetsByContentItem.set(row.content_item_id, current);
      }
    }

    const profileIds = new Set<string>();
    for (const item of contentItems) {
      if (item.created_by) {
        profileIds.add(item.created_by);
      }
      if (item.assigned_to) {
        profileIds.add(item.assigned_to);
      }
    }
    for (const event of auditEvents) {
      if (event.actor_profile_id) {
        profileIds.add(event.actor_profile_id);
      }
    }

    const profileMap = new Map<string, string>();
    const profileIdsList = Array.from(profileIds);

    if (profileIdsList.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id,display_name')
        .in('id', profileIdsList);

      if (profileError) {
        throw new Error(profileError.message);
      }

      (profiles ?? []).forEach((profile: { id: string; display_name: string }) => {
        profileMap.set(profile.id, profile.display_name || 'Unknown');
      });
    }

    const contentByOwner = (item: ContentItemRow) => {
      const ownerId = item.assigned_to || item.created_by;
      return profileMap.get(ownerId || '') || 'Unassigned';
    };

    const normalizeRiskLabel = (risk: string | null | undefined) => {
      const normalized = (risk ?? '').toLowerCase();

      if (normalized === HIGH_RISK) {
        return 'High';
      }
      if (normalized === MEDIUM_RISK) {
        return 'Medium';
      }
      return 'Low';
    };

    const mapRiskTone = (risk: string | null | undefined): DashboardBoardItem['tone'] => {
      const normalized = (risk ?? '').toLowerCase();

      if (normalized === HIGH_RISK) {
        return 'rose';
      }
      if (normalized === MEDIUM_RISK) {
        return 'amber';
      }
      return 'blue';
    };

    const mapRiskLabel = (risk: string | null | undefined): DashboardBoardItem['risk'] => {
      return normalizeRiskLabel(risk);
    };

    const formatDueLabel = (item: ContentItemRow) => {
      const dueAt = item.scheduled_at || item.updated_at || item.created_at;
      if (!dueAt) {
        return 'Unscheduled';
      }

      const dueDate = new Date(dueAt);
      const today = new Date();
      const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

      if (Number.isNaN(dueDate.getTime())) {
        return 'Unscheduled';
      }

      if (diffDays > 2) {
        return `Due in ${diffDays}d`;
      }

      if (diffDays > 0) {
        return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
      }

      if (diffDays === 0) {
        return 'Today';
      }

      return 'Past due';
    };

    const boardBuckets = {
      Backlog: [] as DashboardBoardItem[],
      Todo: [] as DashboardBoardItem[],
      'In Progress': [] as DashboardBoardItem[],
      'In Review': [] as DashboardBoardItem[],
      Done: [] as DashboardBoardItem[],
      Blocked: [] as DashboardBoardItem[],
    };

    contentItems.forEach((item) => {
      const risk = mapRiskLabel(item.risk_level);
      const tone = mapRiskTone(item.risk_level);
      const metadata = item.metadata ?? {};
      const generatedDrafts =
        translationsByContentItem.get(item.id)?.map((translation) => ({
          languageCode: translation.language,
          languageLabel: translation.language,
          title: translation.title,
          body: translation.body,
          status: translation.status,
          createdAt: translation.created_at,
        })) ?? metadata.generatedDrafts;
      const generatedAssets = assetsByContentItem.get(item.id) ?? [];
      const normalizedPresentation = buildPrdPresentation({
        title: item.title,
        subtitle: item.service_area,
        platform:
          Array.isArray(metadata.platforms) && metadata.platforms.length > 0
            ? metadata.platforms.join(', ')
            : item.service_area,
        status: item.status,
        priority: risk,
        metadata,
        generatedDrafts,
        generatedAssets,
        updatedAt: item.updated_at ?? item.created_at,
      });
      const payload: DashboardBoardItem = {
        id: item.id,
        title: item.title,
        owner: contentByOwner(item),
        channel: item.service_area || 'General',
        due: formatDueLabel(item),
        risk,
        tone,
        contentItemStatus: item.status,
        generatedDrafts,
        generatedAssets,
        imageCount: generatedAssets.length > 0 ? generatedAssets.length : typeof metadata.imageCount === 'number' ? metadata.imageCount : undefined,
        selectedAssets: Array.isArray(metadata.selectedAssets) ? metadata.selectedAssets.filter((value): value is string => typeof value === 'string' && value.trim().length > 0) : undefined,
        assetLayoutPlan: Array.isArray(metadata.assetLayoutPlan) ? metadata.assetLayoutPlan.filter((value): value is string => typeof value === 'string' && value.trim().length > 0) : undefined,
        layout: typeof metadata.layout === 'string' ? metadata.layout : undefined,
        visualBrief: typeof metadata.visualBrief === 'string' ? metadata.visualBrief : undefined,
        wordCount: typeof metadata.wordCount === 'number' ? metadata.wordCount : undefined,
        presentation: normalizedPresentation.presentation,
        debug: normalizedPresentation.debug,
      };

      if (DONE_STATUSES.has(item.status)) {
        boardBuckets.Done.push(payload);
        return;
      }

      if (IN_REVIEW_STATUSES.has(item.status) && risk === 'High') {
        boardBuckets.Blocked.push(payload);
        return;
      }

      if (IN_REVIEW_STATUSES.has(item.status)) {
        boardBuckets['In Review'].push(payload);
        return;
      }

      if (item.status === 'source_search' || item.status === 'generating' || item.status === 'scheduled') {
        boardBuckets['In Progress'].push(payload);
        return;
      }

      if (item.status === 'draft' || item.status === 'text_ready' || item.status === 'assets_ready' || item.status === 'ready_for_review' || item.status === 'approved') {
        boardBuckets.Todo.push(payload);
        return;
      }

      if (item.status === 'failed') {
        boardBuckets.Blocked.push(payload);
        return;
      }

      boardBuckets.Backlog.push(payload);
    });

    const board: DashboardBoardColumn[] = Object.entries(boardBuckets).map(([column, items]) => ({
      column,
      count: items.length,
      items,
    }));

    const workingPosts = contentItems.filter((item) => WORKING_STATUSES.has(item.status)).length;
    const needsReviewCount = reviewItems.filter((item) => item.status === 'in_review').length;
    const scheduledCount = contentItems.filter((item) => item.status === 'scheduled').length;

    const workingChangeCount = contentItems.filter(
      (item) => item.created_at && new Date(item.created_at).getTime() >= sevenDaysAgo.getTime(),
    ).length;
    const needsReviewChangeCount = reviewItems.filter(
      (item) => item.created_at && new Date(item.created_at).getTime() >= sevenDaysAgo.getTime() && item.status === 'in_review',
    ).length;
    const scheduledChangeCount = contentItems.filter(
      (item) => item.scheduled_at && new Date(item.scheduled_at).getTime() >= now.getTime(),
    ).length;
    const agentRunsTotal = agentRuns.length;
    const agentRunsChange = agentRuns.filter((run) => run.created_at && new Date(run.created_at).getTime() >= sevenDaysAgo.getTime()).length;

    const runsByAgent = new Map<string, AgentRunRow[]>();
    for (const run of agentRuns) {
      if (!run.agent_id) {
        continue;
      }

      const bucket = runsByAgent.get(run.agent_id) ?? [];
      bucket.push(run);
      runsByAgent.set(run.agent_id, bucket);
    }

    const mappedAgents: DashboardAgent[] = agents.map((agent) => {
      const agentRunRows = runsByAgent.get(agent.id) ?? [];
      const runningRuns = agentRunRows.filter((run) => run.status === 'running').length;
      const queuedRuns = agentRunRows.filter((run) => run.status === 'queued').length;
      const activeRuns = runningRuns + queuedRuns;
      const recentRuns = agentRunRows.filter(
        (run) => run.created_at && new Date(run.created_at).getTime() >= twentyFourHoursAgo.getTime(),
      ).length;

      const state: DashboardAgent['state'] =
        agent.status === 'offline' || agent.status === 'disabled'
          ? 'Offline'
          : runningRuns > 0
            ? 'Online'
            : 'Idle';

      const load = Math.min(100, 8 + Math.min(6, activeRuns) * 12 + Math.min(60, recentRuns * 4));
      const topRun = agentRunRows[0];
      const task =
        runningRuns > 0 && topRun?.target_type
          ? `${topRun.target_type.replace(/_/g, ' ')} is running`
          : queuedRuns > 0 && topRun?.target_type
            ? `${queuedRuns} queued · latest ${topRun.target_type.replace(/_/g, ' ')}`
            : topRun?.target_type
              ? `${topRun.target_type.replace(/_/g, ' ')} last run`
              : agent.purpose ?? 'Ready';

      return {
        name: agent.name,
        state,
        task,
        runs: agentRunRows.length,
        load,
      };
    });

    const auditActivity = auditEvents
      .map((event) => {
        const actorName = event.actor_profile_id ? profileMap.get(event.actor_profile_id) : null;
        const title = getStringValue(event.metadata?.title);
        const queueUpdateStatus = getNestedString(event.metadata?.update, 'status');
        const message = `${actorName ?? 'System'} ${activityMessageFromAudit(event.event_type, {
          reviewType: getStringValue(event.metadata?.reviewType),
          query: getStringValue(event.metadata?.query),
          queueStatus: getStringValue(event.metadata?.status) || queueUpdateStatus,
          updateStatus: queueUpdateStatus,
          title,
          targetType: getStringValue(event.metadata?.targetType),
          targetId: getStringValue(event.metadata?.targetId),
          model: getStringValue(event.metadata?.provider),
          nextStatus: getStringValue(event.metadata?.nextStatus),
          taskType: getStringValue(event.metadata?.taskType),
          previousStatus: getStringValue(event.metadata?.previousStatus),
          sameDayTotal: getStringValue(event.metadata?.sameDayTotal),
          reviewStatus: getStringValue(event.metadata?.reviewStatus),
          reviewAction: getStringValue(event.metadata?.action),
          question: getStringValue(event.metadata?.question),
          findings: getStringValue(event.metadata?.findings),
          chunkCount: getStringValue(event.metadata?.chunkCount),
          sourceType: getStringValue(event.metadata?.sourceType),
          format: getStringValue(event.metadata?.format),
          scope: getStringValue(event.metadata?.scope),
        })}`;

        return {
          message,
          actorName,
          createdAt: event.created_at,
          source: 'audit' as const,
          presentation: {
            readable_message: message,
            event_type: event.event_type,
            status: 'recorded',
            timestamp: event.created_at,
          },
        };
      })
      .filter((entry) => entry.message.trim().length > 0);

    const errorActivity = errorEvents.map((event) => ({
      message: `${event.severity.toUpperCase()} error${event.source ? ` (${event.source})` : ''}: ${event.message}`,
      actorName: null,
      createdAt: event.created_at,
      source: 'error' as const,
      presentation: {
        readable_message: `${event.severity.toUpperCase()} error${event.source ? ` (${event.source})` : ''}: ${event.message}`,
        event_type: event.type,
        status: 'open',
        timestamp: event.created_at,
      },
    }));

    const activity = [...auditActivity, ...errorActivity]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);

    const boardWithSortedItems = board.map((column) => ({
      ...column,
      items: column.items
        .slice()
        .sort((a, b) => RISK_ORDER.indexOf(a.risk) - RISK_ORDER.indexOf(b.risk))
        .slice(0, 12),
      count: column.items.length,
    }));

    const sortedAgents = mappedAgents
      .slice()
      .sort((a, b) => {
        const order: Record<DashboardAgent['state'], number> = { Online: 0, Idle: 1, Offline: 2 };
        return order[a.state] === order[b.state] ? b.runs - a.runs : order[a.state] - order[b.state];
      });

    const payload: DashboardApiResponse = {
      generatedAt: new Date().toISOString(),
      stats: [
        {
          label: 'Working posts',
          value: String(workingPosts),
          change: `+${workingChangeCount} this week`,
          icon: 'Layers3',
          tone: 'blue',
        },
        {
          label: 'Need review',
          value: String(needsReviewCount),
          change: needsReviewChangeCount ? `${needsReviewChangeCount} new` : 'No new items',
          icon: 'ShieldCheck',
          tone: 'amber',
        },
        {
          label: 'Scheduled',
          value: String(scheduledCount),
          change: `${scheduledChangeCount} upcoming`,
          icon: 'Clock3',
          tone: 'emerald',
        },
        {
          label: 'Agent runs',
          value: String(agentRunsTotal),
          change: `+${agentRunsChange} this week`,
          icon: 'Zap',
          tone: 'slate',
        },
      ],
      board: boardWithSortedItems,
      agents: sortedAgents,
      activity,
    };

    await writeAuditEvent(supabase, {
      actorProfileId: actor.profileId,
      eventType: 'dashboard.overview_viewed',
      targetType: 'dashboard',
      metadata: {
        generatedAt: payload.generatedAt,
        workingPosts,
        needsReviewCount,
        scheduledCount,
        agentRunsTotal,
      },
    });

    return NextResponse.json(payload);
  } catch (error) {
    try {
      await supabase.from('error_events').insert({
        type: 'api_error',
        severity: 'high',
        status: 'open',
        message: error instanceof Error ? error.message : 'Dashboard overview failed',
        source: 'dashboard_overview_api',
        metadata: {},
      });
    } catch {
      // Keep endpoint robust if error_events write fails.
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function getStringValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

function getNestedString(value: unknown, key: string) {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return getStringValue((value as Record<string, unknown>)[key]);
}

function activityMessageFromAudit(eventType: string, context: { [key: string]: string | undefined }) {
  const updateStatus = context.updateStatus;
  const reviewType = context.reviewType;
  const reviewAction = context.reviewStatus ?? context.reviewAction;

  switch (eventType) {
    case 'calendar.item_rescheduled':
      return `rescheduled ${context.title || 'a content item'} from ${context.previousStatus ?? 'unknown'} to ${context.nextStatus ?? 'scheduled'}${
        context.sameDayTotal ? ` (${context.sameDayTotal} posts same day)` : ''
      }`;
    case 'publishing_queue.updated':
      return `updated publishing queue item${updateStatus || context.queueStatus ? ` (${updateStatus || context.queueStatus})` : ''}`;
    case 'review.created':
      return `created review item${reviewType ? ` (${reviewType})` : ''} for ${context.title || 'content'}`;
    case 'review.approve':
      return `approved review item${context.title ? ` for ${context.title}` : ''}${reviewAction ? ` (${reviewAction})` : ''}`;
    case 'review.reject':
      return `rejected review item${context.title ? ` for ${context.title}` : ''}${reviewAction ? ` (${reviewAction})` : ''}`;
    case 'review.request_changes':
      return `requested changes on review item${context.title ? ` for ${context.title}` : ''}${reviewAction ? ` (${reviewAction})` : ''}`;
    case 'review.auto_queue':
      return `auto-queued item for publishing${context.title ? ` (${context.title})` : ''}`;
    case 'agent.route_selected':
      return `selected agent ${context.targetType || 'route'}${context.model ? ` with ${context.model}` : ''}`;
    case 'agent.created':
      return `created agent ${context.title || ''}`;
    case 'review.compliance_checked':
      return `checked compliance for ${context.title || 'content'}`;
    case 'knowledge_source.indexed':
      return `completed source indexing${context.chunkCount ? ` (${context.chunkCount} chunks)` : ''}`;
    case 'knowledge_source.uploaded':
      return `uploaded knowledge source${context.title ? ` (${context.title})` : ''}`;
    case 'rag.query_created':
      return `created RAG query${context.question ? `: ${context.question}` : ''}`;
    case 'rag.search':
      return `performed RAG search${context.query ? `: ${context.query}` : ''}`;
    case 'logs.export_requested':
      return `requested logs export${context.format || context.scope ? ` (${context.format || 'csv'} / ${context.scope || 'all'})` : ''}`;
    case 'dashboard.overview_viewed':
      return `opened dashboard overview`;
    default:
      return `performed ${eventType.replace(/_/g, ' ')}`;
  }
}
