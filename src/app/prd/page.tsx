'use client';

import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Home,
  Inbox,
  Layers3,
  Library,
  Lock,
  MessageSquareText,
  MoreHorizontal,
  PenLine,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import type { PrdDebugModel, PrdPresentationModel } from '@/lib/prdPresentation';

type MenuItem = {
  name: string;
  icon: ComponentType<{ className?: string }>;
};

type AgentRuntimePreference = 'auto' | 'multica' | 'codex' | 'openai';

type BoardItem = {
  id: string;
  title: string;
  owner: string;
  channel: string;
  due: string;
  risk: 'Low' | 'Medium' | 'High';
  tone: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  stage?: string;
  contentItemStatus?: string;
  generatedDrafts?: GeneratedDraft[];
  generatedAssets?: GeneratedAsset[];
  imageCount?: number;
  selectedAssets?: string[];
  assetLayoutPlan?: string[];
  layout?: string;
  visualBrief?: string;
  wordCount?: number;
  presentation?: PrdPresentationModel;
  debug?: PrdDebugModel;
};

function normalizeBoardRisk(risk: string | null | undefined): BoardItem['risk'] {
  return risk === 'High' || risk === 'Medium' || risk === 'Low' ? risk : 'Low';
}

type PageName = (typeof navGroups)[number]['items'][number]['name'];

type CalendarPostStatus = 'queued' | 'posted' | 'draft' | 'issue';
type CalendarFocusPost = {
  id: string;
  time: string;
  title: string;
  service: string;
  status: CalendarPostStatus;
  scheduledAt: string | null;
};
type CalendarDayPost = {
  id: string;
  title: string;
  service: string;
  status: CalendarPostStatus;
  scheduledAt: string | null;
};
type CalendarDay = { date: string; dateKey?: string; muted: boolean; posts: CalendarDayPost[] };
type CalendarQueueItem = {
  id: string;
  title: string;
  service_area: string | null;
  status: string | null;
  risk_level: string | null;
  scheduled_at: string | null;
  metadata: Record<string, unknown>;
};
type CalendarApiResponse = { window: { start: string; end: string }; items: CalendarQueueItem[]; dailySlots: { date: string; count: number; warning: 'ok' | 'notice' | 'critical' }[] };
type CalendarCapacity = { date: string; count: number; warning: 'ok' | 'notice' | 'critical' };
type CalendarPayload = {
  days: CalendarDay[];
  focusPosts: CalendarFocusPost[];
  focusLabel: string;
  dailySlotsByDate: Record<string, CalendarCapacity>;
};
type CalendarWeekCoverageItem = {
  service: string;
  day: string;
  dayIndex: number;
  targetCount: number;
  actualCount: number;
  covered: boolean;
};

type PublishingChannelSummary = { name: string; status: 'Success' | 'Failed'; sync: string; queue: number; health: string };
type PublishingQueueRow = { id: string; title: string; platform: string; time: string; status: 'Ready' | 'Syncing' | 'Failed' | 'Queued' | 'Published' | 'Cancelled' };
type PublishingErrorRow = { time: string; platform: string; message: string };
type PublishingQueueApiRow = {
  id: string;
  content_item_id: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  content_items: { id: string; title: string | null; service_area: string | null } | null;
};
type PublishingErrorApiRow = {
  id: string;
  error_code: string | null;
  message: string | null;
  created_at: string;
  publishing_job_id: string | null;
};
type PublishingJobApiRow = {
  id: string;
  publishing_queue_id: string;
  status: string;
  external_post_id: string | null;
  attempt_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};
type PublishingIntegrationApiRow = {
  id: string;
  account_name: string | null;
  external_account_id: string | null;
  status: string;
  scopes: string[];
  last_sync_at: string | null;
  metadata: Record<string, unknown> | null;
  integrations: { provider: string; display_name: string } | { provider: string; display_name: string }[] | null;
};
type PublishingApiResponse = {
  queue: PublishingQueueApiRow[];
  errors: PublishingErrorApiRow[];
  jobs?: PublishingJobApiRow[];
  integrations?: PublishingIntegrationApiRow[];
  summary: Record<string, number>;
};

type DashboardTone = 'blue' | 'amber' | 'emerald' | 'slate';
type DashboardBoard = { column: string; count: number; items: BoardItem[] };
type DashboardAgent = { name: string; state: 'Online' | 'Idle' | 'Offline'; task: string; runs: number; load: number };
type DashboardStatIcon = 'Layers3' | 'ShieldCheck' | 'Clock3' | 'Zap';
type DashboardStatAction = 'working-posts' | 'need-review' | 'scheduled' | 'agent-runs' | 'default';
type DashboardStatSource = {
  label: string;
  value: string;
  change: string;
  icon: DashboardStatIcon;
  tone: DashboardTone;
  action?: DashboardStatAction;
};
type DashboardStat = Omit<DashboardStatSource, 'icon' | 'action'> & { icon: ComponentType<{ className?: string }>; action: DashboardStatAction };
type DashboardActivity = { message: string; actorName?: string | null; createdAt?: string; source?: string; presentation?: Record<string, unknown> };
type DashboardPayload = {
  stats: DashboardStatSource[];
  board: DashboardBoard[];
  agents: DashboardAgent[];
  activity: DashboardActivity[];
};
type DashboardApiPayload = DashboardPayload & { generatedAt: string };

type ReviewApiRow = {
  id: string;
  content_item_id: string;
  review_type: string;
  status: string;
  risk_level: string | null;
  assigned_reviewer: string | null;
  reviewer_name: string | null;
  due_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  content_items: {
    id: string;
    title: string | null;
    service_area: string | null;
    status: string | null;
    risk_level: string | null;
    metadata: Record<string, unknown> | null;
  } | null;
  presentation?: PrdPresentationModel;
  debug?: PrdDebugModel;
};
type ReviewApiResponse = { reviews: ReviewApiRow[]; count: number };
type ContentJobCreateResponse = {
  job: { id: string };
  queuedRuns: Array<{ id: string }>;
  executedRuns?: Array<{ status?: string; runId?: string | null; message?: string }>;
  review?: {
    id?: string;
    status?: string;
    review_type?: string;
  } | null;
};

type SystemLogApiRow = {
  id: string;
  event_type: string;
  source: string | null;
  severity: string;
  status: string;
  message: string | null;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  presentation?: Record<string, unknown> | null;
};
type ErrorLogApiRow = {
  id: string;
  type: string;
  severity: string;
  status: string;
  message: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  presentation?: Record<string, unknown> | null;
};
type LogsApiResponse = {
  systemLogs: SystemLogApiRow[];
  errorEvents: ErrorLogApiRow[];
  summary: Record<string, number>;
};
type AgentExecuteResponse = {
  status: string;
  processed: number;
  results: Array<{
    status?: string;
  }>;
};
type RuntimeCandidate = {
  id: 'multica' | 'codex' | 'openai';
  label: string;
  available: boolean;
  priority: number;
  reason: string;
  checks: Record<string, boolean>;
};
type LocalRuntimeTool = {
  id: string;
  label: string;
  command: string;
  available: boolean;
  path: string | null;
  capabilities: string[];
  reason: string;
};
type RuntimeDiscoveryResponse = {
  status: 'ready' | 'unavailable';
  preference: AgentRuntimePreference;
  selectedProvider: 'multica' | 'codex' | 'openai' | null;
  candidates: RuntimeCandidate[];
  localTools: LocalRuntimeTool[];
  scanScope: 'server_process';
};
type RagCitationApiRow = {
  chunkId: string;
  sourceId: string;
  title: string;
  sourceType: string;
  category: string | null;
  score: number;
};
type RagChatApiResponse = {
  answer: string;
  citations: RagCitationApiRow[];
  blocked: boolean;
  reason?: string;
};
type RagCitationCard = { source: string; match: string; detail: string };

const dashboardStatIcons: Record<DashboardStatIcon, ComponentType<{ className?: string }>> = {
  Layers3,
  ShieldCheck,
  Clock3,
  Zap,
};

function getDashboardStatAction(stat: DashboardStatSource): DashboardStatAction {
  const normalized = `${stat.label} ${stat.change}`.toLowerCase();

  if (normalized.includes('need review') || (normalized.includes('need') && normalized.includes('review'))) {
    return 'need-review';
  }

  if (normalized.includes('scheduled')) {
    return 'scheduled';
  }

  if (normalized.includes('agent') && normalized.includes('run')) {
    return 'agent-runs';
  }

  if (normalized.includes('working')) {
    return 'working-posts';
  }

  return 'default';
}

function normalizeDashboardCounts(board: DashboardBoard[]): DashboardBoard[] {
  return board.map((column) => ({
    ...column,
    count: column.items.length,
    items: column.items.map(normalizeDashboardBoardItem),
  }));
}

function normalizePresentationModel(value: PrdPresentationModel | null | undefined): PrdPresentationModel | undefined {
  if (!value) {
    return undefined;
  }

  return {
    ...value,
    title: normalizeTextValue(value.title),
    subtitle: normalizeTextValue(value.subtitle),
    platform: normalizeTextValue(value.platform),
    status_label: normalizeTextValue(value.status_label),
    priority_label: normalizeTextValue(value.priority_label),
    content_preview: normalizeTextValue(value.content_preview),
    body_preview: normalizeTextValue(value.body_preview),
    caption: normalizeTextValue(value.caption),
    hashtags: Array.isArray(value.hashtags) ? value.hashtags.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0) : undefined,
    call_to_action: normalizeTextValue(value.call_to_action),
    image_preview_url: normalizeTextValue(value.image_preview_url),
    image_status_label: normalizeTextValue(value.image_status_label),
    layout_summary: normalizeTextValue(value.layout_summary),
    creative_summary: normalizeTextValue(value.creative_summary),
    approval_status_label: normalizeTextValue(value.approval_status_label),
    approval_recommendation: normalizeTextValue(value.approval_recommendation),
    required_fix: normalizeTextValue(value.required_fix),
    degraded_message: normalizeTextValue(value.degraded_message),
    next_action_label: normalizeTextValue(value.next_action_label),
    agent_name: normalizeTextValue(value.agent_name),
    updated_at_label: normalizeTextValue(value.updated_at_label),
  };
}

function normalizeDashboardBoardItem(item: BoardItem): BoardItem {
  const presentation = normalizePresentationModel(item.presentation);

  return {
    ...item,
    title: presentation?.title || item.title,
    channel: presentation?.platform || item.channel,
    due: presentation?.updated_at_label || item.due,
    generatedDrafts: mapGeneratedDraftsFromMetadata(item.generatedDrafts),
    generatedAssets: mapGeneratedAssetsFromMetadata(item.generatedAssets),
    selectedAssets: normalizeLanguageCodesFromStored(item.selectedAssets),
    assetLayoutPlan: normalizeLanguageCodesFromStored(item.assetLayoutPlan),
    visualBrief: presentation?.layout_summary || normalizeTextValue(item.visualBrief),
    layout: presentation?.layout_summary || normalizeTextValue(item.layout),
    contentItemStatus: normalizeTextValue(item.contentItemStatus),
    imageCount: typeof item.imageCount === 'number' ? item.imageCount : undefined,
    wordCount: typeof item.wordCount === 'number' ? item.wordCount : undefined,
    presentation,
  };
}

function mapReviewItemToDashboardBoardItem(item: ReviewQueueItem): BoardItem {
  const workflowId = getDashboardIdForWorkflowId(item.workflowId || item.id);
  const risk = normalizeBoardRisk(item.risk);
  const channels = (item.platforms?.filter(Boolean) ?? []).join(', ') || item.category || 'Content workflow';
  const tone: BoardItem['tone'] = risk === 'High' ? 'rose' : risk === 'Medium' ? 'amber' : 'emerald';

  const itemRecord: BoardItem = {
    id: workflowId,
    title: item.title || item.contentPreview || `Review ${workflowId}`,
    owner: item.owner || 'Review Queue',
    channel: channels,
    due: item.due || 'Queued',
    risk,
    tone,
    stage: getReviewSurfaceStage(item),
    contentItemStatus: item.contentItemStatus,
    generatedDrafts: item.generatedDrafts,
    generatedAssets: item.generatedAssets,
    imageCount: item.imageCount,
    selectedAssets: item.selectedAssets,
    assetLayoutPlan: item.assetLayoutPlan,
    layout: item.layout,
    visualBrief: item.visualBrief,
    wordCount: item.wordCount,
    presentation: {
      title: item.title,
      subtitle: item.category,
      platform: channels,
      status_label: item.status,
      priority_label: item.risk,
      content_preview: item.contentPreview,
      body_preview: item.bodyPreview,
      caption: item.caption,
      hashtags: item.hashtags,
      call_to_action: item.cta,
      image_preview_url: item.generatedAssets?.find((asset) => !asset.isPlaceholder && Boolean(asset.url))?.url,
      image_status_label: item.degradedMessage ? 'Generation failed' : item.generatedAssets?.some((asset) => !asset.isPlaceholder && Boolean(asset.url || asset.storagePath)) ? 'Output ready' : item.generatedAssets?.length ? 'Pending generation' : undefined,
      layout_summary: item.visualBrief,
      creative_summary: item.creativeSummary,
      approval_status_label: item.readinessStatus ?? item.status,
      approval_recommendation: item.approvalRecommendation,
      required_fix: item.requiredFix,
      degraded_message: item.degradedMessage,
      next_action_label: item.status === 'In Review' ? 'Complete review' : 'Continue workflow',
      updated_at_label: item.due,
    },
  };

  return itemRecord;
}

function syncDashboardBoardWithInReviewItems(board: DashboardBoard[], reviewItems: ReviewQueueItem[]) {
  const inReviewEntries = reviewItems
    .filter((item) => item.status === 'In Review')
    .map((item) => ({
      reviewItem: item,
      boardItem: mapReviewItemToDashboardBoardItem(item),
      boardSignatures: getReviewQueueItemMatchSignatures(item),
    }))
    .sort((a, b) => getReviewQueueSortValue(b.reviewItem) - getReviewQueueSortValue(a.reviewItem))
    .reduce(
      (
        acc: Array<{
          reviewItem: ReviewQueueItem;
          boardItem: BoardItem;
          boardSignatures: Set<string>;
        }>,
        entry,
      ) => {
        const hasDuplicate = acc.some((current) => hasMatchingSignatures(entry.boardSignatures, current.boardSignatures));

        if (!hasDuplicate) {
          acc.push(entry);
        }

        return acc;
      },
      [],
    );

  const inReviewItems = inReviewEntries.map((entry) => entry.boardItem);
  const inReviewSignatures = inReviewEntries.map((entry) => entry.boardSignatures);

  if (inReviewItems.length === 0) {
    return board;
  }

  const boardWithoutInReviewReferences = board.map((column) => ({
    ...column,
    items: column.items.filter((boardItem) => {
      const boardSignatures = buildReviewIdMatchSignatures(boardItem.id);

      return !inReviewSignatures.some((reviewSignatures) => hasMatchingSignatures(boardSignatures, reviewSignatures));
    }),
  }));

  const nextBoard = boardWithoutInReviewReferences.some((column) => column.column === 'In Review')
    ? boardWithoutInReviewReferences.map((column) =>
        column.column === 'In Review'
          ? {
              ...column,
              items: inReviewItems,
            }
          : column,
      )
    : [
        ...boardWithoutInReviewReferences,
        {
          column: 'In Review',
          count: inReviewItems.length,
          items: inReviewItems,
        },
      ];

  return normalizeDashboardCounts(nextBoard);
}

type DashboardBoardTab = 'All' | 'Assigned' | 'Agents' | 'Scheduled';

function normalizeDashboardTab(tab: string): DashboardBoardTab {
  const normalized = tab.toLowerCase();
  if (normalized.includes('assigned')) {
    return 'Assigned';
  }
  if (normalized.includes('agent')) {
    return 'Agents';
  }
  if (normalized.includes('scheduled')) {
    return 'Scheduled';
  }
  return 'All';
}

function filterDashboardBoardByTab(board: DashboardBoard[], tab: DashboardBoardTab): DashboardBoard[] {
  if (tab === 'All') {
    return normalizeDashboardCounts(board);
  }

  const filtered = board.filter((column) => {
    const key = column.column.toLowerCase();

    if (tab === 'Assigned') {
      return key.includes('backlog') || key.includes('todo') || key.includes('progress') || key.includes('draft') || key.includes('ready');
    }

    if (tab === 'Agents') {
      return key.includes('review') || key.includes('agent') || key.includes('qa');
    }

    return key.includes('done') || key.includes('scheduled') || key.includes('publish') || key.includes('published');
  });

  return normalizeDashboardCounts(filtered);
}

function formatBoardItemContextLabel(item: BoardItem): string {
  return `${item.id} · ${item.owner}`;
}

function mapDashboardPayload(payload: DashboardPayload): {
  stats: DashboardStat[];
  board: DashboardBoard[];
  agents: DashboardAgent[];
  activity: DashboardActivity[];
} {
  return {
    stats: payload.stats.map((item) => ({
      ...item,
      icon: dashboardStatIcons[item.icon] ?? Layers3,
      action: item.action ?? getDashboardStatAction(item),
    })),
    board: normalizeDashboardCounts(payload.board),
    agents: payload.agents,
    activity: payload.activity.map((entry) => ({
      ...entry,
      message:
        (typeof entry.presentation?.readable_message === 'string' && entry.presentation.readable_message) ||
        (typeof entry.presentation?.user_facing_summary === 'string' && entry.presentation.user_facing_summary) ||
        entry.message,
    })),
  };
}

function getFirstDefinedMetadataText(metadata: Record<string, unknown> | null | undefined, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = normalizeTextValue(metadata?.[key] as string | undefined);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function getFirstDefinedMetadataValue(metadata: Record<string, unknown> | null | undefined, keys: string[]): unknown {
  for (const key of keys) {
    if (metadata && Object.prototype.hasOwnProperty.call(metadata, key)) {
      const value = metadata[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  return undefined;
}

function parseReviewTimestamp(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = normalizeTextValue(value);
    if (!normalized) {
      return undefined;
    }

    const parsedNumber = Number(normalized);
    if (Number.isFinite(parsedNumber)) {
      return parsedNumber;
    }

    const timeOnlyMatch = normalized.match(/^(\\d{1,2}):(\\d{2})(?::(\\d{2}))?$/);
    if (timeOnlyMatch) {
      const hour = Number(timeOnlyMatch[1]);
      const minute = Number(timeOnlyMatch[2]);
      const second = Number(timeOnlyMatch[3] || '0');

      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59) {
        const parsed = new Date();
        parsed.setHours(hour, minute, second, 0);
        return parsed.getTime();
      }
    }

    const parsedDate = new Date(normalized);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.getTime();
  }

  if (typeof value === 'bigint' && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return undefined;
}

type JwtTokenPayload = {
  email?: string;
  name?: string;
  username?: string;
  user_name?: string;
  user_metadata?: {
    full_name?: string;
    fullName?: string;
    name?: string;
    username?: string;
    [key: string]: unknown;
  };
};

function decodeJwtPayload(token: string): JwtTokenPayload | null {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  const encodedPayload = parts[1];
  const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;

  try {
    const decodedPayload = atob(padded);
    return JSON.parse(decodedPayload) as JwtTokenPayload;
  } catch {
    return null;
  }
}

function extractActorDisplayNameFromToken(token: string): string {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return '';
  }

  const userMetadata = payload.user_metadata ?? {};
  const emailPrefix = normalizeTextValue(payload.email ?? '').split('@')[0];

  const candidates = [
    normalizeTextValue(payload.name),
    normalizeTextValue(payload.user_name),
    normalizeTextValue(payload.username),
    normalizeTextValue((userMetadata.full_name as string) ?? ''),
    normalizeTextValue((userMetadata.fullName as string) ?? ''),
    normalizeTextValue((userMetadata.name as string) ?? ''),
    normalizeTextValue((userMetadata.username as string) ?? ''),
    emailPrefix,
  ];

  return candidates.find(Boolean) ?? '';
}

function buildReviewItemCreator(metadata: Record<string, unknown> | undefined, reviewerName?: string | null) {
  return (
    getFirstDefinedMetadataText(metadata, ['createdBy', 'created_by', 'creator', 'creatorName', 'created_by_name', 'creator_name']) ||
    normalizeTextValue(reviewerName) ||
    undefined
  );
}

function formatDashboardActivityDate(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

type CommandCenterCounts = {
  total: number;
  brief: number;
  rules: number;
  generate: number;
  qc: number;
  review: number;
  schedule: number;
  publish: number;
  qcFailed: number;
  failedPublish: number;
};

function getCommandCenterCounts(board: DashboardBoard[]): CommandCenterCounts {
  const items = board.flatMap((column) =>
    column.items.map((item) => ({
      item,
      text: `${column.column} ${item.stage ?? ''} ${item.title} ${item.owner} ${item.channel} ${item.due} ${item.risk} ${item.tone}`.toLowerCase(),
    })),
  );

  const countBy = (matcher: (text: string, item: BoardItem) => boolean) => items.filter(({ text, item }) => matcher(text, item)).length;

  return {
    total: items.length,
    brief: countBy((text) => text.includes('brief') || text.includes('backlog') || text.includes('created')),
    rules: countBy((text) => text.includes('source') || text.includes('rag') || text.includes('rules') || text.includes('research')),
    generate: countBy((text) => text.includes('text') || text.includes('draft') || text.includes('generation') || text.includes('strategy')),
    qc: countBy((text, item) => text.includes('qc') || text.includes('compliance') || item.risk === 'High'),
    review: countBy((text) => text.includes('review') || text.includes('approval')),
    schedule: countBy((text) => text.includes('schedule') || text.includes('queued')),
    publish: countBy((text) => text.includes('publish') || text.includes('posted')),
    qcFailed: countBy((text, item) => text.includes('qc failed') || text.includes('blocked') || item.risk === 'High'),
    failedPublish: countBy((text) => text.includes('failed') || text.includes('error')),
  };
}

const navGroups: { group: string; items: MenuItem[] }[] = [
  {
    group: 'Command',
    items: [
      { name: 'Dashboard', icon: Home },
      { name: 'Calendar', icon: CalendarDays },
      { name: 'Publishing', icon: UploadCloud },
    ],
  },
  {
    group: 'Studio',
    items: [
      { name: 'Create Post', icon: PenLine },
      { name: 'Review Queue', icon: ShieldCheck },
      { name: 'Content Library', icon: Library },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { name: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    group: 'System',
    items: [
      { name: 'Knowledge Base', icon: BookOpen },
      { name: 'Rules & Brand', icon: FileText },
      { name: 'Agents', icon: Bot },
      { name: 'Settings', icon: Settings },
      { name: 'Logs', icon: Activity },
    ],
  },
];

const pageMeta: Record<
  string,
  {
    group: string;
    title: string;
    description: string;
    tabs: string[];
  }
> = {
  Dashboard: {
    group: 'Command',
    title: 'Operations command center',
    description: "Today's publishing operations: readiness, stuck work, agent progress, and the next human action.",
    tabs: ['Today', 'Pipeline', 'Needs action'],
  },
  Calendar: {
    group: 'Command',
    title: 'Publishing calendar',
    description: 'Plan monthly, weekly, and daily publishing coverage across Thailand timezone.',
    tabs: ['Month', 'Week', 'Day'],
  },
  Publishing: {
    group: 'Command',
    title: 'Publishing queue',
    description: 'Operate approved posts from unscheduled to scheduled, failed, retried, and published.',
    tabs: ['Unscheduled', 'Scheduled', 'Failed', 'Published log'],
  },
  Analytics: {
    group: 'Intelligence',
    title: 'Analytics',
    description: 'Measure reach, engagement, content trends, and the learning loop for future briefs.',
    tabs: ['Performance', 'Languages', 'Learning loop'],
  },
  'Create Post': {
    group: 'Studio',
    title: 'Create',
    description: 'A guided studio flow from brief, rules, generation, image direction, QC, and review handoff.',
    tabs: ['Manual Setup', 'Quick AI Mode'],
  },
  'Content Library': {
    group: 'Studio',
    title: 'Content Library',
    description: 'Search, filter, reuse, and update all approved posts, drafts, media, and campaign assets.',
    tabs: ['All', 'Drafts', 'Approved', 'Archived'],
  },
  'Knowledge Base': {
    group: 'System',
    title: 'Sources & knowledge',
    description: 'Maintain approved legal and accounting sources that ground AI output and reduce hallucination.',
    tabs: ['Sources', 'Processing', 'Test RAG Knowledge'],
  },
  'Review Queue': {
    group: 'Studio',
    title: 'Review',
    description: 'Preview-first human control for approving, revising, regenerating, or scheduling content.',
    tabs: ['Awaiting review', 'Risk flagged', 'Approved'],
  },
  'Rules & Brand': {
    group: 'System',
    title: 'Rules & Brand',
    description: 'Set team permissions, brand voice, professional rules, target audiences, and forbidden terms.',
    tabs: ['Team Members', 'Law firm voice', 'Accounting voice'],
  },
  Agents: {
    group: 'System',
    title: 'Agents',
    description: 'Manage locked core agents, OpenAI model routing, and premium agent expansion.',
    tabs: ['Core agents', 'Agent routing', 'Upsell locked'],
  },
  Logs: {
    group: 'System',
    title: 'Logs',
    description: 'Trace system events, errors, bugs, agent runs, exports, and audit history.',
    tabs: ['Activity', 'Errors', 'Agent runs'],
  },
  Settings: {
    group: 'System',
    title: 'Settings',
    description: 'Connect platforms, manage credentials, local Codex settings, and operational preferences.',
    tabs: ['Profile', 'Integrations', 'Security'],
  },
};

const fallbackDashboardStats: DashboardStatSource[] = [];
const fallbackDashboardBoard: DashboardBoard[] = [];
const fallbackDashboardAgents: DashboardAgent[] = [];
const fallbackDashboardActivity: DashboardActivity[] = [];

const fallbackDashboardData: {
  stats: DashboardStat[];
  board: DashboardBoard[];
  agents: DashboardAgent[];
  activity: DashboardActivity[];
} = mapDashboardPayload({
  stats: fallbackDashboardStats,
  board: fallbackDashboardBoard,
  agents: fallbackDashboardAgents,
  activity: fallbackDashboardActivity,
});

const fallbackCalendarDays: CalendarDay[] = [];
const fallbackFocusDayPosts: CalendarFocusPost[] = [];
const fallbackPublishingChannels: PublishingChannelSummary[] = [];
const fallbackPublishingQueue: PublishingQueueRow[] = [];
const fallbackPublishingErrors: PublishingErrorRow[] = [];

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const APP_TIMEZONE = 'Asia/Bangkok';
const APP_TIMEZONE_OFFSET = '+07:00';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDateParts(value: number) {
  return String(value).padStart(2, '0');
}

function toBangkokDateParts(date: Date) {
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return { year, month, day, hour, minute, weekday };
}

function createBangkokDateTime(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  return new Date(`${toDateParts(year)}-${toDateParts(month)}-${toDateParts(day)}T${toDateParts(hour)}:${toDateParts(minute)}:${toDateParts(second)}${APP_TIMEZONE_OFFSET}`);
}

function toAppDateKey(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const parts = toBangkokDateParts(value);
    if (!parts) {
      return null;
    }

    return `${parts.year}-${toDateParts(parts.month)}-${toDateParts(parts.day)}`;
  }

  if (isIsoDateKey(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const parts = toBangkokDateParts(parsed);
  if (!parts) {
    return null;
  }

  return `${parts.year}-${toDateParts(parts.month)}-${toDateParts(parts.day)}`;
}

function toIsoDate(date: Date) {
  return toAppDateKey(date) ?? '';
}

function toLocalDateKeyFromDate(date: Date) {
  return toAppDateKey(date) ?? '';
}

function getCalendarWindow() {
  const now = new Date();
  const nowParts = toBangkokDateParts(now);
  if (!nowParts) {
    return {
      start: now,
      end: new Date(now.getTime() + 34 * DAY_IN_MS),
      month: now.getMonth(),
      year: now.getFullYear(),
    };
  }

  const monthStart = createBangkokDateTime(nowParts.year, nowParts.month, 1);
  const monthStartParts = toBangkokDateParts(monthStart);
  const mondayOffset = monthStartParts ? (monthStartParts.weekday + 6) % 7 : 0;
  const start = new Date(monthStart.getTime() - mondayOffset * DAY_IN_MS);
  const end = new Date(start.getTime() + 34 * DAY_IN_MS);

  return {
    start,
    end,
    month: nowParts.month - 1,
    year: nowParts.year,
  };
}

function mapCalendarStatus(status: string | null): CalendarPostStatus {
  const normalized = (status ?? '').toLowerCase();

  if (normalized === 'published' || normalized === 'posted') {
    return 'posted';
  }

  if (normalized === 'error' || normalized === 'failed' || normalized === 'cancelled') {
    return 'issue';
  }

  if (normalized === 'draft' || normalized === 'source_search' || normalized === 'research') {
    return 'draft';
  }

  return 'queued';
}

function formatFocusTime(value: string | null) {
  if (!value) {
    return '--:--';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '--:--';
  }

  return parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE,
  });
}

function parseCalendarMinutes(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parts = toBangkokDateParts(new Date(value));
  if (!parts) {
    return null;
  }

  return parts.hour * 60 + parts.minute;
}

function formatHourLabel(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function getCalendarTimelineHours(days: CalendarDay[]) {
  const minutes = days.flatMap((day) => day.posts.map((post) => parseCalendarMinutes(post.scheduledAt)).filter((value): value is number => value !== null));

  if (minutes.length === 0) {
    return Array.from({ length: 14 }, (_, index) => 8 + index);
  }

  const minHour = Math.max(0, Math.floor(Math.min(...minutes) / 60) - 1);
  const maxHour = Math.min(23, Math.floor(Math.max(...minutes) / 60) + 1);

  return Array.from({ length: maxHour - minHour + 1 }, (_, index) => minHour + index);
}

function buildPostsByHour(posts: CalendarDayPost[], timelineHours: number[]) {
  const buckets = new Map<number, CalendarDayPost[]>();
  timelineHours.forEach((hour) => {
    buckets.set(hour, []);
  });

  posts.forEach((post) => {
    const minutes = parseCalendarMinutes(post.scheduledAt);
    if (minutes === null) {
      const fallback = timelineHours[0] ?? 8;
      const bucket = buckets.get(fallback);
      if (bucket) {
        bucket.push(post);
      }

      return;
    }

    const hour = Math.floor(minutes / 60);
    const boundedHour = hour < timelineHours[0] ? timelineHours[0] : hour > timelineHours[timelineHours.length - 1] ? timelineHours[timelineHours.length - 1] : hour;
    const bucket = buckets.get(boundedHour);

    if (bucket) {
      bucket.push(post);
      return;
    }

    const fallback = timelineHours[0] ?? 8;
    const fallbackBucket = buckets.get(fallback);
    if (fallbackBucket) {
      fallbackBucket.push(post);
    }
  });

  return timelineHours.map((hour) => ({
    hour,
    posts: buckets.get(hour)?.slice().sort((a, b) => {
      const aMinutes = parseCalendarMinutes(a.scheduledAt) ?? 24 * 60;
      const bMinutes = parseCalendarMinutes(b.scheduledAt) ?? 24 * 60;
      return aMinutes - bMinutes;
    }) ?? [],
  }));
}

function isIsoDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatCalendarDateLabel(dateKey: string | undefined, fallbackDate: string) {
  if (!dateKey || !isIsoDateKey(dateKey)) {
    return fallbackDate;
  }

  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) {
    return fallbackDate;
  }

  const [year, month, day] = parts;
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || month < 1 || month > 12) {
    return fallbackDate;
  }

  return `${monthLabels[month - 1]} ${day}`;
}

function toWeekdayIndex(dateKey: string | undefined): number {
  if (!dateKey || !isIsoDateKey(dateKey)) {
    return -1;
  }

  const parsed = dateKey.split('-').map(Number);
  if (parsed.length !== 3) {
    return -1;
  }

  const [year, month, day] = parsed;
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return -1;
  }

  const utcDay = new Date(Date.UTC(year, month - 1, day));
  return (utcDay.getUTCDay() + 6) % 7;
}

function toCalendarSlotIso(selectedDate: string | undefined, hour: number, minute: number) {
  if (!selectedDate) {
    return null;
  }

  if (!isIsoDateKey(selectedDate)) {
    return null;
  }

  const safeHour = Math.max(0, Math.min(hour, 23));
  const safeMinute = Math.max(0, Math.min(minute, 59));
  const localDateTime = new Date(
    `${selectedDate}T${toDateParts(safeHour)}:${toDateParts(safeMinute)}:00${APP_TIMEZONE_OFFSET}`,
  );

  if (Number.isNaN(localDateTime.getTime())) {
    return null;
  }

  return localDateTime.toISOString();
}

function mapCalendarPayload(payload: CalendarApiResponse): CalendarPayload {
  const { items, dailySlots } = payload;
  const byDate = new Map<string, CalendarFocusPost[]>();
  const focusKey = toAppDateKey(new Date()) ?? toIsoDate(new Date());
  const { start, month } = getCalendarWindow();

  items.forEach((item) => {
    if (!item.scheduled_at) return;

    const scheduledAt = item.scheduled_at;
    const key = toAppDateKey(scheduledAt);
    if (!key) {
      return;
    }
    const post: CalendarFocusPost = {
      id: item.id,
      time: formatFocusTime(item.scheduled_at),
      title: item.title ?? 'Untitled content',
      service: item.service_area ?? 'General',
      status: mapCalendarStatus(item.status),
      scheduledAt,
    };

    const current = byDate.get(key) ?? [];
    current.push(post);
    byDate.set(key, current);
  });

  const days: CalendarDay[] = [];
  for (let index = 0; index < 35; index += 1) {
    const value = new Date(start.getTime() + index * DAY_IN_MS);
    const valueParts = toBangkokDateParts(value);
    if (!valueParts) {
      continue;
    }

    const key = `${valueParts.year}-${toDateParts(valueParts.month)}-${toDateParts(valueParts.day)}`;
    const posts = byDate.get(key) ?? [];

    days.push({
      date: String(valueParts.day),
      dateKey: key,
      muted: valueParts.month - 1 !== month,
      posts: posts.map((entry) => ({
        id: entry.id,
        title: entry.title,
        service: entry.service,
        status: entry.status,
        scheduledAt: entry.scheduledAt,
      })),
    });
  }

  const focusPosts = byDate.get(focusKey)?.slice(0, 6) ?? [];
  const focusedKey = focusPosts.length ? focusKey : toAppDateKey(new Date()) ?? toIsoDate(new Date());
  const focusedParts = focusedKey?.split('-').map(Number) ?? [];
  const focusLabel = focusedParts.length === 3 && !Number.isNaN(focusedParts[0]) && !Number.isNaN(focusedParts[1]) && !Number.isNaN(focusedParts[2]) && focusedParts[1] >= 1 && focusedParts[1] <= 12
    ? `${monthLabels[focusedParts[1] - 1]} ${focusedParts[2]}`
    : 'June 15';

  return {
    dailySlotsByDate: dailySlots.reduce(
      (acc, slot) => {
        const slotDate = toAppDateKey(slot.date) ?? toAppDateKey(`${slot.date}T00:00:00`);
        if (slotDate) {
          acc[slotDate] = slot;
        }
        return acc;
      },
      {} as Record<string, CalendarCapacity>,
    ),
    days,
    focusPosts: focusPosts.length
      ? focusPosts
      : Array.from(byDate.entries())
          .sort(([a], [b]) => (a > b ? 1 : -1))
          .find(() => true)?.[1]
          ?.slice(0, 6) ?? [],
    focusLabel,
  };
}

function getCalendarWeekCoverage(calendarDays: CalendarDay[], weekStartIndex: number): CalendarWeekCoverageItem[] {
  const weekDays = calendarDays.slice(weekStartIndex, weekStartIndex + 7);
  const countsByWeekday = new Array(7).fill(0).map(() => new Map<string, number>());

  weekDays.forEach((day, localIndex) => {
    day.posts.forEach((post) => {
      const current = countsByWeekday[localIndex].get(post.service) ?? 0;
      countsByWeekday[localIndex].set(post.service, current + 1);
    });
  });

  return calendarServiceCoverageRules.map((rule) => {
    const servicesForWeekday = countsByWeekday[rule.dayIndex] ?? new Map<string, number>();
    const actualCount = servicesForWeekday.get(rule.service) ?? 0;

    return {
      service: rule.service,
      day: calendarWeekdayLongNames[rule.dayIndex] ?? 'Unknown',
      dayIndex: rule.dayIndex,
      targetCount: rule.targetCount,
      actualCount,
      covered: actualCount >= rule.targetCount,
    };
  });
}

function capitalizeQueueStatus(status: string): PublishingQueueRow['status'] {
  switch ((status ?? '').toLowerCase()) {
    case 'ready':
      return 'Ready';
    case 'syncing':
      return 'Syncing';
    case 'published':
      return 'Published';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Queued';
  }
}

function formatQueueTime(value: string | null) {
  if (!value) {
    return 'Unscheduled';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unscheduled';
  }

  const base = new Date();
  const baseThaiParts = toBangkokDateParts(base);
  if (baseThaiParts) {
    const tomorrowThai = new Date(
      `${baseThaiParts.year}-${toDateParts(baseThaiParts.month)}-${toDateParts(baseThaiParts.day)}T00:00:00${APP_TIMEZONE_OFFSET}`,
    );
    tomorrowThai.setDate(tomorrowThai.getDate() + 1);
    const sameDay = toAppDateKey(parsed) === toAppDateKey(base);
    const sameTomorrow = toAppDateKey(parsed) === toAppDateKey(tomorrowThai);

    const time = parsed.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: APP_TIMEZONE,
    });
    if (sameDay) {
      return `Today ${time}`;
    }

    if (sameTomorrow) {
      return `Tomorrow ${time}`;
    }
  }

  const time = parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE,
  });

  return `${parsed.toLocaleDateString('en-GB', {
    month: 'short',
    day: '2-digit',
    timeZone: APP_TIMEZONE,
  })} ${time}`;
}

function minutesAgo(value: string | null | undefined) {
  if (!value) {
    return 'No activity';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'No activity';
  }

  const deltaMinutes = Math.max(0, Math.round((Date.now() - parsed.getTime()) / 60000));

  return `${deltaMinutes} min ago`;
}

function getPublishingIntegrationMeta(row: PublishingIntegrationApiRow) {
  const integration = Array.isArray(row.integrations) ? row.integrations[0] : row.integrations;
  return integration ?? null;
}

function providerToPublishingChannel(provider: string, displayName: string | undefined) {
  switch (provider) {
    case 'facebook':
      return 'Facebook';
    case 'buffer':
      return 'Buffer';
    case 'wordpress':
      return 'WordPress';
    case 'email_newsletter':
      return 'Email Newsletter';
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    default:
      return displayName ?? provider;
  }
}

function formatIntegrationHealth(status: string) {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'expired':
      return 'Token expired';
    case 'failed':
      return 'Needs attention';
    case 'disconnected':
      return 'Disconnected';
    default:
      return 'Not connected';
  }
}

function mapPublishingPayload(data: PublishingApiResponse) {
  const platformMap = new Map<string, { queue: number; lastUpdated: string | null; hasFailed: boolean }>();
  const jobMap = new Map((data.jobs ?? []).map((job) => [job.id, job]));
  const queueMap = new Map(data.queue.map((row) => [row.id, row]));
  const integrationMap = new Map<string, PublishingIntegrationApiRow>();

  (data.integrations ?? []).forEach((row) => {
    const integration = getPublishingIntegrationMeta(row);
    if (!integration) {
      return;
    }

    integrationMap.set(providerToPublishingChannel(integration.provider, integration.display_name), row);
  });

  data.queue.forEach((row) => {
    const current = platformMap.get(row.platform) ?? { queue: 0, lastUpdated: null, hasFailed: false };
    current.queue += 1;
    const compareWith = row.updated_at || row.created_at;
    if (!current.lastUpdated || (compareWith && compareWith > current.lastUpdated)) {
      current.lastUpdated = compareWith;
    }
    if (row.status === 'failed') {
      current.hasFailed = true;
    }
    platformMap.set(row.platform, current);
  });

  const channelMap: PublishingChannelSummary[] = fallbackPublishingChannels.map((channel) => {
    const summary = platformMap.get(channel.name);
    const integration = integrationMap.get(channel.name);
    const sync = integration?.last_sync_at ? `Last sync ${minutesAgo(integration.last_sync_at)}` : summary?.lastUpdated ? `Last queue update ${minutesAgo(summary.lastUpdated)}` : 'No recent jobs';
    const health = integration ? formatIntegrationHealth(integration.status) : summary ? 'Queue only' : 'Not connected';
    const hasFailed = summary?.hasFailed || integration?.status === 'expired' || integration?.status === 'failed';

    if (!summary) {
      return {
        ...channel,
        queue: 0,
        status: hasFailed ? 'Failed' : 'Success',
        sync,
        health,
      };
    }

    return {
      ...channel,
      queue: summary.queue,
      status: hasFailed ? 'Failed' : 'Success',
      sync,
      health: hasFailed ? health === 'Connected' ? 'Needs attention' : health : health,
    };
  });

  return {
    channels: channelMap,
    queue: data.queue.map((row) => ({
      id: row.id,
      title: row.content_items?.title ?? 'Untitled content',
      platform: row.platform,
      time: formatQueueTime(row.scheduled_at),
      status: capitalizeQueueStatus(row.status),
    })),
    errors: data.errors.slice(0, 4).map((row) => {
      const jobEntry = row.publishing_job_id ? jobMap.get(row.publishing_job_id) : undefined;
      const queueEntry = jobEntry ? queueMap.get(jobEntry.publishing_queue_id) : undefined;
      return {
        time: new Date(row.created_at).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: APP_TIMEZONE,
        }),
        platform: queueEntry?.platform ?? 'System',
        message: `${row.error_code ? `[${row.error_code}] ` : ''}${row.message ?? 'Unknown publishing error'}`,
      };
    }),
    summary: data.summary,
  };
}

function statusToReviewLabel(status: string): ReviewQueueItem['status'] {
  switch ((status ?? '').toLowerCase()) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'changes_requested':
      return 'Needs changes';
    default:
      return 'In Review';
  }
}

function normalizeTextValue(value?: string | null): string {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (trimmed.startsWith('{')) {
    // 1. Try standard JSON parsing
    try {
      const parsed = JSON.parse(trimmed);

      const extractText = (obj: any): string | null => {
        if (!obj || typeof obj !== 'object') return null;

        // Priority fields
        const priorityFields = [
          'body', 'reason', 'request', 'concept', 'summary',
          'message', 'output_text', 'description', 'text', 'detail'
        ];

        for (const field of priorityFields) {
          if (obj[field] && typeof obj[field] === 'string') return obj[field];
        }

        // Search nested objects
        if (obj.imageDirection) {
          const nested = extractText(obj.imageDirection);
          if (nested) return nested;
        }

        if (obj.error && typeof obj.error === 'object') {
          const nested = extractText(obj.error);
          if (nested) return nested;
        }

        return null;
      };

      const result = extractText(parsed);
      if (result) return result;
    } catch {
      // 2. JSON is truncated or invalid - Try Regex extraction for common fields
      const fields = ['reason', 'concept', 'body', 'request', 'message', 'summary'];
      for (const field of fields) {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`);
        const match = trimmed.match(regex);
        if (match && match[1]) return match[1];
      }
    }
  }

  return trimmed;
}

function detectReviewModeFromText(text?: string | null): string {
  const normalized = normalizeTextValue(text).toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized.includes('quick ai') || normalized.includes('quick mode') || normalized.includes('quick')) {
    return 'quick';
  }

  if (normalized.includes('manual setup') || normalized.includes('manual mode') || normalized.includes('manual')) {
    return 'manual';
  }

  return '';
}

function getReviewTypeLabel(reviewType?: string | null): string {
  const normalized = normalizeTextValue(reviewType).toLowerCase();

  if (!normalized) {
    return '';
  }

  return `${normalized} review`;
}

function getReviewModeLabel(mode?: string | null): string {
  const normalizedMode = normalizeTextValue(mode).toLowerCase();
  const normalizedValue = normalizedMode
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .join(' ');

  if (normalizedMode === 'quick') {
    return 'Quick Mode';
  }

  if (normalizedMode === 'manual') {
    return 'Manual Mode';
  }

  if (normalizedValue === 'quick ai' || normalizedValue === 'quick mode' || normalizedValue.includes('quick')) {
    return 'Quick Mode';
  }

  if (normalizedValue === 'manual mode' || normalizedValue.includes('manual')) {
    return 'Manual Mode';
  }

  return 'Review';
}

function normalizeSourceIdsFromStored(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) {
    return undefined;
  }

  const normalized = input
    .map((value) => normalizeTextValue(typeof value === 'string' ? value : ''))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : undefined;
}

function buildReviewQueueSourceIds(values: {
  itemId?: string | null;
  reviewItemId?: string | null;
  workflowId?: string | null;
  publishingId?: string | null;
  alternateIds?: Array<string | null | undefined>;
}): string[] {
  const collected = new Set<string>();

  const add = (value?: string | null) => {
    const normalized = normalizeTextValue(value as string);
    if (!normalized) {
      return;
    }

    collected.add(normalized);
    collected.add(normalized.toLowerCase());
  };

  add(values.itemId);
  add(values.reviewItemId);
  add(values.workflowId);
  add(values.publishingId);

  for (const alternateId of values.alternateIds ?? []) {
    add(alternateId);
  }

  if (values.workflowId) {
    add(getDashboardIdForWorkflowId(values.workflowId));
    add(getReviewIdForWorkflowId(values.workflowId));
    add(getPublishingIdForWorkflowId(values.workflowId));
  }

  return Array.from(collected);
}

function splitReviewIdList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return normalizeTextValue(value as string | undefined | null) ? [normalizeTextValue(value as string)] : [];
  }

  return value
    .map((item) => normalizeTextValue(typeof item === 'string' ? item : typeof item === 'number' ? String(item) : ''))
    .filter(Boolean);
}

function buildReviewModeTitle(input: {
  title: string;
  modeLabel: string;
  numberLabel: string;
  hasModeLabel: boolean;
}) {
  const normalized = normalizeTextValue(input.title);
  if (!normalized) {
    return '';
  }

  const modePrefix = `${input.modeLabel} review`;
  const titleHasModePrefix = hasWordPrefix(normalized, modePrefix);
  if (input.hasModeLabel && titleHasModePrefix) {
    return normalized;
  }

  return `${input.modeLabel} Review${input.numberLabel ? ` #${input.numberLabel}` : ''}: ${normalized}`;
}

function hasWordPrefix(text: string, prefix: string) {
  return text.toLowerCase().startsWith(prefix.toLowerCase());
}

function formatReviewQueueNumber(workflowId?: string | null, contentItemId?: string | null, reviewItemId?: string | null): string {
  const candidates = [workflowId, contentItemId]
    .map((value) => normalizeTextValue(value))
    .filter(Boolean)
    .map((value) => value.replace(/[^a-zA-Z0-9-]/g, ''))
    .filter(Boolean);
  if (reviewItemId) {
    const normalizedReviewId = normalizeTextValue(reviewItemId);
    if (normalizedReviewId) {
      candidates.push(normalizedReviewId.replace(/[^a-zA-Z0-9-]/g, ''));
    }
  }

  if (candidates.length === 0) {
    return '';
  }

  const raw = candidates[0];
  const match = raw.match(/\d+/g)?.[0];
  if (match) {
    return match;
  }

  const seed = [...raw].reduce((total, char) => total + char.charCodeAt(0), 0);
  return `${seed % 1000000}`.padStart(6, '0');
}

function buildReviewQueueTitle(input: {
  title?: string | null;
  reviewType?: string | null;
  category?: string | null;
  mode?: string | null;
  workflowId?: string | null;
  contentItemId?: string | null;
  reviewItemId?: string | null;
}) {
  const modeSource = input.mode ?? detectReviewModeFromText(input.title) ?? input.reviewType;
  const modeLabel = getReviewModeLabel(modeSource);
  const numberLabel = formatReviewQueueNumber(input.workflowId, input.contentItemId, input.reviewItemId);
  const hasModeLabel = modeLabel !== 'Review';

  const directTitle = normalizeTextValue(input.title);
  if (directTitle) {
    const modeAwareTitle = buildReviewModeTitle({
      title: directTitle,
      modeLabel,
      numberLabel,
      hasModeLabel,
    });

    return hasModeLabel ? modeAwareTitle : directTitle;
  }

  const fallbackByType = getReviewTypeLabel(input.reviewType);
  if (fallbackByType) {
    return hasModeLabel ? `${modeLabel} ${fallbackByType}${numberLabel ? ` #${numberLabel}` : ''}` : `${fallbackByType}${numberLabel ? ` #${numberLabel}` : ''}`;
  }

  const fallbackByCategory = normalizeTextValue(input.category);
  if (fallbackByCategory) {
    return hasModeLabel
      ? `${modeLabel} ${fallbackByCategory} review${numberLabel ? ` #${numberLabel}` : ''}`
      : `${fallbackByCategory} review${numberLabel ? ` #${numberLabel}` : ''}`;
  }

  if (numberLabel) {
    return hasModeLabel ? `${modeLabel} Review #${numberLabel}` : `Review #${numberLabel}`;
  }

  const fallbackById = normalizeTextValue(input.workflowId) || normalizeTextValue(input.contentItemId);
  if (fallbackById) {
    return `Review ${fallbackById}`;
  }

  return 'Review package';
}

function buildReviewDraftTitle(category: string | undefined, title: string | undefined) {
  const normalizedCategory = normalizeTextValue(category);
  const normalizedTitle = normalizeTextValue(title);

  if (normalizedTitle) {
    return normalizedTitle;
  }

  return normalizedCategory ? `${normalizedCategory} draft` : 'Review draft';
}

function mapMetadataStringList(metadata: Record<string, unknown> | null | undefined, key: string): string[] | undefined {
  const value = metadata?.[key];

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function mapReviewPayload(data: ReviewApiResponse): ReviewQueueItem[] {
  return data.reviews.map((row) => {
    const metadata = row.content_items?.metadata ?? {};
    const presentation = normalizePresentationModel(row.presentation);
    const reviewCategory = (presentation?.subtitle || row.content_items?.service_area) ?? row.review_type;
    const workflowId =
      getFirstDefinedMetadataText(metadata, ['workflowId', 'workflow_id', 'contentItemId', 'content_item_id', 'content_item']) || row.content_item_id;
    const metadataReviewId = getFirstDefinedMetadataText(metadata, ['reviewId', 'review_id']);
    const metadataPublishingId = getFirstDefinedMetadataText(metadata, ['publishingId', 'publishing_id']);
    const contentRisk = row.risk_level ?? row.content_items?.risk_level;
    const mode = metadata.mode === 'manual' || metadata.mode === 'quick' ? metadata.mode : undefined;
    const imageCount = typeof metadata.imageCount === 'number' ? metadata.imageCount : undefined;
    const postCount = typeof metadata.postCount === 'number' ? metadata.postCount : undefined;
    const wordCount = typeof metadata.wordCount === 'number' ? metadata.wordCount : undefined;
    const metadataCreatedBy = buildReviewItemCreator(metadata, row.reviewer_name);
    const ownerFromMetadata = getFirstDefinedMetadataText(metadata, ['owner', 'assignedOwner', 'creator', 'created_by', 'creatorName']);
    const createdAt =
      parseReviewTimestamp(
        getFirstDefinedMetadataValue(metadata, ['createdAt', 'created_at', 'createdAtIso', 'created_at_iso', 'created_at_ms', 'timestamp', 'timeCreated', 'createdAtISOString']),
      ) ??
      parseReviewTimestamp(row.created_at) ??
      parseReviewTimestamp(row.updated_at);

    return {
      id: row.id,
      workflowId,
      publishingId: metadataPublishingId || getPublishingIdForWorkflowId(workflowId),
      createdAt,
      title: buildReviewQueueTitle({
        title: presentation?.title || row.content_items?.title,
        reviewType: row.review_type,
        category: reviewCategory,
        mode,
        workflowId,
        contentItemId: row.content_item_id,
        reviewItemId: metadataReviewId || row.id,
      }),
      owner: ownerFromMetadata || row.reviewer_name || row.assigned_reviewer || 'Review Queue',
      status: presentation?.approval_status_label || statusToReviewLabel(row.status),
      risk: normalizeBoardRisk(capitalizeRisk(contentRisk)),
      category: reviewCategory,
      createdBy: metadataCreatedBy,
      due: presentation?.updated_at_label || (row.due_at ? formatQueueTime(row.due_at) : minutesAgo(row.created_at)),
      approvalStatusLabel: presentation?.approval_status_label,
      approvalRecommendation: presentation?.approval_recommendation || (typeof metadata.approvalRecommendation === 'string' ? metadata.approvalRecommendation : undefined),
      approvalSummary: typeof metadata.approvalSummary === 'string' ? metadata.approvalSummary : undefined,
      assetComposerStatus: presentation?.image_status_label || (typeof metadata.assetComposerStatus === 'string' ? metadata.assetComposerStatus : undefined),
      assetLayoutPlan: mapMetadataStringList(metadata, 'assetLayoutPlan'),
      brandVoice: typeof metadata.brandVoice === 'string' ? metadata.brandVoice : undefined,
      bodyPreview: presentation?.body_preview,
      caption: presentation?.caption,
      citationStrictness: typeof metadata.sourcePolicy === 'string' ? metadata.sourcePolicy : typeof metadata.citationStrictness === 'string' ? metadata.citationStrictness : undefined,
      contentGoal: typeof metadata.contentGoal === 'string' ? metadata.contentGoal : undefined,
      contentItemStatus: row.content_items?.status ?? undefined,
      contentPreview: presentation?.content_preview,
      creativeSummary: presentation?.creative_summary || (typeof metadata.creativeSummary === 'string' ? metadata.creativeSummary : undefined),
      cta: presentation?.call_to_action || (typeof metadata.cta === 'string' ? metadata.cta : undefined),
      degradedMessage: presentation?.degraded_message || (typeof metadata.degradedMessage === 'string' ? metadata.degradedMessage : undefined),
      hashtags: presentation?.hashtags,
      imageCount,
      issuesFound: mapMetadataStringList(metadata, 'issuesFound'),
      languages: mapMetadataStringList(metadata, 'languages'),
      layout: presentation?.layout_summary || (typeof metadata.layout === 'string' ? metadata.layout : undefined),
      mode,
      nextActionLabel: presentation?.next_action_label,
      platform: presentation?.platform,
      platforms: mapMetadataStringList(metadata, 'platforms'),
      postCount,
      readinessStatus: presentation?.approval_status_label || (typeof metadata.readinessStatus === 'string' ? metadata.readinessStatus : undefined),
      requiredFix: presentation?.required_fix || (typeof metadata.requiredFix === 'string' ? metadata.requiredFix : undefined),
      selectedAssets: mapMetadataStringList(metadata, 'selectedAssets'),
      sourceConnectors: mapMetadataStringList(metadata, 'sourceConnectors'),
      subtitle: presentation?.subtitle,
      targetAudience: typeof metadata.targetAudience === 'string' ? metadata.targetAudience : undefined,
      updatedAtLabel: presentation?.updated_at_label,
      visualBrief: presentation?.layout_summary || (typeof metadata.visualBrief === 'string' ? metadata.visualBrief : undefined),
      generatedDrafts: mapGeneratedDraftsFromMetadata(metadata.generatedDrafts),
      generatedAssets: mapGeneratedAssetsFromMetadata(getFirstDefinedMetadataValue(metadata, ['generatedAssets', 'contentAssets', 'assets'])),
      wordCount,
      sourceIds: buildReviewQueueSourceIds({
        itemId: row.id,
        reviewItemId: metadataReviewId,
        workflowId,
        publishingId: metadataPublishingId,
        alternateIds: [row.content_item_id, workflowId],
      }),
    };
  });
}

function capitalizeRisk(value: string | null | undefined) {
  switch ((value ?? '').toLowerCase()) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    default:
      return 'Low';
  }
}

function normalizeLogSeverity(value: string | null | undefined): LogEvent['severity'] {
  switch ((value ?? '').toLowerCase()) {
    case 'critical':
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    default:
      return 'Low';
  }
}

function formatLogTime(value: string | null | undefined) {
  if (!value) {
    return 'now';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'now';
  }

  return parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE,
  });
}

function toTimestampString() {
  return new Date().toISOString();
}

function formatReviewItemDate(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Unknown';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: APP_TIMEZONE,
  }).format(parsed);
}

function formatAgentQueueTime(value: string | null | undefined) {
  if (!value) {
    return 'now';
  }

  if (value === 'now' || value === 'ready' || value.endsWith(' ago')) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE,
  });
}

function humanizeEventType(value: string) {
  return value
    .replace(/^workflow\./, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapLogsPayload(data: LogsApiResponse): LogEvent[] {
  const systemEvents = data.systemLogs.map((row) => {
    const presentation = row.presentation ?? null;
    const presentationSource = typeof presentation?.agent_name === 'string' ? presentation.agent_name : undefined;
    const presentationReadableMessage = typeof presentation?.readable_message === 'string' ? presentation.readable_message : undefined;
    const presentationSummary = typeof presentation?.user_facing_summary === 'string' ? presentation.user_facing_summary : undefined;
    const presentationRelatedId = typeof presentation?.related_id === 'string' ? presentation.related_id : undefined;
    const presentationStatus = typeof presentation?.status === 'string' ? presentation.status : undefined;
    const presentationEventType = typeof presentation?.event_type === 'string' ? presentation.event_type : undefined;
    const presentationTimestamp = typeof presentation?.timestamp === 'string' ? presentation.timestamp : undefined;

    return {
      time: formatLogTime(presentationTimestamp || row.created_at),
      type: humanizeEventType(presentationEventType || row.event_type),
      source: presentationSource || row.source || row.target_type || 'System logs',
      severity: normalizeLogSeverity(row.severity),
      message: presentationReadableMessage || presentationSummary || row.message || row.event_type,
      itemId: presentationRelatedId || row.target_id || undefined,
      relatedId: presentationRelatedId || (typeof row.metadata?.contentItemId === 'string' ? row.metadata.contentItemId : undefined),
      status: presentationStatus || row.status,
    };
  });
  const errorLogEvents = data.errorEvents.map((row) => {
    const presentation = row.presentation ?? null;
    const presentationSource = typeof presentation?.agent_name === 'string' ? presentation.agent_name : undefined;
    const presentationReadableMessage = typeof presentation?.readable_message === 'string' ? presentation.readable_message : undefined;
    const presentationDegradedMessage = typeof presentation?.degraded_message === 'string' ? presentation.degraded_message : undefined;
    const presentationRelatedId = typeof presentation?.related_id === 'string' ? presentation.related_id : undefined;
    const presentationStatus = typeof presentation?.status === 'string' ? presentation.status : undefined;
    const presentationEventType = typeof presentation?.event_type === 'string' ? presentation.event_type : undefined;
    const presentationTimestamp = typeof presentation?.timestamp === 'string' ? presentation.timestamp : undefined;

    return {
      time: formatLogTime(presentationTimestamp || row.created_at),
      type: humanizeEventType(presentationEventType || row.type),
      source: presentationSource || row.source || 'Error monitor',
      severity: normalizeLogSeverity(row.severity),
      message: presentationDegradedMessage || presentationReadableMessage || row.message || row.type,
      itemId: presentationRelatedId || (typeof row.metadata?.contentItemId === 'string' ? row.metadata.contentItemId : undefined),
      relatedId: presentationRelatedId,
      status: presentationStatus || row.status,
    };
  });

  return [...systemEvents, ...errorLogEvents].slice(0, 80);
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toReviewDecisionApiValue(decision: ReviewDecision) {
  if (decision === 'queued') {
    return 'auto_queue';
  }

  return decision === 'approved' ? 'approve' : 'reject';
}

function toPublishingApiPlatform(value: string | undefined) {
  switch ((value ?? '').toLowerCase()) {
    case 'facebook':
      return 'facebook';
    case 'wordpress':
      return 'wordpress';
    case 'newsletter':
    case 'email newsletter':
      return 'email_newsletter';
    case 'buffer':
      return 'buffer';
    case 'instagram':
      return 'instagram';
    case 'youtube':
      return 'youtube';
    case 'tiktok':
      return 'tiktok';
    default:
      return 'linkedin';
  }
}

const analyticsSummary = [
  { label: 'Total reach', value: '128.4K', change: '+18.2%', icon: Activity },
  { label: 'Engagement', value: '9.7K', change: '+11.4%', icon: MessageSquareText },
  { label: 'Clicks', value: '3.2K', change: '+7.8%', icon: MousePointerIcon },
  { label: 'Partner reports', value: '6', change: 'Ready to export', icon: FileText },
];

const contentPerformance = [
  { title: 'PDPA compliance checklist', language: 'TH', reach: '32.1K', engagement: '2.8K', clicks: '814', topic: 'PDPA' },
  { title: 'Foreign investor company guide', language: 'ZH', reach: '28.4K', engagement: '2.1K', clicks: '1,126', topic: 'Corporate Law' },
  { title: 'VAT filing mistakes for SMEs', language: 'TH', reach: '21.7K', engagement: '1.5K', clicks: '492', topic: 'Accounting' },
  { title: 'BOI incentive comparison', language: 'EN', reach: '18.9K', engagement: '1.1K', clicks: '417', topic: 'Investment' },
  { title: 'Hiring your first employee', language: 'TH', reach: '14.3K', engagement: '927', clicks: '256', topic: 'Labor Law' },
];

const languagePerformance = [
  { language: 'Thai', audience: 'SME owners', reach: 58, note: 'Best for accounting and tax reminders' },
  { language: 'Chinese', audience: 'Investors', reach: 74, note: 'Strongest investor reach and click intent' },
  { language: 'English', audience: 'Foreign founders', reach: 46, note: 'Works well for BOI and company setup' },
  { language: 'Japanese', audience: 'Executives', reach: 31, note: 'Niche but high-quality consultation leads' },
];

const topicTrends = [
  { topic: 'Corporate Law', score: 86, trend: '+24%' },
  { topic: 'Accounting', score: 74, trend: '+18%' },
  { topic: 'PDPA', score: 69, trend: '+12%' },
  { topic: 'Tax', score: 63, trend: '+9%' },
  { topic: 'Labor Law', score: 48, trend: '+4%' },
];

const contentCategories = [
  { name: 'All Content', count: 128 },
  { name: 'Tax', count: 31 },
  { name: 'Visa', count: 18 },
  { name: 'Labor Law', count: 22 },
  { name: 'Corporate Law', count: 27 },
  { name: 'Accounting', count: 19 },
  { name: 'PDPA', count: 11 },
];

const libraryItems = [
  {
    id: 'LIB-301',
    title: 'PDPA Compliance Checklist for Thai Businesses',
    category: 'PDPA',
    language: 'TH / EN',
    status: 'Approved',
    updated: 'Updated 2 days ago',
    assets: 6,
    reuse: 'High',
  },
  {
    id: 'LIB-302',
    title: 'VAT Filing Mistakes That Cost SMEs Money',
    category: 'Tax',
    language: 'TH',
    status: 'Needs update',
    updated: 'Updated 3 months ago',
    assets: 4,
    reuse: 'Medium',
  },
  {
    id: 'LIB-303',
    title: 'Hiring Your First Employee in Thailand',
    category: 'Labor Law',
    language: 'TH / EN',
    status: 'Approved',
    updated: 'Updated 1 week ago',
    assets: 5,
    reuse: 'High',
  },
  {
    id: 'LIB-304',
    title: 'Visa Options for Foreign Directors',
    category: 'Visa',
    language: 'EN / JP',
    status: 'Draft',
    updated: 'Updated yesterday',
    assets: 3,
    reuse: 'Low',
  },
  {
    id: 'LIB-305',
    title: 'Company Registration Guide for Foreign Investors',
    category: 'Corporate Law',
    language: 'EN / ZH',
    status: 'Approved',
    updated: 'Updated 5 days ago',
    assets: 8,
    reuse: 'High',
  },
];

const knowledgeSources = [
  {
    name: 'Revenue Department VAT Update 2026.pdf',
    type: 'PDF',
    category: 'Tax',
    status: 'Indexed',
    chunks: 42,
    updated: '2 days ago',
  },
  {
    name: 'PDPA Client Advisory Guideline',
    type: 'Internal Guideline',
    category: 'PDPA',
    status: 'Indexed',
    chunks: 28,
    updated: '1 week ago',
  },
  {
    name: 'Corporate Registration SOP',
    type: 'Company SOP',
    category: 'Corporate Law',
    status: 'Processing',
    chunks: 19,
    updated: 'Today',
  },
  {
    name: 'Labor Protection Act Reference Notes',
    type: 'Link',
    category: 'Labor Law',
    status: 'Needs review',
    chunks: 33,
    updated: '3 weeks ago',
  },
  {
    name: 'Monthly Accounting Close Checklist',
    type: 'Template',
    category: 'Accounting',
    status: 'Indexed',
    chunks: 16,
    updated: 'Yesterday',
  },
];

const ragRules = [
  'AI must cite at least one indexed source before drafting legal or accounting claims.',
  'If no matching source is found, AI must ask for upload/link instead of guessing.',
  'Claims marked high-risk are routed to Review Queue automatically.',
  'Outdated sources trigger an update warning before generation.',
];

const REVIEW_QUEUE_LOCAL_STORAGE_KEY = 'prd_review_queue_items_v1';

function normalizeLanguageCodesFromStored(input: unknown): string[] | undefined {
  return Array.isArray(input) && input.every((value) => typeof value === 'string') ? input.map((value) => value.trim()).filter(Boolean) : undefined;
}

function normalizeDateValue(value: string | null | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.getTime();
}

function sanitizeStoredReviewQueueItem(raw: unknown): ReviewQueueItem | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const id = normalizeTextValue(item.id as string);

  if (!id) {
    return null;
  }

  const itemRecord: ReviewQueueItem = {
    id,
    title: normalizeTextValue(item.title as string) || `Review ${id}`,
    owner: normalizeTextValue(item.owner as string) || 'Review Queue',
    status: normalizeTextValue(item.status as string) || 'In Review',
    risk: normalizeBoardRisk(item.risk as string),
    category: normalizeTextValue(item.category as string) || 'Legal advisory',
    due: normalizeTextValue(item.due as string) || 'Just now',
    workflowId: normalizeTextValue(item.workflowId as string),
    publishingId: normalizeTextValue(item.publishingId as string),
    createdBy:
      normalizeTextValue(item.createdBy as string) ||
      getFirstDefinedMetadataText(item, ['created_by', 'creator', 'creatorName', 'created_by_name', 'creator_name']),
    approvalRecommendation: normalizeTextValue(item.approvalRecommendation as string),
    approvalSummary: normalizeTextValue(item.approvalSummary as string),
    assetComposerStatus: normalizeTextValue(item.assetComposerStatus as string),
    assetLayoutPlan: normalizeLanguageCodesFromStored(item.assetLayoutPlan),
    brandVoice: normalizeTextValue(item.brandVoice as string),
    citationStrictness: normalizeTextValue(item.citationStrictness as string),
    contentGoal: normalizeTextValue(item.contentGoal as string),
    cta: normalizeTextValue(item.cta as string),
    creativeSummary: normalizeTextValue(item.creativeSummary as string),
    degradedMessage: normalizeTextValue(item.degradedMessage as string),
    imageCount: typeof item.imageCount === 'number' ? item.imageCount : undefined,
    issuesFound: normalizeLanguageCodesFromStored(item.issuesFound),
    languages: normalizeLanguageCodesFromStored(item.languages),
    layout: normalizeTextValue(item.layout as string),
    mode: item.mode === 'manual' || item.mode === 'quick' ? item.mode : undefined,
    platforms: normalizeLanguageCodesFromStored(item.platforms),
    postCount: typeof item.postCount === 'number' ? item.postCount : undefined,
    readinessStatus: normalizeTextValue(item.readinessStatus as string),
    requiredFix: normalizeTextValue(item.requiredFix as string),
    selectedAssets: normalizeLanguageCodesFromStored(item.selectedAssets),
    generatedAssets: mapGeneratedAssetsFromMetadata(item.generatedAssets),
    sourceConnectors: normalizeLanguageCodesFromStored(item.sourceConnectors),
    targetAudience: normalizeTextValue(item.targetAudience as string),
    visualBrief: normalizeTextValue(item.visualBrief as string),
    createdAt:
      typeof item.createdAt === 'number' && Number.isFinite(item.createdAt)
        ? item.createdAt
        : normalizeDateValue(typeof item.createdAt === 'string' ? item.createdAt : ''),
    wordCount: typeof item.wordCount === 'number' ? item.wordCount : undefined,
    sourceIds: normalizeSourceIdsFromStored(item.sourceIds),
    generatedDrafts: Array.isArray(item.generatedDrafts)
      ? (item.generatedDrafts as Array<{ languageCode?: string; languageLabel?: string; title?: string; body?: string }>)
          .map((draft) => ({
            languageCode:
              draft?.languageCode === 'th' || draft?.languageCode === 'en' || draft?.languageCode === 'zh' || draft?.languageCode === 'ja'
                ? draft.languageCode
                : 'th',
            languageLabel: draft?.languageLabel || 'Thai',
            title: normalizeTextValue(draft?.title) || 'Draft',
            body: normalizeTextValue(draft?.body) || '',
          }) as GeneratedDraft)
          .filter((draft) => draft.title || draft.body)
      : undefined,
  };

  if (!itemRecord.workflowId && !itemRecord.publishingId) {
    return null;
  }

  return itemRecord;
}

function readStoredReviewQueueItems({ allowMock } = { allowMock: true }): ReviewQueueItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  if (!allowMock) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(REVIEW_QUEUE_LOCAL_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const sanitized = parsed.map(sanitizeStoredReviewQueueItem).filter((item): item is ReviewQueueItem => Boolean(item));

    if (sanitized.length !== parsed.length) {
      window.localStorage.setItem(REVIEW_QUEUE_LOCAL_STORAGE_KEY, JSON.stringify(sanitized.slice(0, 80)));
    }

    return sanitized;
  } catch (error) {
    return [];
  }
}

function isGenericReviewTitle(title: string): boolean {
  const normalized = normalizeTextValue(title).toLowerCase();

  if (!normalized) {
    return true;
  }

  if (normalized === 'review package') {
    return true;
  }

  return /^review(\s+review)?\s*#/.test(normalized) || normalized === 'review' || normalized === 'needs review';
}

function getReviewQueueSortValue(item: ReviewQueueItem): number {
  if (typeof item.createdAt === 'number' && Number.isFinite(item.createdAt)) {
    return item.createdAt;
  }

  const parsedDate = normalizeDateValue(item.due);
  if (typeof parsedDate === 'number' && Number.isFinite(parsedDate)) {
    return parsedDate;
  }

  const sortSourceIds = [item.id, item.workflowId, item.publishingId].filter((value): value is string => Boolean(value));

  for (const sourceId of sortSourceIds) {
    const seed = extractReviewIdSeed(sourceId);
    if (!seed) {
      continue;
    }

    const normalizedSeed = seed.length > 12 ? seed.slice(-12) : seed;
    const parsedSeed = Number(normalizedSeed);
    if (!Number.isNaN(parsedSeed)) {
      return parsedSeed;
    }
  }

  return 0;
}

function sortReviewQueueItems(items: ReviewQueueItem[]): ReviewQueueItem[] {
  return [...items].sort((a, b) => {
    const aValue = getReviewQueueSortValue(a);
    const bValue = getReviewQueueSortValue(b);

    if (aValue !== bValue) {
      return bValue - aValue;
    }

    return a.id.localeCompare(b.id);
  });
}

function persistReviewQueueItems(items: ReviewQueueItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(REVIEW_QUEUE_LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, 80)));
  } catch {
    // no-op if localStorage is unavailable
  }
}

type ReviewPackageMetadata = {
  approvalStatusLabel?: string;
  approvalRecommendation?: string;
  approvalSummary?: string;
  assetComposerStatus?: string;
  assetLayoutPlan?: string[];
  brandVoice?: string;
  createdAt?: number;
  createdBy?: string;
  citationStrictness?: string;
  contentGoal?: string;
  contentItemStatus?: string;
  creativeSummary?: string;
  cta?: string;
  contentPreview?: string;
  bodyPreview?: string;
  caption?: string;
  hashtags?: string[];
  degradedMessage?: string;
  officialSourceLinks?: string[];
  complianceStatus?: string;
  imageCount?: number;
  issuesFound?: string[];
  autoPipeline?: boolean;
  languages?: string[];
  layout?: string;
  mode?: 'manual' | 'quick';
  platforms?: string[];
  postCount?: number;
  readinessStatus?: string;
  requiredFix?: string;
  nextActionLabel?: string;
  platform?: string;
  selectedAssets?: string[];
  sourceConnectors?: string[];
  targetAudience?: string;
  subtitle?: string;
  updatedAtLabel?: string;
  visualBrief?: string;
  wordCount?: number;
  workflowId?: string;
  generatedDrafts?: GeneratedDraft[];
  generatedAssets?: GeneratedAsset[];
};

type GeneratedDraft = {
  languageCode: LanguageCode;
  languageLabel: string;
  title: string;
  body: string;
};

type GeneratedAsset = {
  assetType: string;
  layoutType?: string;
  url?: string;
  storagePath?: string;
  altText?: string;
  source?: string;
  sortOrder?: number;
  isPlaceholder?: boolean;
  availabilityStatus?: 'generated' | 'stored' | 'pending' | 'failed';
  errorMessage?: string;
};

type LanguageCode = 'th' | 'en' | 'zh' | 'ja';

const languageCodeLabelMap: Record<LanguageCode, string> = {
  th: 'Thai (ไทย)',
  en: 'English',
  zh: 'Chinese (中文)',
  ja: 'Japanese (日本語)',
};

const languageOptions: Array<{ code: LanguageCode; label: string }> = [
  { code: 'th', label: languageCodeLabelMap.th },
  { code: 'en', label: languageCodeLabelMap.en },
  { code: 'zh', label: languageCodeLabelMap.zh },
  { code: 'ja', label: languageCodeLabelMap.ja },
];

const languageDisplayLabels = languageOptions.map((item) => item.label);

function normalizeLanguageCode(value: string): LanguageCode | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'th' || normalized === 'thai' || normalized.includes('thai') || normalized.includes('ไทย')) {
    return 'th';
  }

  if (normalized === 'en' || normalized === 'english' || normalized.includes('english')) {
    return 'en';
  }

  if (normalized === 'zh' || normalized === 'cn' || normalized.includes('zh') || normalized.includes('chinese') || normalized.includes('中文')) {
    return 'zh';
  }

  if (normalized === 'ja' || normalized === 'jp' || normalized.includes('ja') || normalized.includes('japanese') || normalized.includes('日本')) {
    return 'ja';
  }

  return null;
}

function normalizeLanguageCodes(values: string[] | undefined, fallback: readonly LanguageCode[] = ['th', 'en']) {
  if (!Array.isArray(values) || values.length === 0) {
    return [...fallback];
  }

  const normalized = values.map(normalizeLanguageCode).filter((item): item is LanguageCode => item !== null);
  const deduped = normalized.filter((item, index, self) => self.indexOf(item) === index);

  return deduped.length ? deduped : [...fallback];
}

function getLanguageDisplayLabels(values: string[] | undefined, fallback: readonly LanguageCode[] = ['th']) {
  return normalizeLanguageCodes(values, fallback).map((language) => languageCodeLabelMap[language]);
}

function normalizeStringList(values: string[] | undefined, unique = false) {
  if (!Array.isArray(values) || values.length === 0) {
    return [];
  }

  const normalized = values.map((value) => value.trim()).filter((value) => value.length > 0);

  if (!unique) {
    return normalized;
  }

  return normalized.filter((item, index, self) => self.indexOf(item) === index);
}

function getDraftTextByLanguage(params: {
  languageCode: LanguageCode;
  category: string;
  targetAudience: string;
  brandVoice: string;
  categoryContext: string;
  citationStrictness: string;
  cta: string;
  sourceConnectors: string[];
}) {
  const { languageCode, category, targetAudience, brandVoice, categoryContext, citationStrictness, cta, sourceConnectors } = params;

  if (languageCode === 'th') {
    return `ร่างข้อความภาษาไทยในโทน${brandVoice} เกี่ยวกับ ${categoryContext} สำหรับกลุ่ม${targetAudience} เน้นความชัดเจนเรื่องข้อปฏิบัติ การเตือนความเสี่ยง และการอ้างอิงแหล่งข้อมูล ${sourceConnectors.join(', ')} ตาม ${citationStrictness} พร้อม CTA: ${cta}.`;
  }

  if (languageCode === 'zh') {
    return `一份面向${targetAudience} 的“${category}”初稿，采用${brandVoice}语气，先说明关键点与合规边界，再给出操作建议。引用来源采用${citationStrictness}，并附上 CTA: ${cta}。`;
  }

  if (languageCode === 'ja') {
    return `対象${targetAudience}向けに「${category}」を${brandVoice}トーンで要点を整理したドラフトです。` +
      `${citationStrictness}を満たす根拠ソースを明示し、CTAは「${cta}」で導線を統一します。`;
  }

  return `A ${brandVoice.toLowerCase()} draft about ${categoryContext} for ${targetAudience}, written with compliant ${citationStrictness}, practical guidance, and CTA: ${cta}.`;
}

function mapGeneratedDraftsFromMetadata(value: unknown): GeneratedDraft[] | undefined {
  let rawValue = value;

  if (typeof rawValue === 'string') {
    try {
      rawValue = JSON.parse(rawValue);
    } catch {
      return undefined;
    }
  }

  if (
    rawValue &&
    typeof rawValue === 'object' &&
    !Array.isArray(rawValue) &&
    Array.isArray((rawValue as { generatedDrafts?: unknown }).generatedDrafts)
  ) {
    rawValue = (rawValue as { generatedDrafts?: unknown }).generatedDrafts;
  }

  if (!Array.isArray(rawValue)) {
    return undefined;
  }

  const mapped = rawValue
    .map((entry): GeneratedDraft | null => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const entryRecord = entry as Record<string, unknown>;
      const languageText =
        typeof entryRecord.language === 'string'
          ? entryRecord.language
          : typeof entryRecord.languageCode === 'string'
            ? entryRecord.languageCode
            : typeof entryRecord.lang === 'string'
              ? entryRecord.lang
              : typeof entryRecord.language_code === 'string'
                ? entryRecord.language_code
                : '';
      const languageCode = normalizeLanguageCode(languageText);
      if (!languageCode) {
        return null;
      }

      const languageLabel = languageCodeLabelMap[languageCode];
      const title =
        typeof entryRecord.title === 'string' && entryRecord.title.trim() ? entryRecord.title.trim() : typeof entryRecord.topic === 'string' && entryRecord.topic.trim() ? entryRecord.topic.trim() : undefined;
      const body =
        (typeof entryRecord.body === 'string' && entryRecord.body.trim()) ||
        (typeof entryRecord.text === 'string' && entryRecord.text.trim()) ||
        (typeof entryRecord.content === 'string' && entryRecord.content.trim()) ||
        '';

      if (!body) {
        return null;
      }

      return {
        languageCode,
        languageLabel,
        title: title ?? `${languageCodeLabelMap[languageCode]} draft`,
        body,
      };
    })
    .filter((draft): draft is GeneratedDraft => draft !== null);

  return mapped.length > 0 ? mapped : undefined;
}

function mapGeneratedAssetsFromMetadata(value: unknown): GeneratedAsset[] | undefined {
  let rawValue = value;

  if (typeof rawValue === 'string') {
    try {
      rawValue = JSON.parse(rawValue);
    } catch {
      return undefined;
    }
  }

  if (
    rawValue &&
    typeof rawValue === 'object' &&
    !Array.isArray(rawValue) &&
    Array.isArray((rawValue as { generatedAssets?: unknown }).generatedAssets)
  ) {
    rawValue = (rawValue as { generatedAssets?: unknown }).generatedAssets;
  }

  if (!Array.isArray(rawValue)) {
    return undefined;
  }

  const mapped = rawValue
    .map((entry): GeneratedAsset | null => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const entryRecord = entry as Record<string, unknown>;
      const assetType =
        normalizeTextValue(entryRecord.assetType as string | undefined) ||
        normalizeTextValue(entryRecord.asset_type as string | undefined) ||
        normalizeTextValue(entryRecord.type as string | undefined) ||
        'image';
      const url = normalizeTextValue(entryRecord.url as string | undefined) || normalizeTextValue(entryRecord.imageUrl as string | undefined) || normalizeTextValue(entryRecord.image_url as string | undefined);
      const storagePath = normalizeTextValue(entryRecord.storagePath as string | undefined) || normalizeTextValue(entryRecord.storage_path as string | undefined);
      const altText = normalizeTextValue(entryRecord.altText as string | undefined) || normalizeTextValue(entryRecord.alt_text as string | undefined);
      const layoutType = normalizeTextValue(entryRecord.layoutType as string | undefined) || normalizeTextValue(entryRecord.layout_type as string | undefined);
      const source = normalizeTextValue(entryRecord.source as string | undefined);
      const sortOrder = typeof entryRecord.sortOrder === 'number' ? entryRecord.sortOrder : typeof entryRecord.sort_order === 'number' ? entryRecord.sort_order : undefined;
      const metadata =
        entryRecord.metadata && typeof entryRecord.metadata === 'object' && !Array.isArray(entryRecord.metadata)
          ? (entryRecord.metadata as Record<string, unknown>)
          : null;
      const isPlaceholder =
        typeof entryRecord.generatedAssetPlaceholder === 'boolean'
          ? entryRecord.generatedAssetPlaceholder
          : typeof metadata?.generatedAssetPlaceholder === 'boolean'
            ? metadata.generatedAssetPlaceholder
            : false;
      const errorMessage =
        normalizeTextValue(entryRecord.errorMessage as string | undefined) ||
        normalizeTextValue(entryRecord.error_message as string | undefined) ||
        normalizeTextValue(metadata?.failureReason as string | undefined);
      const hasRealAssetReference = Boolean(url || storagePath) && !isPlaceholder;
      const availabilityStatus: GeneratedAsset['availabilityStatus'] = errorMessage
        ? 'failed'
        : hasRealAssetReference
          ? url
            ? 'generated'
            : 'stored'
          : 'pending';

      if (!url && !storagePath && !altText) {
        return null;
      }

      return {
        assetType,
        layoutType,
        url,
        storagePath,
        altText,
        source,
        sortOrder,
        isPlaceholder,
        availabilityStatus,
        errorMessage,
      };
    })
    .filter((asset): asset is GeneratedAsset => asset !== null)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return mapped.length > 0 ? mapped : undefined;
}

function buildDraftPackageFromContext({
  topic,
  category,
  targetAudience,
  brandVoice,
  citationStrictness,
  cta,
  languages,
  sourceConnectors,
  contentGoal,
}: {
  topic: string;
  category: string;
  targetAudience: string;
  brandVoice: string;
  citationStrictness: string;
  cta: string;
  languages: string[];
  sourceConnectors: string[];
  contentGoal: string;
}) {
  const activeLanguages = normalizeLanguageCodes(languages, ['th', 'en']);
  const activeSources = sourceConnectors.length > 0 ? sourceConnectors : ['Knowledge Base'];
  const topicContext = topic.trim() || `${category} content package for ${contentGoal}`;

  return activeLanguages.map((languageCode) => ({
    languageCode,
    languageLabel: languageCodeLabelMap[languageCode],
    title: `${category}: ${topicContext}`,
    body: getDraftTextByLanguage({
      languageCode,
      category,
      targetAudience,
      brandVoice,
      categoryContext: topicContext,
      citationStrictness,
      cta,
      sourceConnectors: activeSources,
    }),
  }));
}

function buildDraftPackageSignature({
  topic,
  category,
  targetAudience,
  brandVoice,
  citationStrictness,
  cta,
  languages,
  sourceConnectors,
  contentGoal,
  officialSourceLinks = [],
}: {
  topic: string;
  category: string;
  targetAudience: string;
  brandVoice: string;
  citationStrictness: string;
  cta: string;
  languages: string[];
  sourceConnectors: string[];
  contentGoal: string;
  officialSourceLinks?: string[];
}) {
  return JSON.stringify({
    topic: topic.trim().toLowerCase(),
    category: category.trim().toLowerCase(),
    targetAudience: targetAudience.trim().toLowerCase(),
    brandVoice: brandVoice.trim().toLowerCase(),
    citationStrictness: citationStrictness.trim().toLowerCase(),
    cta: cta.trim().toLowerCase(),
    contentGoal: contentGoal.trim().toLowerCase(),
    languages: normalizeLanguageCodes(languages, ['th', 'en']).sort().join('|'),
    sourceConnectors: normalizeStringList(sourceConnectors, true).sort().join('|'),
    officialSourceLinks: normalizeStringList(officialSourceLinks, true)
      .map((link) => link.toLowerCase())
      .sort()
      .join('|'),
  });
}

function normalizeContextText(value: string) {
  return value.trim().toLowerCase();
}

function deriveBrandVoice({
  topic,
  category,
  targetAudience,
}: {
  topic: string;
  category: string;
  targetAudience: string;
}): string {
  const normalizedTopic = normalizeContextText(topic);
  const normalizedCategory = normalizeContextText(category);
  const normalizedAudience = normalizeContextText(targetAudience);

  if (
    normalizedCategory === 'tax' ||
    normalizedCategory === 'accounting' ||
    normalizedTopic.includes('ภาษี') ||
    normalizedTopic.includes('tax')
  ) {
    return 'Accounting advisory';
  }

  if (
    normalizedCategory === 'corporate law' ||
    normalizedCategory === 'pdpa' ||
    normalizedCategory === 'labor law' ||
    normalizedCategory === 'visa & work permit' ||
    normalizedTopic.includes('กฎหมาย') ||
    normalizedTopic.includes('legal')
  ) {
    return 'Legal advisory';
  }

  if (
    normalizedAudience.includes('japanese') ||
    normalizedAudience.includes('foreign') ||
    normalizedAudience.includes('investors') ||
    normalizedAudience.includes('founders') ||
    normalizedTopic.includes('executive') ||
    normalizedTopic.includes('board')
  ) {
    return 'Executive summary';
  }

  if (
    normalizedTopic.includes('เข้าใจง่าย') ||
    normalizedTopic.includes('เริ่มต้น') ||
    normalizedTopic.includes('สำหรับคนใหม่') ||
    normalizedTopic.includes('basic') ||
    normalizedTopic.includes('for beginners')
  ) {
    return 'Plain-language educator';
  }

  return 'Legal advisory';
}
type ReviewQueueItem = ReviewPackageMetadata & {
  id: string;
  title: string;
  owner: string;
  status: string;
  risk: BoardItem['risk'];
  category: string;
  due: string;
  workflowId?: string;
  publishingId?: string;
  sourceIds?: string[];
};
type CreateReviewPackage = Pick<ReviewQueueItem, 'title' | 'category' | 'risk'> & ReviewPackageMetadata;
type ReviewDecision = 'approved' | 'rejected' | 'queued';
type SafetyConfirmationTone = 'default' | 'danger' | 'success' | 'info';
type SafetyConfirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: SafetyConfirmationTone;
  details?: string[];
  reasonLabel?: string;
  reasonRequired?: boolean;
  initialReason?: string;
  onConfirm: (reason: string) => void;
};

type WorkflowStatusSurface = {
  surface: 'Dashboard' | 'Review Queue' | 'Publishing Queue' | 'Logs';
  id: string;
  status: string;
  canonicalStage: string;
  detail: string;
  present: boolean;
};

type WorkflowStatusSnapshot = {
  workflowId: string;
  reviewId: string;
  publishingId: string;
  canonicalStage: string;
  syncHealth: 'Synced' | 'Partial' | 'Needs attention';
  mismatchCount: number;
  surfaces: WorkflowStatusSurface[];
};

type ContentJobDetail = {
  workflowId: string;
  reviewId: string;
  publishingId: string;
  title: string;
  owner: string;
  createdAt: number;
  createdAtLabel: string;
  createdBy: string;
  channel: string;
  category: string;
  due: string;
  risk: BoardItem['risk'];
  stage: string;
  boardItem?: BoardItem;
  reviewItem?: ReviewQueueItem;
  publishingRow?: PublishingQueueRow;
  events: LogEvent[];
  agentJobs: AgentQueueJob[];
  statusSnapshot: ReturnType<typeof buildWorkflowStatusSnapshot>;
};

type AgentQueueJob = {
  id: string;
  agent: string;
  owner: string;
  stage: string;
  status: 'Done' | 'Running' | 'Queued' | 'Waiting review';
  detail: string;
  createdAt: string;
  updatedAt: string;
  handoffTarget?: string;
  runMode?: 'Dry-run' | 'Live';
};

const fallbackAgentQueueJobs: AgentQueueJob[] = [];

const complianceFindings = [
  { label: 'Legal claim needs citation', severity: 'High', source: 'PDPA Guideline section 24' },
  { label: 'Translation meaning drift', severity: 'Medium', source: 'Thai vs English paragraph 2' },
  { label: 'Brand tone is acceptable', severity: 'Low', source: 'Rules & Brand voice policy' },
  { label: 'No prohibited guarantee language', severity: 'Low', source: 'Claim restriction policy' },
];

const teamMembers = [
  { name: 'Managing Partner', role: 'Admin', access: 'Post + approve + settings' },
  { name: 'Senior Lawyer', role: 'Lawyer', access: 'Legal review + approve' },
  { name: 'Accounting Lead', role: 'Accountant', access: 'Tax/accounting review' },
  { name: 'Content Manager', role: 'Editor', access: 'Create + edit drafts' },
];

const prohibitedTerms = ['รับประกันผลลัพธ์', 'ดีที่สุดในประเทศ', 'ชนะทุกคดี', 'ลดภาษีได้แน่นอน', 'ไม่มีความเสี่ยง'];

const targetAudiences = ['SME owners', 'Foreign investors', 'Startup founders', 'Japanese executives', 'Chinese investors'];

const coreServices = ['Corporate Law', 'Accounting', 'Tax Advisory', 'PDPA Compliance', 'Labor Law', 'Visa & Work Permit'];

const imageGenerationConnector = {
  provider: 'OpenAI Images API',
  defaultModel: 'gpt-image-2',
  lockedSnapshot: 'gpt-image-2-2026-04-21',
  thaiTextRule: 'Generate visual/background only; Thai text must be overlaid by the app composer.',
};

const agentBlueprints = [
  {
    name: 'Agent Orchestrator',
    purpose: 'Controls queue order, assigns work to the correct specialist agent, and prevents publishing before approval.',
    model: 'GPT-5.4-Mini',
    provider: 'Codex runtime',
    workload: 'Routing',
    runs: 156,
    activity: 86,
  },
  {
    name: 'Content Strategy Agent',
    purpose: 'Turns user requirements into topic anchors, content plans, draft structure, and platform-specific copy direction.',
    model: 'GPT-5.4',
    provider: 'Codex runtime',
    workload: 'Planning + drafting',
    runs: 54,
    activity: 80,
  },
  {
    name: 'RAG Research Agent',
    purpose: 'Searches Knowledge Base, Google Drive, Obsidian, official links, and approved web sources before drafting.',
    model: 'GPT-5.4',
    provider: 'Codex runtime',
    workload: 'Retrieving',
    runs: 91,
    activity: 88,
  },
  {
    name: 'Brand Memory Agent',
    purpose: 'Learns approved writing style, recurring edits, preferred wording, forbidden phrasing, and user-specific tone patterns.',
    model: 'GPT-5.4-Mini',
    provider: 'Codex runtime',
    workload: 'Learning',
    runs: 24,
    activity: 46,
  },
  {
    name: 'Legal Compliance Agent',
    purpose: 'Checks legal claims, prohibited wording, citations, and professional ethics rules.',
    model: 'GPT-5.5',
    provider: 'Codex runtime',
    workload: 'Reviewing',
    runs: 64,
    activity: 82,
  },
  {
    name: 'Tax & Accounting Agent',
    purpose: 'Reviews tax/accounting accuracy, deadlines, document requirements, and risk language.',
    model: 'GPT-5.4',
    provider: 'Codex runtime',
    workload: 'Idle',
    runs: 42,
    activity: 51,
  },
  {
    name: 'Multilingual Localization Agent',
    purpose: 'Translates and adapts Thai, English, Chinese, and Japanese content while preserving meaning.',
    model: 'GPT-5.4-Mini',
    provider: 'Codex runtime',
    workload: 'Translating',
    runs: 118,
    activity: 92,
  },
  {
    name: 'Image & Layout Agent',
    purpose: `Converts final text into visual brief, layout constraints, image prompt, and sends generation to ${imageGenerationConnector.defaultModel}. Thai text is overlaid by the app composer.`,
    model: 'GPT-5.4',
    provider: 'Codex runtime / OpenAI Images API',
    workload: 'Idle',
    runs: 27,
    activity: 36,
  },
  {
    name: 'Publishing Agent',
    purpose: 'Queues approved posts to LinkedIn, Facebook, WordPress, Buffer, and newsletters while recording retry/failure logs.',
    model: 'GPT-5.4-Mini',
    provider: 'Codex runtime',
    workload: 'Queued',
    runs: 75,
    activity: 69,
  },
  {
    name: 'Analytics Insight Agent',
    purpose: 'Summarizes reach, engagement, clicks, language performance, and topic trends.',
    model: 'GPT-5.4-Mini',
    provider: 'Codex runtime',
    workload: 'Reporting',
    runs: 33,
    activity: 44,
  },
];

const coreAgentNames = [
  'Agent Orchestrator',
  'Content Strategy Agent',
  'Legal Compliance Agent',
  'Image & Layout Agent',
  'Publishing Agent',
];

const agentOperatingWorkflow = [
  {
    step: '1',
    stage: 'Queue orchestration',
    agent: 'Agent Orchestrator',
    model: 'GPT-5.4-Mini',
    output: 'Validated queue item, selected route, ownership, SLA, and next agent assignment',
    handoff: 'Creates a specialist task card and blocks invalid transitions',
  },
  {
    step: '2',
    stage: 'Brief intake',
    agent: 'Content Strategy Agent',
    model: 'GPT-5.4',
    output: 'Topic plan, post count, audience, platform direction',
    handoff: 'Creates job package for RAG Research Agent',
  },
  {
    step: '3',
    stage: 'Source grounding',
    agent: 'RAG Research Agent',
    model: 'GPT-5.4',
    output: 'Cited source pack from Knowledge Base, Google Drive, Obsidian, and official links',
    handoff: 'Blocks generation if no citation exists',
  },
  {
    step: '4',
    stage: 'Style memory lookup',
    agent: 'Brand Memory Agent',
    model: 'GPT-5.4-Mini',
    output: 'Approved tone, recurring user edits, preferred phrases, and banned wording for this topic/audience',
    handoff: 'Injects memory constraints into text generation and localization prompts',
  },
  {
    step: '5',
    stage: 'Text generation',
    agent: 'Content Strategy Agent',
    model: 'GPT-5.4',
    output: 'Thai-first copy package with translation-ready structure',
    handoff: 'Sends text package to Localization, Image/Layout, and Compliance queues',
  },
  {
    step: '6',
    stage: 'Localization',
    agent: 'Multilingual Localization Agent',
    model: 'GPT-5.4-Mini',
    output: 'Thai, English, Chinese, and Japanese variants with legal meaning preserved',
    handoff: 'Sends localized variants to Compliance and Review Queue package',
  },
  {
    step: '7',
    stage: 'Image + layout',
    agent: 'Image & Layout Agent',
    model: 'GPT-5.4',
    output: 'Visual brief, generated image asset selection, carousel/grid/single layout',
    handoff: 'Attaches assets to Review Queue package',
  },
  {
    step: '8',
    stage: 'Legal compliance',
    agent: 'Legal Compliance Agent',
    model: 'GPT-5.5',
    output: 'Citation, prohibited claim, legal/tax/accounting risk report',
    handoff: 'Routes legal risk result to Review Queue or revision queue',
  },
  {
    step: '9',
    stage: 'Tax/accounting review',
    agent: 'Tax & Accounting Agent',
    model: 'GPT-5.4',
    output: 'Tax/accounting accuracy, deadline, document, and risk wording report',
    handoff: 'Routes tax/accounting result to Review Queue or revision queue',
  },
  {
    step: '10',
    stage: 'Human review gate',
    agent: 'Review Queue',
    model: 'Human-in-the-loop',
    output: 'Approve, Reject, Regenerate, or Auto Queue decision',
    handoff: 'Only approved work can move to Publishing Agent',
  },
  {
    step: '11',
    stage: 'Queue + post',
    agent: 'Publishing Agent',
    model: 'GPT-5.4-Mini',
    output: 'Publishing queue status, sync result, failure log',
    handoff: 'Writes lifecycle event and sends results to Analytics Insight Agent',
  },
  {
    step: '12',
    stage: 'Performance learning',
    agent: 'Analytics Insight Agent',
    model: 'GPT-5.4-Mini',
    output: 'Performance summary, language insight, topic trend, and memory suggestions',
    handoff: 'Sends approved learning signals to Brand Memory Agent and planning signals to Content Strategy Agent',
  },
];

const modelCatalog: Record<string, string[]> = {
  'Codex runtime': ['GPT-5.4-Mini', 'GPT-5.4', 'GPT-5.5'],
};

const hiddenCodexModels = ['GPT-5.3-Codex-Spark'];

const providerKeyReadiness = [
  {
    provider: 'OpenAI',
    keyName: 'OPENAI_API_KEY',
    status: 'Configured',
    scope: 'Agents, Create Post, RAG answers, image brief generation',
    models: 'GPT-5.4-Mini, GPT-5.4, GPT-5.5',
    required: true,
  },
  {
    provider: 'Supabase',
    keyName: 'SUPABASE_SERVICE_ROLE_KEY',
    status: 'Configured',
    scope: 'Server-side jobs, workflow logs, RAG indexes, publishing queue',
    models: 'Database / Storage / Edge Functions',
    required: true,
  },
  {
    provider: 'Buffer',
    keyName: 'BUFFER_ACCESS_TOKEN',
    status: 'Pending',
    scope: 'Approved content queue and social publishing',
    models: 'Publishing connector',
    required: false,
  },
  {
    provider: 'Vercel',
    keyName: 'VERCEL_TOKEN',
    status: 'Optional',
    scope: 'Deployment inspection and production environment sync',
    models: 'Deploy / env management',
    required: false,
  },
];

const settingsReadinessChecklist = [
  'Provider keys are masked and never shown in plain text after save.',
  'Codex Local can only operate inside the approved HEAD-OFFICE workspace.',
  'Connected integrations declare source, publishing, or analytics scope.',
  'Every test/connect action should write a workflow log when backend persistence lands.',
];

const backendDatabaseTables = [
  {
    table: 'content_jobs',
    owner: 'Workflow core',
    purpose: 'Single source of truth for SW-* content lifecycle, canonical status, owner, risk, schedule, and mode.',
    rls: 'Workspace-member read/write; service role for agent jobs only',
    status: 'Required',
  },
  {
    table: 'review_items',
    owner: 'Review Queue',
    purpose: 'Human-in-the-loop package with multilingual drafts, citations, visual brief, selected assets, and decision state.',
    rls: 'Lawyer/accountant/editor roles by workspace',
    status: 'Required',
  },
  {
    table: 'publishing_queue',
    owner: 'Publishing',
    purpose: 'Queued platform sync jobs, retry state, token health snapshot, publish result, and error detail.',
    rls: 'Editors can queue; publishing service can mutate status',
    status: 'Required',
  },
  {
    table: 'agent_runs',
    owner: 'Agents',
    purpose: 'Every OpenAI agent run, model, input/output references, tokens, latency, cost, and handoff target.',
    rls: 'Read by workspace admins; insert by server jobs',
    status: 'Required',
  },
  {
    table: 'system_logs',
    owner: 'Logs',
    purpose: 'Append-only audit trail for safety confirmations, errors, stage audits, agent handoffs, and exports.',
    rls: 'Append-only via server; masked read for workspace users',
    status: 'Required',
  },
  {
    table: 'knowledge_sources',
    owner: 'Knowledge Base',
    purpose: 'PDF/link/Drive/Obsidian source metadata, indexing state, citation policy, and source ownership.',
    rls: 'Workspace scoped with source-level permissions',
    status: 'Required',
  },
  {
    table: 'content_assets',
    owner: 'Asset Composer',
    purpose: 'Generated/selected images, layout metadata, asset prompt, platform crop, and review attachment.',
    rls: 'Workspace scoped; signed storage URLs only',
    status: 'Required',
  },
  {
    table: 'integration_connections',
    owner: 'Settings',
    purpose: 'OAuth/provider state for Google Drive, Obsidian, Facebook, Instagram, Buffer, YouTube, and TikTok.',
    rls: 'Admin only; encrypted token references, never raw token display',
    status: 'Required',
  },
];

const backendApiContracts = [
  { route: 'POST /api/content/jobs', owner: 'Create Post', input: 'brief, mode, platforms, language, source policy', output: 'content_job + queued agent runs', status: 'Required' },
  { route: 'POST /api/agents/run', owner: 'Agents', input: 'content_job_id, agent_key, model, source refs', output: 'agent_run + next queue state', status: 'Required' },
  { route: 'POST /api/review/decision', owner: 'Review Queue', input: 'review_item_id, decision, reason, reviewer_id', output: 'review update + content status + system log', status: 'Required' },
  { route: 'POST /api/publishing/queue', owner: 'Publishing', input: 'content_job_id, platform targets, scheduled_at', output: 'publishing_queue rows + status event', status: 'Required' },
  { route: 'POST /api/publishing/sync', owner: 'Publishing Agent', input: 'publishing_queue_id, action, safety note', output: 'sync status, error log, retry policy', status: 'Required' },
  { route: 'GET /api/logs/export', owner: 'Logs', input: 'date range, severity, actor, workflow id', output: 'CSV/JSON/PDF export or upgrade-required', status: 'Pro gated' },
  { route: 'POST /api/settings/integrations/test', owner: 'Settings', input: 'provider id, workspace id', output: 'health result + masked diagnostic log', status: 'Required' },
];

const backendJobQueues = [
  { queue: 'content-generation', trigger: 'Create Post reaches Generation', worker: 'Content Strategy Agent', writes: 'content_jobs, agent_runs, system_logs' },
  { queue: 'asset-composer', trigger: 'Text package completed', worker: 'Image & Layout Agent', writes: 'content_assets, review_items, agent_runs' },
  { queue: 'compliance-check', trigger: 'Ready for Review or manual check', worker: 'Legal Compliance Agent', writes: 'review_items, agent_runs, system_logs' },
  { queue: 'publish-sync', trigger: 'Approve + Auto Queue or Publish Now confirmation', worker: 'Publishing Agent', writes: 'publishing_queue, content_jobs, system_logs' },
  { queue: 'analytics-rollup', trigger: 'Published/failed status or weekly cron', worker: 'Analytics Insight Agent', writes: 'agent_runs, analytics snapshots, system_logs' },
];

const backendEnvContracts = [
  { key: 'OPENAI_API_KEY', visibility: 'Server only', usedBy: 'Agents, RAG answers, image/layout planning', guard: 'Never expose as NEXT_PUBLIC_*' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', visibility: 'Server only', usedBy: 'Route handlers, workers, append-only logs', guard: 'Never send to browser; use only in server runtime' },
  { key: 'NEXT_PUBLIC_SUPABASE_URL', visibility: 'Client safe', usedBy: 'Browser Supabase client', guard: 'Pair with RLS and scoped anon key' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', visibility: 'Client safe with RLS', usedBy: 'Client reads/writes allowed by policy', guard: 'RLS on every exposed table' },
  { key: 'BUFFER_ACCESS_TOKEN', visibility: 'Server only', usedBy: 'Publishing queue sync', guard: 'Store encrypted or provider-vault reference' },
  { key: 'CODEX_LOCAL_BRIDGE_SECRET', visibility: 'Local/server only', usedBy: 'Signed local Codex handoff', guard: 'Workspace allowlist + per-action audit logs' },
];

const backendSecurityChecklist = [
  'Enable RLS on every exposed Supabase table before granting anon/authenticated access.',
  'Service role keys stay inside Next.js route handlers, workers, or Supabase Edge Functions only.',
  'system_logs should be append-only and masked for sensitive values, API keys, and provider tokens.',
  'Review decisions and publishing confirmations require reason/safety metadata before mutation.',
  'Agent runs store references to sources/assets, not raw private documents unless explicitly allowed.',
  'Integration tokens are stored as encrypted references and never rendered back to the browser.',
];

const backendImplementationHandoff = [
  {
    phase: 'Schema migration',
    owner: 'Supabase DBA',
    deliverable: 'Create workspace-scoped tables for content_jobs, review_items, publishing_queue, agent_runs, system_logs, knowledge_sources, content_assets, and integration_connections.',
    gate: 'Migration reviewed before apply; table names and status enum match UI workflow.',
    status: 'Ready to write',
  },
  {
    phase: 'RLS + grants',
    owner: 'Security reviewer',
    deliverable: 'Enable RLS on exposed tables, grant minimum Data API privileges, and avoid TO authenticated without workspace/ownership predicates.',
    gate: 'Each exposed table has select/insert/update policies with explicit workspace membership checks.',
    status: 'Required',
  },
  {
    phase: 'Server API routes',
    owner: 'Next.js backend',
    deliverable: 'Implement route handlers for content jobs, agent runs, review decisions, publishing queue, publishing sync, integration tests, and log export.',
    gate: 'No service role or provider token is available to client bundles.',
    status: 'Ready to build',
  },
  {
    phase: 'Worker orchestration',
    owner: 'Agent runtime',
    deliverable: 'Connect content-generation, asset-composer, compliance-check, publish-sync, and analytics-rollup jobs to OpenAI agents.',
    gate: 'Every worker writes agent_runs and system_logs before mutating the next workflow state.',
    status: 'Ready to build',
  },
  {
    phase: 'Verification',
    owner: 'QA / audit',
    deliverable: 'Run seed workflow SW-134 from Create Post to Publishing, then confirm Dashboard, Review Queue, Publishing, and Logs agree.',
    gate: 'Supabase advisors, API smoke checks, and browser workflow audit pass before deploy.',
    status: 'Audit gate',
  },
];

const backendRlsPolicyHandoff = [
  {
    table: 'content_jobs',
    policy: 'workspace_member_can_read_write',
    access: 'Authenticated workspace members can read/write rows for their workspace; server workers can update canonical status.',
  },
  {
    table: 'review_items',
    policy: 'reviewer_role_can_decide',
    access: 'Lawyer, accountant, editor, and admin roles can review; reject and approve mutations require reason metadata.',
  },
  {
    table: 'publishing_queue',
    policy: 'editor_can_queue_service_can_sync',
    access: 'Editors can queue approved jobs; server-only publishing service can mutate sync status and error detail.',
  },
  {
    table: 'system_logs',
    policy: 'append_only_masked_read',
    access: 'Server inserts append-only logs; workspace users read masked events only; raw tokens and secrets never render.',
  },
];

const backendHandoffChecklist = [
  'Confirm Supabase changelog before migration work, then use current RLS/Data API docs as source of truth.',
  'Create migration through Supabase workflow, not an invented timestamped SQL filename.',
  'Keep service_role and provider tokens server-only; browser uses publishable/anon key with RLS.',
  'Run advisor/security checks after schema, policy, function, or storage changes.',
  'Seed SW-134 as the end-to-end workflow fixture for QA and cross-page status consistency.',
];

const releaseReadinessGates = [
  {
    gate: 'Frontend workflow QA',
    owner: 'Product QA',
    evidence: 'Create Post, Dashboard simulation, Review Queue, Publishing, Settings, Agents, and Logs pass browser smoke checks.',
    status: 'Ready for preview',
  },
  {
    gate: 'Backend contract freeze',
    owner: 'Backend lead',
    evidence: 'Stage 9 API/table map and Stage 11 handoff package are accepted before real Supabase migration work starts.',
    status: 'Ready for backend',
  },
  {
    gate: 'Environment variables',
    owner: 'Release manager',
    evidence: 'OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, Supabase public URL/anon key, Buffer token, and Vercel token are present only in the correct runtime scope.',
    status: 'Needs production values',
  },
  {
    gate: 'Security review',
    owner: 'Security reviewer',
    evidence: 'RLS policies, Data API grants, secret masking, log export gating, and service role isolation are reviewed.',
    status: 'Required before prod',
  },
  {
    gate: 'Rollback plan',
    owner: 'Release manager',
    evidence: 'Preview deployment can be promoted only after audit; rollback target and release notes are recorded.',
    status: 'Draft ready',
  },
];

const releaseDeployPath = [
  { step: 'Preview', command: 'vercel deploy', note: 'Create preview URL for product/browser QA without touching production.' },
  { step: 'Inspect', command: 'vercel inspect <preview-url>', note: 'Review build metadata, functions, and deployment details.' },
  { step: 'Smoke test', command: 'npm run lint && browser workflow audit', note: 'Verify /prd, Settings gates, Logs, and seed workflow SW-134.' },
  { step: 'Promote', command: 'vercel promote <preview-url>', note: 'Promote validated preview instead of rebuilding production blindly.' },
  { step: 'Rollback', command: 'vercel rollback', note: 'Return production alias to previous known-good deployment if post-release checks fail.' },
];

const releaseOpenRisks = [
  'Do not enable real Publish Now until platform tokens and failure retries are tested.',
  'Do not expose log export to Basic plan unless billing/upsell gate is implemented.',
  'Do not connect real Supabase mutations until RLS and workspace membership policies pass advisor checks.',
  'Do not unlock +New Agent until plan limits and billing enforcement are wired server-side.',
];

const settingsGroups = [
  {
    label: 'My Account',
    items: ['Profile', 'Preferences', 'Notifications', 'API Tokens', 'Daemon', 'Updates'],
  },
  {
    label: 'Agency OS',
    items: ['General', 'Repositories', 'GitHub', 'Codex Local', 'Integrations', 'Labs', 'Members'],
  },
];

const integrationApps = [
  { name: 'Google Drive', description: 'Sync documents, PDFs, folders, Docs, Sheets, and Slides.', status: 'Connected', category: 'Knowledge Source', scope: 'RAG source ingest', auth: 'OAuth connected', lastSync: '12m ago', readiness: 'Ready', icon: DriveIcon },
  { name: 'Obsidian', description: 'Index markdown vault notes, backlinks, and internal knowledge.', status: 'Connect', category: 'Knowledge Source', scope: 'Local vault import', auth: 'Path approval needed', lastSync: 'Not connected', readiness: 'Needs setup', icon: ObsidianIcon },
  { name: 'Facebook', description: 'Publish posts, monitor pages, and sync publishing results.', status: 'Connected', category: 'Publishing', scope: 'Page publishing', auth: 'Page token active', lastSync: '18m ago', readiness: 'Ready', icon: FacebookIcon },
  { name: 'Instagram', description: 'Prepare visual posts, carousel assets, and caption drafts.', status: 'Connect', category: 'Publishing', scope: 'Asset publishing', auth: 'Business login needed', lastSync: 'Not connected', readiness: 'Needs setup', icon: InstagramIcon },
  { name: 'Buffer', description: 'Queue approved content and manage publishing schedules.', status: 'Connected', category: 'Publishing', scope: 'Queue handoff', auth: 'Access token active', lastSync: '5m ago', readiness: 'Ready', icon: BufferIcon },
  { name: 'YouTube', description: 'Plan scripts, descriptions, thumbnails, and video publishing.', status: 'Connect', category: 'Publishing', scope: 'Video metadata', auth: 'OAuth needed', lastSync: 'Not connected', readiness: 'Needs setup', icon: YoutubeIcon },
  { name: 'TikTok', description: 'Prepare short-form post ideas, scripts, captions, and hashtags.', status: 'Connect', category: 'Publishing', scope: 'Short-form drafts', auth: 'OAuth needed', lastSync: 'Not connected', readiness: 'Needs setup', icon: TiktokIcon },
];

const logSummary = [
  { label: 'Agent runs', value: '428', detail: '+64 today', icon: Bot },
  { label: 'RAG queries', value: '1.2K', detail: '+218 this week', icon: Search },
  { label: 'Errors / bugs', value: '17', detail: '4 unresolved', icon: ShieldCheck },
  { label: 'Token usage', value: '3.8M', detail: '$42.10 estimated', icon: Activity },
];

type StaticErrorEvent = { type: string; severity: string; status: string; message: string; source: string; time: string; item?: string };
const errorEvents: StaticErrorEvent[] = [];
type LogEvent = (typeof errorEvents)[number] & {
  itemId?: string;
  relatedId?: string;
  status?: string;
};

const endToEndWorkflowSimulation = [
  {
    step: '01',
    page: 'Create Post',
    state: 'Brief accepted',
    agent: 'Content Strategy Agent',
    contract: 'POST /api/content/jobs',
    handoff: 'Creates SW-134 and queues content-generation',
    evidence: 'Topic, language, platform, source policy, post count, image count',
    status: 'Ready',
  },
  {
    step: '02',
    page: 'Generation',
    state: 'Text ready',
    agent: 'Content Strategy Agent',
    contract: 'POST /api/agents/run',
    handoff: 'Writes draft copy, citations, and source summary',
    evidence: 'Text is generated before image/layout work starts',
    status: 'Ready',
  },
  {
    step: '03',
    page: 'Asset Composer',
    state: 'Assets ready',
    agent: 'Image & Layout Agent',
    contract: 'asset-composer queue',
    handoff: 'Turns approved text into image prompts and platform layout',
    evidence: 'Selected images, crop notes, carousel/grid/single layout package',
    status: 'Ready',
  },
  {
    step: '04',
    page: 'Review Queue',
    state: 'Human review',
    agent: 'Legal Compliance Agent',
    contract: 'POST /api/review/decision',
    handoff: 'Checks citations, multilingual meaning, claims, and risk flags',
    evidence: 'Approve, reject with reason, or auto queue decision',
    status: 'Guarded',
  },
  {
    step: '05',
    page: 'Publishing',
    state: 'Queued / syncing',
    agent: 'Publishing Agent',
    contract: 'POST /api/publishing/queue',
    handoff: 'Schedules platform targets and syncs publish result',
    evidence: 'Publishing queue status remains canonical across pages',
    status: 'Ready',
  },
  {
    step: '06',
    page: 'Logs',
    state: 'Audit trail',
    agent: 'Operations Monitor Agent',
    contract: 'GET /api/logs/export',
    handoff: 'Records every decision, handoff, error, retry, and stage audit',
    evidence: 'Workflow ID links Dashboard, Review Queue, Publishing, and Logs',
    status: 'Logged',
  },
];

const stageAuditEvents: LogEvent[] = [];

type AgentActivityLog = { agent: string; model: string; status: string; tokens: string; duration: string };
type UserActivityLog = { user: string; action: string; target: string; time: string };
const agentActivityLogs: AgentActivityLog[] = [];
type LogExportItem = { format: string; scope: string; filter: string; user: string; time: string };
const userActivityLogs: UserActivityLog[] = [];
const logExports: LogExportItem[] = [];
type FeatureUsageItem = { feature: string; count: string; trend: string; percent: number };
const featureUsage: FeatureUsageItem[] = [];

const planEntitlements = {
  name: 'Basic',
  customAgents: false,
  modelSelection: false,
  promptEditing: false,
  logExports: false,
  ragQueries: true,
  publishingIntegrations: false,
};

const agentFeatureFlags = {
  showPlanBanner: !planEntitlements.customAgents && planEntitlements.name !== 'Basic',
  showRoutingPreview: true,
};

const showAgentRouting = agentFeatureFlags.showRoutingPreview;
const showPlanBanner = agentFeatureFlags.showPlanBanner;

function toPrdRouteSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePrdPageParam(value: string | null): PageName | null {
  if (!value) {
    return null;
  }

  const normalized = toPrdRouteSlug(value);
  const page = navGroups.flatMap((group) => group.items).find((item) => toPrdRouteSlug(item.name) === normalized);

  return (page?.name as PageName | undefined) ?? null;
}

function normalizePrdTabParam(page: PageName, value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = toPrdRouteSlug(value);
  const tab = pageMeta[page]?.tabs.find((item) => toPrdRouteSlug(item) === normalized);

  return tab ?? value;
}

function getInitialPrdPage() {
  if (typeof window === 'undefined') {
    return 'Dashboard' as PageName;
  }

  return normalizePrdPageParam(new URLSearchParams(window.location.search).get('page')) ?? 'Dashboard';
}

function getInitialPrdTab(page: PageName) {
  if (typeof window === 'undefined') {
    return pageMeta[page]?.tabs?.[0] ?? 'All';
  }

  const tab = normalizePrdTabParam(page, new URLSearchParams(window.location.search).get('tab'));
  return tab ?? pageMeta[page]?.tabs?.[0] ?? 'All';
}

type SearchParamReader = { get: (name: string) => string | null } | null;

function getPrdPageFromSearchParams(searchParams: SearchParamReader) {
  return normalizePrdPageParam(searchParams?.get('page') ?? null) ?? ('Dashboard' as PageName);
}

function getPrdTabFromSearchParams(page: PageName, searchParams: SearchParamReader) {
  const tab = normalizePrdTabParam(page, searchParams?.get('tab') ?? null);
  return tab ?? pageMeta[page]?.tabs?.[0] ?? 'All';
}

const agentRoutingRows = [
  {
    task: 'Topic planning',
    agent: 'Content Strategy Agent',
    model: 'GPT-5.4',
    trigger: 'New weekly campaign, empty calendar slot, or service coverage gap',
    rule: 'Use fast planning model first, escalate only when legal risk is detected.',
    risk: 'Low',
  },
  {
    task: 'Source search / RAG',
    agent: 'RAG Research Agent',
    model: 'GPT-5.4',
    trigger: 'User asks AI to cite law, tax notice, internal policy, or client-specific rule',
    rule: 'Return cited sources only. If no source is found, block generation and request upload.',
    risk: 'Medium',
  },
  {
    task: 'Draft generation',
    agent: 'Content Strategy Agent',
    model: 'GPT-5.4',
    trigger: 'Create Post reaches Generation step after sources are selected',
    rule: 'Generate Thai first, then prepare translation-ready structure and image brief.',
    risk: 'Medium',
  },
  {
    task: 'Legal / tax review',
    agent: 'Legal Compliance Agent',
    model: 'GPT-5.5',
    trigger: 'Any claim about tax savings, legal outcome, visa result, PDPA, or labor law',
    rule: 'Always require citation, flag prohibited promises, and route high-risk items to human review.',
    risk: 'High',
  },
  {
    task: 'Localization',
    agent: 'Multilingual Localization Agent',
    model: 'GPT-5.4-Mini',
    trigger: 'Multi-language generation for English, Chinese, or Japanese',
    rule: 'Preserve legal meaning, compare translation drift, and keep audience-specific tone.',
    risk: 'Medium',
  },
  {
    task: 'Image + layout',
    agent: 'Image & Layout Agent',
    model: 'GPT-5.4',
    trigger: 'Text package is ready and visual brief can be derived from final copy',
    rule: 'Create image direction after text generation, then attach selected assets to Review Queue.',
    risk: 'Medium',
  },
  {
    task: 'Publishing',
    agent: 'Publishing Agent',
    model: 'GPT-5.4-Mini',
    trigger: 'Approved content is queued or Publish Now is clicked',
    rule: 'Publish only approved content, check platform token, then log every sync result.',
    risk: 'Medium',
  },
  {
    task: 'Analytics insight',
    agent: 'Analytics Insight Agent',
    model: 'GPT-5.4-Mini',
    trigger: 'Weekly report, campaign review, or topic performance comparison',
    rule: 'Summarize trend, winner topic, language performance, and next recommended action.',
    risk: 'Low',
  },
];

const agentEscalationRules = [
  'High-risk legal/tax claims always go to Review Queue before publishing.',
  'If RAG has no citation, content generation is blocked instead of guessed.',
  'Fast/low-cost models handle planning, drafts, publishing logs, and analytics summaries.',
  'Stronger models handle compliance, source reasoning, and cross-language meaning checks.',
];

const calendarWeekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const calendarWeekdayLongNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const calendarServiceCoverageRules: Array<{ service: string; dayIndex: number; targetCount: number }> = [
  { service: 'Corporate Law', dayIndex: 0, targetCount: 1 },
  { service: 'Accounting', dayIndex: 2, targetCount: 1 },
  { service: 'Tax', dayIndex: 4, targetCount: 1 },
  { service: 'PDPA', dayIndex: 1, targetCount: 1 },
  { service: 'Labor Law', dayIndex: 3, targetCount: 1 },
  { service: 'BOI / Investment', dayIndex: 5, targetCount: 1 },
];

function PrdPageClient() {
  const defaultPrdPage = 'Dashboard' as PageName;
  const authBypassEnabled = process.env.NEXT_PUBLIC_AI_CONTENT_DISABLE_API_AUTH === 'true';
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientInitComplete, setClientInitComplete] = useState(false);
  const [activePage, setActivePage] = useState<PageName>(defaultPrdPage);
  const [activeTab, setActiveTab] = useState<string>(pageMeta[defaultPrdPage]?.tabs?.[0] ?? 'All');
  const [apiToken, setApiToken] = useState<string>('');
  const [uiNotice, setUiNotice] = useState('');
  const [dashboardState, setDashboardState] = useState<{
    stats: DashboardStat[];
    board: DashboardBoard[];
    agents: DashboardAgent[];
    activity: DashboardActivity[];
  }>(fallbackDashboardData);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [calendarDaysState, setCalendarDaysState] = useState<CalendarDay[]>(fallbackCalendarDays);
  const [focusDayPostsState, setFocusDayPostsState] = useState<CalendarFocusPost[]>(fallbackFocusDayPosts);
  const [calendarFocusLabel, setCalendarFocusLabel] = useState('June 15');
  const [calendarDailyCapacity, setCalendarDailyCapacity] = useState<Record<string, CalendarCapacity>>({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState('');
  const [publishingChannelsState, setPublishingChannelsState] = useState<PublishingChannelSummary[]>(fallbackPublishingChannels);
  const [publishingQueueState, setPublishingQueueState] = useState<PublishingQueueRow[]>(fallbackPublishingQueue);
  const [workflowPublishingRowsState, setWorkflowPublishingRowsState] = useState<PublishingQueueRow[]>([]);
  const [publishingErrorsState, setPublishingErrorsState] = useState<PublishingErrorRow[]>(fallbackPublishingErrors);
  const [publishingLoading, setPublishingLoading] = useState(false);
  const [publishingActionLoading, setPublishingActionLoading] = useState('');
  const [publishingError, setPublishingError] = useState('');
  const [publishingSummary, setPublishingSummary] = useState<Record<string, number> | null>(null);
  const hasSessionToken = typeof window !== 'undefined' && Boolean(window.sessionStorage.getItem('prd_api_bearer_token')?.trim());
  const hasToken = authBypassEnabled || Boolean(apiToken.trim()) || hasSessionToken;
  const shouldUseMockQueue = false;
  const [reviewQueueItemsState, setReviewQueueItemsState] = useState<ReviewQueueItem[]>(() =>
    readStoredReviewQueueItems({ allowMock: shouldUseMockQueue }),
  );
  const [apiActorDisplayName, setApiActorDisplayName] = useState('Current User');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [agentQueueJobsState, setAgentQueueJobsState] = useState<AgentQueueJob[]>(fallbackAgentQueueJobs);
  const [agentExecutionLoading, setAgentExecutionLoading] = useState(false);
  const [agentConnectionPreference, setAgentConnectionPreference] = useState<AgentRuntimePreference>('auto');
  const agentRunnerInFlightRef = useRef(false);
  const [workflowErrorEventsState, setWorkflowErrorEventsState] = useState<LogEvent[]>(stageAuditEvents);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [selectedDashboardBoardItemId, setSelectedDashboardBoardItemId] = useState<string | null>(null);
  const [selectedWorkflowItemId, setSelectedWorkflowItemId] = useState<string | null>(null);
  const [selectedContentJobDetailWorkflowId, setSelectedContentJobDetailWorkflowId] = useState<string | null>(null);
  const [selectedContentJobDetailId, setSelectedContentJobDetailId] = useState<string | null>(null);
  const [contentJobDeleteLoadingId, setContentJobDeleteLoadingId] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<SafetyConfirmation | null>(null);
  const [confirmationReason, setConfirmationReason] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const contentJobDetailRefreshInFlightRef = useRef(false);
  const syncPrdStateFromLocation = useCallback(() => {
    const pageParam = searchParams?.get('page') ?? null;
    const contentJobParam = searchParams?.get('contentJob') ?? null;

    if (contentJobParam) {
      const normalizedContentJobId = normalizeTextValue(contentJobParam);
      setSelectedContentJobDetailWorkflowId((current) =>
        current === normalizedContentJobId ? current : normalizedContentJobId,
      );
      setSelectedContentJobDetailId((current) => (current === normalizedContentJobId ? current : normalizedContentJobId));
    }

    if (!pageParam) {
      return;
    }

    const nextPage = getPrdPageFromSearchParams(searchParams);
    const nextTab = getPrdTabFromSearchParams(nextPage, searchParams);

    setActivePage((current) => (current === nextPage ? current : nextPage));
    setActiveTab((current) => (current === nextTab ? current : nextTab));
  }, [searchParams]);
  const resolveAuthToken = useCallback(
    () =>
      authBypassEnabled || apiToken.trim()
        ? apiToken.trim().replace(/^Bearer\s+/i, '')
        : typeof window !== 'undefined'
          ? (window.sessionStorage.getItem('prd_api_bearer_token') ?? '').trim().replace(/^Bearer\s+/i, '')
          : '',
    [apiToken, authBypassEnabled],
  );
  const fetchWithToken = useCallback(
    async function fetchWithToken<T>(path: string, options: RequestInit = {}) {
      const token = resolveAuthToken();

      if (!authBypassEnabled && !token) {
        throw new Error('Please sign in before loading live data.');
      }

      const headers = {
        ...(options.headers as Record<string, string>),
      } as Record<string, string>;

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (options.body) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(path, {
        ...options,
        headers,
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body?.message || body?.error || 'Request failed');
      }

      return body as T;
    },
    [resolveAuthToken, authBypassEnabled],
  );
  useEffect(() => {
    if (!clientInitComplete) {
      return;
    }

    if (authBypassEnabled) {
      setApiActorDisplayName('System Operator');
      return;
    }

    const resolvedToken = resolveAuthToken();
    setApiActorDisplayName(extractActorDisplayNameFromToken(resolvedToken) || 'Current User');
  }, [clientInitComplete, authBypassEnabled, resolveAuthToken]);
  const setActivePageWithTab = (page: PageName, tab?: string) => {
    const nextTab = tab ?? pageMeta[page]?.tabs?.[0] ?? 'All';
    setActivePage(page);
    setActiveTab(nextTab);
    router.replace(`/prd?page=${toPrdRouteSlug(page)}&tab=${toPrdRouteSlug(nextTab)}`, { scroll: false });
  };

  const showUiNotice = (message: string) => {
    setUiNotice(message);
    window.setTimeout(() => {
      setUiNotice((current) => (current === message ? '' : current));
    }, 3200);
  };

  const goToPageWithTab = (page: PageName, tab?: string, note?: string) => {
    setActivePageWithTab(page, tab);
    showUiNotice(note ?? `เปิดหน้า ${page}${tab ? ` (${tab})` : ''}`);
  };

  const goToPage = (page: PageName) => {
    goToPageWithTab(page);
  };

  const addWorkflowAuditEvent = (event: Omit<LogEvent, 'time'>) => {
    setWorkflowErrorEventsState((current) => [
      {
        time: 'now',
        ...event,
      },
      ...current,
    ].slice(0, 24));
  };

  const requestSafetyConfirmation = (confirmation: SafetyConfirmation) => {
    setPendingConfirmation(confirmation);
    setConfirmationReason(confirmation.initialReason ?? '');
  };

  const closeSafetyConfirmation = () => {
    setPendingConfirmation(null);
    setConfirmationReason('');
  };

  const confirmSafetyAction = () => {
    if (!pendingConfirmation) {
      return;
    }
    if (pendingConfirmation.reasonRequired && !confirmationReason.trim()) {
      showUiNotice('ต้องใส่เหตุผลก่อนยืนยัน action นี้');
      return;
    }
    pendingConfirmation.onConfirm(confirmationReason.trim());
    closeSafetyConfirmation();
  };

  const requestPublishingNow = (id: string) => {
    const workflowId = getDashboardIdForWorkflowId(id);
    requestSafetyConfirmation({
      title: 'Publish Now confirmation',
      description: `Confirm publishing action for ${id}. This will move the job into sync and write a safety audit log.`,
      confirmLabel: 'Confirm Publish',
      tone: 'info',
      reasonLabel: 'Publishing note',
      details: [workflowId, id, 'Next status: Syncing', 'Publishing Agent will continue the handoff after confirmation.'],
      onConfirm: (reason) => {
        addWorkflowAuditEvent({
          type: 'Safety confirmation',
          source: 'Publishing',
          severity: 'Low',
          message: `${workflowId} → ${id} Publish Now confirmed${reason ? ` · Reason: ${reason}` : ''}`,
          itemId: workflowId,
          relatedId: id,
          status: 'Publish Now confirmed',
        });
        updateQueueItem(id, 'syncing');
      },
    });
  };

  const requestPublishingCancel = (id: string) => {
    const workflowId = getDashboardIdForWorkflowId(id);
    requestSafetyConfirmation({
      title: 'Cancel Queue confirmation',
      description: `Confirm queue cancellation for ${id}. This will stop the scheduled publishing job and write a safety audit log.`,
      confirmLabel: 'Confirm Cancel',
      tone: 'danger',
      reasonLabel: 'Cancellation reason',
      details: [workflowId, id, 'Next status: Cancelled', 'Use this when a post must not go live.'],
      onConfirm: (reason) => {
        addWorkflowAuditEvent({
          type: 'Safety confirmation',
          source: 'Publishing',
          severity: 'Medium',
          message: `${workflowId} → ${id} Cancel Queue confirmed${reason ? ` · Reason: ${reason}` : ''}`,
          itemId: workflowId,
          relatedId: id,
          status: 'Cancel Queue confirmed',
        });
        updateQueueItem(id, 'cancelled');
      },
    });
  };

  const requestPublishingSelected = (ids: string[], onConfirmed: () => void) => {
    const workflowIds = ids.map((id) => getDashboardIdForWorkflowId(id));
    requestSafetyConfirmation({
      title: 'Publish selected confirmation',
      description: `Confirm publishing ${ids.length} selected queue item${ids.length > 1 ? 's' : ''}.`,
      confirmLabel: 'Confirm Selected',
      tone: 'info',
      reasonLabel: 'Batch publishing note',
      details: [`Queue items: ${ids.join(', ')}`, `Workflows: ${workflowIds.join(', ')}`, 'Next status: Syncing for all selected items.'],
      onConfirm: (reason) => {
        addWorkflowAuditEvent({
          type: 'Safety confirmation',
          source: 'Publishing',
          severity: 'Low',
          message: `${workflowIds.join(', ')} → ${ids.join(', ')} Publish selected confirmed${reason ? ` · Reason: ${reason}` : ''}`,
          itemId: workflowIds[0],
          relatedId: ids.join(', '),
          status: 'Publish selected confirmed',
        });
        ids.forEach((id) => updateQueueItem(id, 'syncing'));
        onConfirmed();
      },
    });
  };

  const requestReviewDecision = (item: ReviewQueueItem, decision: ReviewDecision, reason: string, applyDecision: () => void) => {
    const isOrchestratorOwner =
      normalizeTextValue(item.owner) === 'Agent Orchestrator' || normalizeTextValue(item.createdBy) === 'Agent Orchestrator';
    const workflowId = item.workflowId ?? getDashboardIdForWorkflowId(item.id);
    const decisionLabel = decision === 'approved' ? 'Approve' : decision === 'rejected' ? 'Reject' : 'Auto Queue';

    if (!isOrchestratorOwner) {
      showUiNotice(`Cannot move ${item.id}: only Agent Orchestrator can move items out of In Review.`);
      return;
    }

    requestSafetyConfirmation({
      title: `${decisionLabel} confirmation`,
      description: `Confirm ${decisionLabel.toLowerCase()} for ${item.id}. This decision will update the review workflow and write a safety audit log.`,
      confirmLabel: `Confirm ${decisionLabel}`,
      tone: decision === 'rejected' ? 'danger' : decision === 'approved' ? 'success' : 'info',
      reasonLabel: decision === 'rejected' ? 'Reject reason (required)' : 'Reviewer note',
      reasonRequired: decision === 'rejected',
      initialReason: reason,
      details: [workflowId, item.id, item.title, `Decision: ${decisionLabel}`],
      onConfirm: (confirmedReason) => {
        addWorkflowAuditEvent({
          type: 'Safety confirmation',
          source: 'Review Queue',
          severity: decision === 'rejected' ? 'Medium' : 'Low',
          message: `${workflowId} → ${item.id} ${decisionLabel} confirmed · Reason: ${confirmedReason || 'No reason provided'}`,
          itemId: workflowId,
          relatedId: item.id,
          status: `${decisionLabel} confirmed`,
        });
        if (!hasToken || !isUuidLike(item.id)) {
          applyDecision();
          return;
        }

        void fetchWithToken('/api/review/decision', {
          method: 'POST',
          body: JSON.stringify({
            reviewItemId: item.id,
            decision: toReviewDecisionApiValue(decision),
            reason: confirmedReason || reason || `${decisionLabel} from Review Queue`,
            platform: decision === 'queued' ? toPublishingApiPlatform(item.platforms?.[0]) : undefined,
            scheduledAt: decision === 'queued' ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : undefined,
          }),
        })
          .then(async () => {
            applyDecision();
            await Promise.all([loadReviewData(), loadLogsData(), decision === 'queued' ? loadPublishingData() : Promise.resolve()]);
            showUiNotice(`Review decision synced to backend: ${item.id} → ${decisionLabel}`);
          })
          .catch((error: unknown) => {
            addWorkflowAuditEvent({
              type: 'Review decision sync failed',
              source: 'Review Queue API',
              severity: 'High',
              message: error instanceof Error ? error.message : 'Review decision backend sync failed',
              itemId: workflowId,
              relatedId: item.id,
              status: 'Backend sync failed',
            });
            showUiNotice(`Review decision backend sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          });
      },
    });
  };

  const resetDashboardState = () => {
    setActiveTab('All');
    if (hasToken) {
      void loadDashboardData();
    } else {
      setDashboardState(fallbackDashboardData);
    }
    showUiNotice('Dashboard เรียกคืนสภาพเริ่มต้น: กลับสู่ All และอัปเดตข้อมูลเท่านั้นถ้ามี token');
  };

  const openDashboardRunningView = () => {
    goToPageWithTab('Publishing', 'Queue', 'เปิด Publishing (Queue): ติดตามงานที่กำลังรัน/รอ sync');
  };

  const openDashboardErrorDetails = () => {
    goToPageWithTab('Review Queue', 'Needs review', 'เปิด Review Queue เพื่อดูรายละเอียด Error/blocked items');
  };

  const openDashboardStatAction = (action: DashboardStatAction) => {
    switch (action) {
      case 'need-review':
        goToPageWithTab('Review Queue', 'Needs review', 'เปิดหน้า Review Queue เพื่อ drill-down รายการที่ต้อง review');
        break;
      case 'scheduled':
        goToPageWithTab('Calendar', 'Month', 'เปิด Calendar Month เพื่อดูคิวที่ใกล้ถึงกำหนด');
        break;
      case 'agent-runs':
        goToPageWithTab('Agents', 'Prompts', 'เปิด Agents > Prompts เพื่อดูความพร้อมของทีม agent');
        break;
      case 'working-posts':
        goToPageWithTab('Publishing', 'Scheduled', 'เปิด Publishing Scheduled เพื่อเช็คโพสต์ที่พร้อมเผยแพร่');
        break;
      default:
        goToPageWithTab('Analytics', 'Performance', 'เปิด Analytics สำหรับสถิติแบบละเอียด');
        break;
    }
  };

  const openDashboardBoardItem = (item: BoardItem) => {
    setSelectedDashboardBoardItemId(item.id);
    setSelectedWorkflowItemId(item.id);
    setSelectedContentJobDetailWorkflowId(item.id);
    setSelectedContentJobDetailId(item.id);
    showUiNotice(`เปิดรายละเอียดบอร์ด: ${item.id} - ${item.title}`);
  };

  const clearDashboardBoardItem = () => {
    setSelectedDashboardBoardItemId(null);
    setSelectedWorkflowItemId(null);
    setSelectedContentJobDetailWorkflowId(null);
    setSelectedContentJobDetailId(null);
  };

  const syncContentJobQuery = (contentJobId: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    params.set('page', toPrdRouteSlug(activePage));
    params.set('tab', toPrdRouteSlug(activeTab));

    if (contentJobId) {
      params.set('contentJob', contentJobId);
    } else {
      params.delete('contentJob');
    }

    router.replace(`/prd?${params.toString()}`, { scroll: false });
  };

  const openContentJobDetail = (id: string, note?: string) => {
    setSelectedContentJobDetailWorkflowId(id);
    setSelectedContentJobDetailId(id);
    syncContentJobQuery(id);
    showUiNotice(note ?? `เปิด Content Job Detail: ${id}`);
  };

  const closeContentJobDetail = () => {
    setSelectedContentJobDetailWorkflowId(null);
    setSelectedContentJobDetailId(null);
    syncContentJobQuery(null);
  };

  const requestContentJobDelete = (detail: ContentJobDetail) => {
    requestSafetyConfirmation({
      title: 'Delete content job confirmation',
      description: `Confirm deletion for ${detail.workflowId}. This removes the content item and related review/assets/publishing records.`,
      confirmLabel: 'Delete Content',
      tone: 'danger',
      reasonLabel: 'Delete reason',
      reasonRequired: true,
      details: [detail.workflowId, detail.reviewId, detail.publishingId, detail.title],
      onConfirm: (reason) => {
        setContentJobDeleteLoadingId(detail.workflowId);

        void (async () => {
          try {
            await fetchWithToken('/api/content/jobs?id=' + encodeURIComponent(detail.workflowId), {
              method: 'DELETE',
              body: JSON.stringify({ reason }),
            });

            addWorkflowAuditEvent({
              type: 'Content job deleted',
              source: 'Content Job Detail',
              severity: 'Medium',
              message: `${detail.workflowId} deleted${reason ? ` · Reason: ${reason}` : ''}`,
              itemId: detail.workflowId,
              relatedId: detail.reviewId,
              status: 'Deleted',
            });

            showUiNotice(`Deleted content job ${detail.workflowId}`);
            closeContentJobDetail();
            await Promise.all([loadDashboardData(), loadReviewData(), loadPublishingData(), loadLogsData()]);
          } catch (error) {
            showUiNotice(error instanceof Error ? error.message : 'Unable to delete content job');
          } finally {
            setContentJobDeleteLoadingId(null);
          }
        })();
      },
    });
  };

  const openDashboardBoardItemInReview = (item: BoardItem) => {
    goToPageWithTab('Review Queue', 'Needs review', `เปิดรายการ ${item.id} จาก Dashboard ในหน้า Review`);
    setSelectedDashboardBoardItemId(item.id);
    setSelectedWorkflowItemId(item.id);
  };

  const openDashboardBoardItemInCreate = (item: BoardItem) => {
    goToPageWithTab('Create Post', 'Brief', `เริ่มสร้างโพสต์ต่อจาก ${item.id} ใน Draft`);
    setSelectedDashboardBoardItemId(item.id);
    setSelectedWorkflowItemId(item.id);
  };

  const openDashboardBoardItemInPublishing = (item: BoardItem) => {
    goToPageWithTab('Publishing', 'Queue', `เปิด Publishing Queue เพื่อติดตาม ${item.id}`);
    setSelectedDashboardBoardItemId(item.id);
    setSelectedWorkflowItemId(item.id);
  };

  const openDashboardBoardItemInLogs = (item: BoardItem) => {
    goToPageWithTab('Logs', 'Monitor', `เปิด Logs เพื่อตรวจ audit trail ของ ${item.id}`);
    setSelectedDashboardBoardItemId(item.id);
    setSelectedWorkflowItemId(item.id);
  };

  const sendCreatePackageToReview = async (packageItem: CreateReviewPackage) => {
    const requestedWorkflowId = packageItem.workflowId ?? createNextDraftWorkflowId();
    const requestedReviewId = getReviewIdForWorkflowId(requestedWorkflowId);
    const requestedPublishingId = getPublishingIdForWorkflowId(requestedWorkflowId);
    const reviewItemCreatedAt = Date.now();
    const reviewModeLabel = getReviewModeLabel(packageItem.mode);
    const reviewItemCreator = normalizeTextValue(packageItem.createdBy) || normalizeTextValue(apiActorDisplayName) || reviewModeLabel;

    const newReviewItem: Omit<ReviewQueueItem, 'id' | 'workflowId' | 'publishingId'> = {
      title: buildReviewQueueTitle({
        title: packageItem.title,
        reviewType: packageItem.category,
        category: packageItem.category,
        workflowId: requestedWorkflowId,
        mode: packageItem.mode,
      }),
      owner: 'Agent Orchestrator',
      status: 'In Review',
      risk: normalizeBoardRisk(packageItem.risk),
      category: packageItem.category,
      due: 'Just now',
      brandVoice: packageItem.brandVoice,
      createdBy: reviewItemCreator,
      assetComposerStatus: packageItem.assetComposerStatus,
      assetLayoutPlan: packageItem.assetLayoutPlan,
      citationStrictness: packageItem.citationStrictness,
      contentGoal: packageItem.contentGoal,
      cta: packageItem.cta,
      imageCount: packageItem.imageCount,
      languages: packageItem.languages,
      layout: packageItem.layout,
      mode: packageItem.mode,
      platforms: packageItem.platforms,
      postCount: packageItem.postCount,
      selectedAssets: packageItem.selectedAssets,
      sourceConnectors: packageItem.sourceConnectors,
      targetAudience: packageItem.targetAudience,
      visualBrief: packageItem.visualBrief,
      wordCount: packageItem.wordCount,
      generatedDrafts: packageItem.generatedDrafts,
      generatedAssets: packageItem.generatedAssets,
    };
    const toPipelineItem = (workflowId: string, stage: 'Todo' | 'In Progress'): BoardItem => ({
      id: workflowId,
      title: newReviewItem.title,
      owner: stage === 'Todo' ? 'Agent Orchestrator' : 'Content Strategy Agent',
      channel: `${newReviewItem.languages?.length ?? 0} lang · ${newReviewItem.layout ?? 'Layout'}`,
      due: stage === 'Todo' ? 'Queued' : 'Running',
      risk: normalizeBoardRisk(newReviewItem.risk),
      tone: normalizeBoardRisk(newReviewItem.risk) === 'High' ? 'rose' : normalizeBoardRisk(newReviewItem.risk) === 'Medium' ? 'amber' : 'emerald',
      stage,
      contentItemStatus: stage === 'Todo' ? 'draft' : 'source_search',
      generatedDrafts: newReviewItem.generatedDrafts,
      generatedAssets: newReviewItem.generatedAssets,
      imageCount: newReviewItem.imageCount,
      selectedAssets: newReviewItem.selectedAssets,
      assetLayoutPlan: newReviewItem.assetLayoutPlan,
      layout: newReviewItem.layout,
      visualBrief: newReviewItem.visualBrief,
      wordCount: newReviewItem.wordCount,
    });
    const toAgentJobs = (workflowId: string, runMode: 'Dry-run' | 'Live', executionState: 'review_ready' | 'queued'): AgentQueueJob[] => {
      const workflowSeed = getWorkflowIdSeed(workflowId);
      const sourceConnectors = (newReviewItem.sourceConnectors ?? []).join(', ') || 'source connectors';
      const now = toTimestampString();
      const providerLabel = runMode === 'Dry-run' ? 'Local runtime check' : 'Live backend';
      const languages = newReviewItem.languages?.length ?? 0;
      const imageSlots = (newReviewItem.selectedAssets ?? []).length || newReviewItem.imageCount || 'image';

      if (executionState === 'queued') {
        return [
          {
            id: `AGQ-${workflowSeed}-ORCH`,
            agent: 'Agent Orchestrator',
            owner: 'Agent Orchestrator',
            stage: 'Queue claimed',
            status: 'Done',
            detail: `${providerLabel} claimed ${workflowId} and routed grounded text work for ${newReviewItem.title}.`,
            createdAt: now,
            updatedAt: now,
            handoffTarget: 'Content Strategy Agent',
            runMode,
          },
          {
            id: `AGQ-${workflowSeed}-SOURCE`,
            agent: 'Content Strategy Agent',
            owner: 'Content Strategy Agent',
            stage: 'Source Search queued',
            status: 'Queued',
            detail: `${providerLabel} queued source-aware drafting with ${sourceConnectors}. No text will be generated without reliable context.`,
            createdAt: now,
            updatedAt: now,
            handoffTarget: 'Content Strategy Agent',
            runMode,
          },
          {
            id: `AGQ-${workflowSeed}-DRAFT`,
            agent: 'Content Strategy Agent',
            owner: 'Content Strategy Agent',
            stage: 'Draft Generation waiting on sources',
            status: 'Queued',
            detail: `${providerLabel} will generate ${languages} language draft package only after Source Search returns grounded context.`,
            createdAt: now,
            updatedAt: now,
            handoffTarget: 'Image & Layout Agent',
            runMode,
          },
          {
            id: `AGQ-${workflowSeed}-IMAGE`,
            agent: 'Image & Layout Agent',
            owner: 'Image & Layout Agent',
            stage: 'Waiting for text package',
            status: 'Queued',
            detail: `${providerLabel} will create the visual brief and ${imageSlots} slot(s) only after grounded text is complete.`,
            createdAt: now,
            updatedAt: now,
            handoffTarget: 'Legal Compliance Agent',
            runMode,
          },
          {
            id: `AGQ-${workflowSeed}-QC`,
            agent: 'Legal Compliance Agent',
            owner: 'Legal Compliance Agent',
            stage: 'Waiting for grounded text',
            status: 'Queued',
            detail: `${providerLabel} will run compliance only after text and citation context are attached.`,
            createdAt: now,
            updatedAt: now,
            handoffTarget: 'Publishing Agent',
            runMode,
          },
          {
            id: `AGQ-${workflowSeed}-PUBLISH`,
            agent: 'Publishing Agent',
            owner: 'Publishing Agent',
            stage: 'Publish blocked until approval',
            status: 'Waiting review',
            detail: `Publishing for ${(newReviewItem.platforms ?? ['selected platforms']).join(', ')} remains locked until Review Queue approval or Auto Queue.`,
            createdAt: now,
            updatedAt: now,
            handoffTarget: 'Human approval',
            runMode,
          },
        ];
      }

      return [
        {
          id: `AGQ-${workflowSeed}-ORCH`,
          agent: 'Agent Orchestrator',
          owner: 'Agent Orchestrator',
          stage: 'Queue claimed',
          status: 'Done',
          detail: `${providerLabel} claimed ${workflowId}, enforced step order, and blocked publishing before approval.`,
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Content Strategy Agent',
          runMode,
        },
        {
          id: `AGQ-${workflowSeed}-SOURCE`,
          agent: 'Content Strategy Agent',
          owner: 'Content Strategy Agent',
          stage: 'Source Search complete',
          status: 'Done',
          detail: `${providerLabel} grounded ${newReviewItem.title} with ${sourceConnectors} and handed the approved context to Draft Generation.`,
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Content Strategy Agent',
          runMode,
        },
        {
          id: `AGQ-${workflowSeed}-DRAFT`,
          agent: 'Content Strategy Agent',
          owner: 'Content Strategy Agent',
          stage: 'Grounded text package ready',
          status: 'Done',
          detail: `${providerLabel} generated ${languages} language draft package for ${newReviewItem.targetAudience ?? 'target audience'} from the grounded source set.`,
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Image & Layout Agent',
          runMode,
        },
        {
          id: `AGQ-${workflowSeed}-IMAGE`,
          agent: 'Image & Layout Agent',
          owner: 'Image & Layout Agent',
          stage: 'Visual Brief Ready',
          status: 'Done',
          detail: `${providerLabel} created visual prompt, ${imageSlots} slot(s), and ${newReviewItem.layout ?? 'platform'} layout constraints for composer.`,
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Legal Compliance Agent',
          runMode,
        },
        {
          id: `AGQ-${workflowSeed}-QC`,
          agent: 'Legal Compliance Agent',
          owner: 'Legal Compliance Agent',
          stage: 'Compliance Review',
          status: 'Done',
          detail: `${providerLabel} checked legal/tax risk, banned claims, citation strictness, and review readiness.`,
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Publishing Agent',
          runMode,
        },
        {
          id: `AGQ-${workflowSeed}-PUBLISH`,
          agent: 'Publishing Agent',
          owner: 'Publishing Agent',
          stage: 'Publish blocked until approval',
          status: 'Waiting review',
          detail: `Publishing job for ${(newReviewItem.platforms ?? ['selected platforms']).join(', ')} will start after human approval or Auto Queue.`,
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Human approval',
          runMode,
        },
      ];
    };
    const languageSummary = getLanguageDisplayLabels(newReviewItem.languages, ['th', 'en']).join(', ');
    const replaceDashboardColumnItem = (workflowId: string, columnName: 'Todo' | 'In Progress' | 'Done', item: BoardItem) =>
      setDashboardState((current) => ({
        ...current,
        board: normalizeDashboardCounts(
          current.board.some((column) => column.column === columnName)
            ? current.board.map((column) =>
                column.column === columnName
                  ? {
                      ...column,
                      items: [item, ...column.items.filter((boardItem) => boardItem.id !== workflowId)].slice(0, 4),
                    }
                  : column,
              )
            : [
                ...current.board,
                {
                  column: columnName,
                  count: 1,
                  items: [item],
                },
              ],
        ),
      }));
    const applyCreateHandoffState = (
      workflowId: string,
      reviewId: string,
      publishingId: string,
      options?: { runMode?: 'Dry-run' | 'Live'; executionState?: 'todo' | 'in_progress'; statusLabel?: string },
    ) => {
      const runMode = options?.runMode ?? 'Dry-run';
      const executionState = options?.executionState ?? 'todo';
      const statusLabel = options?.statusLabel ?? (runMode === 'Dry-run' ? 'Dry-run waiting for agent pickup' : 'Live agent pipeline started');
      const pipelineColumn = executionState === 'in_progress' ? 'In Progress' : 'Todo';
      const pipelineItem = toPipelineItem(workflowId, pipelineColumn);
      const workflowSeed = getWorkflowIdSeed(workflowId);
      const newAgentJobs = toAgentJobs(workflowId, runMode, executionState === 'in_progress' ? 'queued' : 'queued');
      setReviewQueueItemsState((current) => {
        const next = current.filter(
          (item) =>
            item.workflowId !== workflowId &&
            item.workflowId !== requestedWorkflowId &&
            item.id !== reviewId &&
            item.id !== requestedReviewId &&
            item.publishingId !== publishingId,
        );
        return next;
      });
      setSelectedWorkflowItemId(workflowId);
      setSelectedDashboardBoardItemId(workflowId);
      replaceDashboardColumnItem(workflowId, pipelineColumn, pipelineItem);
      setAgentQueueJobsState((current) => [...newAgentJobs, ...current.filter((job) => !job.id.startsWith(`AGQ-${workflowSeed}-`)).slice(0, 2)].slice(0, 8));
      addWorkflowAuditEvent({
        type: 'Create handoff',
        source: 'Create Post',
        severity: 'Low',
        message: `${workflowId} [${runMode}] → ${pipelineColumn} → ${statusLabel} (${languageSummary || 'languages'} / ${
          newReviewItem.platforms?.join(', ') ?? 'platforms'
        })`,
        itemId: workflowId,
        relatedId: reviewId,
        status: statusLabel,
      });
    };
    const navigateToDashboardPipeline = (workflowId: string) => {
      goToPageWithTab('Dashboard', 'All', `ส่ง ${workflowId} เข้า Todo/In Progress แล้ว รอ Agent ทำ package ก่อนเข้า Review Queue`);
    };

    if (!hasToken) {
      applyCreateHandoffState(requestedWorkflowId, requestedReviewId, requestedPublishingId);
      addWorkflowAuditEvent({
        type: 'Create handoff',
        source: 'Create Post',
        severity: 'Low',
        message: `${requestedWorkflowId} [local runtime check] -> ${requestedReviewId} moved to local review queue`,
        itemId: requestedWorkflowId,
        relatedId: requestedReviewId,
        status: 'Dry-run queue',
      });
      navigateToDashboardPipeline(requestedWorkflowId);
      return;
    }

    addWorkflowAuditEvent({
      type: 'Create handoff',
      source: 'Create Post',
      severity: 'Low',
      message: `${requestedWorkflowId} submitting to backend for review handoff`,
      itemId: requestedWorkflowId,
      relatedId: requestedReviewId,
      status: 'Submitting',
    });

    try {
      const result = await fetchWithToken<ContentJobCreateResponse>('/api/content/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: newReviewItem.title,
          brief: newReviewItem.visualBrief ?? `${newReviewItem.category} content package from Create Post`,
          category: newReviewItem.category,
          serviceArea: newReviewItem.category,
          riskLevel: normalizeBoardRisk(newReviewItem.risk).toLowerCase(),
          mode: newReviewItem.mode ?? 'manual',
          languages: newReviewItem.languages ?? ['th', 'en'],
          platforms: newReviewItem.platforms ?? [],
          sourcePolicy: newReviewItem.citationStrictness ?? 'knowledge_base_required',
          queueAgents: true,
          autoExecuteAgents: true,
          agentExecutionMaxRuns: 1,
          providerPreference: agentConnectionPreference,
          metadata: {
            workflowId: requestedWorkflowId,
            reviewId: requestedReviewId,
            publishingId: requestedPublishingId,
            owner: 'Agent Orchestrator',
            sourceMode: reviewModeLabel,
            sourceModeLabel: reviewModeLabel,
            createdAt: reviewItemCreatedAt,
            createdAtIso: new Date(reviewItemCreatedAt).toISOString(),
            assetComposerStatus: newReviewItem.assetComposerStatus,
            brandVoice: newReviewItem.brandVoice,
            citationStrictness: newReviewItem.citationStrictness,
            sourceConnectors: newReviewItem.sourceConnectors ?? [],
            officialSourceLinks: packageItem.officialSourceLinks ?? [],
            layout: newReviewItem.layout,
            imageCount: newReviewItem.imageCount,
            postCount: newReviewItem.postCount,
            wordCount: newReviewItem.wordCount,
            selectedAssets: newReviewItem.selectedAssets ?? [],
            assetLayoutPlan: newReviewItem.assetLayoutPlan ?? [],
            facebookLayoutRule: getFacebookLayoutGuideline(newReviewItem.layout ?? '', newReviewItem.platforms ?? []),
            contentGoal: newReviewItem.contentGoal,
            targetAudience: newReviewItem.targetAudience,
            cta: newReviewItem.cta,
            visualBrief: newReviewItem.visualBrief,
            generatedDrafts: newReviewItem.generatedDrafts,
            generatedAssets: newReviewItem.generatedAssets,
          },
        }),
      });
      const workflowId = isUuidLike(result.job.id) ? result.job.id : requestedWorkflowId;
      const reviewId = result.review?.id && isUuidLike(result.review.id) ? result.review.id : getReviewIdForWorkflowId(workflowId);
      const publishingId = getPublishingIdForWorkflowId(workflowId);
      const executedCount = result.executedRuns?.filter((run) => run.status === 'succeeded').length ?? 0;
      applyCreateHandoffState(workflowId, reviewId, publishingId, {
        runMode: 'Live',
        executionState: executedCount > 0 ? 'in_progress' : 'todo',
        statusLabel: executedCount > 0 ? 'Live agent picked up' : 'Live queue waiting for agent pickup',
      });
      addWorkflowAuditEvent({
        type: 'Backend handoff',
        source: 'Create Post API',
        severity: 'Low',
        message: `${workflowId} persisted as content job; ${result.queuedRuns.length} live agent run(s) queued; ${
          result.executedRuns?.filter((run) => run.status === 'succeeded').length ?? 0
        } picked up by agent executor.`,
        itemId: workflowId,
        relatedId: result.review?.id ?? undefined,
        status: 'Live queued',
      });
      showUiNotice(`Live queue started: ${result.job.id}. ${executedCount}/${result.queuedRuns.length} agent run(s) picked up. Dashboard will move to Review after package is ready.`);
      await Promise.all([loadDashboardData(), loadReviewData(), loadPublishingData(), loadLogsData()]);
      goToPageWithTab('Dashboard', 'All', `ส่ง ${workflowId} เข้า pipeline แล้ว รอ package ครบก่อนเข้า Review Queue`);
    } catch (error: unknown) {
      applyCreateHandoffState(requestedWorkflowId, requestedReviewId, requestedPublishingId, {
        statusLabel: 'Local queue retained after backend sync issue',
      });
      addWorkflowAuditEvent({
        type: 'Backend handoff failed',
        source: 'Create Post API',
        severity: 'High',
        message: error instanceof Error ? error.message : 'Create Post backend handoff failed',
        itemId: requestedWorkflowId,
        relatedId: requestedReviewId,
        status: 'Backend handoff failed',
      });
      showUiNotice('Backend handoff failed. ไม่สามารถส่งไป backend ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const executeQueuedAgentRuns = async () => {
    if (agentExecutionLoading) {
      showUiNotice('Agent execution is already running. กรุณารอให้เสร็จสิ้นก่อนกดใหม่อีกครั้ง');
      return;
    }

    const maxRuns = 8;
    const commandId = `AGX-${Date.now()}`;
    const now = toTimestampString();
    const workflowId = selectedWorkflowItemId ?? selectedDashboardBoardItemId ?? createNextDraftWorkflowId();
    const workflowSeed = getWorkflowIdSeed(workflowId);

    if (!hasToken && (agentConnectionPreference === 'auto' || agentConnectionPreference === 'codex')) {
      const localRunJobs: AgentQueueJob[] = [
        {
          id: `${commandId}-ORCH`,
          agent: 'Agent Orchestrator',
          owner: 'Agent Orchestrator',
          stage: 'Queue claimed',
          status: 'Done',
          detail: `Local runtime check claimed ${workflowId}, selected agent routes, and kept publish locked until human approval.`,
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Content Strategy Agent',
          runMode: 'Dry-run',
        },
        {
          id: `AGQ-${workflowSeed}-SOURCE`,
          agent: 'Content Strategy Agent',
          owner: 'Content Strategy Agent',
          stage: 'Source Search complete',
          status: 'Done',
          detail: 'Codex local / GPT-5.4 grounded source context, verified the connector set, and prepared citation-safe inputs for drafting.',
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Content Strategy Agent',
          runMode: 'Dry-run',
        },
        {
          id: `AGQ-${workflowSeed}-DRAFT`,
          agent: 'Content Strategy Agent',
          owner: 'Content Strategy Agent',
          stage: 'Grounded text package ready',
          status: 'Done',
          detail: 'Codex local / GPT-5.4 generated the content text package, language requirements, topic anchor, and brand voice instructions.',
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Image & Layout Agent',
          runMode: 'Dry-run',
        },
        {
          id: `AGQ-${workflowSeed}-IMAGE`,
          agent: 'Image & Layout Agent',
          owner: 'Image & Layout Agent',
          stage: 'Visual Brief Ready',
          status: 'Done',
          detail: 'Codex local / GPT-5.4 converted approved text into image prompts, platform layout constraints, and composer-ready asset notes.',
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Legal Compliance Agent',
          runMode: 'Dry-run',
        },
        {
          id: `AGQ-${workflowSeed}-QC`,
          agent: 'Legal Compliance Agent',
          owner: 'Legal Compliance Agent',
          stage: 'Compliance Review Complete',
          status: 'Done',
          detail: 'Codex local / GPT-5.5 checked claims, source strictness, professional ethics, and review risk before handoff.',
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Publishing Agent',
          runMode: 'Dry-run',
        },
        {
          id: `AGQ-${workflowSeed}-PUBLISH`,
          agent: 'Publishing Agent',
          owner: 'Publishing Agent',
          stage: 'Awaiting Human Approval',
          status: 'Waiting review',
          detail: 'Publish is intentionally paused. Local runtime check stops before Buffer/social posting until Review Queue approval or Auto Queue.',
          createdAt: now,
          updatedAt: now,
          handoffTarget: 'Human approval',
          runMode: 'Dry-run',
        },
      ];

      setAgentExecutionLoading(true);
      setAgentQueueJobsState((current) => [
        ...localRunJobs,
        ...current.filter((job) => !job.id.startsWith(`AGQ-${workflowSeed}-`) && job.id !== `${commandId}-ORCH`),
      ].slice(0, 10));
      addWorkflowAuditEvent({
        type: 'Codex local agent run',
        source: 'Agents',
        severity: 'Low',
        message: `${workflowId} local runtime check completed: Orchestrator -> Source Search -> Draft Generation -> Image/Layout -> Compliance -> Publishing hold`,
        itemId: workflowId,
        relatedId: commandId,
        status: 'Codex local ready',
      });
      showUiNotice('Local runtime check complete: Agent queue ส่งงานครบ และหยุดก่อน publish แล้ว');
      window.setTimeout(() => setAgentExecutionLoading(false), 350);
      return;
    }

    if (!hasToken) {
      addWorkflowAuditEvent({
        type: 'Agent execution',
        source: 'Agents',
        severity: 'Medium',
        message: 'Agent execution blocked because session is not authenticated',
        itemId: selectedWorkflowItemId ?? undefined,
        relatedId: undefined,
        status: 'Blocked',
      });
      showUiNotice('Sign in first before running Agent.');
      return;
    }

    setAgentExecutionLoading(true);
    setAgentQueueJobsState((current) => [
      {
        id: commandId,
        agent: 'Agent Orchestrator',
        owner: 'Agent Orchestrator',
        stage: 'Execution pass requested',
        status: 'Running',
        detail: `Requested execution for up to ${maxRuns} queued tasks`,
        createdAt: now,
        updatedAt: now,
      },
      ...current.filter((job) => job.id !== commandId),
    ]);

    try {
      const result = await fetchWithToken<AgentExecuteResponse>('/api/agents/execute', {
        method: 'POST',
        body: JSON.stringify({ maxRuns, providerPreference: agentConnectionPreference }),
      });
      const processed = result.processed ?? 0;
      const total = result.results?.length ?? 0;
      const message =
        processed === 0
          ? total === 0
            ? 'No queued agent tasks found.'
            : `Agent execution completed: ${processed}/${total} task(s) updated.`
          : `Agent execution updated ${processed}/${total} task(s).`;

      setAgentQueueJobsState((current) =>
        current.map((job) =>
          job.id === commandId
                ? {
                    ...job,
                    status: processed > 0 ? 'Done' : 'Done',
                    stage: message.includes('updated') ? 'Execution pass' : 'Execution pass',
                    detail: message,
                    updatedAt: toTimestampString(),
                  }
                : job,
        ),
      );
      await Promise.all([loadDashboardData(), loadReviewData(), loadPublishingData(), loadLogsData()]);
      showUiNotice(`Agent execution run: ${message}`);
      addWorkflowAuditEvent({
        type: 'Agent execution',
        source: 'Agents',
        severity: 'Low',
        message: `${result.status}: processed ${processed} of ${total} queued run(s)`,
        itemId: selectedWorkflowItemId ?? undefined,
        relatedId: commandId,
        status: result.status,
      });
    } catch (error: unknown) {
      setAgentQueueJobsState((current) =>
        current.map((job) =>
          job.id === commandId
                ? {
                    ...job,
                    status: 'Queued',
                    stage: 'Execution failed',
                    detail: error instanceof Error ? error.message : 'Agent execution failed',
                    updatedAt: toTimestampString(),
                  }
                : job,
        ),
      );
      addWorkflowAuditEvent({
        type: 'Agent execution failed',
        source: 'Agents',
        severity: 'High',
        message: error instanceof Error ? error.message : 'Failed to run agent queue',
        itemId: selectedWorkflowItemId ?? undefined,
        relatedId: commandId,
        status: 'Failed',
      });
      showUiNotice('Agent execution failed');
    } finally {
      setAgentExecutionLoading(false);
    }
  };

  const syncDashboardPipelineFromReview = (item: ReviewQueueItem, decision: ReviewDecision) => {
    const workflowId = item.workflowId ?? getDashboardIdForWorkflowId(item.id);
    const publishingId = item.publishingId ?? getPublishingIdForWorkflowId(item.id);
    const targetColumn: 'Todo' | 'In Progress' | 'Done' =
      decision === 'queued' || decision === 'approved' ? 'Done' : 'In Progress';
    const syncedItem: BoardItem = {
      id: workflowId,
      title: item.title,
      owner: decision === 'queued' || decision === 'approved' ? 'Publishing Agent' : 'Content Strategy Agent',
      channel: decision === 'queued' ? 'Publishing Queue' : decision === 'approved' ? 'Publishing hold' : item.category,
      due: decision === 'queued' ? 'Queued' : decision === 'rejected' ? 'Needs edit' : 'Approved',
      risk: item.risk as BoardItem['risk'],
      tone: decision === 'rejected' ? 'rose' : decision === 'queued' ? 'emerald' : 'blue',
      stage: decision === 'queued' ? 'Publishing Queued' : decision === 'rejected' ? 'Rejected / Needs edit' : 'Approved / Awaiting Queue',
    };

    setDashboardState((current) => {
      const boardWithoutItem = current.board.map((column) => ({
        ...column,
        items: column.items.filter((boardItem) => boardItem.id !== workflowId && boardItem.id !== item.id && boardItem.id !== publishingId),
      }));
      const boardWithTarget = boardWithoutItem.some((column) => column.column === targetColumn)
        ? boardWithoutItem.map((column) =>
            column.column === targetColumn
              ? {
                  ...column,
                  items: [syncedItem, ...column.items],
                }
              : column,
          )
        : [
            ...boardWithoutItem,
            {
              column: targetColumn,
              count: 1,
              items: [syncedItem],
            },
          ];

      return {
        ...current,
        board: normalizeDashboardCounts(boardWithTarget),
      };
    });
  };

  const handleReviewDecisionSync = (item: ReviewQueueItem, decision: ReviewDecision) => {
    const isOrchestratorOwner =
      normalizeTextValue(item.owner) === 'Agent Orchestrator' || normalizeTextValue(item.createdBy) === 'Agent Orchestrator';

    if (!isOrchestratorOwner) {
      showUiNotice(`Cannot move ${item.id}: only Agent Orchestrator can move items out of In Review.`);
      return;
    }

    const workflowId = item.workflowId ?? getDashboardIdForWorkflowId(item.id);
    const publishingId = item.publishingId ?? getPublishingIdForWorkflowId(workflowId);
    const statusByDecision = {
      approved: 'Approved',
      rejected: 'Rejected',
      queued: 'Auto queued',
    };
    const updatedItem: ReviewQueueItem = {
      ...item,
      status: statusByDecision[decision],
      due: decision === 'queued' ? 'Publishing queue' : decision === 'rejected' ? 'Needs edit' : 'Approved',
    };

    setReviewQueueItemsState((current) => current.map((reviewItem) => (reviewItem.id === item.id ? updatedItem : reviewItem)));
    syncDashboardPipelineFromReview(updatedItem, decision);

    if (decision === 'queued') {
      const publishingRow: PublishingQueueRow = {
        id: publishingId,
        title: item.title,
        platform: item.platforms?.[0] ?? (item.category === 'Corporate Law' ? 'LinkedIn' : 'Facebook'),
        time: 'Next available',
        status: 'Queued',
      };
      const now = toTimestampString();
      const agentCJob: AgentQueueJob = {
        id: `AGQ-${item.id}-C`,
        agent: 'Publishing Agent',
        owner: 'Publishing Agent',
        stage: 'Publishing Queued',
        status: 'Queued',
        detail: `${item.title} is approved and waiting in Publishing Queue.`,
        createdAt: now,
        updatedAt: now,
      };

      setWorkflowPublishingRowsState((current) => [publishingRow, ...current.filter((row) => row.id !== publishingRow.id)]);
      setPublishingQueueState((current) => [publishingRow, ...current.filter((row) => row.id !== publishingRow.id)]);
      setAgentQueueJobsState((current) => [agentCJob, ...current.filter((job) => job.id !== agentCJob.id)].slice(0, 8));
      addWorkflowAuditEvent({
        type: 'Publishing handoff',
        source: 'Review Queue',
        severity: 'Low',
        message: `${workflowId} → ${item.id} → ${publishingRow.id} → Publishing Queued`,
        itemId: workflowId,
        relatedId: publishingRow.id,
        status: 'Publishing Queued',
      });
      goToPageWithTab('Publishing', 'Queue', `${workflowId} / ${item.id} ถูก Auto Queue เข้า Publishing Queue แล้ว`);
      return;
    }

    const agentJob: AgentQueueJob =
      decision === 'rejected'
        ? {
            id: `AGQ-${item.id}-${decision}`,
            agent: 'Content Strategy Agent',
            owner: 'Content Strategy Agent',
            stage: 'Needs Text Revision',
            status: 'Queued',
            detail: `${item.title} returned to text generation for revision.`,
            createdAt: toTimestampString(),
            updatedAt: toTimestampString(),
            handoffTarget: 'Image & Layout Agent',
          }
        : {
            id: `AGQ-${item.id}-${decision}`,
            agent: 'Publishing Agent',
            owner: 'Publishing Agent',
            stage: 'Approved / Awaiting Queue',
            status: 'Queued',
            detail: `${item.title} was approved by human review and is waiting for manual scheduling or Auto Queue.`,
            createdAt: toTimestampString(),
            updatedAt: toTimestampString(),
            handoffTarget: 'Publishing Queue',
          };

    setAgentQueueJobsState((current) => [agentJob, ...current.filter((job) => job.id !== agentJob.id)].slice(0, 8));
    addWorkflowAuditEvent({
      type: 'Review decision',
      source: 'Review Queue',
      severity: decision === 'rejected' ? 'Medium' : 'Low',
      message: `${workflowId} → ${item.id} → ${statusByDecision[decision]}`,
      itemId: workflowId,
      relatedId: item.id,
      status: statusByDecision[decision],
    });
    showUiNotice(`สถานะ ${item.id} sync แล้ว: ${statusByDecision[decision]}`);
  };

  const syncDashboardPipelineFromPublishing = (row: PublishingQueueRow, nextStatus: PublishingQueueRow['status']) => {
    const relatedContentId = getDashboardIdForWorkflowId(row.id);
    const reviewId = getReviewIdForWorkflowId(row.id);
    const targetColumn = nextStatus === 'Published' || nextStatus === 'Failed' ? 'Posted / Failed' : 'Publishing Queued';
    const syncedItem: BoardItem = {
      id: relatedContentId,
      title: row.title,
      owner: 'Publishing Agent',
      channel: row.platform,
      due: nextStatus === 'Published' ? 'Posted' : nextStatus === 'Failed' ? 'Failed' : 'Publishing',
      risk: nextStatus === 'Failed' ? 'High' : 'Low',
      tone: nextStatus === 'Failed' ? 'rose' : nextStatus === 'Published' ? 'emerald' : 'blue',
      stage: nextStatus === 'Published' ? 'Posted' : nextStatus === 'Failed' ? 'Failed' : nextStatus,
    };

    setDashboardState((current) => {
      const boardWithoutItem = current.board.map((column) => ({
        ...column,
        items: column.items.filter((item) => item.id !== relatedContentId && item.id !== reviewId && item.id !== row.id),
      }));
      const boardWithTarget = boardWithoutItem.some((column) => column.column === targetColumn)
        ? boardWithoutItem.map((column) =>
            column.column === targetColumn
              ? {
                  ...column,
                  items: [syncedItem, ...column.items],
                }
              : column,
          )
        : [
            ...boardWithoutItem,
            {
              column: targetColumn,
              count: 1,
              items: [syncedItem],
            },
          ];

      return {
        ...current,
        board: normalizeDashboardCounts(boardWithTarget),
      };
    });
  };

  const updatePublishingRowStatus = (queueId: string, nextStatus: PublishingQueueRow['status']) => {
    const updateRows = (rows: PublishingQueueRow[]) => rows.map((row) => (row.id === queueId ? { ...row, status: nextStatus } : row));
    const mergedRows = [
      ...workflowPublishingRowsState,
      ...publishingQueueState.filter((row) => !workflowPublishingRowsState.some((workflowRow) => workflowRow.id === row.id)),
    ];
    const currentRow = mergedRows.find((row) => row.id === queueId);

    setWorkflowPublishingRowsState(updateRows);
    setPublishingQueueState(updateRows);

    if (currentRow) {
      const syncedRow = { ...currentRow, status: nextStatus };
      const relatedContentId = getDashboardIdForWorkflowId(syncedRow.id);
      syncDashboardPipelineFromPublishing(syncedRow, nextStatus);
      addWorkflowAuditEvent({
        type: nextStatus === 'Failed' ? 'Sync failed' : 'Publishing status',
        source: syncedRow.platform,
        severity: nextStatus === 'Failed' ? 'High' : 'Low',
        message: `${relatedContentId} → ${syncedRow.id} → ${nextStatus}`,
        itemId: relatedContentId,
        relatedId: syncedRow.id,
        status: nextStatus,
      });
    }
  };

  const dashboardActiveTab = useMemo(() => normalizeDashboardTab(activeTab), [activeTab]);
  const dashboardBoard = useMemo(() => filterDashboardBoardByTab(dashboardState.board, dashboardActiveTab), [dashboardState.board, dashboardActiveTab]);
  const dashboardBoardItems = useMemo(() => dashboardState.board.flatMap((column) => column.items), [dashboardState.board]);
  const mergedPublishingQueue = useMemo(
    () => [
      ...workflowPublishingRowsState,
      ...publishingQueueState.filter((row) => !workflowPublishingRowsState.some((workflowRow) => workflowRow.id === row.id)),
    ],
    [publishingQueueState, workflowPublishingRowsState],
  );
  const selectedDashboardBoardItem = useMemo(
    () =>
      activePage === 'Dashboard'
        ? dashboardBoard.flatMap((column) => column.items).find((item) => item.id === selectedDashboardBoardItemId) ?? null
        : null,
    [activePage, dashboardBoard, selectedDashboardBoardItemId],
  );
  const selectedContentJobDetail = useMemo<ContentJobDetail | null>(() => {
    if (!selectedContentJobDetailId) {
      return null;
    }

    const workflowId = normalizeTextValue(selectedContentJobDetailId);
    const reviewId = getReviewIdForWorkflowId(workflowId);
    const publishingId = getPublishingIdForWorkflowId(workflowId);
    const targetSignatures = buildReviewQueueTargetMatchSignatures([workflowId, reviewId, publishingId, selectedContentJobDetailId]);
    const targetTokens = Array.from(targetSignatures)
      .map((value) => normalizeTextValue(value).toLowerCase())
      .filter(Boolean);
    const boardItem = dashboardBoardItems.find((item) => hasReviewQueueValueMatch(item.id, targetSignatures));
    const reviewItem = reviewQueueItemsState.find((item) => hasReviewQueueTargetMatch(item, targetSignatures));
    const publishingRow = mergedPublishingQueue.find((row) => hasReviewQueueValueMatch(row.id, targetSignatures));
    const events = workflowErrorEventsState.filter((event) => {
      const itemId = normalizeTextValue(event.itemId).toLowerCase();
      const relatedId = normalizeTextValue(event.relatedId).toLowerCase();
      const message = normalizeTextValue(event.message).toLowerCase();

      return targetTokens.some((token) => itemId === token || relatedId === token || (message.includes(token)));
    });
    const workflowSeed = getWorkflowIdSeed(workflowId);
    const agentJobs = agentQueueJobsState.filter(
      (job) =>
        job.id.includes(workflowSeed) ||
        job.detail.includes(workflowId) ||
        job.detail.includes(reviewId) ||
        job.detail.includes(publishingId),
    );
    const stage =
      boardItem?.stage ??
      (publishingRow ? publishingRow.status : reviewItem?.status === 'In Review' ? 'In Review' : reviewItem?.status ?? events[0]?.status ?? 'Brief Created');
    const eventCreatedAt = events
      .map((event) => parseReviewTimestamp(event.time))
      .filter((time): time is number => typeof time === 'number' && Number.isFinite(time))
      .reduce((latest, current) => (latest === undefined || current > latest ? current : latest), undefined as number | undefined);
    const createdAt = eventCreatedAt ?? (typeof reviewItem?.createdAt === 'number' && Number.isFinite(reviewItem.createdAt) ? reviewItem.createdAt : undefined) ?? Date.now();
    const createdBy =
      reviewItem?.createdBy || normalizeTextValue(apiActorDisplayName) || boardItem?.owner || reviewItem?.owner || 'Content Strategy Agent';
    const statusSnapshot = buildWorkflowStatusSnapshot({
      workflowId,
      reviewId,
      publishingId,
      boardItem,
      reviewItem,
      publishingRow,
      events,
      fallbackStage: stage,
    });

    return {
      workflowId,
      reviewId,
      publishingId,
      title: boardItem?.title ?? reviewItem?.title ?? publishingRow?.title ?? `Content job ${workflowId}`,
      owner: boardItem?.owner ?? reviewItem?.owner ?? 'Content Strategy Agent',
      createdAt,
      createdAtLabel: formatReviewItemDate(createdAt),
      createdBy,
      channel: boardItem?.channel ?? publishingRow?.platform ?? reviewItem?.category ?? 'Content workflow',
      category: reviewItem?.category ?? boardItem?.channel ?? publishingRow?.platform ?? 'Content',
      due: boardItem?.due ?? reviewItem?.due ?? publishingRow?.time ?? 'Not scheduled',
      risk: boardItem?.risk ?? (reviewItem?.risk as BoardItem['risk'] | undefined) ?? (publishingRow?.status === 'Failed' ? 'High' : 'Low'),
      stage,
      boardItem,
      reviewItem,
      publishingRow,
      events,
      agentJobs,
      statusSnapshot,
    };
  }, [agentQueueJobsState, apiActorDisplayName, dashboardBoardItems, mergedPublishingQueue, reviewQueueItemsState, selectedContentJobDetailId, workflowErrorEventsState]);

  useEffect(() => {
    syncPrdStateFromLocation();
    setApiToken(window.sessionStorage.getItem('prd_api_bearer_token') ?? '');
    const storedPreference = window.localStorage.getItem('prd_agent_connection_preference');

    if (storedPreference === 'auto' || storedPreference === 'multica' || storedPreference === 'codex' || storedPreference === 'openai') {
      setAgentConnectionPreference(storedPreference);
    }

    setClientInitComplete(true);
  }, [syncPrdStateFromLocation]);

  useEffect(() => {
    syncPrdStateFromLocation();
  }, [syncPrdStateFromLocation]);

  useEffect(() => {
    if (!clientInitComplete) {
      return;
    }

    window.localStorage.setItem('prd_agent_connection_preference', agentConnectionPreference);

    window.localStorage.removeItem('prd_api_bearer_token');

    if (apiToken) {
      window.sessionStorage.setItem('prd_api_bearer_token', apiToken);
      return;
    }

    window.sessionStorage.removeItem('prd_api_bearer_token');
  }, [apiToken, clientInitComplete, agentConnectionPreference]);

  useEffect(() => {
    if (!clientInitComplete) {
      return;
    }

    if (!hasToken) {
      persistReviewQueueItems(reviewQueueItemsState);
    }
  }, [clientInitComplete, hasToken, reviewQueueItemsState]);

  const loadCalendarData = useCallback(async () => {
    if (!hasToken) {
      setCalendarDaysState(fallbackCalendarDays);
      setFocusDayPostsState(fallbackFocusDayPosts);
      setCalendarDailyCapacity({});
      setCalendarFocusLabel('June 15');
      setCalendarError('Please sign in to load live calendar data.');
      return;
    }

    setCalendarLoading(true);
    setCalendarError('');
    try {
      const { start, end } = getCalendarWindow();
      const search = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
      const payload = await fetchWithToken<CalendarApiResponse>(`/api/calendar/slots?${search.toString()}`);
      const mapped = mapCalendarPayload(payload);
      setCalendarDaysState(mapped.days);
      setFocusDayPostsState(mapped.focusPosts);
      setCalendarFocusLabel(mapped.focusLabel);
      setCalendarDailyCapacity(mapped.dailySlotsByDate);
    } catch (error) {
      setCalendarError(error instanceof Error ? error.message : 'Unable to load calendar');
      setCalendarDaysState(fallbackCalendarDays);
      setFocusDayPostsState(fallbackFocusDayPosts);
      setCalendarDailyCapacity({});
      setCalendarFocusLabel('June 15');
    } finally {
      setCalendarLoading(false);
    }
  }, [fetchWithToken, hasToken]);

  async function moveCalendarPost(contentItemId: string, targetDate: string, targetHour?: number) {
    if (!hasToken) {
      setCalendarError('Please sign in to update the live calendar schedule.');
      return;
    }

    const sourcePost = calendarDaysState.flatMap((day) => day.posts).find((post) => post.id === contentItemId);

    if (!sourcePost) {
      setCalendarError('Unable to find moved item in the local calendar cache.');
      return;
    }

    const sourceTimeMinutes = parseCalendarMinutes(sourcePost.scheduledAt);
    const sourceMinute = sourceTimeMinutes !== null ? sourceTimeMinutes % 60 : 0;
    const slotHour = typeof targetHour === 'number' ? targetHour : sourceTimeMinutes !== null ? Math.floor(sourceTimeMinutes / 60) : 9;
    const scheduledAt = toCalendarSlotIso(targetDate, slotHour, sourceMinute) ?? null;

    if (!scheduledAt) {
      setCalendarError('Unable to calculate scheduled time for move action.');
      return;
    }

    setCalendarLoading(true);
    setCalendarError('');
    try {
      await fetchWithToken('/api/calendar/slots', {
        method: 'POST',
        body: JSON.stringify({
          contentItemId,
          scheduledAt,
        }),
      });
      await loadCalendarData();
    } catch (error) {
      setCalendarError(error instanceof Error ? error.message : 'Unable to reschedule content');
    } finally {
      setCalendarLoading(false);
    }
  }

  const loadPublishingData = useCallback(async () => {
    if (!hasToken) {
      setPublishingChannelsState(fallbackPublishingChannels);
      setPublishingQueueState(fallbackPublishingQueue);
      setPublishingErrorsState(fallbackPublishingErrors);
    setPublishingError('Please sign in to load live publishing data.');
      return;
    }

    setPublishingLoading(true);
    setPublishingError('');
    try {
      const payload = await fetchWithToken<PublishingApiResponse>('/api/publishing/queue');
      const mapped = mapPublishingPayload(payload);
      setPublishingChannelsState(mapped.channels);
      setPublishingQueueState(mapped.queue);
      setPublishingErrorsState(mapped.errors);
      setPublishingSummary(mapped.summary);
    } catch (error) {
      setPublishingError(error instanceof Error ? error.message : 'Unable to load publishing queue');
      setPublishingChannelsState(fallbackPublishingChannels);
      setPublishingQueueState(fallbackPublishingQueue);
      setPublishingErrorsState(fallbackPublishingErrors);
      setPublishingSummary(null);
    } finally {
      setPublishingLoading(false);
    }
  }, [fetchWithToken, hasToken]);

  const loadDashboardData = useCallback(async () => {
    const resolvedReviewQueueItemsForDashboard = reviewQueueItemsState;

    if (!hasToken) {
      setDashboardState({
        ...fallbackDashboardData,
        board: syncDashboardBoardWithInReviewItems(fallbackDashboardData.board, resolvedReviewQueueItemsForDashboard),
      });
    setDashboardError('Please sign in to load live dashboard data.');
      return;
    }

    setDashboardLoading(true);
    setDashboardError('');
    try {
      const payload = await fetchWithToken<DashboardApiPayload>('/api/dashboard/overview');
      const mapped = mapDashboardPayload({
        stats: payload.stats,
        board: payload.board,
        agents: payload.agents,
        activity: payload.activity,
      });

      setDashboardState({
        ...mapped,
        board: syncDashboardBoardWithInReviewItems(mapped.board, resolvedReviewQueueItemsForDashboard),
      });
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Unable to load dashboard');
      setDashboardState({
        ...fallbackDashboardData,
        board: syncDashboardBoardWithInReviewItems(fallbackDashboardData.board, resolvedReviewQueueItemsForDashboard),
      });
    } finally {
      setDashboardLoading(false);
    }
  }, [fetchWithToken, hasToken, reviewQueueItemsState]);

  useEffect(() => {
    if (!clientInitComplete || activePage !== 'Dashboard' || !hasToken) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadDashboardData();
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activePage, clientInitComplete, hasToken, loadDashboardData]);

  useEffect(() => {
    if (!clientInitComplete || !hasToken) {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      if (document.visibilityState !== 'visible' || agentRunnerInFlightRef.current) {
        return;
      }

      agentRunnerInFlightRef.current = true;

      try {
        const result = await fetchWithToken<AgentExecuteResponse>('/api/agents/execute', {
          method: 'POST',
          body: JSON.stringify({
            maxRuns: 3,
            providerPreference: agentConnectionPreference,
          }),
        });

        if ((result.processed ?? 0) > 0) {
          void loadDashboardData();
        }
      } catch {
        // Background runner errors are surfaced through Logs/error_events by the API.
      } finally {
        agentRunnerInFlightRef.current = false;
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [agentConnectionPreference, clientInitComplete, fetchWithToken, hasToken, loadDashboardData]);

  const loadReviewData = useCallback(async () => {
    if (!hasToken) {
      setReviewQueueItemsState((current) => {
        const sortedCurrent = sortReviewQueueItems(current);
        setDashboardState((currentDashboard) => ({
          ...currentDashboard,
          board: syncDashboardBoardWithInReviewItems(currentDashboard.board, sortedCurrent),
        }));
        return sortedCurrent;
      });
      setReviewError('Please sign in to load live review queue.');
      return;
    }

    setReviewLoading(true);
    setReviewError('');
    try {
      const payload = await fetchWithToken<ReviewApiResponse>('/api/reviews?status=in_review&limit=80');
      const mapped = mapReviewPayload(payload);
      const sorted = sortReviewQueueItems(mapped);

      setReviewQueueItemsState(() => {
        const sortedMerged = sortReviewQueueItems(sorted);
        setDashboardState((currentDashboard) => ({
          ...currentDashboard,
          board: syncDashboardBoardWithInReviewItems(currentDashboard.board, sortedMerged),
        }));

        return sortedMerged;
      });
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to load review queue');
      setReviewQueueItemsState((current) => {
        const sortedCurrent = sortReviewQueueItems(current);
        setDashboardState((currentDashboard) => ({
          ...currentDashboard,
          board: syncDashboardBoardWithInReviewItems(currentDashboard.board, sortedCurrent),
        }));
        return sortedCurrent;
      });
    } finally {
      setReviewLoading(false);
    }
  }, [fetchWithToken, hasToken]);

  useEffect(() => {
    if (!clientInitComplete || !hasToken) {
      return;
    }

    window.localStorage.removeItem(REVIEW_QUEUE_LOCAL_STORAGE_KEY);
  }, [clientInitComplete, hasToken]);

  const loadLogsData = useCallback(async () => {
    if (!hasToken) {
      setWorkflowErrorEventsState(stageAuditEvents);
    setLogsError('Please sign in to load live system logs.');
      return;
    }

    setLogsLoading(true);
    setLogsError('');
    try {
      const payload = await fetchWithToken<LogsApiResponse>('/api/logs?limit=100');
      const mapped = mapLogsPayload(payload);
      setWorkflowErrorEventsState(mapped.length > 0 ? mapped : stageAuditEvents);
    } catch (error) {
      setLogsError(error instanceof Error ? error.message : 'Unable to load logs');
      setWorkflowErrorEventsState(stageAuditEvents);
    } finally {
      setLogsLoading(false);
    }
  }, [fetchWithToken, hasToken]);

  async function updateQueueItem(queueId: string, status: 'syncing' | 'cancelled' | 'queued') {
    const mergedRows = [
      ...workflowPublishingRowsState,
      ...publishingQueueState.filter((row) => !workflowPublishingRowsState.some((workflowRow) => workflowRow.id === row.id)),
    ];
    const currentRow = mergedRows.find((row) => row.id === queueId);
    const syncAction =
      status === 'cancelled'
        ? 'cancel'
        : currentRow?.status === 'Syncing'
          ? currentRow.platform === 'WordPress'
            ? 'mark_failed'
            : 'mark_published'
          : 'publish_now';
    const nextStatus: PublishingQueueRow['status'] =
      status === 'cancelled'
        ? 'Cancelled'
        : status === 'queued'
          ? 'Queued'
          : currentRow?.status === 'Syncing'
            ? currentRow.platform === 'WordPress'
              ? 'Failed'
              : 'Published'
            : 'Syncing';

    if (!hasToken) {
      updatePublishingRowStatus(queueId, nextStatus);
      showUiNotice(`Publishing status updated locally: ${queueId} -> ${nextStatus}`);
      return;
    }

    setPublishingActionLoading(queueId);
    try {
      await fetchWithToken<{ queue: { id: string; status: string }; job: { id: string; status: string } }>(`/api/publishing/sync`, {
        method: 'POST',
        body: JSON.stringify({
          queueId,
          action: syncAction,
          externalPostId: syncAction === 'mark_published' ? `manual_publish_${queueId.slice(0, 8)}` : undefined,
          errorCode: syncAction === 'mark_failed' ? 'manual_sync_failed' : undefined,
          errorMessage: syncAction === 'mark_failed' ? 'Manual sync failed. Reconnect platform token or use manual fallback.' : undefined,
          metadata: {
            source: 'prd_publishing_ui',
            previousStatus: currentRow?.status ?? null,
            requestedStatus: status,
            nextStatus,
          },
        }),
      });
      await loadPublishingData();
      updatePublishingRowStatus(queueId, nextStatus);
      showUiNotice(`Publishing queue updated: ${queueId} → ${nextStatus}`);
    } catch (error) {
      setPublishingError(error instanceof Error ? error.message : 'Failed to update queue');
    } finally {
      setPublishingActionLoading('');
    }
  }

  // Loading current page data from effects is intentional because state depends on route context and token availability.
  useEffect(() => {
    const run = () => {
      if (activePage === 'Calendar') {
        void loadCalendarData();
      } else if (activePage === 'Dashboard') {
        void loadDashboardData();
      } else if (activePage === 'Publishing') {
        void loadPublishingData();
      } else if (activePage === 'Review Queue') {
        void loadReviewData();
      } else if (activePage === 'Logs') {
        void loadLogsData();
      } else if (!hasToken) {
        void loadDashboardData();
        void loadCalendarData();
        void loadPublishingData();
        void loadReviewData();
        void loadLogsData();
      }
    };

    void Promise.resolve().then(() => {
      run();
    });
  }, [activePage, hasToken, loadCalendarData, loadDashboardData, loadLogsData, loadPublishingData, loadReviewData]);

  useEffect(() => {
    if (!clientInitComplete || !hasToken || !selectedContentJobDetailId) {
      return undefined;
    }

    const refreshContentJobDetail = async () => {
      if (document.visibilityState !== 'visible' || contentJobDetailRefreshInFlightRef.current) {
        return;
      }

      contentJobDetailRefreshInFlightRef.current = true;

      try {
        await Promise.all([loadDashboardData(), loadReviewData(), loadLogsData(), loadPublishingData()]);
      } finally {
        contentJobDetailRefreshInFlightRef.current = false;
      }
    };

    void refreshContentJobDetail();

    const interval = window.setInterval(() => {
      void refreshContentJobDetail();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [clientInitComplete, hasToken, loadDashboardData, loadLogsData, loadPublishingData, loadReviewData, selectedContentJobDetailId]);

  const onRefresh = async () => {
    if (activePage === 'Calendar') {
      await loadCalendarData();
    } else if (activePage === 'Dashboard') {
      await loadDashboardData();
    } else if (activePage === 'Publishing') {
      await loadPublishingData();
    } else if (activePage === 'Review Queue') {
      await loadReviewData();
    } else if (activePage === 'Logs') {
      await loadLogsData();
    }
  };

  return (
    <main
      className="h-dvh min-h-dvh w-full overflow-hidden bg-[#f5f5f2] text-[#171717] antialiased"
    >
      <div className="flex h-full min-w-0">
	        <Sidebar
	          activePage={activePage}
	          onPageChange={setActivePageWithTab}
	          onSearchCommand={() => showUiNotice('Search command is available in the release roadmap.')}
	          onWorkspace={() => {
	            setMobileSidebarOpen(false);
	            showUiNotice('Workspace selector will open in production rollout.');
	          }}
	        />
	        <MobileSidebarDrawer
	          activePage={activePage}
	          open={mobileSidebarOpen}
	          onClose={() => setMobileSidebarOpen(false)}
	          onPageChange={(page) => {
	            setActivePageWithTab(page);
	            setMobileSidebarOpen(false);
	          }}
	          onSearchCommand={() => {
	            setMobileSidebarOpen(false);
	            showUiNotice('Search command is available in the release roadmap.');
	          }}
	          onWorkspace={() => {
	            setMobileSidebarOpen(false);
	            showUiNotice('Workspace selector will open in production rollout.');
	          }}
	        />

        <section className="flex min-w-0 flex-1 flex-col">
          <TopBar
            onApiTokenChange={setApiToken}
            authBypassEnabled={authBypassEnabled}
            hasToken={hasToken}
            onRefresh={onRefresh}
            onSearchCommand={() => showUiNotice('Search is not connected yet.')}
	            onOpenInbox={() => goToPage('Review Queue')}
	            onOpenNotifications={() => showUiNotice('Notifications will be connected after phase 2.')}
	            onCreate={() => goToPage('Create Post')}
	            onOpenMobileMenu={() => setMobileSidebarOpen(true)}
	          />

          {uiNotice ? (
            <div className="border-b border-[#cddbf0] bg-[#eef3ff] px-4 py-2 text-xs font-medium text-[#21458a] lg:px-6">{uiNotice}</div>
          ) : null}

          <div className="flex min-h-0 flex-1">
            <section className="flex min-w-0 flex-1 flex-col">
              <DashboardHeader
                activePage={activePage}
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  showUiNotice(`Filtered by ${tab}`);
                }}
              />

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
                {activePage === 'Dashboard' ? (
                  <DashboardView
                    data={{ ...dashboardState, board: dashboardBoard }}
                    loading={dashboardLoading}
                    error={dashboardError}
                    onNewPost={() => goToPage('Create Post')}
                    onResetState={resetDashboardState}
                    onOpenRunning={openDashboardRunningView}
                    onViewDetails={openDashboardErrorDetails}
                    onStatMoreAction={openDashboardStatAction}
                    onAddBoardItem={() => goToPage('Create Post')}
                    onOpenBoardItem={openDashboardBoardItem}
                    selectedBoardItem={selectedDashboardBoardItem}
                    onCloseBoardItem={clearDashboardBoardItem}
                    onOpenBoardInReview={openDashboardBoardItemInReview}
                    onOpenBoardInCreate={openDashboardBoardItemInCreate}
                    onOpenBoardInPublishing={openDashboardBoardItemInPublishing}
                    onOpenBoardInLogs={openDashboardBoardItemInLogs}
                    onOpenContentJobDetail={(item) => openContentJobDetail(item.id)}
                    onRunAgentQueue={executeQueuedAgentRuns}
                    isAgentRunning={agentExecutionLoading}
                  />
                ) : activePage === 'Calendar' ? (
                  <CalendarView
                    calendarDays={calendarDaysState}
                    focusDayPosts={focusDayPostsState}
                    focusLabel={calendarFocusLabel}
                    viewMode={activeTab === 'Week' ? 'Week' : activeTab === 'Day' ? 'Day' : 'Month'}
                    onModeChange={(mode) => {
                      setActiveTab(mode);
                    }}
                    loading={calendarLoading}
                    error={calendarError}
                    dailySlots={calendarDailyCapacity}
                    onMovePost={moveCalendarPost}
                    onNoopAction={(message) => showUiNotice(`Calendar action: ${message}`)}
                  />
                ) : activePage === 'Publishing' ? (
                <PublishingView
                  channels={publishingChannelsState}
                  queue={mergedPublishingQueue}
                  errors={publishingErrorsState}
                  summary={publishingSummary}
                  loading={publishingLoading}
                  actionLoading={publishingActionLoading}
                  actionError={publishingError}
                  targetQueueId={selectedContentJobDetailWorkflowId}
                  onPublishNow={requestPublishingNow}
                  onCancel={requestPublishingCancel}
                  onPublishSelected={requestPublishingSelected}
                  onOpenContentJob={(id) => openContentJobDetail(id, `เปิด Content Job Detail จาก Publishing: ${id}`)}
                  onNoopAction={(message) => showUiNotice(`Publishing action: ${message}`)}
                />
                ) : activePage === 'Analytics' ? (
                  <AnalyticsView onNoopAction={(message) => showUiNotice(`Analytics action: ${message}`)} />
                ) : activePage === 'Create Post' ? (
                  <CreatePostView
                    onNoopAction={(message) => showUiNotice(`Create Post action: ${message}`)}
                    onSendToReviewQueue={sendCreatePackageToReview}
                    onWorkflowAuditEvent={addWorkflowAuditEvent}
                    defaultCreatorName={apiActorDisplayName}
                  />
                ) : activePage === 'Content Library' ? (
                  <ContentLibraryView onNoopAction={(message) => showUiNotice(`Content Library action: ${message}`)} />
                ) : activePage === 'Knowledge Base' ? (
                  <KnowledgeBaseView apiToken={apiToken} onNoopAction={(message) => showUiNotice(`Knowledge Base action: ${message}`)} />
                ) : activePage === 'Review Queue' ? (
                <ReviewQueueView
                  items={reviewQueueItemsState}
                  loading={reviewLoading}
                  error={reviewError}
                  targetReviewItemId={selectedContentJobDetailWorkflowId}
                  actorDisplayName={apiActorDisplayName}
                  onNoopAction={(message) => showUiNotice(`Review Queue action: ${message}`)}
                  onReviewDecision={handleReviewDecisionSync}
                  onRequestReviewDecision={requestReviewDecision}
                  onOpenContentJob={(id) => openContentJobDetail(id, `เปิด Content Job Detail จาก Review Queue: ${id}`)}
                />
                ) : activePage === 'Rules & Brand' ? (
                  <RulesBrandView />
                ) : activePage === 'Agents' ? (
                  <AgentsView
                    agents={dashboardState.agents}
                    onRunAgentQueue={executeQueuedAgentRuns}
                    isRunning={agentExecutionLoading}
                    connectionPreference={agentConnectionPreference}
                  />
                ) : activePage === 'Logs' ? (
                <LogsView
                  workflowErrors={workflowErrorEventsState}
                  loading={logsLoading}
                  error={logsError}
                  targetWorkflowId={selectedContentJobDetailWorkflowId}
                  onOpenContentJob={(id) => openContentJobDetail(id, `เปิด Content Job Detail จาก Logs: ${id}`)}
                />
                ) : activePage === 'Settings' ? (
                  <SettingsView
                    agentConnectionPreference={agentConnectionPreference}
                    onAgentConnectionPreferenceChange={setAgentConnectionPreference}
                  />
                ) : (
                  <WorkspaceView page={activePage} />
                )}
              </div>
            </section>

            <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-[#deded8] bg-white xl:block">
                <AgentPanel
                  agents={dashboardState.agents}
                  activity={dashboardState.activity}
                  queueJobs={agentQueueJobsState}
                  onAgentOpen={() => goToPage('Agents')}
                  onSavePrompt={() => showUiNotice('Prompt saved to agent command draft.')}
                  onRunPrompt={executeQueuedAgentRuns}
                  isRunning={agentExecutionLoading}
                />
            </aside>
          </div>
        </section>
      </div>
      {selectedContentJobDetail ? (
        <ContentJobDetailDrawer
          detail={selectedContentJobDetail}
          onClose={closeContentJobDetail}
          onOpenDashboard={() => goToPageWithTab('Dashboard', 'All', `กลับไป Dashboard เพื่อติดตาม ${selectedContentJobDetail.workflowId}`)}
          onOpenReview={() => goToPageWithTab('Review Queue', 'Needs review', `เปิด ${selectedContentJobDetail.reviewId} ใน Review Queue`)}
          onOpenPublishing={() => goToPageWithTab('Publishing', 'Queue', `เปิด ${selectedContentJobDetail.publishingId} ใน Publishing Queue`)}
          onOpenLogs={() => goToPageWithTab('Logs', 'Dashboard', `เปิด Logs ของ ${selectedContentJobDetail.workflowId}`)}
          onDelete={() => requestContentJobDelete(selectedContentJobDetail)}
          deleteLoading={contentJobDeleteLoadingId === selectedContentJobDetail.workflowId}
        />
      ) : null}
      {pendingConfirmation ? (
        <SafetyConfirmationDialog
          confirmation={pendingConfirmation}
          reason={confirmationReason}
          onReasonChange={setConfirmationReason}
          onCancel={closeSafetyConfirmation}
          onConfirm={confirmSafetyAction}
        />
      ) : null}
    </main>
  );
}

function PrdPageLoadingFallback() {
  return (
    <main className="flex h-dvh min-h-dvh items-center justify-center bg-[#f5f5f2] px-4 text-[#171717]">
      <div className="rounded-2xl border border-[#deded8] bg-white px-4 py-3 text-sm font-medium shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        Loading PRD workspace...
      </div>
    </main>
  );
}

export default function PrdPage() {
  return (
    <Suspense fallback={<PrdPageLoadingFallback />}>
      <PrdPageClient />
    </Suspense>
  );
}

function SafetyConfirmationDialog({
  confirmation,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}: {
  confirmation: SafetyConfirmation;
  reason: string;
  onReasonChange: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const tone = confirmation.tone ?? 'default';
  const toneStyles: Record<SafetyConfirmationTone, { panel: string; badge: string; button: string }> = {
    default: {
      panel: 'border-[#deded8] bg-white',
      badge: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
      button: 'bg-[#171717] text-white hover:bg-[#2f2f2b]',
    },
    danger: {
      panel: 'border-rose-200 bg-white',
      badge: 'border-rose-200 bg-rose-50 text-rose-800',
      button: 'bg-rose-700 text-white hover:bg-rose-800',
    },
    success: {
      panel: 'border-emerald-200 bg-white',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      button: 'bg-emerald-700 text-white hover:bg-emerald-800',
    },
    info: {
      panel: 'border-[#cfd8ea] bg-white',
      badge: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
      button: 'bg-[#2f4f7f] text-white hover:bg-[#263f65]',
    },
  };
  const confirmDisabled = Boolean(confirmation.reasonRequired && !reason.trim());

  return (
    <div data-testid="safety-confirmation-dialog" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 p-3 backdrop-blur-[2px]">
      <section className={`max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-hidden overflow-y-auto rounded-2xl border shadow-2xl ${toneStyles[tone].panel}`}>
        <div className="flex items-start justify-between gap-3 border-b border-[#e8e8e4] bg-[#fbfbfa] p-4">
          <div>
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneStyles[tone].badge}`}>
              Safety confirmation
            </span>
            <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[#171717]">{confirmation.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#6e6e68]">{confirmation.description}</p>
          </div>
          <button
            onClick={onCancel}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#deded8] bg-white text-[#6e6e68] hover:bg-[#f6f6f2]"
            type="button"
          >
            <span className="sr-only">Close confirmation</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {confirmation.details?.length ? (
            <div className="rounded-xl border border-[#deded8] bg-[#f6f6f2] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a82]">Action details</p>
              <div className="mt-2 space-y-1.5">
                {confirmation.details.map((detail) => (
                  <p key={detail} className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#4f4f49]">
                    {detail}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <label className="block">
            <span className="text-xs font-semibold text-[#4f4f49]">
              {confirmation.reasonLabel ?? 'Confirmation note'}
              {confirmation.reasonRequired ? ' *' : ''}
            </span>
            <textarea
              data-testid="safety-confirmation-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#deded8] bg-white px-3 py-2 text-sm leading-relaxed text-[#171717] outline-none transition focus:border-[#2f4f7f] focus:ring-2 focus:ring-[#d9e0ef]"
              placeholder={confirmation.reasonRequired ? 'กรอกเหตุผลก่อนยืนยัน action นี้' : 'Optional note for audit log...'}
            />
          </label>

          {confirmation.reasonRequired && !reason.trim() ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Required for Reject: ต้องใส่เหตุผลเพื่อให้ทีมตรวจสอบย้อนหลังได้
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#e8e8e4] bg-[#fbfbfa] p-4 sm:flex-row sm:justify-end">
          <button
            data-testid="safety-confirmation-cancel"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#deded8] bg-white px-4 text-sm font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
            type="button"
          >
            Cancel
          </button>
          <button
            data-testid="safety-confirmation-confirm"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${toneStyles[tone].button}`}
            type="button"
          >
            {confirmation.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function EndToEndWorkflowSimulation() {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-[#171717]">End-to-end workflow simulation</h2>
              <span className="rounded-full border border-[#d8d4c8] bg-[#f6f1df] px-2 py-0.5 text-[11px] font-semibold text-[#7a5b18]">
                Stage 10
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[#6e6e68]">
              One content job should move through the same canonical workflow across Dashboard, Create Post, Review Queue, Publishing, and Logs before real backend wiring starts.
            </p>
          </div>
          <div className="rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#2f4f7f]">
            Simulation ID: SW-134 · Review: REV-134 · Publish: PUB-134
          </div>
        </div>
      </div>

      <div className="grid gap-0">
        <div className="min-w-0 overflow-x-auto p-3">
          <div className="grid min-w-[1180px] grid-cols-6 gap-3">
            {endToEndWorkflowSimulation.map((step) => (
              <article key={step.step} className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-[#cfcfc8] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">{step.step}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      step.status === 'Guarded'
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : step.status === 'Logged'
                          ? 'border-[#d9e0ef] bg-[#f4f7fd] text-[#2f4f7f]'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#171717]">{step.page}</h3>
                <p className="mt-1 text-xs font-semibold text-[#4f4f49]">{step.state}</p>
                <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-[#6e6e68]">
                  <p>
                    <span className="font-semibold text-[#171717]">Agent:</span> {step.agent}
                  </p>
                  <p>
                    <span className="font-semibold text-[#171717]">Contract:</span> {step.contract}
                  </p>
                  <p>{step.handoff}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function CommandCenterHero({
  counts,
  loading,
  error,
  onCreate,
  onReview,
  onDetails,
  onRunAgentQueue,
  isAgentRunning,
}: {
  counts: CommandCenterCounts;
  loading: boolean;
  error: string;
  onCreate: () => void;
  onReview: () => void;
  onDetails: () => void;
  onRunAgentQueue: () => void;
  isAgentRunning: boolean;
}) {
  const readiness = [
    { label: 'OpenAI', value: error.toLowerCase().includes('openai') ? 'Check' : 'Ready', tone: error.toLowerCase().includes('openai') ? 'rose' : 'emerald' },
    { label: 'Buffer', value: counts.failedPublish > 0 ? 'Needs action' : 'Ready to connect', tone: counts.failedPublish > 0 ? 'rose' : 'amber' },
    { label: 'Brand Rules', value: 'Ready', tone: 'emerald' },
    { label: 'Content Rules', value: 'Ready', tone: 'emerald' },
  ];
  const nextAction = error
    ? { title: 'System needs attention', detail: 'Review connection or token health before sending more work to agents.', action: 'View details', onClick: onDetails }
    : counts.failedPublish > 0
      ? { title: 'Resolve failed publishing', detail: `${counts.failedPublish} item(s) need retry, fallback, or platform attention.`, action: 'Open details', onClick: onDetails }
      : counts.review > 0
        ? { title: `Review ${counts.review} draft${counts.review > 1 ? 's' : ''}`, detail: 'Human approval is the main bottleneck before scheduling.', action: 'Open review', onClick: onReview }
        : { title: 'Create first batch', detail: 'Start a guided studio flow and let the agent workflow prepare text, image direction, QC, and review handoff.', action: 'Create batch', onClick: onCreate };
  const stuckWork = [
    { label: 'Drafts', value: counts.generate },
    { label: 'QC failed', value: counts.qcFailed },
    { label: 'Awaiting review', value: counts.review },
    { label: 'Scheduled', value: counts.schedule },
    { label: 'Failed publish', value: counts.failedPublish },
  ];

  return (
    <section className="rounded-[28px] border border-[#d7d3c6] bg-[#f7f2e8] p-4 shadow-[0_18px_45px_rgba(84,73,48,0.09)] lg:p-5">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#dfd7c2] bg-[#fffaf0] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8ceb5] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6a2f]">
                <Zap className="h-3.5 w-3.5" />
                Operations command
              </div>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.04em] text-[#171717] md:text-3xl">
                What needs attention today?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">
                One screen for system readiness, stuck work, agent progress, and the next human decision before content moves to publishing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onRunAgentQueue}
                disabled={isAgentRunning}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#c7b98e] bg-white px-3 text-xs font-semibold text-[#625237] ${
                  isAgentRunning ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#fbf7ed]'
                }`}
                type="button"
              >
                <Bot className="h-3.5 w-3.5" />
                {isAgentRunning ? 'Testing queue...' : 'Test agent workflow'}
              </button>
              <span className="rounded-full border border-[#d9d1bf] bg-white px-3 py-1 text-xs font-semibold text-[#625237]">
                {loading ? 'Syncing live data' : `${counts.total} active item${counts.total === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {readiness.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#e3dccd] bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a8e78]">{item.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.tone === 'emerald' ? 'bg-emerald-500' : item.tone === 'rose' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                  <p className="text-sm font-semibold text-[#171717]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-5">
            {stuckWork.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#e5dfd1] bg-[#fbf7ed] px-3 py-3">
                <p className="text-xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</p>
                <p className="mt-1 text-[11px] font-medium text-[#746b59]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#d5ccb7] bg-[#252015] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d6c7a7]">
            <ShieldCheck className="h-4 w-4" />
            Next action
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">{nextAction.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#d7cfbd]">{nextAction.detail}</p>
          <button
            onClick={nextAction.onClick}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#f0c36a] px-4 text-sm font-semibold text-[#211a0e] shadow-[0_12px_24px_rgba(0,0,0,0.18)] hover:bg-[#f6d386]"
          >
            {nextAction.action}
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d6c7a7]">Human control point</p>
            <p className="mt-2 text-sm leading-relaxed text-[#efe8d6]">
              Agents can generate, compose, check, and queue work. Approval stays with the reviewer before anything goes live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowPipelineOverview({ counts }: { counts: CommandCenterCounts }) {
  const steps = [
    { label: 'Brief', value: counts.brief, icon: PenLine },
    { label: 'Rules', value: counts.rules, icon: FileText },
    { label: 'Generate', value: counts.generate, icon: Sparkles },
    { label: 'QC', value: counts.qc, icon: ShieldCheck },
    { label: 'Review', value: counts.review, icon: Eye },
    { label: 'Schedule', value: counts.schedule, icon: Clock3 },
    { label: 'Publish', value: counts.publish, icon: UploadCloud },
  ];

  return (
    <section className="mt-4 rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-semibold text-[#171717]">Publishing pipeline overview</h2>
          <p className="mt-0.5 text-xs text-[#6e6e68]">Brief → Rules → Generate → QC → Review → Schedule → Publish</p>
        </div>
        <span className="rounded-full border border-[#deded8] bg-[#f4f4f2] px-2.5 py-1 text-[11px] font-semibold text-[#6e6e68]">
          Agent handoff map
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="rounded-2xl border border-[#e5e5df] bg-[#fbfbfa] p-3">
              <div className="flex items-center justify-between gap-2">
                <Icon className="h-4 w-4 text-[#7c6a45]" />
                <span className="text-lg font-semibold tracking-[-0.04em] text-[#171717]">{step.value}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#484844]">{step.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DashboardView({
  data,
  loading,
  error,
  onNewPost,
  onResetState,
  onOpenRunning,
  onViewDetails,
  onStatMoreAction,
  onAddBoardItem,
  onOpenBoardItem,
  selectedBoardItem,
  onCloseBoardItem,
  onOpenBoardInReview,
  onOpenBoardInCreate,
  onOpenBoardInPublishing,
  onOpenBoardInLogs,
  onOpenContentJobDetail,
  onRunAgentQueue,
  isAgentRunning,
}: {
  data: { stats: DashboardStat[]; board: DashboardBoard[]; agents: DashboardAgent[]; activity: DashboardActivity[] };
  loading: boolean;
  error: string;
  onNewPost: () => void;
  onResetState: () => void;
  onOpenRunning: () => void;
  onViewDetails: () => void;
  onStatMoreAction: (action: DashboardStatAction) => void;
  onAddBoardItem: () => void;
  onOpenBoardItem: (item: BoardItem) => void;
  selectedBoardItem: BoardItem | null;
  onCloseBoardItem: () => void;
  onOpenBoardInReview: (item: BoardItem) => void;
  onOpenBoardInCreate: (item: BoardItem) => void;
  onOpenBoardInPublishing: (item: BoardItem) => void;
  onOpenBoardInLogs: (item: BoardItem) => void;
  onOpenContentJobDetail: (item: BoardItem) => void;
  onRunAgentQueue: () => void;
  isAgentRunning: boolean;
}) {
  const commandCounts = getCommandCenterCounts(data.board);

  return (
    <>
      {loading && <p className="mb-3 text-sm font-medium text-[#6e6e68]">Loading live dashboard data...</p>}
      {error && <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <CommandCenterHero
        counts={commandCounts}
        loading={loading}
        error={error}
        onCreate={onNewPost}
        onReview={onViewDetails}
        onDetails={onViewDetails}
        onRunAgentQueue={onRunAgentQueue}
        isAgentRunning={isAgentRunning}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} onMoreAction={() => onStatMoreAction(stat.action)} />
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#171717]">Content Pipeline</h2>
              <span className="rounded-full border border-[#deded8] bg-[#f4f4f2] px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">
                Board
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Operational board for the same workflow: Brief → Rules → Generate → QC → Review → Schedule → Publish.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewPost}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
            >
              <Plus className="h-3.5 w-3.5" />
              New post
            </button>
          </div>
        </div>

        <div className="bg-[#fbfbfa] p-3">
          {data.board.length ? (
            <>
              <MobileBoardStack
                board={data.board}
                selectedBoardItemId={selectedBoardItem?.id}
                onAddBoardItem={onAddBoardItem}
                onOpenBoardItem={onOpenBoardItem}
              />
              <div className="hidden overflow-x-auto lg:block">
                <div className="grid min-w-[1680px] grid-cols-7 gap-3">
                  {data.board.map((column) => (
                    <BoardColumn
                      key={column.column}
                      column={column.column}
                      count={column.count}
                      items={column.items}
                      selectedBoardItemId={selectedBoardItem?.id}
                      onAddBoardItem={onAddBoardItem}
                      onOpenBoardItem={onOpenBoardItem}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[#deded8] bg-white p-4 text-sm text-[#6e6e68]">
              <p>ไม่มีคอลัมน์แสดงผลในมุมมองนี้ กรุณาสร้างโพสต์ใหม่เพื่อเริ่มคิวงาน</p>
              <div className="mt-3 flex gap-2">
                <button onClick={onNewPost} className="rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717]">
                  New post
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedBoardItem ? (
          <div className="mx-4 my-4 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#171717]">Board item context</h2>
                  <RiskBadge risk={selectedBoardItem.risk} />
                </div>
                <p className="mt-1 text-xs text-[#6e6e68]">{selectedBoardItem.title}</p>
                <p className="mt-2 text-[11px] text-[#8a8a82]">{formatBoardItemContextLabel(selectedBoardItem)}</p>
              </div>
              <button
                onClick={onCloseBoardItem}
                className="inline-flex h-8 items-center rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              >
                Close
              </button>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-[#4f4f49] md:grid-cols-3">
              <div className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="font-semibold text-[#171717]">Channel</div>
                <div>{selectedBoardItem.channel}</div>
              </div>
              <div className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="font-semibold text-[#171717]">Due</div>
                <div>{selectedBoardItem.due}</div>
              </div>
              <div className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="font-semibold text-[#171717]">Owner</div>
                <div>{selectedBoardItem.owner}</div>
              </div>
            </div>
            <DashboardLifecycleDetail item={selectedBoardItem} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => onOpenContentJobDetail(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg bg-[#171717] px-3 text-xs font-semibold text-white hover:bg-[#2f2f2b]"
              >
                Open job detail
              </button>
              <button
                onClick={() => onOpenBoardInReview(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
              >
                Open in Review Queue
              </button>
              <button
                onClick={() => onOpenBoardInCreate(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 text-xs font-semibold text-[#2f4f7f] hover:bg-white"
              >
                Create follow-up post
              </button>
              <button
                onClick={() => onOpenBoardInPublishing(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              >
                Open Publishing Queue
              </button>
              <button
                onClick={() => onOpenBoardInLogs(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              >
                Open Logs
              </button>
            </div>
          </div>
        ) : null}
      </div>

    </>
  );
}

function StatePreviewStrip({
  onResetState,
  onOpenRunning,
  onViewDetails,
}: {
  onResetState: () => void;
  onOpenRunning: () => void;
  onViewDetails: () => void;
}) {
  return (
    <section className="mt-4 grid gap-3 lg:grid-cols-3">
      <SystemStateCard
        icon={Search}
        title="Empty state"
        label="No matching content"
        description="Use this when search/filter returns nothing. Offer a clear reset or create action."
        action="Reset filters"
        onClickAction={onResetState}
      />
      <SystemStateCard
        icon={Clock3}
        title="Loading state"
        label="AI is checking sources"
        description="Use while RAG, generation, compliance checks, or publishing sync is running."
        action="Running..."
        muted
        onClickAction={onOpenRunning}
      />
      <SystemStateCard
        icon={ShieldCheck}
        title="Error state"
        label="Action needs attention"
        description="Use for expired tokens, failed sync, missing citation, or blocked generation."
        action="View details"
        warning
        onClickAction={onViewDetails}
      />
    </section>
  );
}

function ResponsiveQaStrip() {
  const checkpoints = [
    { label: 'Mobile', value: '360-430px', detail: 'Sidebar drawer, stacked cards, scroll-safe dialogs' },
    { label: 'Tablet', value: '768px', detail: 'Stacked panels, horizontal tables inside cards' },
    { label: 'Desktop', value: '1280px+', detail: 'Kanban, right agent rail, full workflow surfaces' },
  ];

  return (
    <section className="mt-3 rounded-2xl border border-[#d9e0ef] bg-[#f8fbff] p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#172033]">Responsive QA guard</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#4d6281]">
            Stage 8 keeps wide boards and tables inside controlled scroll containers while preserving mobile access to every workflow.
          </p>
        </div>
        <span className="rounded-full border border-[#cfd8ea] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#2f4f7f]">
          Viewport-safe
        </span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {checkpoints.map((item) => (
          <div key={item.label} className="rounded-xl border border-[#d9e0ef] bg-white px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6c7fa0]">{item.label}</div>
            <div className="mt-1 text-xs font-semibold text-[#172033]">{item.value}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#5d6f8a]">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SystemStateCard({
  action,
  description,
  icon: Icon,
  label,
  muted = false,
  title,
  warning = false,
  onClickAction,
}: {
  action: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  muted?: boolean;
  title: string;
  warning?: boolean;
  onClickAction: () => void;
}) {
  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)] ${warning ? 'border-amber-200' : 'border-[#deded8]'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${warning ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{title}</div>
          <h3 className="mt-1 text-sm font-semibold text-[#171717]">{label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{description}</p>
        </div>
      </div>
      <button
        onClick={onClickAction}
        className={`mt-3 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
          muted
            ? 'border-[#deded8] bg-[#f6f6f2] text-[#8a8a82]'
            : warning
              ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-white'
              : 'border-[#cfcfc8] bg-[#f6f6f2] text-[#171717] hover:bg-white'
        }`}
      >
        {action}
      </button>
    </div>
  );
}

function CalendarView({
  calendarDays,
  focusDayPosts,
  focusLabel,
  loading,
  error,
  onMovePost,
  viewMode,
  onModeChange,
  dailySlots,
  onNoopAction,
}: {
  calendarDays: CalendarDay[];
  focusDayPosts: CalendarFocusPost[];
  focusLabel: string;
  loading?: boolean;
  error?: string;
  dailySlots?: Record<string, CalendarCapacity>;
  viewMode: 'Month' | 'Week' | 'Day';
  onModeChange: (mode: 'Month' | 'Week' | 'Day') => void;
  onMovePost?: (contentItemId: string, targetDate: string, targetHour?: number) => void;
  onNoopAction: (message: string) => void;
}) {
  const calendarDaysMapWarning = dailySlots || {};
  const inferDefaultDateKey = useCallback(() => {
    const focusedDates = focusDayPosts
      .map((post) => {
        if (!post.scheduledAt) {
          return null;
        }

        return toAppDateKey(post.scheduledAt);
      })
      .filter((value): value is string => Boolean(value));

    const fromFocus = focusedDates.find((dateKey) => calendarDays.some((day) => day.dateKey === dateKey));
    if (fromFocus) {
      return fromFocus;
    }

    const todayKey = toLocalDateKeyFromDate(new Date());
    if (calendarDays.some((day) => day.dateKey === todayKey)) {
      return todayKey;
    }

    return calendarDays.find((day) => !day.muted)?.dateKey ?? calendarDays[0]?.dateKey;
  }, [calendarDays, focusDayPosts]);
  const [manualSelectedDateKey, setManualSelectedDateKey] = useState<string | undefined>(inferDefaultDateKey);
  const selectedDateKey = useMemo(() => {
    const inferred = inferDefaultDateKey();
    if (!manualSelectedDateKey) {
      return inferred;
    }

    if (calendarDays.some((day) => day.dateKey === manualSelectedDateKey)) {
      return manualSelectedDateKey;
    }

    return inferred;
  }, [calendarDays, inferDefaultDateKey, manualSelectedDateKey]);
  const [calendarDensity, setCalendarDensity] = useState<'Compact' | 'Comfortable'>('Compact');
  const [selectedReschedulePost, setSelectedReschedulePost] = useState<CalendarDayPost | null>(null);
  const [calendarFallbackNotice, setCalendarFallbackNotice] = useState('Tap a content block to reschedule without drag-and-drop.');

  const selectedDateIndex = selectedDateKey ? calendarDays.findIndex((day) => day.dateKey === selectedDateKey) : -1;
  const normalizedSelectedIndex = selectedDateIndex >= 0 ? selectedDateIndex : 0;
  const selectedWeekday = selectedDateKey ? toWeekdayIndex(selectedDateKey) : normalizedSelectedIndex % 7;
  const selectedWeekdaySafe = selectedWeekday >= 0 ? selectedWeekday : normalizedSelectedIndex % 7;
  const weekStartIndex = Math.max(0, Math.min(normalizedSelectedIndex - selectedWeekdaySafe, Math.max(0, calendarDays.length - 7)));
  const selectedDay = calendarDays[normalizedSelectedIndex] ?? calendarDays[0];
  const selectedDayPosts = useMemo(() => selectedDay?.posts ?? [], [selectedDay]);
  const selectedDayLabel = selectedDay ? formatCalendarDateLabel(selectedDay.dateKey, focusLabel) : focusLabel;
  const visiblePostsLimit = calendarDensity === 'Compact' ? 2 : 4;
  const weekCoverage = getCalendarWeekCoverage(calendarDays, weekStartIndex);
  const dayGap = weekCoverage.filter((item) => !item.covered).length;
  const selectedDayPostsWithTime = selectedDayPosts.map((post) => ({
    ...post,
    time: formatFocusTime(post.scheduledAt),
  }));
  const calendarDisplayDays = useMemo(() => {
    if (viewMode === 'Month') {
      return calendarDays;
    }

    if (viewMode === 'Week') {
      return calendarDays.slice(weekStartIndex, weekStartIndex + 7);
    }

    return selectedDay ? [selectedDay] : [];
  }, [calendarDays, viewMode, weekStartIndex, selectedDay]);
  const calendarTimelineHours = useMemo(() => getCalendarTimelineHours(calendarDisplayDays), [calendarDisplayDays]);
  const dayPostsByHour = useMemo(() => buildPostsByHour(selectedDayPosts, calendarTimelineHours), [selectedDayPosts, calendarTimelineHours]);
  const weekPostsByDay = useMemo(
    () =>
      calendarDisplayDays.map((day) => ({
        day,
        postsByHour: buildPostsByHour(day.posts, calendarTimelineHours),
      })),
    [calendarDisplayDays, calendarTimelineHours],
  );
  const daySlotVisibleLimit = calendarDensity === 'Compact' ? 1 : 2;
  const weekSlotVisibleLimit = calendarDensity === 'Compact' ? 1 : 2;

  const getDayPostsLimit = (day: CalendarDay) => {
    const slot = day.dateKey ? calendarDaysMapWarning[day.dateKey] : undefined;
    const count = slot?.count ?? day.posts.length;
    const isNotice = slot ? slot.warning === 'notice' : count >= 3 && count < 5;
    const isCritical = slot ? slot.warning === 'critical' : count >= 5;

    if (count <= 2) {
      return null;
    }

    return {
      countText: `${count}/5`,
      tone: isCritical ? 'critical' : isNotice ? 'notice' : 'ok',
    };
  };

  const handleDrop = (
    event: { dataTransfer: DataTransfer; preventDefault: () => void },
    targetDate: string | undefined,
    targetHour?: number,
  ) => {
    if (!onMovePost || !targetDate) {
      return;
    }

    event.preventDefault();

    const payload = event.dataTransfer.getData('application/json');
    if (!payload) {
      return;
    }

    try {
      const parsed = JSON.parse(payload) as { contentItemId?: string };
      if (!parsed?.contentItemId) {
        return;
      }

      onMovePost(parsed.contentItemId, targetDate, targetHour);
    } catch {
      return;
    }
  };

  const handleDragOver = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const selectDate = (dateKey: string | undefined) => {
    if (!dateKey) {
      return;
    }

    setManualSelectedDateKey(dateKey);
  };

  const selectPostForReschedule = (post: CalendarDayPost) => {
    setSelectedReschedulePost(post);
    setCalendarFallbackNotice(`${post.title} selected. Choose a target slot from the fallback panel.`);
  };

  const rescheduleSelectedPost = (targetHour?: number) => {
    if (!selectedReschedulePost || !selectedDay?.dateKey) {
      setCalendarFallbackNotice('Select a content block and target day before rescheduling.');
      return;
    }

    if (!onMovePost) {
      setCalendarFallbackNotice('Live reschedule is unavailable until calendar API is connected.');
      return;
    }

    onMovePost(selectedReschedulePost.id, selectedDay.dateKey, targetHour);
    setCalendarFallbackNotice(
      `${selectedReschedulePost.title} moved to ${formatCalendarDateLabel(selectedDay.dateKey, selectedDay.date)}${targetHour ? ` at ${formatHourLabel(targetHour)}` : ''}.`,
    );
  };

  return (
    <div className="grid gap-4">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#171717]">Calendar</h2>
              <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">
                Publishing calendar
              </span>
              <span className="rounded-full border border-[#d9e0ef] bg-[#f4f7fd] px-2 py-0.5 text-[11px] font-semibold text-[#2f4f7f]">
                Timezone locked: Thailand
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Drag content blocks or tap Reschedule to move publish date and time.</p>
            {error && <p className="mt-1 text-[11px] font-semibold text-rose-700">{error}</p>}
            {loading && <p className="mt-1 text-[11px] font-semibold text-[#6e6e68]">Loading live calendar data...</p>}
          </div>

          <div className="flex items-center rounded-xl border border-[#deded8] bg-[#f4f4f2] p-1">
            {['Month', 'Week', 'Day'].map((view) => (
              <button
                key={view}
                onClick={() => {
                  onModeChange(view as 'Month' | 'Week' | 'Day');
                  onNoopAction(`Switched calendar view to ${view}`);
                }}
                className={`h-8 rounded-lg px-3 text-xs font-medium ${
                  view === viewMode ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68] hover:text-[#171717]'
                }`}
                type="button"
              >
                {view}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-xl border border-[#deded8] bg-[#f4f4f2] p-1">
            {['Compact', 'Comfortable'].map((view) => (
              <button
                key={view}
                onClick={() => {
                  setCalendarDensity(view as 'Compact' | 'Comfortable');
                  onNoopAction(`Switched calendar density to ${view}`);
                }}
                className={`h-8 rounded-lg px-3 text-xs font-medium ${
                  view === calendarDensity ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68] hover:text-[#171717]'
                }`}
                type="button"
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'Month' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 border-b border-[#e8e8e4] bg-[#fbfbfa]">
                {calendarWeekdayNames.map((day) => (
                  <div
                    key={day}
                    className="border-r border-[#e8e8e4] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82] last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 bg-[#fbfbfa]">
                {calendarDisplayDays.map((day, index) => {
                  const dayCapacity = day ? getDayPostsLimit(day) : null;
                  const isSelected = day.dateKey ? day.dateKey === selectedDateKey : false;
                  const dayIndex = day.date ? Number(day.date) : index + 1;

                  return (
                    <div
                      key={`${day.date}-${day.dateKey ?? dayIndex}`}
                      className={`min-h-[132px] border-r border-b border-[#e8e8e4] bg-white p-2 last:border-r-0 ${
                        onMovePost ? 'cursor-pointer' : ''
                      } ${isSelected ? 'ring-2 ring-[#4f6f9f] bg-[#f4f7ff]' : 'hover:bg-[#fbfdff]'}`}
                      onDrop={(event) => handleDrop(event, day.dateKey)}
                      onDragOver={handleDragOver}
                      onClick={() => selectDate(day.dateKey)}
                    >
                      <div
                        className={`mb-2 flex items-center justify-between text-xs font-semibold ${day.muted ? 'text-[#b4b4ad]' : 'text-[#4f4f49]'}`}
                      >
                        <span>{day.date}</span>
                        {dayCapacity && dayCapacity.tone !== 'ok' ? (
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                              dayCapacity.tone === 'critical'
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {dayCapacity.countText}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-1.5">
                        {day.posts.slice(0, visiblePostsLimit).map((post) => (
                          <CalendarPost key={`${day.date}-${post.id}`} post={post} draggable={Boolean(onMovePost)} onReschedule={selectPostForReschedule} />
                        ))}
                        {day.posts.length > visiblePostsLimit && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onNoopAction(`Open full day post list for ${formatCalendarDateLabel(day.dateKey, day.date)}`);
                            }}
                            className="w-full rounded-md border border-dashed border-[#cfcfc8] bg-[#f6f6f2] px-2 py-1 text-left text-[11px] font-semibold text-[#6e6e68] hover:bg-white"
                            type="button"
                          >
                            +{day.posts.length - visiblePostsLimit} more posts
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {viewMode === 'Week' ? (
          <div className="grid max-h-[820px] overflow-auto border border-[#ecece8] bg-[#fbfbfa]">
            <div className="sticky top-0 z-10 grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-[#e8e8e4] bg-[#fbfbfa]">
              <div className="border-r border-[#e8e8e4] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8a8a82]">Time</div>
              {weekPostsByDay.map(({ day }, dayIndex) => {
                const dateKey = day.dateKey;
                const weekdayIndex = dateKey ? toWeekdayIndex(dateKey) : dayIndex;
                const isSelected = dateKey ? dateKey === selectedDateKey : false;
                const dayCapacity = getDayPostsLimit(day);

                return (
                  <div
                    key={`${day.dateKey ?? day.date}-${day.date}`}
                    className={`border-r border-[#e8e8e4] px-3 py-2 last:border-r-0 ${isSelected ? 'bg-[#f4f7ff]' : 'bg-[#fbfbfa]'}`}
                  >
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        day.muted ? 'text-[#b4b4ad]' : 'text-[#6e6e68]'
                      }`}
                    >
                      {calendarWeekdayNames[Math.min(Math.max(weekdayIndex, 0), 6)] ?? 'Day'}
                    </div>
                    <div
                      className={`mt-1 flex items-center justify-between text-sm font-semibold ${day.muted ? 'text-[#b4b4ad]' : 'text-[#171717]'}`}
                    >
                      <span>{day.date}</span>
                      {dayCapacity && dayCapacity.tone !== 'ok' ? (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            dayCapacity.tone === 'critical'
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {dayCapacity.countText}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {calendarTimelineHours.map((hour) => {
              return (
                <div
                  key={`hour-row-${hour}`}
                  className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-[#ecece8] last:border-b-0"
                >
                  <div className="border-r border-[#ecece8] bg-[#f3f3ef] px-2 py-2 text-right text-[10px] font-semibold text-[#86867f]">
                    <span className="inline-block rounded-md border border-[#deded8] bg-white px-2 py-1">{formatHourLabel(hour)}</span>
                  </div>
                  {weekPostsByDay.map(({ day, postsByHour }) => {
                    const selectedSlot = postsByHour.find((slot) => slot.hour === hour);
                    const hasAny = (selectedSlot?.posts.length ?? 0) > 0;
                    const isSelected = day.dateKey ? day.dateKey === selectedDateKey : false;
                    const now = new Date();
                    const nowParts = toBangkokDateParts(now);
                    const todaySlot = nowParts ? nowParts.hour === hour && day.dateKey === `${nowParts.year}-${toDateParts(nowParts.month)}-${toDateParts(nowParts.day)}` : false;
                    return (
                      <div
                        key={`${day.date}-${hour}`}
                        className={`border-r border-[#e8e8e4] bg-white px-2 py-1 last:border-r-0 ${isSelected ? 'bg-[#f4f7ff]/55' : ''} ${todaySlot ? 'bg-[#f8fbff]' : ''}`}
                        onDrop={(event) => handleDrop(event, day.dateKey, hour)}
                        onDragOver={handleDragOver}
                        onClick={() => selectDate(day.dateKey)}
                      >
                        <div className="space-y-1">
                          {selectedSlot?.posts.slice(0, weekSlotVisibleLimit).map((post) => (
                            <CalendarPost key={`${day.date}-${post.id}`} post={post} draggable={Boolean(onMovePost)} onReschedule={selectPostForReschedule} />
                          ))}
                          {selectedSlot && selectedSlot.posts.length > weekSlotVisibleLimit ? (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onNoopAction(`Open full schedule for ${day.dateKey ? formatCalendarDateLabel(day.dateKey, day.date) : day.date}`);
                              }}
                              className="w-full rounded-md border border-dashed border-[#cfcfc8] bg-[#f6f6f2] px-2 py-1 text-left text-[10px] font-semibold text-[#6e6e68] hover:bg-white"
                              type="button"
                            >
                              +{selectedSlot.posts.length - weekSlotVisibleLimit} more
                            </button>
                          ) : null}
                          {!hasAny && calendarDensity === 'Comfortable' ? <span className="text-[10px] text-[#b8b8af]">No posts</span> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : null}

        {viewMode === 'Day' ? (
          <div className="bg-[#fbfbfa]">
            <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
              <div className="text-xs text-[#8a8a82]">รายงานตามลำดับเวลา</div>
              <div className="mt-0.5 text-sm font-semibold text-[#171717]">
                {selectedDayLabel}
              </div>
            </div>

            <div className="max-h-[680px] overflow-y-auto border-t border-[#e8e8e4]">
              <div className="divide-y divide-[#e8e8e4]">
                {dayPostsByHour.map((slot) => {
                  const hasPosts = slot.posts.length > 0;
                  const now = new Date();
                  const nowParts = toBangkokDateParts(now);
                  const isNow = nowParts ? nowParts.hour === slot.hour && selectedDay?.dateKey === `${nowParts.year}-${toDateParts(nowParts.month)}-${toDateParts(nowParts.day)}` : false;

                  return (
                    <div
                      key={`${selectedDay?.dateKey}-${slot.hour}`}
                      className={`grid grid-cols-[74px_1fr] bg-white ${isNow ? 'bg-[#f4f8ff]' : ''}`}
                      onDrop={(event) => handleDrop(event, selectedDay?.dateKey, slot.hour)}
                      onDragOver={handleDragOver}
                    >
                      <div className="border-r border-[#e8e8e4] bg-[#f3f3ef] px-2 py-3 text-right text-[11px] font-semibold text-[#86867f]">
                        <span className="inline-block rounded-md border border-[#deded8] bg-white px-2 py-1">{formatHourLabel(slot.hour)}</span>
                      </div>
                      <div className="min-h-[72px] space-y-1 px-2 py-2">
                        {slot.posts.slice(0, daySlotVisibleLimit).map((post) => {
                          const postTime = formatFocusTime(post.scheduledAt);
                          return (
                            <div
                              key={`${selectedDay?.dateKey}-${post.id}`}
                              className="grid grid-cols-[44px_1fr] gap-2"
                            >
                              <div className="pt-1 text-[11px] font-semibold text-[#8a8a82]">{postTime}</div>
                              <CalendarPost post={post} draggable={Boolean(onMovePost)} onReschedule={selectPostForReschedule} />
                            </div>
                          );
                        })}
                        {slot.posts.length > daySlotVisibleLimit ? (
                          <button
                            onClick={() => onNoopAction(`Open full day post list for ${selectedDayLabel}`)}
                            className="inline-flex rounded-md border border-dashed border-[#cfcfc8] bg-[#f6f6f2] px-2 py-1 text-left text-[11px] font-semibold text-[#6e6e68] hover:bg-white"
                            type="button"
                          >
                            +{slot.posts.length - daySlotVisibleLimit} more posts
                          </button>
                        ) : null}
                        {!hasPosts ? (
                          <p className="text-[11px] text-[#b9b9b3]">{calendarDensity === 'Comfortable' ? 'No scheduled posts in this slot.' : '\u00a0'}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#171717]">Selected day</h2>
                <p className="mt-1 text-xs text-[#6e6e68]">
                  {selectedDayLabel} · {selectedDayPosts.length} posts scheduled
                </p>
              </div>
            <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
              {viewMode}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {selectedDayPosts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#d0d0ca] px-3 py-2 text-xs text-[#6e6e68]">No posts scheduled for this date.</p>
            ) : null}
            {selectedDayPostsWithTime.map((post) => (
              <div key={`${post.id}-${post.title}`} className="grid grid-cols-[44px_1fr] gap-3">
                <div className="pt-1 text-[11px] font-semibold text-[#8a8a82]">{post.time}</div>
                <CalendarPost post={post} draggable={Boolean(onMovePost)} onReschedule={selectPostForReschedule} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h2 className="text-sm font-semibold text-[#171717]">Status legend</h2>
          <div className="mt-3 space-y-2">
            <LegendDot label="Queued / waiting to publish" tone="queued" />
            <LegendDot label="Posted successfully" tone="posted" />
            <LegendDot label="Draft / not ready" tone="draft" />
            <LegendDot label="Issue / needs attention" tone="issue" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#cfd8ea] bg-[#f8fbff] p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#cfd8ea] bg-white text-[#2f4f7f]">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#171717]">Reschedule fallback</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Mobile and keyboard users can move posts without drag-and-drop.</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-[#cfd8ea] bg-white p-3">
            <div className="text-xs font-semibold text-[#171717]">
              {selectedReschedulePost ? selectedReschedulePost.title : 'No content selected'}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{calendarFallbackNotice}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                disabled={!selectedReschedulePost}
                onClick={() => rescheduleSelectedPost()}
                className="rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#2f4f7f] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                Move to selected day
              </button>
              <button
                disabled={!selectedReschedulePost}
                onClick={() => rescheduleSelectedPost(10)}
                className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                Move to 10:00
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Weekly service coverage</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Checks whether this week covers the office service mix.</p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {dayGap} gap
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {weekCoverage.map((item) => (
              <div key={item.service} className="flex items-center justify-between rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 py-2">
                <div>
                  <div className="text-xs font-semibold text-[#171717]">{item.service}</div>
                  <div className="mt-0.5 text-[11px] text-[#6e6e68]">
                    {item.day} cadence · {item.actualCount}/{item.targetCount} planned
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    item.covered
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {item.covered ? 'Covered' : 'Gap'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">Drag & drop behavior</h2>
          <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">
            Planned interaction: drag a content block to another day, then the system updates scheduled_at, checks channel conflicts, and warns if service coverage becomes unbalanced.
          </p>
        </section>
      </aside>
    </div>
  );
}

function PublishingView({
  channels,
  queue,
  errors,
  summary,
  loading,
  actionLoading,
  actionError,
  targetQueueId,
  onPublishNow,
  onCancel,
  onPublishSelected,
  onOpenContentJob,
  onNoopAction,
}: {
  channels: PublishingChannelSummary[];
  queue: PublishingQueueRow[];
  errors: PublishingErrorRow[];
  summary: Record<string, number> | null;
  loading: boolean;
  actionLoading: string;
  actionError: string;
  targetQueueId?: string | null;
  onPublishNow: (id: string) => void;
  onCancel: (id: string) => void;
  onPublishSelected: (ids: string[], onConfirmed: () => void) => void;
  onOpenContentJob: (id: string) => void;
  onNoopAction: (message: string) => void;
  }) {
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const publishableQueue = queue.filter((item) => item.status === 'Ready' || item.status === 'Queued');
  const targetQueueSignatures = targetQueueId ? buildReviewQueueTargetMatchSignatures([targetQueueId]) : null;
  const targetQueueItem = targetQueueSignatures ? queue.find((item) => hasReviewQueueValueMatch(item.id, targetQueueSignatures)) ?? null : null;
  const isTargetQueueItem = (item: PublishingQueueRow) => (targetQueueSignatures ? hasReviewQueueValueMatch(item.id, targetQueueSignatures) : false);
  const selectedCount = selectedQueueIds.length;
  const allPublishableSelected = publishableQueue.length > 0 && publishableQueue.every((item) => selectedQueueIds.includes(item.id));
  const failedChannel = channels.find((channel) => channel.status === 'Failed');
  const latestError = errors[0];
  const publishingLocked = !planEntitlements.publishingIntegrations;
  const operationalBuckets = [
    { label: 'Approved unscheduled', value: queue.filter((item) => (item.status === 'Ready' || item.status === 'Queued') && item.time === 'Unscheduled').length },
    { label: 'Scheduled', value: queue.filter((item) => (item.status === 'Ready' || item.status === 'Queued') && item.time !== 'Unscheduled').length },
    { label: 'Failed', value: queue.filter((item) => item.status === 'Failed').length },
    { label: 'Manual action', value: queue.filter((item) => item.status === 'Failed' || item.status === 'Cancelled').length },
    { label: 'Published log', value: queue.filter((item) => item.status === 'Published').length },
  ];
  const toggleSelectedQueueItem = (id: string) => {
    setSelectedQueueIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  };
  const toggleAllPublishable = () => {
    setSelectedQueueIds(allPublishableSelected ? [] : publishableQueue.map((item) => item.id));
  };
  const publishSelected = () => {
    if (publishingLocked) {
      onNoopAction('Publishing integrations are locked on the current plan');
      return;
    }

    if (selectedQueueIds.length === 0) {
      onNoopAction('Select at least one publish-ready post first');
      return;
    }

    onPublishSelected(selectedQueueIds, () => {
      onNoopAction(`Publishing ${selectedQueueIds.length} selected posts`);
      setSelectedQueueIds([]);
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 space-y-4">
        <div className="rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center gap-2">
          {channels.map((channel) => (
            <ChannelCard key={channel.name} channel={channel} />
          ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Publishing queue</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Posts waiting to sync across LinkedIn, Facebook, WordPress, and newsletter.</p>
            </div>
            {summary && <div className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-1 text-[11px] font-semibold text-[#4f4f49]">Total jobs: {summary.total}</div>}
            <button
              onClick={toggleAllPublishable}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              type="button"
            >
              {allPublishableSelected ? 'Clear selected' : 'Select ready'}
            </button>
            {actionError && <p className="text-[11px] font-semibold text-rose-700">{actionError}</p>}
            {loading && <p className="text-[11px] font-semibold text-[#6e6e68]">Loading live publishing data...</p>}
            <button
              disabled={selectedCount === 0 || publishingLocked}
              onClick={publishSelected}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Publish selected {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>
          </div>
          <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-4 py-2 text-xs text-[#6e6e68]">
            {selectedCount > 0
              ? `${selectedCount} publish-ready post${selectedCount > 1 ? 's' : ''} selected for batch publishing.`
              : 'Select Ready or Queued posts to enable batch publishing.'}
          </div>
          {targetQueueId ? (
            <div className="border-b border-[#d9e0ef] bg-[#f4f7fd] px-4 py-3 text-xs text-[#2f4f7f]">
              {targetQueueItem
                ? `Focused from Dashboard: ${targetQueueItem.id} · ${targetQueueItem.title} · ${targetQueueItem.status}`
                : `Focused from Dashboard: ${targetQueueId} has not entered Publishing Queue yet.`}
            </div>
          ) : null}

          <div className="divide-y divide-[#e8e8e4]">
              {queue.map((item) => (
                <div
                  key={item.id}
                  data-target={isTargetQueueItem(item) ? 'true' : undefined}
                  className={`grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] lg:grid-cols-[32px_1fr_128px_112px_236px] lg:items-center ${
                  isTargetQueueItem(item) ? 'bg-[#f4f7fd] ring-1 ring-inset ring-[#cfd8ea]' : ''
                }`}
              >
                <label className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#deded8] bg-white">
                  <span className="sr-only">Select {item.title}</span>
                  <input
                    checked={selectedQueueIds.includes(item.id)}
                    disabled={item.status !== 'Ready' && item.status !== 'Queued'}
                    onChange={() => toggleSelectedQueueItem(item.id)}
                    className="h-3.5 w-3.5 accent-[#2f4f7f] disabled:cursor-not-allowed"
                    type="checkbox"
                  />
                </label>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#8a8a82]">{item.id}</span>
                    <PublishingStatus status={item.status} />
                  </div>
                  <h3 className="mt-1 truncate text-sm font-semibold text-[#171717]">{item.title}</h3>
                </div>
                <div className="text-xs font-medium text-[#4f4f49]">{item.platform}</div>
                <div className="text-xs text-[#6e6e68]">{item.time}</div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
                  <button
                    className="rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-white"
                    onClick={() => onOpenContentJob(item.id)}
                    type="button"
                  >
                    Detail
                  </button>
                  <button
                    className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]"
                    onClick={() => (publishingLocked ? onNoopAction('Publishing integrations are locked on the current plan') : onPublishNow(item.id))}
                    disabled={publishingLocked || actionLoading === item.id || item.status === 'Published' || item.status === 'Cancelled'}
                    type="button"
                  >
                    {publishingLocked ? 'Locked' : item.status === 'Failed' ? 'Retry' : item.status === 'Syncing' ? 'Complete Sync' : item.status === 'Published' ? 'Posted' : 'Publish Now'}
                  </button>
                  <button
                    className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#6e6e68] hover:bg-[#f6f6f2]"
                    onClick={() => (publishingLocked ? onNoopAction('Publishing integrations are locked on the current plan') : onCancel(item.id))}
                    disabled={publishingLocked || actionLoading === item.id || item.status === 'Published' || item.status === 'Cancelled'}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertIcon />
            <div>
              <h2 className="text-sm font-semibold text-rose-900">{failedChannel ? `${failedChannel.name} needs attention` : 'Manual fallback ready'}</h2>
              <p className="mt-1 text-xs leading-relaxed text-rose-700">
                {latestError?.message ?? failedChannel?.health ?? 'If a platform rejects sync, retry from the queue or publish manually and record the result.'}
              </p>
              <button
                onClick={() => onNoopAction(failedChannel ? `Reconnect ${failedChannel.name} integration` : 'Open manual publishing fallback')}
                className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800"
                type="button"
              >
                {failedChannel ? 'Reconnect' : 'Manual fallback'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h2 className="text-sm font-semibold text-[#171717]">Error log</h2>
          <div className="mt-4 space-y-3">
            {errors.map((error) => (
              <div key={`${error.time}-${error.message}`} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#8a8a82]">{error.time}</span>
                  <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">
                    {error.platform}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#4f4f49]">{error.message}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function AnalyticsView({ onNoopAction }: { onNoopAction: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analyticsSummary.map((item) => (
            <MiniPageCard key={item.label} label={item.label} value={item.value} detail={item.change} icon={item.icon} />
          ))}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onNoopAction('Export analytics as PDF')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-white px-3 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]"
            type="button"
          >
            <FileText className="h-3.5 w-3.5" />
            Export report PDF
          </button>
          <button
            onClick={() => onNoopAction('Export analytics as Excel')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
            type="button"
          >
            <Archive className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Content performance</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Reach, engagement, and clicks by individual content item.</p>
            </div>
            <button
              onClick={() => onNoopAction('Change date range')}
              className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#4f4f49] hover:bg-[#f6f6f2]"
              type="button"
            >
              Last 30 days
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-[#e8e8e4] bg-[#fbfbfa] text-[11px] uppercase tracking-[0.14em] text-[#8a8a82]">
                <tr>
                  <th className="px-4 py-2 font-semibold">Content</th>
                  <th className="px-4 py-2 font-semibold">Language</th>
                  <th className="px-4 py-2 font-semibold">Reach</th>
                  <th className="px-4 py-2 font-semibold">Engagement</th>
                  <th className="px-4 py-2 font-semibold">Clicks</th>
                  <th className="px-4 py-2 font-semibold">Topic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e4]">
                {contentPerformance.map((item) => (
                  <tr key={item.title} className="hover:bg-[#fbfbfa]">
                    <td className="px-4 py-3 text-sm font-semibold text-[#171717]">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
                        {item.language}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4f4f49]">{item.reach}</td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4f4f49]">{item.engagement}</td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4f4f49]">{item.clicks}</td>
                    <td className="px-4 py-3 text-xs text-[#6e6e68]">{item.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h2 className="text-sm font-semibold text-[#171717]">Language insights</h2>
            <div className="mt-4 space-y-3">
              {languagePerformance.map((item) => (
                <div key={item.language}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-[#171717]">{item.language}</div>
                      <div className="text-[11px] text-[#6e6e68]">{item.audience}</div>
                    </div>
                    <span className="text-xs font-semibold text-[#4f4f49]">{item.reach}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#e8e8e4]">
                    <div className="h-1.5 rounded-full bg-[#8b8b84]" style={{ width: `${item.reach}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h2 className="text-sm font-semibold text-[#171717]">Topic trend</h2>
            <p className="mt-1 text-xs text-[#6e6e68]">Which legal/accounting categories are gaining attention.</p>
            <div className="mt-4 space-y-3">
              {topicTrends.map((item) => (
                <div key={item.topic} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#171717]">{item.topic}</span>
                    <span className="text-[11px] font-semibold text-emerald-700">{item.trend}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#e8e8e4]">
                    <div className="h-1.5 rounded-full bg-[#8b8b84]" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

type CreateWorkflowStep = 1 | 2 | 3 | 4;

const createWorkflowSteps: Array<{ index: CreateWorkflowStep; label: string }> = [
  { index: 1, label: 'Topic & Brief' },
  { index: 2, label: 'Source Search' },
  { index: 3, label: 'Generation' },
  { index: 4, label: 'Ready for Review' },
];

const facebookLayoutGuidelines: Record<string, { title: string; size: string; guardrail: string; composerRule: string }> = {
  Single: {
    title: 'Facebook single image',
    size: 'Use 1200 x 1200 px (1:1), 960 x 1200 px (4:5), or 1200 x 600 px / 1920 x 1080 px for horizontal feed.',
    guardrail: 'Generate 1 primary image only. Do not compose as an album layout.',
    composerRule: 'Asset Composer must create one Facebook feed-safe image and preserve important text inside the central safe area.',
  },
  Grid: {
    title: 'Facebook square album / 4 images',
    size: 'Use 1920 x 1920 px for all 4 images (1:1).',
    guardrail: 'Keep exactly 4 layout-defining images. More than 4 can change Facebook album display behavior.',
    composerRule: 'Asset Composer must create four square images with consistent typography, spacing, and slide order.',
  },
  Carousel: {
    title: 'Facebook album carousel / story set',
    size: 'Use 1+2, 1+3, or 2+3 album rules: cover 960 x 1920, 1280 x 1920, or 1920 x 960/1280, with supporting images usually 1920 x 1920 or 1920 x 1280.',
    guardrail: 'Use 3 images for 1+2, 4 images for 1+3, or 5 images for 2+3. Images after the 5th do not control the main Facebook layout.',
    composerRule: 'Asset Composer must decide the album pattern first, then generate each image at the exact size required by that selected pattern.',
  },
};

function getFacebookLayoutGuideline(layout: string, platforms: string[]) {
  const hasFacebook = platforms.some((platform) => platform.toLowerCase().includes('facebook'));
  return hasFacebook ? facebookLayoutGuidelines[layout] ?? null : null;
}

function createNextDraftWorkflowId() {
  return `SW-${Date.now().toString().slice(-4)}`;
}

function CreatePostView({
  onNoopAction,
  onSendToReviewQueue,
  onWorkflowAuditEvent,
  defaultCreatorName,
}: {
  onNoopAction: (message: string) => void;
  onSendToReviewQueue: (packageItem: CreateReviewPackage) => void;
  onWorkflowAuditEvent: (event: Omit<LogEvent, 'time'>) => void;
  defaultCreatorName?: string;
}) {
  const [mode, setMode] = useState<'manual' | 'quick'>('manual');
  const [createDraftWorkflowId, setCreateDraftWorkflowId] = useState(createNextDraftWorkflowId);
  const [currentCreateStep, setCurrentCreateStep] = useState<CreateWorkflowStep>(1);
  const [topicBrief, setTopicBrief] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(['Thai (ไทย)', 'English']);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Facebook', 'LinkedIn']);
  const [selectedImageLayout, setSelectedImageLayout] = useState('Carousel');
  const [selectedWordCount, setSelectedWordCount] = useState(500);
  const [selectedPostCount, setSelectedPostCount] = useState(1);
  const [selectedImageCount, setSelectedImageCount] = useState(6);
  const [selectedAssetIds, setSelectedAssetIds] = useState(['Image 1', 'Image 2', 'Image 3']);
  const [selectedCategory, setSelectedCategory] = useState('Tax');
  const [selectedContentGoal, setSelectedContentGoal] = useState('Educate & Lead');
  const [selectedTargetAudience, setSelectedTargetAudience] = useState('SME Owners');
  const [selectedCta, setSelectedCta] = useState('Book consultation');
  const [selectedBrandVoice, setSelectedBrandVoice] = useState('Legal advisory');
  const [selectedCitationStrictness, setSelectedCitationStrictness] = useState('Strict citations');
  const [selectedSourceConnectors, setSelectedSourceConnectors] = useState(['Knowledge Base', 'Official Link']);
  const [officialSourceLinks, setOfficialSourceLinks] = useState<string[]>(['']);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState('');
  const effectiveSelectedAssets = selectedAssetIds.filter((asset) => Number(asset.replace(/\D/g, '')) <= selectedImageCount);
  const selectedAssetsForPackage = effectiveSelectedAssets;
  const selectedLanguageLabels = getLanguageDisplayLabels(selectedLanguages);
  const payloadLanguageCodes = normalizeLanguageCodes(selectedLanguages, ['th', 'en']);
  const normalizedSourceConnectors = useMemo(() => normalizeStringList(selectedSourceConnectors, true), [selectedSourceConnectors]);
  const normalizedOfficialSourceLinks = officialSourceLinks.map((link) => link.trim()).filter((link) => link.length > 0);
  const normalizedDraftSources = useMemo(
    () => (normalizedSourceConnectors.length > 0 ? normalizedSourceConnectors : ['Knowledge Base']),
    [normalizedSourceConnectors],
  );
  const generatedDrafts = useMemo(
    () =>
      buildDraftPackageFromContext({
        topic: topicBrief,
        category: selectedCategory,
        targetAudience: selectedTargetAudience,
        brandVoice: selectedBrandVoice,
        citationStrictness: selectedCitationStrictness,
        cta: selectedCta,
        languages: payloadLanguageCodes,
        sourceConnectors: normalizedDraftSources,
        contentGoal: selectedContentGoal,
      }),
    [
      topicBrief,
      selectedCategory,
      selectedTargetAudience,
      selectedBrandVoice,
      selectedCitationStrictness,
      selectedCta,
      payloadLanguageCodes,
      normalizedDraftSources,
      selectedContentGoal,
    ],
  );
  const hasMinimumCreateSettings = selectedLanguages.length > 0 && selectedPlatforms.length > 0 && Boolean(selectedImageLayout);
  const hasSourceConnectors = selectedSourceConnectors.length > 0;
  const requiresOfficialLinks = selectedSourceConnectors.includes('Official Link');
  const hasReadySourceContext = hasSourceConnectors && (!requiresOfficialLinks || normalizedOfficialSourceLinks.length > 0);
  const manualRequiredChecks = [
    { label: 'topic brief', ready: Boolean(topicBrief.trim()) },
    { label: 'source connector', ready: selectedSourceConnectors.length > 0 },
    { label: 'language', ready: payloadLanguageCodes.length > 0 },
    { label: 'platform', ready: selectedPlatforms.length > 0 },
    { label: 'image layout', ready: Boolean(selectedImageLayout) },
    { label: 'citation rule', ready: Boolean(selectedCitationStrictness) },
  ];
  const missingManualRequirements = manualRequiredChecks.filter((item) => !item.ready).map((item) => item.label);
  const isCreateReady = mode === 'quick' ? hasMinimumCreateSettings : missingManualRequirements.length === 0;
  const selectedFacebookLayoutGuideline = getFacebookLayoutGuideline(selectedImageLayout, selectedPlatforms);
  const createValidationMessage = isCreateReady
    ? mode === 'manual'
      ? `Manual production ready: ${selectedPostCount} post(s), ${selectedLanguageLabels.length} language(s), ${selectedPlatforms.length} platform(s), ${selectedSourceConnectors.length} source connector(s), ${selectedImageCount} image option(s).`
      : `Ready: ${selectedPostCount} post(s), ${selectedLanguageLabels.length} language(s), ${selectedPlatforms.length} platform(s), ${selectedImageCount} image option(s), ${selectedImageLayout} layout.`
    : mode === 'quick'
      ? 'Choose at least one language, one platform, and one image layout before AI generation.'
      : `Manual setup missing: ${missingManualRequirements.join(', ')}.`;
  const canContinueCreate =
    currentCreateStep === 2 ? hasReadySourceContext : currentCreateStep === 1 ? isCreateReady : currentCreateStep === 3 ? generatedDrafts.length > 0 : true;
  const createFooterMessage =
    currentCreateStep === 1
      ? createValidationMessage
      : currentCreateStep === 2
        ? hasReadySourceContext
          ? 'Sources are ready for citation checking. Continue when the reference set looks safe.'
          : requiresOfficialLinks
            ? 'Official Link is selected. Add at least one official URL before generating text.'
            : 'Select at least one source connector before starting Source Search.'
        : currentCreateStep === 3
          ? 'Drafts and image layout are prepared. Continue to package the post for human review.'
          : 'Ready to send this package to Review Queue for compliance approval.';
  const createPrimaryActionLabel =
    currentCreateStep === 1
      ? 'Start Source Search'
      : currentCreateStep === 2
        ? 'Generate Text First'
        : currentCreateStep === 3
          ? 'Build Review Package'
          : 'Send to Review Queue';
  const createPrimaryActionNote =
    currentCreateStep === 1
      ? 'Source search started'
      : currentCreateStep === 2
        ? 'Text generation started before image work'
        : currentCreateStep === 3
          ? 'Review package built from text, images, and layout'
          : 'Package sent to Review Queue';
  const handleSourceConnectorsChange = (values: string[]) => {
    setSelectedSourceConnectors(values);

    if (!values.includes('Official Link')) {
      setOfficialSourceLinks([]);
      return;
    }

    setOfficialSourceLinks((links) => (links.length > 0 ? links : ['']));
  };
  const recordCreateWorkflowEvent = (type: string, status: string, message: string, relatedId?: string, severity: LogEvent['severity'] = 'Low') => {
    onWorkflowAuditEvent({
      type,
      source: 'Create Post',
      severity,
      message,
      itemId: createDraftWorkflowId,
      relatedId,
      status,
    });
  };
  const saveCreateDraft = () => {
    const draftTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setLastDraftSavedAt(draftTime);
    onNoopAction(`Create Post draft saved at ${draftTime}: ${mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'}, step ${currentCreateStep}`);
    recordCreateWorkflowEvent(
      'Draft saved',
      `Step ${currentCreateStep}`,
      `${createDraftWorkflowId} draft saved at step ${currentCreateStep} (${mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'})`,
    );
  };
  const goToPreviousCreateStep = () => {
    if (currentCreateStep <= 1) {
      return;
    }

    const previousStep = (currentCreateStep - 1) as CreateWorkflowStep;
    setCurrentCreateStep(previousStep);
    recordCreateWorkflowEvent('Step back', `Step ${previousStep}`, `${createDraftWorkflowId} moved back from step ${currentCreateStep} to step ${previousStep}`);
  };
  const goToNextCreateStep = () => {
    if (!canContinueCreate) {
      return;
    }

    if (currentCreateStep < 4) {
      const nextStep = (currentCreateStep + 1) as CreateWorkflowStep;
      if (currentCreateStep === 2) {
        recordCreateWorkflowEvent('Text draft generated', 'Text Generation', `${createDraftWorkflowId} updated draft package for ${selectedCategory}`);
      }
      const nextStatus = currentCreateStep === 1 ? 'Source Search' : currentCreateStep === 2 ? 'Text Generation' : 'Review Package';
      recordCreateWorkflowEvent(
        currentCreateStep === 1 ? 'Source search started' : currentCreateStep === 2 ? 'Text generation started' : 'Review package built',
        nextStatus,
        `${createDraftWorkflowId} ${createPrimaryActionNote}: ${selectedCategory}, ${selectedLanguageLabels.join(', ')}, ${selectedPlatforms.join(', ')}`,
      );
      setCurrentCreateStep(nextStep);
      onNoopAction(`${createPrimaryActionNote}: moved to step ${nextStep}`);
      return;
    }

    const reviewId = getReviewIdForWorkflowId(createDraftWorkflowId);
    const draftPayload = generatedDrafts;
    recordCreateWorkflowEvent(
      'Create handoff requested',
      'Ready for Review',
      `${createDraftWorkflowId} → ${reviewId} package ready for Review Queue (${selectedLanguageLabels.join(', ')} / ${selectedPlatforms.join(', ')})`,
      reviewId,
    );
    const creatorName = normalizeTextValue(defaultCreatorName);
    onSendToReviewQueue({
      workflowId: createDraftWorkflowId,
      title: topicBrief.trim() || `${selectedCategory} content package from ${mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'}`,
      category: selectedCategory,
      risk: selectedCategory === 'PDPA' || selectedCategory === 'Corporate Law' ? 'Medium' : 'Low',
      createdBy: creatorName || (mode === 'quick' ? 'Quick Mode' : 'Manual Mode'),
      assetComposerStatus: 'Assets reviewed and ready for human approval',
      assetLayoutPlan: [
        ...selectedPlatforms.map((platform, index) => `${platform}: ${selectedImageLayout} crop ${index + 1} ready`),
        ...(selectedFacebookLayoutGuideline
          ? [
              `Facebook layout enforcement: ${selectedFacebookLayoutGuideline.title}`,
              `Facebook required sizes: ${selectedFacebookLayoutGuideline.size}`,
              `Facebook guardrail: ${selectedFacebookLayoutGuideline.guardrail}`,
            ]
          : []),
      ],
      brandVoice: selectedBrandVoice,
      citationStrictness: selectedCitationStrictness,
      contentGoal: selectedContentGoal,
      cta: selectedCta,
      imageCount: selectedImageCount,
      languages: payloadLanguageCodes,
      layout: selectedImageLayout,
      mode,
      platforms: selectedPlatforms,
      postCount: selectedPostCount,
      selectedAssets: selectedAssetsForPackage,
      sourceConnectors: selectedSourceConnectors,
      officialSourceLinks: normalizedOfficialSourceLinks,
      targetAudience: selectedTargetAudience,
      visualBrief: `Visual brief from generated text: ${selectedCategory} advisory concept for ${selectedTargetAudience}, ${selectedBrandVoice.toLowerCase()} tone, CTA focus on ${selectedCta.toLowerCase()}, ${selectedImageLayout.toLowerCase()} layout, avoid exaggerated claims.`,
      wordCount: selectedWordCount,
      generatedDrafts: draftPayload,
    });
    setCreateDraftWorkflowId(createNextDraftWorkflowId());
    setCurrentCreateStep(1);
    setLastDraftSavedAt('');
    setSelectedAssetIds([]);
  };
  const setCreateMode = (nextMode: typeof mode) => {
    setMode(nextMode);
    setCurrentCreateStep(1);
    recordCreateWorkflowEvent(
      'Mode changed',
      'Brief Created',
      `${createDraftWorkflowId} mode changed to ${nextMode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'}`,
    );
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex min-h-12 items-center gap-2 overflow-x-auto border-b border-[#deded8] bg-[#fbfbfa] px-3 py-2 sm:gap-4 sm:px-4">
        <h2 className="shrink-0 text-sm font-semibold text-[#171717]">Create Post</h2>
        <div className="flex shrink-0 items-center rounded-xl border border-[#deded8] bg-[#f6f6f2] p-1">
          {[
            { label: 'Manual Setup', value: 'manual' as const, icon: Filter },
            { label: 'Quick AI Mode', value: 'quick' as const, icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const active = mode === item.value;

            return (
              <button
                key={item.value}
                aria-pressed={active}
                onClick={() => setCreateMode(item.value)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${
                  active ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68] hover:text-[#171717]'
                }`}
                type="button"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="h-5 w-px bg-[#deded8]" />
        {createWorkflowSteps.map((step, stepIndex) => (
          <div key={step.index} className="flex shrink-0 items-center gap-4">
            <CreateStep completed={currentCreateStep > step.index} index={step.index} label={step.label} active={currentCreateStep === step.index} />
            {stepIndex < createWorkflowSteps.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-[#c2c2ba]" /> : null}
          </div>
        ))}
      </div>

      <div className="min-h-[560px] lg:min-h-[690px]">
        <section className="flex min-w-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
	            {currentCreateStep === 1 ? (
	              mode === 'quick' ? (
	                <QuickAiCreatePanel
                    imageCount={selectedImageCount}
                    languages={selectedLanguages}
                    layout={selectedImageLayout}
                    onImageCountChange={setSelectedImageCount}
                    onLanguagesChange={setSelectedLanguages}
                    onLayoutChange={setSelectedImageLayout}
                    onPlatformsChange={setSelectedPlatforms}
                    onPostCountChange={setSelectedPostCount}
                    platforms={selectedPlatforms}
                    postCount={selectedPostCount}
                  />
	              ) : (
	                <ManualCreatePanel
	                  category={selectedCategory}
                    citationStrictness={selectedCitationStrictness}
                    contentGoal={selectedContentGoal}
                    cta={selectedCta}
                    imageCount={selectedImageCount}
                    languages={selectedLanguages}
                    layout={selectedImageLayout}
                    brandVoice={selectedBrandVoice}
	                  onCategoryChange={setSelectedCategory}
                    onCitationStrictnessChange={setSelectedCitationStrictness}
                    onContentGoalChange={setSelectedContentGoal}
                    onCtaChange={setSelectedCta}
                    onImageCountChange={setSelectedImageCount}
                    onLanguagesChange={setSelectedLanguages}
                    onLayoutChange={setSelectedImageLayout}
                    onPlatformsChange={setSelectedPlatforms}
                    onPostCountChange={setSelectedPostCount}
                    onBrandVoiceChange={setSelectedBrandVoice}
                    onSourceConnectorsChange={handleSourceConnectorsChange}
                    onTargetAudienceChange={setSelectedTargetAudience}
	                  onTopicChange={setTopicBrief}
	                  onWordCountChange={setSelectedWordCount}
                    platforms={selectedPlatforms}
	                  postCount={selectedPostCount}
                    sourceConnectors={selectedSourceConnectors}
                    targetAudience={selectedTargetAudience}
	                  topic={topicBrief}
	                  wordCount={selectedWordCount}
	                />
	              )
	            ) : currentCreateStep === 2 ? (
	              <SourceSearchCreatePanel
                  brandVoice={selectedBrandVoice}
                  category={selectedCategory}
                  citationStrictness={selectedCitationStrictness}
                  contentGoal={selectedContentGoal}
                  cta={selectedCta}
                  languages={selectedLanguages}
                  mode={mode}
                  onSourceConnectorsChange={handleSourceConnectorsChange}
                  onOfficialSourceLinksChange={setOfficialSourceLinks}
                  platforms={selectedPlatforms}
                  officialSourceLinks={officialSourceLinks}
                  sourceConnectors={selectedSourceConnectors}
                  targetAudience={selectedTargetAudience}
                  topic={topicBrief}
                />
	            ) : currentCreateStep === 3 ? (
	              <GenerationCreatePanel
                  brandVoice={selectedBrandVoice}
                  category={selectedCategory}
                  citationStrictness={selectedCitationStrictness}
                  contentGoal={selectedContentGoal}
                  cta={selectedCta}
                  imageCount={selectedImageCount}
                  languages={selectedLanguages}
                  generatedDrafts={generatedDrafts}
                  layout={selectedImageLayout}
                  platforms={selectedPlatforms}
                  sourceConnectors={selectedSourceConnectors}
                  targetAudience={selectedTargetAudience}
                  topic={topicBrief}
                  wordCount={selectedWordCount}
                />
	            ) : (
	              <ReadyForReviewCreatePanel
                  brandVoice={selectedBrandVoice}
                  generatedDrafts={generatedDrafts}
	                category={selectedCategory}
                  citationStrictness={selectedCitationStrictness}
                  contentGoal={selectedContentGoal}
                  cta={selectedCta}
	                imageCount={selectedImageCount}
	                languages={selectedLanguages}
	                layout={selectedImageLayout}
	                mode={mode}
	                onEditAssets={() => {
	                  setCurrentCreateStep(3);
	                  onNoopAction('Returned to Generation for asset editing');
	                }}
	                onEditText={() => {
	                  setCurrentCreateStep(3);
	                  onNoopAction('Returned to Generation for text editing');
	                }}
	                onRegenerateImage={() => {
	                  setCurrentCreateStep(3);
	                  onNoopAction(`Regenerating ${selectedImageCount} image option(s) from visual brief`);
	                }}
	                platforms={selectedPlatforms}
	                postCount={selectedPostCount}
                  selectedAssets={selectedAssetsForPackage}
                  onSelectedAssetsChange={setSelectedAssetIds}
                  sourceConnectors={selectedSourceConnectors}
                  targetAudience={selectedTargetAudience}
	                topic={topicBrief}
	                wordCount={selectedWordCount}
	              />
	            )}
	          </div>

	          <div className="flex min-h-14 flex-col items-stretch justify-between gap-3 border-t border-[#deded8] bg-[#fbfbfa] px-3 py-3 sm:flex-row sm:items-center sm:px-4">
	            <div className="min-w-0 sm:flex-1">
	              <p className={`text-xs font-semibold ${canContinueCreate ? 'text-emerald-700' : 'text-amber-700'}`}>{createFooterMessage}</p>
	              <p className="mt-0.5 text-[11px] font-medium text-[#8a8a82]">
                  Workflow {createDraftWorkflowId} · Step {currentCreateStep} of 4{lastDraftSavedAt ? ` · Draft saved ${lastDraftSavedAt}` : ''}
                </p>
	            </div>
	            <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
                <button
                  onClick={saveCreateDraft}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#deded8] bg-white px-4 text-sm font-semibold text-[#4f4f49] shadow-sm hover:bg-[#f6f6f2] sm:w-auto"
                  type="button"
                >
                  Save Draft
                </button>
	              {currentCreateStep > 1 ? (
	                <button
	                  onClick={goToPreviousCreateStep}
	                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#deded8] bg-white px-4 text-sm font-semibold text-[#4f4f49] shadow-sm hover:bg-[#f6f6f2] sm:w-auto"
	                  type="button"
	                >
	                  Back
	                </button>
	              ) : null}
	              <button
	                disabled={!canContinueCreate}
	                onClick={goToNextCreateStep}
	                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1f5eff] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#194bd1] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
	                type="button"
	              >
	                {createPrimaryActionLabel}
	                <ChevronRight className="h-4 w-4" />
	              </button>
	            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ContentLibraryView({ onNoopAction }: { onNoopAction: (message: string) => void }) {
  const [libraryQuery, setLibraryQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLibraryFilter, setActiveLibraryFilter] = useState<'All' | 'Needs update' | 'High reuse'>('All');
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<(typeof libraryItems)[number]>(libraryItems[0]);
  const [libraryAction, setLibraryAction] = useState('Edit text');
  const filteredLibraryItems = libraryItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesFilter =
      activeLibraryFilter === 'All' ||
      (activeLibraryFilter === 'Needs update' && item.status === 'Needs update') ||
      (activeLibraryFilter === 'High reuse' && item.reuse === 'High');
    const query = libraryQuery.trim().toLowerCase();
    const matchesQuery = !query || [item.id, item.title, item.category, item.language, item.status].some((value) => value.toLowerCase().includes(query));

    return matchesCategory && matchesFilter && matchesQuery;
  });
  const selectLibraryAction = (item: (typeof libraryItems)[number], action: string) => {
    setSelectedLibraryItem(item);
    setLibraryAction(action);
    onNoopAction(`${action}: ${item.id}`);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_1fr_320px]">
      <aside className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <h2 className="text-sm font-semibold text-[#171717]">Categories</h2>
        <div className="mt-3 space-y-1">
          {contentCategories.map((category) => {
            const active = category.name === activeCategory;

            return (
            <button
              key={category.name}
              aria-pressed={active}
              onClick={() => setActiveCategory(category.name)}
              className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-sm ${
                active ? 'border border-[#cfcfc8] bg-[#f6f6f2] font-semibold text-[#171717]' : 'text-[#5f5f58] hover:bg-[#f6f6f2]'
              }`}
              type="button"
            >
              <span>{category.name}</span>
              <span className="text-xs text-[#8a8a82]">{category.count}</span>
            </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
          <div className="text-xs font-semibold text-[#171717]">Recycle signal</div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">3 older posts should be refreshed because laws or deadlines changed.</p>
        </div>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-[#171717]">Content assets</h2>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Search old posts, reuse assets, or update legal/accounting content.</p>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 text-sm text-[#6e6e68] sm:w-72 sm:flex-none">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search content library</span>
              <input
                value={libraryQuery}
                onChange={(event) => setLibraryQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#8a8a82]"
                placeholder="Search title, law, category..."
              />
            </label>
            {(['All', 'Needs update', 'High reuse'] as const).map((filter) => (
              <button
                key={filter}
                aria-pressed={activeLibraryFilter === filter}
                onClick={() => setActiveLibraryFilter(filter)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${
                  activeLibraryFilter === filter ? 'border-[#cfcfc8] bg-[#f6f6f2] text-[#171717]' : 'border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f6f6f2]'
                }`}
                type="button"
              >
                {filter === 'All' ? <Filter className="h-3.5 w-3.5" /> : null}
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#e8e8e4]">
          {filteredLibraryItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#6e6e68]">No content matches the current search and filters.</div>
          ) : null}
          {filteredLibraryItems.map((item) => (
            <LibraryRow
              key={item.id}
              item={item}
              onEdit={(selected) => selectLibraryAction(selected, 'Edit text')}
              onRecycle={(selected) => selectLibraryAction(selected, 'Recycle as new post')}
              onSelect={setSelectedLibraryItem}
              selected={selectedLibraryItem.id === item.id}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h2 className="text-sm font-semibold text-[#171717]">Asset preview</h2>
          <p className="mt-1 text-xs text-[#6e6e68]">{selectedLibraryItem.title}</p>
          <div className="mt-3 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{selectedLibraryItem.category}</span>
              <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{selectedLibraryItem.language}</span>
              <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">Reuse {selectedLibraryItem.reuse}</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">Selected action: {libraryAction}. This panel is ready to become an edit/recycle drawer when backend records are connected.</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {['Cover', 'Carousel 1', 'Carousel 2', 'Infographic', 'Source PDF', 'Caption'].slice(0, Math.min(selectedLibraryItem.assets, 6)).map((asset, index) => (
              <button
                key={asset}
                onClick={() => onNoopAction(`Open content asset: ${asset}`)}
                className={`aspect-[4/3] rounded-xl border p-2 text-left text-[11px] font-semibold ${
                  index < 4 ? 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]' : 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]'
                }`}
                type="button"
              >
                <div className="flex h-full items-end rounded-lg bg-gradient-to-br from-white to-[#e8e8e4] p-2">{asset}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">Available actions</h2>
          <div className="mt-3 space-y-2">
            {['Edit text', 'Replace image', 'Recycle as new post', 'Update legal reference'].map((action, index) => (
              <button
                key={action}
                onClick={() => {
                  setLibraryAction(action);
                  onNoopAction(`Action: ${action} for ${selectedLibraryItem.id}`);
                }}
                className={`flex h-9 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold ${
                  index === 0 ? 'border-[#cfcfc8] bg-white text-[#171717]' : 'border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f6f6f2]'
                }`}
                type="button"
              >
                {action}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function KnowledgeBaseView({ apiToken, onNoopAction }: { apiToken: string; onNoopAction: (message: string) => void }) {
  const [ragQuery, setRagQuery] = useState('What changed in VAT filing rules? Cite the source and show related Obsidian notes.');
  const [ragStatus, setRagStatus] = useState<'ready' | 'retrieving' | 'answered' | 'blocked' | 'error'>('ready');
  const [ragAnswer, setRagAnswer] = useState('Run live RAG retrieval to see cited answers from connected sources.');
  const [ragError, setRagError] = useState('');
  const fallbackRagCitations: RagCitationCard[] = [];
  const [ragCitations, setRagCitations] = useState<RagCitationCard[]>(fallbackRagCitations);
  const hasRagQuery = Boolean(ragQuery.trim());
  const runRagSearch = async () => {
    if (!hasRagQuery) {
      setRagStatus('blocked');
      setRagAnswer('RAG search blocked: query is required.');
      onNoopAction('RAG search blocked: query is required');
      return;
    }

    const token = apiToken.trim().replace(/^Bearer\s+/i, '');

    if (!token) {
      setRagStatus('blocked');
      setRagAnswer('Sign in to run live RAG retrieval.');
      setRagCitations(fallbackRagCitations);
      onNoopAction('Live RAG search blocked: API bearer token is required');
      return;
    }

    setRagStatus('retrieving');
    setRagError('');

    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: ragQuery,
          strictCitation: true,
        }),
      });
      const payload = (await response.json()) as RagChatApiResponse & { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.message || payload.error || 'RAG chat request failed');
      }

      setRagAnswer(payload.answer);
      setRagCitations(
        payload.citations.length
          ? payload.citations.map((citation) => ({
              source: citation.title,
              match: `${Math.round(citation.score * 100)}%`,
              detail: `${citation.sourceType}${citation.category ? ` · ${citation.category}` : ''} · chunk ${citation.chunkId.slice(0, 8)}`,
            }))
          : [],
      );
      setRagStatus(payload.blocked ? 'blocked' : 'answered');
      onNoopAction(payload.blocked ? `RAG blocked: ${payload.reason ?? 'No source matched'}` : `RAG answered with ${payload.citations.length} citation(s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'RAG retrieval failed';
      setRagStatus('error');
      setRagError(message);
      setRagAnswer(message);
      onNoopAction(`RAG retrieval failed: ${message}`);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#deded8] bg-white p-2 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          {['Sources', 'Connections', 'Test RAG Knowledge'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => onNoopAction(`Switch knowledge tab: ${tab}`)}
              className={`h-9 rounded-xl px-3 text-sm font-semibold ${
                index === 2
                  ? 'border border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]'
                  : 'text-[#6e6e68] hover:bg-[#f6f6f2] hover:text-[#171717]'
              }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MiniPageCard label="Indexed sources" value="126" detail="Ready for RAG retrieval" icon={BookOpen} />
          <MiniPageCard label="Processing" value="3" detail="PDFs being chunked" icon={Clock3} />
          <MiniPageCard label="Review needed" value="5" detail="Outdated or risky claims" icon={ShieldCheck} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2]">
                <UploadCloud className="h-5 w-5 text-[#4f4f49]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#171717]">Upload PDF / document</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Add legal notices, Revenue Department announcements, SOPs, or company guidelines.</p>
                <button
                  onClick={() => onNoopAction('Upload PDF or document')}
                  className="mt-3 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-white"
                  type="button"
                >
                  Choose file
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2]">
                <GlobeIcon className="h-5 w-5 text-[#4f4f49]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-[#171717]">Connect source link</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Connect official links so AI can retrieve trusted references before writing.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input className="h-8 min-w-0 flex-1 rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 text-xs outline-none" placeholder="https://..." />
                  <button
                    onClick={() => onNoopAction('Add source link')}
                    className="h-8 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
                    type="button"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">External knowledge connections</h2>
              <p className="mt-1 text-xs text-[#6e6e68]">Connect office files and notes so RAG can retrieve approved internal knowledge.</p>
            </div>
            <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
              2 available
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <KnowledgeConnectionCard name="Google Drive" description="Sync PDFs, Docs, Sheets, and shared folders." icon={DriveIcon} status="Connect" />
            <KnowledgeConnectionCard name="Obsidian" description="Index local vault notes, markdown files, and backlinks." icon={ObsidianIcon} status="Connect" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Office knowledge sources</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Documents that AI is allowed to retrieve from before generating content.</p>
            </div>
            <button
              onClick={() => onNoopAction('Search knowledge sources')}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              type="button"
            >
              <Search className="h-3.5 w-3.5" />
              Search sources
            </button>
          </div>

          <div className="divide-y divide-[#e8e8e4]">
            {knowledgeSources.map((source) => (
              <KnowledgeSourceRow key={source.name} source={source} />
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#cfd8ea] bg-[#f8fbff] p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#cfd8ea] bg-white text-[#2f4f7f]">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">AI Chat Bot</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Test RAG retrieval across uploaded files, Google Drive, Obsidian, and official source links.</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#cfd8ea] bg-white p-3">
            <textarea
              value={ragQuery}
              onChange={(event) => {
                setRagQuery(event.target.value);
                if (event.target.value.trim()) {
                  setRagStatus('ready');
                }
              }}
              className="min-h-28 w-full resize-none rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3 text-xs text-[#171717] outline-none ring-[#2f4f7f] placeholder:text-[#8a8a82] focus:ring-1"
              placeholder="Ask: What changed in VAT filing rules? Cite the source and show related Obsidian notes..."
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {['PDF', 'Drive', 'Obsidian'].map((source) => (
                  <span key={source} className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">
                    {source}
                  </span>
                ))}
              </div>
              <button
                onClick={runRagSearch}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 text-xs font-semibold text-[#2f4f7f] hover:bg-white"
                type="button"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: 'No source', status: 'blocked' },
                { label: 'Error state', status: 'error' },
                { label: 'Retrieving', status: 'retrieving' },
              ].map((state) => (
                <button
                  key={state.status}
                  onClick={() => setRagStatus(state.status as typeof ragStatus)}
                  className="rounded-lg border border-[#deded8] bg-[#fbfbfa] px-2 py-1 text-[10px] font-semibold text-[#6e6e68] hover:bg-white"
                  type="button"
                >
                  {state.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-[#cfd8ea] bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#171717]">Retrieval status</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  ragStatus === 'blocked' || ragStatus === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : ragStatus === 'answered'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]'
                }`}
              >
                {ragStatus === 'answered' ? 'Citations ready' : ragStatus === 'blocked' ? 'Blocked' : ragStatus === 'error' ? 'Error' : ragStatus === 'retrieving' ? 'Retrieving' : 'Ready'}
              </span>
            </div>

            {ragStatus === 'blocked' ? (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-800">
                {ragAnswer || 'No query or approved source was found. AI answer is blocked until a source is uploaded, indexed, or connected.'}
              </div>
            ) : ragStatus === 'error' ? (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                {ragError || 'Retrieval failed. Check Drive/Obsidian permissions, source indexing, or retry after processing completes.'}
              </div>
            ) : ragStatus === 'answered' ? (
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
                  {ragAnswer}
                </div>
                {ragCitations.map((citation) => (
                  <div key={citation.source} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#171717]">{citation.source}</span>
                      <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{citation.match}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{citation.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#6e6e68]">
                Enter a question and run search. If no indexed source matches, generation remains blocked instead of guessing.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">RAG guardrail</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">
                AI must use this knowledge base as the trusted retrieval layer before making legal or accounting claims.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {ragRules.map((rule) => (
              <div key={rule} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#4f4f49]">
                {rule}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">Hallucination control</h2>
          <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">
            If the AI cannot retrieve a relevant indexed source, generation is blocked and the user is asked to upload a source or connect an official link.
          </p>
        </section>
      </aside>
    </div>
  );
}

function ReviewQueueView({
  items,
  loading = false,
  error = '',
  targetReviewItemId,
  actorDisplayName,
  onNoopAction,
  onReviewDecision,
  onRequestReviewDecision,
  onOpenContentJob,
}: {
  items: ReviewQueueItem[];
  loading?: boolean;
  error?: string;
  targetReviewItemId?: string | null;
  actorDisplayName?: string;
  onNoopAction: (message: string) => void;
  onReviewDecision: (item: ReviewQueueItem, decision: ReviewDecision) => void;
  onRequestReviewDecision: (item: ReviewQueueItem, decision: ReviewDecision, reason: string, applyDecision: () => void) => void;
  onOpenContentJob: (id: string) => void;
}) {
  const [selectedReviewItemId, setSelectedReviewItemId] = useState(items[0]?.id ?? '');
  const [reviewDecision, setReviewDecision] = useState<'pending' | 'approved' | 'rejected' | 'queued'>('pending');
  const [reviewReason, setReviewReason] = useState('Citations match the PDPA guideline and translation meaning is consistent across Thai, English, and Chinese.');
  const [reviewQueueSearch, setReviewQueueSearch] = useState('');
  const targetReviewItem = useMemo(() => {
    if (!targetReviewItemId) {
      return null;
    }

    const targetMatchSignatures = buildReviewIdMatchSignatures(targetReviewItemId);

    return (
      items.find((item) => {
        return hasReviewQueueTargetMatch(item, targetMatchSignatures);
      }) ?? null
    );
  }, [items, targetReviewItemId]);
  const orderedReviewItems = useMemo(() => {
    const sorted = sortReviewQueueItems(items);
    if (!targetReviewItem) {
      return sorted;
    }

    const targetSignatures = buildReviewQueueTargetMatchSignatures([
      targetReviewItem.id,
      targetReviewItem.workflowId,
      targetReviewItem.publishingId,
    ]);

    return [
      targetReviewItem,
      ...sorted.filter((item) => !hasReviewQueueTargetMatch(item, targetSignatures)),
    ];
  }, [items, targetReviewItem]);
  const reviewQueueSearchQuery = reviewQueueSearch.trim().toLowerCase();
  const reviewQueueItems = useMemo(() => {
    if (!reviewQueueSearchQuery) {
      return orderedReviewItems;
    }

    return orderedReviewItems.filter((item) => {
      const searchable = [
        item.id,
        item.title,
        item.workflowId,
        item.publishingId,
        item.owner,
        item.category,
        item.createdBy,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(reviewQueueSearchQuery);
    });
  }, [orderedReviewItems, reviewQueueSearchQuery]);
  const selectedReviewItem = targetReviewItem ?? reviewQueueItems.find((item) => item.id === selectedReviewItemId) ?? orderedReviewItems[0] ?? items[0] ?? null;

  if (!selectedReviewItem) {
    return (
      <div className="rounded-2xl border border-[#deded8] bg-white p-4 text-sm text-[#6e6e68]">
        No items are currently waiting in Review Queue.
      </div>
    );
  }
  const effectiveReviewReason = targetReviewItem
    ? `Focused from Dashboard: check ${targetReviewItem.id} before moving the same content item forward. ${reviewReason}`
    : reviewReason;
  const reviewPackageLanguageCodes = normalizeLanguageCodes(selectedReviewItem.languages, ['th', 'en', 'zh']);
  const reviewPackageLanguages = reviewPackageLanguageCodes.map((languageCode) => languageCodeLabelMap[languageCode]);
  const reviewPackagePlatforms = selectedReviewItem.platforms?.length ? selectedReviewItem.platforms : ['Facebook', 'LinkedIn'];
  const reviewPackageSources = selectedReviewItem.sourceConnectors?.length ? selectedReviewItem.sourceConnectors : ['Knowledge Base', 'Internal advisory guideline', `${selectedReviewItem.owner} handoff package`];
  const reviewDraftByLanguage = new Map((selectedReviewItem.generatedDrafts ?? []).map((draft) => [draft.languageCode, draft]));
  const reviewPackageMeta = [
    ['Workflow', selectedReviewItem.workflowId ?? getDashboardIdForWorkflowId(selectedReviewItem.id)],
    [
      'Mode',
      selectedReviewItem.mode === 'quick'
        ? 'Quick Mode'
        : selectedReviewItem.mode === 'manual'
          ? 'Manual Mode'
          : 'Manual/Quick',
    ],
    ['Goal', selectedReviewItem.contentGoal ?? 'Educate & Lead'],
    ['Audience', selectedReviewItem.targetAudience ?? 'SME Owners'],
    ['CTA', selectedReviewItem.cta ?? 'Book consultation'],
    ['Brand', selectedReviewItem.brandVoice ?? 'Legal advisory'],
    ['Citation', selectedReviewItem.citationStrictness ?? 'Strict citations'],
    ['Layout', selectedReviewItem.layout ?? 'Carousel'],
    ['Platforms', reviewPackagePlatforms.join(', ')],
    ['Assets', `${(selectedReviewItem.selectedAssets ?? []).length || selectedReviewItem.imageCount || 0} selected`],
  ];
  const selectedReviewSources = reviewPackageSources.map((source) => `${source} · ${selectedReviewItem.category} evidence`);
  const selectedReviewDrafts = reviewPackageLanguageCodes.map((languageCode) => ({
    language: languageCodeLabelMap[languageCode],
    title: normalizeTextValue(reviewDraftByLanguage.get(languageCode)?.title ?? `${normalizeTextValue(selectedReviewItem.category) || 'Review'}: ${buildReviewDraftTitle(selectedReviewItem.category, selectedReviewItem.title)}`),
    body: normalizeTextValue(
      reviewDraftByLanguage.get(languageCode)?.body ??
        `Draft content is not available for ${languageCodeLabelMap[languageCode]}. Open the original Create workflow and generate Step 3 before review.`
    ),
  }));
  const decisionMeta = {
    pending: { label: 'Awaiting decision', tone: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]', detail: 'No human decision has been recorded yet.' },
    approved: { label: 'Approved', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800', detail: 'Content passed human review and is ready for creative or publishing queue.' },
    rejected: { label: 'Rejected', tone: 'border-rose-200 bg-rose-50 text-rose-800', detail: 'Content must be revised before it can continue in the workflow.' },
    queued: { label: 'Auto queued', tone: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]', detail: 'Content was approved for automatic scheduling after review.' },
  }[reviewDecision];
  const canMoveFromReviewQueue = normalizeTextValue(actorDisplayName) === 'Agent Orchestrator';
  const recordReviewDecision = (decision: ReviewDecision) => {
    if (!canMoveFromReviewQueue) {
      onNoopAction(`Only Agent Orchestrator can move ${selectedReviewItem.id} from In Review.`);
      return;
    }

    const reason = effectiveReviewReason.trim();
    if (decision === 'rejected' && !reason) {
      onNoopAction(`Reject requires reviewer reason for ${selectedReviewItem.id}`);
      return;
    }

    onRequestReviewDecision(selectedReviewItem, decision, reason, () => {
      setReviewDecision(decision);
      onNoopAction(`Review decision recorded for ${selectedReviewItem.id}: ${decision}`);
      onReviewDecision(selectedReviewItem, decision);
    });
  };
  const selectReviewItem = (item: ReviewQueueItem) => {
    setSelectedReviewItemId(item.id);
    setReviewDecision('pending');
    setReviewReason(`Reviewing ${buildReviewDraftTitle(item.category, item.title)}. Check citations, claim risk, translation consistency, and asset handoff before approval.`);
    onNoopAction(`Open review item ${item.id}`);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_1fr_340px]">
      <aside className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="border-b border-[#e8e8e4] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">In Review</h2>
          <p className="mt-1 text-xs text-[#6e6e68]">Human-in-the-loop queue for lawyers and accountants.</p>
          {error ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
              {error}
            </div>
          ) : null}
        </div>

      <div className="divide-y divide-[#e8e8e4]">
          {reviewQueueItems.map((item) => (
            <button
              key={item.id}
              onClick={() => selectReviewItem(item)}
              className={`w-full p-3 text-left hover:bg-[#fbfbfa] ${selectedReviewItem.id === item.id ? 'bg-[#f6f6f2]' : ''}`}
              type="button"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#8a8a82]">{item.id}</span>
                <RiskBadge risk={item.risk as BoardItem['risk']} />
              </div>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#171717]">{item.title}</h3>
              <p className="mt-1 text-[11px] text-[#6e6e68]">
                {(item.mode === 'quick' ? 'Quick Mode' : item.mode === 'manual' ? 'Manual Mode' : 'Manual / Quick')} ·{' '}
                {item.workflowId ?? item.id}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Tag>{item.category}</Tag>
                <Tag>{item.due}</Tag>
              </div>
              <div className="mt-2 text-[11px] text-[#6e6e68]">{item.owner} · {item.status}</div>
            </button>
          ))}
        </div>
          {targetReviewItemId ? (
            <div className="mt-3 mb-2 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-[11px] font-semibold text-[#2f4f7f]">
              {targetReviewItem
                ? `Focused from Dashboard: ${targetReviewItem.id}`
                : `Focused from Dashboard: ${targetReviewItemId} has not entered Review Queue yet.`}
            </div>
          ) : null}
          <label className="mt-3 mb-4 flex h-9 items-center gap-2 rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 text-xs text-[#6e6e68]">
            <Search className="h-3.5 w-3.5" />
            <input
              value={reviewQueueSearch}
              onChange={(event) => setReviewQueueSearch(event.target.value)}
              aria-label="Search review queue"
              className="min-w-0 flex-1 bg-transparent text-xs text-[#171717] outline-none placeholder:text-[#8a8a82]"
              placeholder="Search review queue..."
            />
          </label>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#171717]">Split-view editor</h2>
              <RiskBadge risk={normalizeBoardRisk(selectedReviewItem.risk)} />
            </div>
            <p className="mt-0.5 text-xs text-[#6e6e68]">
              {selectedReviewItem.id} · {selectedReviewItem.title}
            </p>
          </div>
          <button
            onClick={() => onNoopAction(`Run legal/tax compliance check for ${selectedReviewItem.id}`)}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] sm:w-auto"
            type="button"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Check Legal/Tax Compliance
          </button>
          <button
            onClick={() => onOpenContentJob(selectedReviewItem.workflowId ?? selectedReviewItem.id)}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#171717] px-3 text-xs font-semibold text-white hover:bg-[#2f2f2b] sm:w-auto"
            type="button"
          >
            Open job detail
          </button>
        </div>

        <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Create Post package handoff</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">
                Package metadata from Create Post travels with this review item so legal/tax reviewers can verify the original intent, sources, audience, and publishing target.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {reviewPackageLanguages.map((language) => (
                <Tag key={language}>{language}</Tag>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {reviewPackageMeta.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#deded8] bg-white px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
                <div className="mt-1 truncate text-xs font-semibold text-[#171717]">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-xl border border-[#d7e1f4] bg-white p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Visual brief</div>
              <p className="mt-1 text-xs leading-relaxed text-[#4f4f49]">
                {normalizeTextValue(selectedReviewItem.visualBrief) || 'Visual brief pending. Image & Layout Agent will summarize approved text before asset generation.'}
              </p>
              {normalizeTextValue(selectedReviewItem.creativeSummary) ? (
                <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">
                  Creative summary: {normalizeTextValue(selectedReviewItem.creativeSummary)}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl border border-[#deded8] bg-white p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Selected assets</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(selectedReviewItem.selectedAssets?.length ? selectedReviewItem.selectedAssets : ['Pending asset selection']).map((asset) => {
                  const isUrl = asset.startsWith('http');
                  return isUrl ? (
                    <div key={asset} className="h-12 w-12 overflow-hidden rounded-lg border border-[#deded8] bg-[#fbfbfa]">
                      <img src={asset} alt="Selected asset" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <Tag key={asset}>{asset}</Tag>
                  );
                })}
              </div>

              {selectedReviewItem.generatedAssets && selectedReviewItem.generatedAssets.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {selectedReviewItem.generatedAssets
                    .filter((a) =>
                      !a.isPlaceholder &&
                      (a.assetType === 'image' ||
                        a.assetType === 'thumbnail' ||
                        a.assetType === 'carousel_slide' ||
                        Boolean(a.url) ||
                        Boolean(a.storagePath))
                    )
                    .map((asset, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-lg border border-[#e8e8e4] bg-[#fbfbfa]">
                        {asset.url ? (
                          <img
                            src={asset.url}
                            alt={asset.altText || 'Asset'}
                            className="aspect-square w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square w-full items-center justify-center text-[10px] text-[#8a8a82]">
                            {asset.storagePath ? 'Stored' : 'No URL'}
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 p-1 text-[9px] text-white transition-transform group-hover:translate-y-0">
                          {asset.assetType}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {selectedReviewItem.generatedAssets?.some((asset) => asset.isPlaceholder || asset.availabilityStatus === 'pending') ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] leading-relaxed text-amber-800">
                  Real image output is still pending. Review stays attached to the live asset job and will use the generated image once `content_assets.url` or storage output is available.
                </div>
              ) : null}

              {normalizeTextValue(selectedReviewItem.degradedMessage) ? (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-[11px] leading-relaxed text-rose-700">
                  {normalizeTextValue(selectedReviewItem.degradedMessage)}
                </div>
              ) : null}

              <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">
                {selectedReviewItem.assetComposerStatus ?? 'Asset Composer status will appear here after Create Post packaging.'}
              </p>
              {normalizeTextValue(selectedReviewItem.approvalRecommendation) ? (
                <p className="mt-2 text-[11px] leading-relaxed text-[#4f4f49]">
                  Approval recommendation: {normalizeTextValue(selectedReviewItem.approvalRecommendation)}
                </p>
              ) : null}
              {normalizeTextValue(selectedReviewItem.requiredFix) ? (
                <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">
                  Required fix: {normalizeTextValue(selectedReviewItem.requiredFix)}
                </p>
              ) : null}
              <p className="mt-1 text-[11px] font-semibold text-[#4f4f49]">
                Selected assets attached: {selectedReviewItem.selectedAssets?.length ? selectedReviewItem.selectedAssets.join(', ') : 'none yet'}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-[#e8e8e4] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {selectedReviewDrafts.map((draft) => (
            <ReviewLanguagePanel key={draft.language} language={draft.language} title={draft.title} body={draft.body} />
          ))}
        </div>

        <div className="border-t border-[#e8e8e4] bg-[#fbfbfa] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Referenced sources</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {selectedReviewSources.map((source) => (
              <div key={source} className="rounded-xl border border-[#deded8] bg-white p-3 text-xs font-medium text-[#4f4f49]">
                {source}
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">AI Compliance Checker</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Checks citations, legal/tax claims, translation consistency, and prohibited guarantee wording.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {complianceFindings.map((finding) => (
              <ComplianceFinding key={finding.label} finding={finding} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">Decision actions</h2>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-[#4f4f49]">Reviewer reason / notes</span>
            <textarea
              value={effectiveReviewReason}
              onChange={(event) => setReviewReason(event.target.value)}
              className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#deded8] bg-white p-3 text-xs leading-relaxed text-[#171717] outline-none ring-[#2f4f7f] placeholder:text-[#8a8a82] focus:ring-1"
              placeholder="Explain why this content is approved, rejected, or queued..."
            />
          </label>
          <div className="mt-3 rounded-xl border border-[#deded8] bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#171717]">Decision summary</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${decisionMeta.tone}`}>{decisionMeta.label}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">{decisionMeta.detail}</p>
            {reviewDecision !== 'pending' ? (
              <div className="mt-3 rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] p-2 text-[11px] leading-relaxed text-[#4f4f49]">
                Audit trail: Managing Partner recorded “{decisionMeta.label}” with reviewer notes. This event is ready to sync into system logs.
              </div>
            ) : null}
          </div>
          {!canMoveFromReviewQueue ? (
            <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 text-[11px] leading-relaxed text-rose-800">
              Only Agent Orchestrator can move this item out of In Review.
            </div>
          ) : null}
          <div className="mt-3 space-y-2">
            <button
              onClick={() => recordReviewDecision('approved')}
              disabled={!canMoveFromReviewQueue}
              className={`flex h-10 w-full items-center justify-between rounded-lg border border-emerald-200 px-3 text-sm font-semibold ${
                canMoveFromReviewQueue ? 'bg-emerald-50 text-emerald-800 hover:bg-white' : 'cursor-not-allowed bg-emerald-100 text-emerald-700'
              }`}
              type="button"
            >
              Approve
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => recordReviewDecision('rejected')}
              disabled={!canMoveFromReviewQueue}
              className={`flex h-10 w-full items-center justify-between rounded-lg border border-rose-200 px-3 text-sm font-semibold ${
                canMoveFromReviewQueue ? 'bg-rose-50 text-rose-800 hover:bg-white' : 'cursor-not-allowed bg-rose-100 text-rose-700'
              }`}
              type="button"
            >
              Reject
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => recordReviewDecision('queued')}
              disabled={!canMoveFromReviewQueue}
              className={`flex h-10 w-full items-center justify-between rounded-lg border border-[#cfd8ea] px-3 text-sm font-semibold ${
                canMoveFromReviewQueue ? 'bg-[#f4f7fd] text-[#2f4f7f] hover:bg-white' : 'cursor-not-allowed bg-[#f7f9fd] text-[#6f7380]'
              }`}
              type="button"
            >
              Auto Queue
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}

function RulesBrandView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <MiniPageCard label="Team roles" value="4" detail="Admin, lawyer, accountant, editor" icon={UsersIcon} />
          <MiniPageCard label="Voice profiles" value="2" detail="Lawyer and accounting modes" icon={MessageSquareText} />
          <MiniPageCard label="Guardrails" value="12" detail="Forbidden claims and review rules" icon={ShieldCheck} />
        </div>

        <section className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="border-b border-[#e8e8e4] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#171717]">Team Members & Permissions</h2>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Control who can post, approve, review, or only edit drafts.</p>
          </div>
          <div className="divide-y divide-[#e8e8e4]">
            {teamMembers.map((member) => (
              <div key={member.name} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_132px_220px_84px] md:items-center">
                <div className="min-w-0 text-sm font-semibold text-[#171717]">{member.name}</div>
                <span className="w-fit rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">{member.role}</span>
                <div className="min-w-0 text-xs leading-relaxed text-[#6e6e68]">{member.access}</div>
                <button className="w-full rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] md:w-auto" type="button">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <BrandVoiceCard
            title="Lawyer Brand Voice"
            tone="Professional, precise, careful, citation-first"
            rules={[
              'Avoid guaranteeing legal outcomes.',
              'Use cautious wording for litigation and compliance risk.',
              'Always reference legal basis when making claims.',
            ]}
          />
          <BrandVoiceCard
            title="Accounting Brand Voice"
            tone="Clear, practical, deadline-aware, business-friendly"
            rules={[
              'Explain tax/accounting duties in simple operational language.',
              'Mention deadlines and required documents clearly.',
              'Avoid promising exact tax savings without context.',
            ]}
          />
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h2 className="text-sm font-semibold text-[#171717]">What AI should know about us</h2>
          <p className="mt-1 text-xs text-[#6e6e68]">Office-specific context used before drafting, reviewing, or translating content.</p>
          <textarea
            className="mt-3 min-h-28 w-full resize-none rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3 text-sm leading-relaxed text-[#2f3a4b] outline-none ring-[#2f4f7f] focus:ring-1"
            defaultValue="We are a professional legal and accounting advisory office serving Thai SMEs, foreign investors, and founders who need practical compliance guidance. Content should be accurate, cautious, helpful, and never overpromise outcomes."
          />
        </section>
      </section>

      <aside className="space-y-4">
        <RulesPillPanel title="Prohibited words / claims" items={prohibitedTerms} tone="danger" />
        <RulesPillPanel title="Target Audience" items={targetAudiences} />
        <RulesPillPanel title="Core Services" items={coreServices} />

        <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">System rule summary</h2>
          <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">
            AI must follow professional ethics, avoid exaggerated claims, cite Knowledge Base sources, and route legal/tax risk to Review Queue before publishing.
          </p>
        </section>
      </aside>
    </div>
  );
}

function buildAgentQueueOverview() {
  const orchestrator = findAgentBlueprint('Agent Orchestrator');
  const content = findAgentBlueprint('Content Strategy Agent');
  const image = findAgentBlueprint('Image & Layout Agent');
  const compliance = findAgentBlueprint('Legal Compliance Agent');
  const publish = findAgentBlueprint('Publishing Agent');

  const agentStats = (agent: (typeof agentBlueprints)[number] | undefined) => {
    if (!agent) return { activity: 0, runs: 0 };
    return { activity: agent.activity, runs: agent.runs };
  };

  const orchestratorStats = agentStats(orchestrator);
  const contentStats = agentStats(content);
  const imageStats = agentStats(image);
  const reviewStats = agentStats(compliance);
  const publishStats = agentStats(publish);

  return [
    {
      label: 'Orchestrator',
      value: 'Agent Orchestrator',
      detail: 'Controls queue order, validates prerequisites, assigns owners, and blocks invalid transitions.',
      stage: 'Brief -> Sources -> Text -> Image -> QC -> Publish',
      queue: 'review-pipeline',
      badge: 'Core',
      tone: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
      activity: orchestratorStats.activity,
      runs: orchestratorStats.runs,
    },
    {
      label: 'Content',
      value: 'Content Strategy Agent',
      detail: 'Combines brief planning, source grounding, style memory, and draft generation for MVP.',
      stage: 'Requirement -> Grounded draft -> Text package',
      queue: 'content-queue',
      badge: contentStats.activity >= 80 ? 'High use' : 'Ready',
      tone: contentStats.activity >= 80 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      activity: contentStats.activity,
      runs: contentStats.runs,
    },
    {
      label: 'Asset',
      value: 'Image & Layout Agent',
      detail: 'Builds visual brief, image options, carousel/grid/single layout, and platform-ready assets.',
      stage: 'Text package -> Visual brief -> Assets',
      queue: 'image-layout-queue',
      badge: imageStats.activity >= 80 ? 'High use' : 'Ready',
      tone: imageStats.activity >= 80 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      activity: imageStats.activity,
      runs: imageStats.runs,
    },
    {
      label: 'Review',
      value: 'Legal Compliance Agent',
      detail: 'Combines legal, tax/accounting, localization sanity, and brand compliance checks for MVP.',
      stage: 'QC -> Human review -> Approval gate',
      queue: 'review-queue',
      badge: reviewStats.activity >= 80 ? 'High use' : 'Ready',
      tone: reviewStats.activity >= 80 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      activity: reviewStats.activity,
      runs: reviewStats.runs,
    },
    {
      label: 'Publishing',
      value: 'Publishing Agent',
      detail: 'Queues approved posts, checks connectors, records retry/failure logs, and stops before unapproved publish.',
      stage: 'Approved -> Schedule -> Publish log',
      queue: 'publish-queue',
      badge: publishStats.activity >= 80 ? 'High use' : 'Ready',
      tone: publishStats.activity >= 80 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      activity: publishStats.activity,
      runs: publishStats.runs,
    },
  ];
}

function findAgentBlueprint(name: string) {
  return agentBlueprints.find((agent) => agent.name === name);
}

function AgentsView({
  agents,
  onRunAgentQueue,
  isRunning,
  connectionPreference,
}: {
  agents: DashboardAgent[];
  onRunAgentQueue: () => void;
  isRunning: boolean;
  connectionPreference: AgentRuntimePreference;
}) {
  const [showNewAgent, setShowNewAgent] = useState(false);
  const lockedNewAgent = !planEntitlements.customAgents;
  const agentQueueOverview = buildAgentQueueOverview();
  const connectionLabel =
    connectionPreference === 'auto'
      ? 'Auto runtime select'
      : connectionPreference === 'multica'
        ? 'Multica daemon first'
        : connectionPreference === 'codex'
          ? 'Codex local first'
          : 'OpenAI API first';
  const liveAgentNames = new Set(agents.map((agent) => agent.name));
  const activeAgentSource = agents.filter((agent) => coreAgentNames.includes(agent.name));
  const displayAgents = activeAgentSource.map((agent) => {
    const blueprint = agentBlueprints.find((item) => item.name === agent.name);

    return {
      name: agent.name,
      purpose: blueprint?.purpose ?? agent.task,
      model: blueprint?.model ?? 'Live route',
      provider: blueprint?.provider ?? connectionLabel,
      workload: agent.task,
      runs: agent.runs,
      activity: agent.load,
      state: agent.state,
    };
  });
  const hiddenAgents = agentBlueprints.filter((agent) => !coreAgentNames.includes(agent.name) || !liveAgentNames.has(agent.name));
  const onlineCount = displayAgents.filter((agent) => agent.state === 'Online').length;
  const idleCount = displayAgents.filter((agent) => agent.state === 'Idle').length;
  const offlineCount = displayAgents.filter((agent) => agent.state === 'Offline').length;

  return (
    <div className="space-y-4">
      {showPlanBanner ? (
        <section className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#cfcfc8] bg-white">
              <Sparkles className="h-4 w-4 text-[#4f4f49]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-[#171717]">{planEntitlements.name} plan</h2>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Custom agents locked</span>
              </div>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#6e6e68]">
                Built-in specialist agents are available now. Creating new agents, choosing provider models, and editing system prompts are reserved for Pro/Business upsell.
              </p>
            </div>
          </div>
          <button className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]" type="button">
            View upgrade options
          </button>
        </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#deded8] bg-[#f6f6f2]">
              <Bot className="h-4 w-4 text-[#4f4f49]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#171717]">Agents</h2>
                <span className="text-xs text-[#8a8a82]">{displayAgents.length} active</span>
              </div>
              <p className="truncate text-xs text-[#6e6e68]">Only the 5 production agents are active. Other specialist agents stay hidden for later rollout.</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <button
              onClick={onRunAgentQueue}
              disabled={isRunning}
              className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 text-xs font-semibold text-[#2f4f7f] sm:w-auto ${
                isRunning ? 'cursor-not-allowed opacity-70' : 'hover:bg-white'
              }`}
              type="button"
            >
              <Bot className="h-3.5 w-3.5" />
              {isRunning ? 'Running queue...' : 'Run agent queue'}
            </button>
            <span className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 text-[11px] font-semibold text-[#6e6e68] sm:w-auto">
              {connectionLabel}
            </span>
            <button
              onClick={() => setShowNewAgent(true)}
              className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold sm:w-auto ${
                lockedNewAgent
                  ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50'
                  : 'border-[#cfcfc8] bg-[#f6f6f2] text-[#171717] hover:bg-white'
              }`}
              type="button"
              aria-label={
                planEntitlements.customAgents
                  ? 'Create new agent'
                  : 'Custom agents locked. Upgrade to create a new agent.'
              }
              title={
                planEntitlements.customAgents
                  ? 'Create new agent'
                  : 'Custom agents locked. Upgrade to create a new agent.'
              }
            >
              {planEntitlements.customAgents ? <Plus className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {lockedNewAgent ? '+ New Agent locked' : '+ New Agent'}
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#e8e8e4] bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
          {agentQueueOverview.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
                  <div className="mt-2 truncate text-base font-semibold tracking-[-0.03em] text-[#171717]">{item.value}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${item.tone}`}>
                  {item.badge}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-[#6e6e68]">
                  <span>{item.stage}</span>
                  <span>{item.runs} runs</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#e8e8e4]">
                  <div className="h-1.5 rounded-full bg-[#2f4f7f]" style={{ width: `${item.activity}%` }} />
                </div>
              </div>
              <p className="mt-2 truncate font-mono text-[11px] text-[#8a8a82]">{item.queue}</p>
            </div>
          ))}
        </div>

        <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#6e6e68] sm:w-72">
              <Search className="h-4 w-4" />
              <input
                aria-label="Search agents"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#8a8a82]"
                placeholder="Search agents..."
              />
            </label>
            <div className="flex items-center rounded-xl border border-[#deded8] bg-[#f6f6f2] p-1">
              {['Mine', 'All'].map((tab, index) => (
                <button
                  key={tab}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold ${index === 0 ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68]'}`}
                  type="button"
                >
                  {tab} {displayAgents.length}
                </button>
              ))}
            </div>
            <button className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              All runtimes
            </button>
            <button className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Recent activity
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[`Core ${displayAgents.length}`, `Hidden ${hiddenAgents.length}`, `Online ${onlineCount}`, `Idle ${idleCount}`, `Offline ${offlineCount}`].map((filter, index) => (
              <button
                key={filter}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  index === 0 ? 'border-[#cfcfc8] bg-white text-[#171717]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                }`}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="border-b border-[#e8e8e4] bg-[#f6f6f2] text-[11px] uppercase tracking-[0.14em] text-[#8a8a82]">
              <tr>
                <th className="px-4 py-2 font-semibold">Agent</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Workload</th>
                <th className="px-4 py-2 font-semibold">Model</th>
                <th className="px-4 py-2 font-semibold">Provider</th>
                <th className="px-4 py-2 font-semibold">Activity (7D)</th>
                <th className="px-4 py-2 font-semibold">Runs</th>
                <th className="px-4 py-2 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e4]">
              {displayAgents.map((agent) => (
                <AgentTableRow key={agent.name} agent={agent} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showNewAgent && <NewAgentDialog onClose={() => setShowNewAgent(false)} locked={lockedNewAgent} />}
    </div>
  );
}

function AgentOperatingModelPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-[#171717]">Built-in OpenAI operating model</h2>
          <p className="mt-0.5 max-w-3xl text-xs leading-relaxed text-[#6e6e68]">
            Quick AI Mode should hand work from text generation to image/layout composition, then to human review and publishing queue using these real agents.
          </p>
        </div>
        <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-2.5 py-1 text-[10px] font-semibold text-[#2f4f7f]">
          OpenAI only
        </span>
      </div>

      <div className="grid gap-3 p-4 lg:grid-cols-3">
        {agentOperatingWorkflow.map((step) => (
          <article key={step.step} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49]">
                {step.step}
              </div>
              <Tag>{step.model}</Tag>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#171717]">{step.stage}</h3>
            <p className="mt-1 text-xs font-semibold text-[#4f4f49]">{step.agent}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">{step.output}</p>
            <div className="mt-3 rounded-xl border border-[#deded8] bg-white px-3 py-2 text-[11px] leading-relaxed text-[#4f4f49]">
              Handoff: {step.handoff}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AgentRoutingSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-[#171717]">Built-in OpenAI route rules</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-[#6e6e68]">
            Read-only routing map for the current plan. Users can see how work is assigned, while custom route/model editing remains locked for upsell.
          </p>
        </div>
        <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2.5 py-1 text-[10px] font-semibold text-[#4f4f49]">
          Ready for backend agent_routes
        </span>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="border-b border-[#e8e8e4] bg-[#f6f6f2] text-[11px] uppercase tracking-[0.14em] text-[#8a8a82]">
              <tr>
                <th className="px-4 py-2 font-semibold">Task</th>
                <th className="px-4 py-2 font-semibold">Default agent</th>
                <th className="px-4 py-2 font-semibold">Model</th>
                <th className="px-4 py-2 font-semibold">Trigger</th>
                <th className="px-4 py-2 font-semibold">Routing rule</th>
                <th className="px-4 py-2 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e4]">
              {agentRoutingRows.map((row) => (
                <tr key={row.task} className="hover:bg-[#fbfbfa]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-[#f6f6f2]">
                        <Zap className="h-3.5 w-3.5 text-[#4f4f49]" />
                      </div>
                      <span className="text-sm font-semibold text-[#171717]">{row.task}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#4f4f49]">{row.agent}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg border border-[#deded8] bg-[#fbfbfa] px-2 py-1 text-[11px] font-semibold text-[#4f4f49]">{row.model}</span>
                  </td>
                  <td className="max-w-[240px] px-4 py-3 text-xs leading-relaxed text-[#6e6e68]">{row.trigger}</td>
                  <td className="max-w-[260px] px-4 py-3 text-xs leading-relaxed text-[#6e6e68]">{row.rule}</td>
                  <td className="px-4 py-3">
                    <RiskPill risk={row.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="border-t border-[#e8e8e4] bg-[#fbfbfa] p-4 xl:border-l xl:border-t-0">
          <div className="rounded-2xl border border-[#deded8] bg-white p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#4f4f49]" />
              <h3 className="text-sm font-semibold text-[#171717]">Escalation rules</h3>
            </div>
            <div className="mt-3 space-y-2">
              {agentEscalationRules.map((rule, index) => (
                <div key={rule} className="flex gap-2 rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#deded8] bg-white text-[10px] font-semibold text-[#6e6e68]">{index + 1}</span>
                  <p className="text-xs leading-relaxed text-[#4f4f49]">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function RiskPill({ risk }: { risk: string }) {
  const className =
    risk === 'High'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : risk === 'Medium'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}>{risk}</span>;
}

function SettingsView({
  agentConnectionPreference,
  onAgentConnectionPreferenceChange,
}: {
  agentConnectionPreference: AgentRuntimePreference;
  onAgentConnectionPreferenceChange: (value: AgentRuntimePreference) => void;
}) {
  const [settingsPage, setSettingsPage] = useState('Integrations');

  return (
    <div className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="grid lg:min-h-[720px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-[#deded8] bg-[#fbfbfa] p-3 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-2 lg:mb-6">
            <Settings className="h-4 w-4 text-[#171717]" />
            <h2 className="text-sm font-semibold text-[#171717]">Settings</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:block lg:space-y-6">
            {settingsGroups.map((group) => (
              <div key={group.label} className="min-w-0">
                <div className="mb-2 text-xs font-medium text-[#6e6e68]">{group.label}</div>
                <div className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
                  {group.items.map((item) => {
                    const active = item === settingsPage;

                    return (
                      <button
                        key={item}
                        onClick={() => setSettingsPage(item)}
                        className={`flex h-8 shrink-0 items-center justify-between gap-3 rounded-lg px-2 text-left text-sm lg:w-full ${
                          active ? 'bg-[#eeeeea] font-semibold text-[#171717]' : 'text-[#5f5f58] hover:bg-[#f6f6f2]'
                        }`}
                        type="button"
                      >
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <SettingsMenuIcon name={item} />
                          {item}
                        </span>
                        {active && <span className="hidden h-5 w-0.5 rounded-full bg-[#8b8b84] lg:block" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0 overflow-x-hidden p-4 md:p-8">
          {settingsPage === 'Integrations' ? (
            <SettingsIntegrations />
          ) : settingsPage === 'Codex Local' ? (
            <SettingsCodexConnection />
          ) : settingsPage === 'API Tokens' ? (
            <SettingsApiTokens
              providerPreference={agentConnectionPreference}
              onProviderPreferenceChange={onAgentConnectionPreferenceChange}
            />
          ) : settingsPage === 'Updates' ? (
            <SettingsReleaseReadiness />
          ) : (
            <SettingsProfile page={settingsPage} />
          )}
        </section>
      </div>
    </div>
  );
}

function LogsView({
  workflowErrors = [],
  loading = false,
  error = '',
  targetWorkflowId,
  onOpenContentJob,
}: {
  workflowErrors?: LogEvent[];
  loading?: boolean;
  error?: string;
  targetWorkflowId?: string | null;
  onOpenContentJob?: (id: string) => void;
}) {
  const [activeLogFilters, setActiveLogFilters] = useState(['Last 7 days', 'All log types', 'Mask sensitive data', 'Exclude API keys']);
  const allErrorEvents = [...workflowErrors, ...errorEvents];
  const targetReviewId = targetWorkflowId ? getReviewIdForWorkflowId(targetWorkflowId) : null;
  const targetPublishingId = targetWorkflowId ? getPublishingIdForWorkflowId(targetWorkflowId) : null;
  const targetWorkflowIds = [targetWorkflowId, targetReviewId, targetPublishingId].filter(Boolean) as string[];
  const isTargetWorkflowEvent = (event: LogEvent) =>
    targetWorkflowIds.length > 0 &&
    targetWorkflowIds.some((id) => event.itemId === id || event.relatedId === id || event.message.includes(id));
  const targetWorkflowEvents = workflowErrors.filter(isTargetWorkflowEvent);
  const workflowEventsToRender =
    targetWorkflowIds.length > 0
      ? [...targetWorkflowEvents, ...workflowErrors.filter((event) => !isTargetWorkflowEvent(event))]
      : workflowErrors;
  const toggleLogFilter = (filter: string) => {
    setActiveLogFilters((current) => (current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]));
  };
  const filteredErrorEvents = allErrorEvents.filter((event) => {
    if (activeLogFilters.includes('High + Medium severity') && event.severity !== 'High' && event.severity !== 'Medium') {
      return false;
    }

    if (!activeLogFilters.includes('All log types') && event.type !== 'Agent failed') {
      return false;
    }

    return true;
  });
  const safeLogFilters = activeLogFilters.filter((filter) => filter !== 'Exclude API keys' && filter !== 'Mask sensitive data');

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#171717]">Export logs</h2>
            <p className="mt-1 text-xs text-[#6e6e68]">Export filtered logs for debugging, audit trails, partner reports, or developer handoff.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={!planEntitlements.logExports} className="rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white disabled:cursor-not-allowed disabled:opacity-55" type="button">
              Export CSV
            </button>
            <button disabled={!planEntitlements.logExports} className="rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white disabled:cursor-not-allowed disabled:opacity-55" type="button">
              Export JSON
            </button>
            <button disabled={!planEntitlements.logExports} className="rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white disabled:cursor-not-allowed disabled:opacity-55" type="button">
              Export PDF
            </button>
          </div>
        </div>
        {!planEntitlements.logExports ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            Log export is locked on Basic. The backend API already returns an upgrade-required response, so this is ready for Pro/Business upsell.
          </div>
        ) : null}
        {loading ? (
          <div className="mt-4 rounded-xl border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#2f4f7f]">
            Loading live system logs...
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            {error}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {['Last 7 days', 'All log types', 'High + Medium severity', 'Mask sensitive data', 'Exclude API keys'].map((filter) => (
            <button
              key={filter}
              aria-pressed={activeLogFilters.includes(filter)}
              onClick={() => toggleLogFilter(filter)}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold hover:bg-white ${
                activeLogFilters.includes(filter) ? 'border-[#cfcfc8] bg-white text-[#171717]' : 'border-[#deded8] bg-[#fbfbfa] text-[#4f4f49]'
              }`}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[#6e6e68]">
          Showing {filteredErrorEvents.length}/{allErrorEvents.length} monitor events. Safety filters active: {safeLogFilters.length > 0 ? safeLogFilters.join(' · ') : 'none'}.
        </p>
        {targetWorkflowId ? (
          <div className="mt-3 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs text-[#2f4f7f]">
            Focused workflow: {targetWorkflowId} · {targetReviewId} · {targetPublishingId}. Found {targetWorkflowEvents.length} matching workflow event{targetWorkflowEvents.length === 1 ? '' : 's'}.
          </div>
        ) : null}
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {logSummary.map((item) => (
          <MiniPageCard key={item.label} label={item.label} value={item.value} detail={item.detail} icon={item.icon} />
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-[#171717]">Workflow audit trail</h2>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Status changes from Review Queue, Agent Queue, Publishing Queue, and Dashboard Pipeline.</p>
          </div>
          <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
            {workflowEventsToRender.length} workflow event{workflowEventsToRender.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="divide-y divide-[#e8e8e4]">
          {workflowEventsToRender.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[#6e6e68]">
              No workflow events yet. Failed publishing syncs and agent handoffs will appear here as soon as the workflow changes status.
            </div>
          ) : null}
          {workflowEventsToRender.map((event) => (
            <LogErrorRow key={`workflow-${event.time}-${event.message}`} event={event} showChain onOpenContentJob={onOpenContentJob} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Error / bug monitor</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Track failed agents, sync errors, RAG misses, UI bugs, and integration issues.</p>
            </div>
	            <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">{filteredErrorEvents.length} shown</span>
	            <button disabled={!planEntitlements.logExports} className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] disabled:cursor-not-allowed disabled:opacity-55" type="button">
              Export logs
            </button>
          </div>
          <div className="divide-y divide-[#e8e8e4]">
            {filteredErrorEvents.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#6e6e68]">No log events match the active filters.</div>
            ) : null}
            {filteredErrorEvents.map((event) => (
              <LogErrorRow key={`${event.time}-${event.message}`} event={event} onOpenContentJob={onOpenContentJob} />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h2 className="text-sm font-semibold text-[#171717]">Frequently used features</h2>
            <div className="mt-4 space-y-3">
              {featureUsage.map((item) => (
                <div key={item.feature}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="min-w-0 text-xs font-semibold text-[#171717]">{item.feature}</span>
                    <span className="text-[11px] text-[#6e6e68]">{item.count} uses</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#e8e8e4]">
                    <div className="h-1.5 rounded-full bg-[#8b8b84]" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
            <h2 className="text-sm font-semibold text-[#171717]">Monitor policy</h2>
            <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">
              Every AI run, review decision, publishing attempt, integration sync, and important user action should create a log event for debugging and audit trails.
            </p>
          </section>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <LogTable title="Agent activity logs" rows={agentActivityLogs} type="agent" />
        <LogTable title="User activity logs" rows={userActivityLogs} type="user" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="border-b border-[#e8e8e4] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#171717]">Export history</h2>
          <p className="mt-0.5 text-xs text-[#6e6e68]">Tracks who exported logs, selected format, and applied filters.</p>
        </div>
        <div className="divide-y divide-[#e8e8e4]">
          {logExports.map((item) => (
              <div key={`${item.format}-${item.time}`} className="grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] md:grid-cols-[90px_150px_minmax(0,1fr)_140px_100px] md:items-center">
                <span className="w-fit rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{item.format}</span>
                <div className="min-w-0 text-xs font-semibold text-[#171717]">{item.scope}</div>
                <div className="min-w-0 text-xs leading-relaxed text-[#6e6e68]">{item.filter}</div>
                <div className="min-w-0 text-xs text-[#4f4f49]">{item.user}</div>
                <div className="text-xs font-semibold text-[#8a8a82]">{item.time}</div>
              </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsCodexConnection() {
  const [codexConnectionStatus, setCodexConnectionStatus] = useState<'Ready' | 'Testing' | 'Connected'>('Ready');
  const [codexLastAction, setCodexLastAction] = useState('Waiting for local bridge approval');
  const [codexActivity, setCodexActivity] = useState([
    { time: 'now', title: 'Codex Local page opened', detail: 'Settings prepared for local workspace bridge.' },
    { time: 'ready', title: 'Workspace allowlist loaded', detail: '/Users/jakarinosk/HEAD-OFFICE/head-office-app' },
  ]);

  const addCodexActivity = (title: string, detail: string) => {
    setCodexActivity((current) => [{ time: 'now', title, detail }, ...current].slice(0, 5));
  };

  const handleTestConnection = () => {
    setCodexConnectionStatus('Testing');
    setCodexLastAction('Testing local Codex bridge permissions');
    addCodexActivity('Connection test requested', 'Checking desktop app, workspace path, and allowed agent actions.');
    window.setTimeout(() => {
      setCodexConnectionStatus('Ready');
      setCodexLastAction('Local bridge responded');
      addCodexActivity('Connection test passed', 'Mock bridge is ready. Backend signed bridge is the next implementation task.');
    }, 450);
  };

  const handleConnectLocalCodex = () => {
    setCodexConnectionStatus('Connected');
    setCodexLastAction('Connected to local Codex runtime');
    addCodexActivity('Local Codex connected', 'Audit, task planning, and staged edit commands are enabled in UI mode.');
  };

  const handleOpenWorkspace = () => {
    setCodexLastAction('Workspace open request recorded');
    addCodexActivity('Open workspace requested', 'A real bridge would open the approved HEAD-OFFICE workspace in Codex.');
  };

  const codexHealth = [
    { label: 'Desktop app', value: codexConnectionStatus === 'Connected' ? 'Connected' : 'Detected', detail: 'Codex local session is available on this machine.' },
    { label: 'Workspace', value: 'HEAD-OFFICE', detail: '/Users/jakarinosk/HEAD-OFFICE/head-office-app' },
    { label: 'Agent mode', value: 'Local first', detail: 'Use local Codex for audits, task planning, and safe file edits.' },
    { label: 'Access scope', value: 'Project only', detail: 'Recommended: limit actions to approved workspace paths.' },
  ];

  const codexActions = [
    'Audit current page and create tasks',
    'Run local health checks after each stage',
    'Prepare code changes from approved tasks',
    'Write workflow logs for agent handoff',
  ];

  const codexPermissionMatrix = [
    { action: 'Audit page/workflow', status: 'Allowed', detail: 'Read rendered UI, compare stage requirements, and create task notes.' },
    { action: 'Edit approved files', status: 'Allowed with task', detail: 'Only after the task is part of the approved stage roadmap.' },
    { action: 'Run checks', status: 'Allowed', detail: 'Lint, curl health, and browser smoke audits after each completed stage.' },
    { action: 'Destructive git actions', status: 'Blocked', detail: 'No reset, checkout, revert, or amend without explicit user approval.' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Codex Local Connection</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">
            Connect this web workspace with the Codex app running on your Mac so local audits, staged tasks, and agent handoffs can be controlled from the platform.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {codexConnectionStatus === 'Testing' ? 'Testing bridge' : codexConnectionStatus === 'Connected' ? 'Local bridge connected' : 'Local bridge ready'}
        </span>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#deded8] bg-[#eeeeea]">
              <Bot className="h-5 w-5 text-[#171717]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#171717]">Codex Desktop Bridge</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-[#6e6e68]">
                Mock-ready UI for local Codex connection. Backend endpoint can later call a signed local bridge or approved agent runner.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <button
              onClick={handleTestConnection}
              className="flex-1 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white sm:flex-none"
              type="button"
            >
              {codexConnectionStatus === 'Testing' ? 'Testing...' : 'Test connection'}
            </button>
            <button onClick={handleConnectLocalCodex} className="flex-1 rounded-lg bg-[#171717] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2f2f2b] sm:flex-none" type="button">
              {codexConnectionStatus === 'Connected' ? 'Connected' : 'Connect local Codex'}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs leading-relaxed text-[#2f4f7f]">
          Current status: {codexLastAction}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {codexHealth.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 truncate text-sm font-semibold text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Local connection settings</h3>
              <p className="mt-1 text-xs text-[#6e6e68]">Keep the values explicit so users understand what Codex can access.</p>
            </div>
            <button onClick={handleOpenWorkspace} className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Open workspace
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Workspace path</span>
              <input
                className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
                defaultValue="/Users/jakarinosk/HEAD-OFFICE/head-office-app"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Local bridge endpoint</span>
              <input
                className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
                defaultValue="codex://local/head-office"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Default audit rule</span>
              <select className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1" defaultValue="Audit after every stage">
                <option>Audit after every stage</option>
                <option>Audit only before deploy</option>
                <option>Manual approval only</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Agent execution</span>
              <select className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1" defaultValue="Plan first, edit after approval">
                <option>Plan first, edit after approval</option>
                <option>Auto-fix low risk tasks</option>
                <option>Read-only audit mode</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Log destination</span>
              <input
                className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
                defaultValue="Workflow Logs / system_logs"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#6e6e68]">Stage gate</span>
              <input
                className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
                defaultValue="Audit must pass before next stage"
              />
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            Safety note: production should never expose unrestricted local file access from the browser. Use a signed local bridge, explicit workspace allowlist, and per-action approval logs.
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
            <h3 className="text-sm font-semibold text-[#171717]">What Codex can do here</h3>
            <div className="mt-3 space-y-2">
              {codexActions.map((action, index) => (
                <div key={action} className="flex gap-3 rounded-xl border border-[#e0e0da] bg-white px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eeeeea] text-[11px] font-semibold text-[#4f4f49]">{index + 1}</span>
                  <span className="text-xs leading-relaxed text-[#4f4f49]">{action}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h3 className="text-sm font-semibold text-[#171717]">Permission matrix</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Defines what the web app may ask local Codex to do before a signed bridge is implemented.</p>
            <div className="mt-3 space-y-2">
              {codexPermissionMatrix.map((item) => (
                <div key={item.action} className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#171717]">{item.action}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        item.status === 'Blocked' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h3 className="text-sm font-semibold text-[#171717]">Local activity</h3>
            <div className="mt-3 space-y-3">
              {codexActivity.map((item) => (
                <div key={`${item.time}-${item.title}-${item.detail}`} className="border-l border-[#deded8] pl-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#171717]">{item.title}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a82]">{item.time}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SettingsProfile({ page }: { page: string }) {
  if (page === 'General') {
    return <BackendReadinessMap />;
  }

  if (page !== 'Profile') {
    return (
      <div>
        <h2 className="text-base font-semibold text-[#171717]">{page}</h2>
        <div className="mt-4 rounded-2xl border border-[#deded8] bg-white p-6">
          <p className="text-sm leading-relaxed text-[#6e6e68]">
            {page} settings will control workspace preferences, notifications, API tokens, daemon runtime, updates, repositories, GitHub, labs, and members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-[#171717]">Profile</h2>
      <div className="mt-4 max-w-3xl rounded-2xl border border-[#deded8] bg-white p-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#deded8] bg-[#dcebff] text-xl font-semibold text-[#2f4f7f]">
            JO
          </div>
          <button className="text-sm text-[#6e6e68] hover:text-[#171717]" type="button">Click to upload avatar</button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-[#6e6e68]">Name</label>
            <input className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm outline-none ring-[#2f4f7f] focus:ring-1" defaultValue="Jakarin Osk" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-[#6e6e68]">About you</label>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg border border-[#deded8] bg-white p-3 text-sm outline-none ring-[#2f4f7f] placeholder:text-[#8a8a82] focus:ring-1"
              placeholder="e.g. Legal/accounting content operator. Prefer concise, accurate, citation-backed content."
            />
            <div className="mt-1 text-xs text-[#6e6e68]">Shared with agents working on your behalf: role, stack, preferences, and context.</div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="w-full rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-white sm:w-auto" type="button">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function BackendReadinessMap() {
  const requiredTables = backendDatabaseTables.filter((item) => item.status === 'Required').length;
  const requiredApis = backendApiContracts.filter((item) => item.status === 'Required').length;
  const serverOnlyEnv = backendEnvContracts.filter((item) => item.visibility === 'Server only').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Backend readiness map</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#6e6e68]">
            Stage 9 defines the backend contract before wiring real Supabase tables, OpenAI agent jobs, publishing workers, and append-only logs.
          </p>
        </div>
        <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-1 text-xs font-semibold text-[#2f4f7f]">
          Ready for implementation planning
        </span>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: 'Supabase tables', value: requiredTables, detail: 'Workflow, review, queue, logs, RAG, assets' },
            { label: 'API contracts', value: requiredApis, detail: 'Next.js route handlers before real mutations' },
            { label: 'Worker queues', value: backendJobQueues.length, detail: 'Agent and publishing jobs by stage' },
            { label: 'Server-only env', value: serverOnlyEnv, detail: 'Secrets never exposed to browser' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <BackendImplementationHandoff />

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="border-b border-[#e8e8e4] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#171717]">Supabase database tables</h3>
          <p className="mt-0.5 text-xs text-[#6e6e68]">Proposed source-of-truth tables. RLS is mandatory for every exposed table.</p>
        </div>
        <div className="divide-y divide-[#e8e8e4]">
          {backendDatabaseTables.map((item) => (
            <div key={item.table} className="grid gap-3 px-4 py-4 lg:grid-cols-[180px_130px_minmax(0,1fr)_220px_90px] lg:items-start">
              <div className="font-mono text-xs font-semibold text-[#171717]">{item.table}</div>
              <div className="text-xs font-semibold text-[#4f4f49]">{item.owner}</div>
              <p className="text-xs leading-relaxed text-[#6e6e68]">{item.purpose}</p>
              <p className="text-xs leading-relaxed text-[#4f4f49]">{item.rls}</p>
              <Tag>{item.status}</Tag>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="border-b border-[#e8e8e4] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#171717]">Next.js API contracts</h3>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Route handlers should initialize service clients lazily and log every mutation.</p>
          </div>
          <div className="divide-y divide-[#e8e8e4]">
            {backendApiContracts.map((item) => (
              <div key={item.route} className="grid gap-3 px-4 py-4 lg:grid-cols-[190px_120px_minmax(0,1fr)_minmax(0,1fr)_90px] lg:items-start">
                <div className="font-mono text-xs font-semibold text-[#171717]">{item.route}</div>
                <div className="text-xs font-semibold text-[#4f4f49]">{item.owner}</div>
                <p className="text-xs leading-relaxed text-[#6e6e68]">Input: {item.input}</p>
                <p className="text-xs leading-relaxed text-[#6e6e68]">Output: {item.output}</p>
                <Tag>{item.status}</Tag>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
            <h3 className="text-sm font-semibold text-[#171717]">Security checklist</h3>
            <div className="mt-3 space-y-2">
              {backendSecurityChecklist.map((item, index) => (
                <div key={item} className="flex gap-2 rounded-xl border border-[#deded8] bg-white p-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#deded8] bg-[#fbfbfa] text-[10px] font-semibold text-[#6e6e68]">{index + 1}</span>
                  <p className="text-xs leading-relaxed text-[#4f4f49]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-900">Backend boundary</h3>
            <p className="mt-2 text-xs leading-relaxed text-amber-800">
              Stage 9 is a readiness contract only. Real schema migrations, RLS policies, Edge Functions, and queue workers should be implemented after this map is accepted.
            </p>
          </section>
        </aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h3 className="text-sm font-semibold text-[#171717]">Worker queues</h3>
          <div className="mt-3 space-y-2">
            {backendJobQueues.map((item) => (
              <div key={item.queue} className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[#171717]">{item.queue}</span>
                  <Tag>{item.worker}</Tag>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">Trigger: {item.trigger}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#4f4f49]">Writes: {item.writes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h3 className="text-sm font-semibold text-[#171717]">Environment visibility</h3>
          <div className="mt-3 space-y-2">
            {backendEnvContracts.map((item) => (
              <div key={item.key} className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[#171717]">{item.key}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      item.visibility.includes('Server') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.visibility}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">Used by: {item.usedBy}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#4f4f49]">Guard: {item.guard}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function BackendImplementationHandoff() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-[#171717]">Backend implementation handoff package</h3>
              <span className="rounded-full border border-[#d8d4c8] bg-[#f6f1df] px-2 py-0.5 text-[11px] font-semibold text-[#7a5b18]">Stage 11</span>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[#6e6e68]">
              Converts the Stage 9 map and Stage 10 simulation into a backend-ready checklist for Supabase Cloud, Next.js routes, OpenAI workers, and final QA.
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Handoff ready
          </span>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 overflow-x-auto p-3">
          <div className="grid min-w-[980px] gap-3">
            {backendImplementationHandoff.map((item, index) => (
              <article key={item.phase} className="grid gap-3 rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3 lg:grid-cols-[44px_150px_150px_minmax(0,1fr)_minmax(0,1fr)_110px] lg:items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cfcfc8] bg-white text-xs font-semibold text-[#4f4f49]">{index + 1}</div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">Phase</div>
                  <p className="mt-1 text-xs font-semibold text-[#171717]">{item.phase}</p>
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">Owner</div>
                  <p className="mt-1 text-xs font-semibold text-[#4f4f49]">{item.owner}</p>
                </div>
                <p className="text-xs leading-relaxed text-[#6e6e68]">{item.deliverable}</p>
                <p className="text-xs leading-relaxed text-[#4f4f49]">Gate: {item.gate}</p>
                <Tag>{item.status}</Tag>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-3 border-t border-[#e8e8e4] bg-[#fbfbfa] p-4 xl:border-l xl:border-t-0">
          <section className="rounded-2xl border border-[#deded8] bg-white p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Supabase policy starter</h4>
            <div className="mt-3 space-y-2">
              {backendRlsPolicyHandoff.map((item) => (
                <div key={item.policy} className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#171717]">{item.table}</span>
                    <span className="font-mono text-[10px] text-[#8a8780]">{item.policy}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{item.access}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <h4 className="text-xs font-semibold text-amber-900">Implementation guardrails</h4>
            <div className="mt-2 space-y-2">
              {backendHandoffChecklist.map((item) => (
                <p key={item} className="text-[11px] leading-relaxed text-amber-800">• {item}</p>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function SettingsReleaseReadiness() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-[#171717]">Release readiness center</h2>
            <span className="rounded-full border border-[#d8d4c8] bg-[#f6f1df] px-2 py-0.5 text-[11px] font-semibold text-[#7a5b18]">Stage 12</span>
          </div>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#6e6e68]">
            Deployment prep for preview, production promotion, rollback, and post-release audit. This page is a readiness gate, not a production deploy trigger.
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          Deploy later · Prep now
        </span>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Release gates', value: releaseReadinessGates.length, detail: 'QA, backend, env, security, rollback' },
          { label: 'Deploy path', value: releaseDeployPath.length, detail: 'Preview → inspect → smoke → promote → rollback' },
          { label: 'Open risks', value: releaseOpenRisks.length, detail: 'Blocked before production enablement' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
            <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#171717]">Production readiness gates</h3>
          <p className="mt-0.5 text-xs text-[#6e6e68]">Every gate needs evidence before a preview deployment can be promoted to production.</p>
        </div>
        <div className="divide-y divide-[#e8e8e4]">
          {releaseReadinessGates.map((item) => (
            <div key={item.gate} className="grid gap-3 px-4 py-4 lg:grid-cols-[180px_140px_minmax(0,1fr)_150px] lg:items-start">
              <div className="text-xs font-semibold text-[#171717]">{item.gate}</div>
              <div className="text-xs font-semibold text-[#4f4f49]">{item.owner}</div>
              <p className="text-xs leading-relaxed text-[#6e6e68]">{item.evidence}</p>
              <Tag>{item.status}</Tag>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h3 className="text-sm font-semibold text-[#171717]">Recommended deployment path</h3>
          <div className="mt-3 space-y-2">
            {releaseDeployPath.map((item, index) => (
              <div key={item.step} className="grid gap-3 rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3 sm:grid-cols-[32px_90px_minmax(0,180px)_1fr] sm:items-start">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#cfcfc8] bg-white text-[11px] font-semibold text-[#4f4f49]">{index + 1}</span>
                <span className="text-xs font-semibold text-[#171717]">{item.step}</span>
                <span className="font-mono text-[11px] text-[#4f4f49]">{item.command}</span>
                <p className="text-xs leading-relaxed text-[#6e6e68]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-900">Production blockers</h3>
            <div className="mt-3 space-y-2">
              {releaseOpenRisks.map((item) => (
                <p key={item} className="rounded-xl border border-amber-200 bg-white/70 px-3 py-2 text-xs leading-relaxed text-amber-800">{item}</p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#d9e0ef] bg-[#f4f7fd] p-4">
            <h3 className="text-sm font-semibold text-[#2f4f7f]">Release note draft</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#2f4f7f]">
              Preview includes complete PRD UI, agent workflow model, Settings readiness, Logs audit trail, and seed workflow SW-134. Production deploy waits for Supabase RLS, server routes, env secrets, and publishing token tests.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}

function SettingsApiTokens({
  providerPreference,
  onProviderPreferenceChange,
}: {
  providerPreference: AgentRuntimePreference;
  onProviderPreferenceChange: (value: AgentRuntimePreference) => void;
}) {
  const [showTokenPreview, setShowTokenPreview] = useState(false);
  const [tokenActivity, setTokenActivity] = useState('Ready to test provider configuration against live runtime settings.');
  const [runtimeDiscovery, setRuntimeDiscovery] = useState<RuntimeDiscoveryResponse | null>(null);
  const [runtimeDiscoveryLoading, setRuntimeDiscoveryLoading] = useState(false);
  const configuredCount = providerKeyReadiness.filter((provider) => provider.status === 'Configured').length;
  const requiredCount = providerKeyReadiness.filter((provider) => provider.required).length;
  const configuredRequiredCount = providerKeyReadiness.filter((provider) => provider.required && provider.status === 'Configured').length;
  const readiness = configuredRequiredCount === requiredCount ? 'Required providers ready' : 'Required provider missing';
  const selectedModeLabel =
    providerPreference === 'auto'
      ? 'Auto-select the best available runtime'
      : providerPreference === 'multica'
        ? 'Prefer Multica daemon, fallback Codex/OpenAI'
        : providerPreference === 'codex'
        ? 'Prefer Codex first, fallback OpenAI'
        : 'Use OpenAI API key only';
  const handleProviderPreferenceChange = (value: AgentRuntimePreference) => {
    onProviderPreferenceChange(value);
    setTokenActivity(
      value === 'auto'
        ? 'Execution preference updated: detect available runtimes and select automatically.'
        : value === 'multica'
          ? 'Execution preference updated: try Multica daemon first, then fallback to Codex/OpenAI if needed.'
          : value === 'codex'
        ? 'Execution preference updated: try Codex first, then fallback to OpenAI if needed.'
        : 'Execution preference updated: use OpenAI API key only.',
    );
  };

  const handleProviderTest = async (provider: string) => {
    if (provider !== 'Agent runtimes') {
      setTokenActivity(`${provider} readiness test recorded. Backend will verify env availability and write system_logs in Stage 9.`);
      return;
    }

    setRuntimeDiscoveryLoading(true);
    setTokenActivity('Checking local runtime availability from backend...');
    try {
      const token = window.sessionStorage.getItem('prd_api_bearer_token') ?? '';
      const response = await fetch(`/api/runtimes?preference=${providerPreference}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = (await response.json()) as RuntimeDiscoveryResponse | { error?: string };

      if (!response.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error ?? 'Runtime discovery failed' : 'Runtime discovery failed');
      }

      const discovery = payload as RuntimeDiscoveryResponse;
      setRuntimeDiscovery(discovery);
      setTokenActivity(
        discovery.selectedProvider
          ? `Runtime selected: ${discovery.selectedProvider}. ${discovery.candidates.filter((candidate) => candidate.available).length}/${discovery.candidates.length} runtime(s) available.`
          : 'No runtime is available. Configure Codex bridge or OpenAI API key.',
      );
    } catch (error) {
      setTokenActivity(error instanceof Error ? error.message : 'Runtime discovery failed');
      setRuntimeDiscovery(null);
    } finally {
      setRuntimeDiscoveryLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">API Tokens & Provider Readiness</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">
            Central place for provider keys used by agents, RAG, publishing jobs, and deployment checks. Values stay masked in the UI.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {readiness}
        </span>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#171717]">Agent execution connection mode</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">กำหนดลำดับการเชื่อมต่อสำหรับการรัน Agent ในทุกขั้นตอน</p>
          <div className="mt-3 grid gap-2 lg:grid-cols-4">
            <button
              onClick={() => handleProviderPreferenceChange('auto')}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                providerPreference === 'auto'
                  ? 'border-[#171717] bg-[#171717] text-white'
                  : 'border-[#deded8] bg-white text-[#171717] hover:border-[#171717]'
              }`}
              type="button"
            >
              <div className="font-semibold">Auto select runtime</div>
              <p className={`mt-1 text-xs ${providerPreference === 'auto' ? 'text-white' : 'text-[#6e6e68]'}`}>
                ตรวจ local machine/bridge ก่อน แล้วเลือก runtime ที่พร้อมใช้งานที่สุด
              </p>
            </button>
            <button
              onClick={() => handleProviderPreferenceChange('multica')}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                providerPreference === 'multica'
                  ? 'border-[#171717] bg-[#171717] text-white'
                  : 'border-[#deded8] bg-white text-[#171717] hover:border-[#171717]'
              }`}
              type="button"
            >
              <div className="font-semibold">Multica daemon first</div>
              <p className={`mt-1 text-xs ${providerPreference === 'multica' ? 'text-white' : 'text-[#6e6e68]'}`}>
                ใช้ local Multica daemon ก่อน แล้ว fallback ไป Codex/OpenAI เมื่อ bridge ยังไม่พร้อม
              </p>
            </button>
            <button
              onClick={() => handleProviderPreferenceChange('codex')}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                providerPreference === 'codex'
                  ? 'border-[#171717] bg-[#171717] text-white'
                  : 'border-[#deded8] bg-white text-[#171717] hover:border-[#171717]'
              }`}
              type="button"
            >
              <div className="font-semibold">Codex (default)</div>
              <p className={`mt-1 text-xs ${providerPreference === 'codex' ? 'text-white' : 'text-[#6e6e68]'}`}>
                เชื่อมต่อผ่าน local Codex ก่อน แล้ว fallback ไป OpenAI API เมื่อจำเป็น
              </p>
            </button>
            <button
              onClick={() => handleProviderPreferenceChange('openai')}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                providerPreference === 'openai'
                  ? 'border-[#4f4f49] bg-[#171717] text-white'
                  : 'border-[#deded8] bg-white text-[#171717] hover:border-[#4f4f49]'
              }`}
              type="button"
            >
              <div className="font-semibold">OpenAI API only</div>
              <p className={`mt-1 text-xs ${providerPreference === 'openai' ? 'text-white' : 'text-[#6e6e68]'}`}>
                ใช้ OPENAI_API_KEY เท่านั้นผ่าน /api/agents/execute
              </p>
            </button>
          </div>
          <div className="mt-3 rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2 text-xs text-[#6e6e68]">
            Current execution mode: <span className="font-semibold text-[#171717]">{selectedModeLabel}</span>
          </div>
          <div className="mt-3 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[#171717]">Runtime discovery</div>
                <p className="mt-0.5 text-xs text-[#6e6e68]">Backend checks Codex Local Bridge and OpenAI runtime, then selects the available machine/runtime.</p>
              </div>
              <button
                onClick={() => handleProviderTest('Agent runtimes')}
                className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]"
                type="button"
              >
                {runtimeDiscoveryLoading ? 'Checking...' : 'Check runtimes'}
              </button>
            </div>
            {runtimeDiscovery ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {runtimeDiscovery.candidates.map((candidate) => (
                  <div key={candidate.id} className={`rounded-lg border p-3 ${candidate.available ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#171717]">{candidate.label}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${candidate.available ? 'border-emerald-200 bg-white text-emerald-700' : 'border-amber-200 bg-white text-amber-800'}`}>
                        {candidate.available ? 'Available' : 'Missing'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#4f4f49]">{candidate.reason}</p>
                  </div>
                ))}
                <div className="rounded-lg border border-[#d9e0ef] bg-[#f4f7fd] p-3 text-xs font-semibold text-[#2f4f7f] md:col-span-2">
                  Selected runtime: {runtimeDiscovery.selectedProvider ?? 'None'}
                </div>
                <div className="rounded-lg border border-[#deded8] bg-white p-3 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-[#171717]">Local CLI scan</div>
                      <p className="mt-0.5 text-[11px] text-[#8a8a82]">
                        Scope: {runtimeDiscovery.scanScope}. Browser cannot scan a user Mac directly without a daemon/bridge.
                      </p>
                    </div>
                    <Tag>{runtimeDiscovery.localTools.filter((tool) => tool.available).length}/{runtimeDiscovery.localTools.length} detected</Tag>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-2">
                    {runtimeDiscovery.localTools.map((tool) => (
                      <div key={tool.id} className={`rounded-lg border p-2 ${tool.available ? 'border-emerald-200 bg-emerald-50' : 'border-[#e3e3dd] bg-[#fbfbfa]'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#171717]">{tool.label}</div>
                            <div className="mt-0.5 truncate text-[11px] text-[#6e6e68]">{tool.path ?? tool.reason}</div>
                          </div>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tool.available ? 'border-emerald-200 bg-white text-emerald-700' : 'border-[#deded8] bg-white text-[#8a8a82]'}`}>
                            {tool.available ? 'Detected' : 'Not found'}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tool.capabilities.slice(0, 3).map((capability) => (
                            <span key={capability} className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6e6e68]">
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: 'Providers tracked', value: providerKeyReadiness.length, detail: 'OpenAI, Supabase, Buffer, Vercel' },
            { label: 'Configured', value: configuredCount, detail: 'Ready for live workflow handoff' },
            { label: 'Required ready', value: `${configuredRequiredCount}/${requiredCount}`, detail: 'Required before backend jobs run' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs leading-relaxed text-[#2f4f7f]">
          {tokenActivity}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Provider keys</h3>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Masked values only. Backend should store secrets in environment variables or Supabase vault, not browser state.</p>
          </div>
          <button
            onClick={() => setShowTokenPreview((current) => !current)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
            type="button"
          >
            {showTokenPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showTokenPreview ? 'Hide masked keys' : 'Show masked keys'}
          </button>
        </div>

        <div className="divide-y divide-[#e8e8e4]">
          {providerKeyReadiness.map((provider) => {
            const configured = provider.status === 'Configured';

            return (
              <div key={provider.keyName} className="grid gap-3 px-4 py-4 lg:grid-cols-[150px_minmax(0,1fr)_150px_120px] lg:items-center">
                <div>
                  <div className="text-sm font-semibold text-[#171717]">{provider.provider}</div>
                  <div className="mt-0.5 text-[11px] font-semibold text-[#8a8a82]">{provider.required ? 'Required' : 'Optional'}</div>
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-xs font-semibold text-[#4f4f49]">
                    {showTokenPreview ? `${provider.keyName}=••••••••••••${configured ? 'ready' : 'pending'}` : provider.keyName}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{provider.scope}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Tag>{provider.models}</Tag>
                    <Tag>{provider.status}</Tag>
                  </div>
                </div>
                <span
                  className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    configured ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
                  }`}
                >
                  {provider.status}
                </span>
                <button
                  onClick={() => handleProviderTest(provider.provider)}
                  className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
                  type="button"
                >
                  Test
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
        <h3 className="text-sm font-semibold text-[#171717]">Backend handoff requirements</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {settingsReadinessChecklist.map((item) => (
            <div key={item} className="rounded-xl border border-[#deded8] bg-white px-3 py-2 text-xs leading-relaxed text-[#4f4f49]">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsIntegrations() {
  const [integrationNotice, setIntegrationNotice] = useState('Integration readiness matrix is prepared for Stage 9 backend wiring.');
  const connectedCount = integrationApps.filter((app) => app.status === 'Connected').length;
  const knowledgeCount = integrationApps.filter((app) => app.category === 'Knowledge Source').length;
  const publishingCount = integrationApps.filter((app) => app.category === 'Publishing').length;
  const handleTestAll = () => {
    setIntegrationNotice('Test all integrations recorded. Backend will check OAuth/token health and write logs in Stage 9.');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Integrations</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#6e6e68]">Connect content sources, publishing platforms, and social channels with explicit readiness for RAG and publishing workflows.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button onClick={handleTestAll} className="flex-1 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white sm:flex-none" type="button">
            Test all
          </button>
          <button className="flex-1 rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] sm:flex-none" type="button">
            Add custom integration
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: 'Connected', value: `${connectedCount}/${integrationApps.length}`, detail: 'Ready for live workflows' },
            { label: 'Knowledge sources', value: knowledgeCount, detail: 'RAG ingest candidates' },
            { label: 'Publishing targets', value: publishingCount, detail: 'Queue/post destinations' },
            { label: 'Health policy', value: 'Logged', detail: 'Every connect/test action becomes an audit event' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs leading-relaxed text-[#2f4f7f]">
          {integrationNotice}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {integrationApps.map((app) => (
          <IntegrationAppCard
            key={app.name}
            app={app}
            onAction={() => setIntegrationNotice(`${app.name} ${app.status === 'Connected' ? 'manage' : 'connect'} action recorded. Backend connector will persist OAuth status in Stage 9.`)}
          />
        ))}
      </div>
    </div>
  );
}

function ManualCreatePanel({
  brandVoice,
  category,
  citationStrictness,
  contentGoal,
  cta,
  imageCount,
  languages,
  layout,
  onBrandVoiceChange,
  onCategoryChange,
  onCitationStrictnessChange,
  onContentGoalChange,
  onCtaChange,
  onImageCountChange,
  onLanguagesChange,
  onLayoutChange,
  onPlatformsChange,
  onPostCountChange,
  onSourceConnectorsChange,
  onTargetAudienceChange,
  onTopicChange,
  onWordCountChange,
  platforms,
  postCount,
  sourceConnectors,
  targetAudience,
  topic,
  wordCount,
}: {
  brandVoice: string;
  category: string;
  citationStrictness: string;
  contentGoal: string;
  cta: string;
  imageCount: number;
  languages: string[];
  layout: string;
  onBrandVoiceChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCitationStrictnessChange: (value: string) => void;
  onContentGoalChange: (value: string) => void;
  onCtaChange: (value: string) => void;
  onImageCountChange: (value: number) => void;
  onLanguagesChange: (values: string[]) => void;
  onLayoutChange: (value: string) => void;
  onPlatformsChange: (values: string[]) => void;
  onPostCountChange: (value: number) => void;
  onSourceConnectorsChange: (values: string[]) => void;
  onTargetAudienceChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onWordCountChange: (value: number) => void;
  platforms: string[];
  postCount: number;
  sourceConnectors: string[];
  targetAudience: string;
  topic: string;
  wordCount: number;
}) {
  const toggleManualSelection = (value: string, currentValues: string[], onChange: (values: string[]) => void) => {
    onChange(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  };
  const activeLanguages = getLanguageDisplayLabels(languages);
  const activePlatforms = platforms.length > 0 ? platforms : ['Facebook'];
  const readinessItems = [
    { label: 'Topic brief', ready: Boolean(topic.trim()), detail: topic.trim() ? 'Brief captured' : 'Required before Source Search' },
    { label: 'Sources required', ready: sourceConnectors.length > 0, detail: sourceConnectors.length ? `${sourceConnectors.length} connector(s)` : 'Pick at least one source' },
    {
      label: 'Languages selected',
      ready: activeLanguages.length > 0,
      detail: activeLanguages.length ? activeLanguages.join(', ') : 'Pick at least one language',
    },
    { label: 'Platforms selected', ready: platforms.length > 0, detail: platforms.length ? platforms.join(', ') : 'Pick at least one platform' },
    { label: 'Image layout', ready: Boolean(layout), detail: layout || 'Pick layout' },
    { label: 'Citation rule', ready: Boolean(citationStrictness), detail: citationStrictness || 'Pick citation rule' },
    { label: 'Human review required', ready: true, detail: 'Always routed to Review Queue' },
  ];
  const readinessScore = Math.round((readinessItems.filter((item) => item.ready).length / readinessItems.length) * 100);
  const manualReady = readinessItems.every((item) => item.ready);
  const sourceSearchPreview = [
    ['Topic', topic.trim() || 'Missing topic brief'],
    ['Service', category],
    ['Audience', targetAudience],
    ['CTA', cta],
    ['Sources', sourceConnectors.length ? sourceConnectors.join(', ') : 'Missing source connector'],
    ['Output', `${postCount} post(s), ${activeLanguages.length} language(s), ${activePlatforms.length} platform(s)`],
  ];
  const pipelineSteps = [
    {
      title: 'Source Search',
      agent: 'Content Strategy Agent',
      status: sourceConnectors.length > 0 ? 'Ready' : 'Required',
      detail: 'Ground Knowledge Base, Drive, Obsidian, and official references before drafting.',
    },
    {
      title: 'Generate Text',
      agent: 'Content Strategy Agent',
      status: topic.trim() ? 'Ready' : 'Waiting brief',
      detail: `${wordCount} words across ${activeLanguages.length} language(s), text first before images.`,
    },
    {
      title: 'Compliance Check',
      agent: 'Legal Compliance Agent',
      status: 'Required',
      detail: 'Check citations, prohibited claims, professional ethics, and risk wording.',
    },
    {
      title: 'Localization',
      agent: 'Content Strategy Agent',
      status: activeLanguages.length > 1 ? 'Ready' : 'Optional',
      detail: `Preserve meaning across ${activeLanguages.join(', ')} outputs inside the MVP content flow.`,
    },
    {
      title: 'Image & Layout',
      agent: 'Image & Layout Agent',
      status: 'After text',
      detail: `Create visual brief, generate ${imageCount} image option(s), then compose ${layout.toLowerCase()} layout.`,
    },
    {
      title: 'Review Package',
      agent: 'Legal Compliance Agent',
      status: 'Human review',
      detail: 'Bundle final text, images, layout, citations, and risk notes for Review Queue.',
    },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_minmax(380px,1.15fr)_minmax(280px,1fr)] xl:items-start">
        <section className="space-y-3 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Brief Details</h3>
            <p className="mt-1 text-xs text-[#6e6e68]">Define what to generate, for whom, and which business outcome it supports.</p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Topic / Brief</span>
            <textarea
              value={topic}
              onChange={(event) => onTopicChange(event.target.value)}
              className="min-h-28 w-full resize-none rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2 text-sm leading-relaxed text-[#171717] outline-none ring-[#2f4f7f] placeholder:text-[#8a8a82] focus:ring-1"
              placeholder="เช่น สรุปประเด็นภาษีสำหรับ SME ปี 2026 พร้อม CTA ให้จองปรึกษาก่อนยื่นเอกสาร"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Service Category</span>
              <select
                value={category}
                onChange={(event) => onCategoryChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
              >
                <option>Tax</option>
                <option>Accounting</option>
                <option>Corporate Law</option>
                <option>PDPA</option>
                <option>Labor Law</option>
                <option>Visa & Work Permit</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Content Goal</span>
              <select
                value={contentGoal}
                onChange={(event) => onContentGoalChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
              >
                {['Educate & Lead', 'Build trust', 'Announce update', 'Drive consultation', 'Recycle evergreen'].map((goal) => (
                  <option key={goal}>{goal}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Target Audience</div>
            <div className="flex flex-wrap gap-2">
              {['SME Owners', 'Foreign Investors', 'Startup Founders', 'Japanese Executives', 'Chinese Investors'].map((audience) => (
                <button
                  key={audience}
                  aria-pressed={targetAudience === audience}
                  onClick={() => onTargetAudienceChange(audience)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    targetAudience === audience ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                  }`}
                  type="button"
                >
                  {audience}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">CTA</span>
              <select
                value={cta}
                onChange={(event) => onCtaChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
              >
                {['Book consultation', 'Download checklist', 'Read full article', 'Contact office', 'Join newsletter'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Brand Voice</span>
              <select
                value={brandVoice}
                onChange={(event) => onBrandVoiceChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
              >
                {['Legal advisory', 'Accounting advisory', 'Executive summary', 'Plain-language educator'].map((voice) => (
                  <option key={voice}>{voice}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Output Quantity</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 5, 7].map((count) => (
                <button
                  key={count}
                  aria-pressed={postCount === count}
                  onClick={() => onPostCountChange(count)}
                  className={`h-8 rounded-lg border text-xs font-semibold ${
                    postCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#4f4f49]'
                  }`}
                  type="button"
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Word Count</div>
            <div className="grid grid-cols-3 gap-1.5">
              {[500, 1000, 1500].map((count) => (
                <button
                  key={count}
                  aria-pressed={wordCount === count}
                  onClick={() => onWordCountChange(count)}
                  className={`h-8 rounded-lg border text-xs font-semibold ${
                    wordCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#4f4f49]'
                  }`}
                  type="button"
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#171717]">Distribution Setup</span>
              <span className="text-[11px] font-semibold text-[#8a8a82]">Manual controlled</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="mb-1.5 text-[11px] font-semibold text-[#4f4f49]">Languages</div>
                <div className="flex flex-wrap gap-1.5">
                  {languageDisplayLabels.map((language) => {
                    const selected = languages.includes(language);

                    return (
                      <button
                        key={language}
                        aria-pressed={selected}
                        onClick={() => toggleManualSelection(language, languages, onLanguagesChange)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          selected ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                        }`}
                        type="button"
                      >
                        {language}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-semibold text-[#4f4f49]">Platforms</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Facebook', 'LinkedIn', 'WordPress', 'Newsletter', 'TikTok'].map((platform) => {
                    const selected = platforms.includes(platform);

                    return (
                      <button
                        key={platform}
                        aria-pressed={selected}
                        onClick={() => toggleManualSelection(platform, platforms, onPlatformsChange)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          selected ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                        }`}
                        type="button"
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#4f4f49]">Image Layout</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Single', 'Grid', 'Carousel'].map((item) => (
                      <button
                        key={item}
                        aria-pressed={layout === item}
                        onClick={() => onLayoutChange(item)}
                        className={`h-8 rounded-lg border text-[11px] font-semibold ${
                          layout === item ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                        }`}
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#4f4f49]">Images</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[3, 6, 9, 12].map((count) => (
                      <button
                        key={count}
                        aria-pressed={imageCount === count}
                        onClick={() => onImageCountChange(count)}
                        className={`h-8 rounded-lg border text-[11px] font-semibold ${
                          imageCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                        }`}
                        type="button"
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">AI Production Pipeline</h3>
              <p className="mt-1 text-xs text-[#6e6e68]">Text is generated first, then summarized into visual direction before images/layout.</p>
            </div>
            <span
              aria-label="OpenAI agents"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]"
              title="OpenAI agents"
            >
              <OpenAIIcon className="h-4 w-4" />
            </span>
          </div>

          <div className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#171717]">Source connectors</span>
              <span className="text-[11px] font-semibold text-[#8a8a82]">{sourceConnectors.length} active</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Knowledge Base', 'Google Drive', 'Obsidian', 'Official Link', 'Manual Upload'].map((source) => {
                const selected = sourceConnectors.includes(source);

                return (
                  <button
                    key={source}
                    aria-pressed={selected}
                    onClick={() => toggleManualSelection(source, sourceConnectors, onSourceConnectorsChange)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      selected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-[#deded8] bg-white text-[#6e6e68]'
                    }`}
                    type="button"
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {pipelineSteps.map((step, index) => (
              <article key={step.title} className="relative rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
                {index < pipelineSteps.length - 1 ? <div className="absolute left-6 top-[52px] h-5 w-px bg-[#deded8]" /> : null}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49]">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#171717]">{step.title}</h4>
                      <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">{step.status}</span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#2f4f7f]">{step.agent}</div>
                    <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{step.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Readiness & Preview</h3>
            <p className="mt-1 text-xs text-[#6e6e68]">Check whether this job is safe enough to generate text first.</p>
          </div>

          <div className="rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2f4f7f]">Readiness</div>
                <div className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-[#172033]">{readinessScore}%</div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2f4f7f]">
                {readinessScore >= 80 ? 'Ready soon' : 'Needs setup'}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-[#2f4f7f]" style={{ width: `${readinessScore}%` }} />
            </div>
            <p className={`mt-3 text-xs font-semibold ${manualReady ? 'text-emerald-700' : 'text-amber-700'}`}>
              Manual production gate: {manualReady ? 'ready to start Source Search' : 'blocked until required setup is complete'}.
            </p>
          </div>

          <div className="space-y-2">
            {readinessItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2 text-xs">
                <span className="font-semibold text-[#4f4f49]">{item.label}</span>
                <span className={`text-right font-semibold ${item.ready ? 'text-emerald-700' : 'text-amber-700'}`}>{item.ready ? item.detail : 'Missing'}</span>
              </div>
            ))}
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Citation Strictness</span>
            <select
              value={citationStrictness}
              onChange={(event) => onCitationStrictnessChange(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
            >
              {['Strict citations', 'Balanced citations', 'Light citations'].map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Selected output</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeLanguages.map((language) => (
                <Tag key={language}>{language}</Tag>
              ))}
              {activePlatforms.map((platform) => (
                <Tag key={platform}>{platform}</Tag>
              ))}
              <Tag>{layout}</Tag>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6e6e68]">
              {postCount} post(s), {imageCount} image option(s), {wordCount} words, {brandVoice}, CTA: {cta}.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            {category === 'PDPA' || category === 'Corporate Law'
              ? 'Medium risk: citation and human legal review are required before publishing.'
              : 'Low risk by default, but source citation is still required before generation.'}
          </div>

          <div className="rounded-2xl border border-[#deded8] bg-white p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Source Search preview</h4>
            <div className="mt-2 grid gap-2">
              {sourceSearchPreview.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
                  <div className="mt-1 text-xs font-semibold text-[#4f4f49]">{value}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6e6e68]">
              The next step will search sources for {category}, then generate text first. Image & Layout Agent will only start after the text becomes a visual brief.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickAiCreatePanel({
  imageCount,
  languages,
  layout,
  onImageCountChange,
  onLanguagesChange,
  onLayoutChange,
  onPlatformsChange,
  onPostCountChange,
  platforms,
  postCount,
}: {
  imageCount: number;
  languages: string[];
  layout: string;
  onImageCountChange: (value: number) => void;
  onLanguagesChange: (values: string[]) => void;
  onLayoutChange: (value: string) => void;
  onPlatformsChange: (values: string[]) => void;
  onPostCountChange: (value: number) => void;
  platforms: string[];
  postCount: number;
}) {
  const toggleQuickSelection = (value: string, currentValues: string[], onChange: (values: string[]) => void) => {
    onChange(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  };
  const activeLanguages = getLanguageDisplayLabels(languages);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <section className="rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2f4f7f] shadow-sm">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[#171717]">Quick AI Mode</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#304463]">
              Choose only the production limits. AI will pick the angle, search sources, write text first, then create images and layout for review.
            </p>
          </div>
          <div className="rounded-2xl border border-[#cfd8ea] bg-white p-3 text-xs leading-relaxed text-[#2f4f7f]">
            Ready settings: {postCount} post(s), {activeLanguages.length} language(s), {platforms.join(', ') || 'no platform'}, {imageCount} image option(s), {layout || 'no layout'} layout.
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h4 className="text-sm font-semibold text-[#171717]">Quick controls</h4>
          <p className="mt-1 text-xs text-[#6e6e68]">Keep this short: quantity, destinations, language, and image setup only.</p>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Posts to Generate</div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 7].map((count) => (
                  <button
                    key={count}
                    aria-pressed={postCount === count}
                    onClick={() => onPostCountChange(count)}
                    className={`h-9 rounded-lg border text-xs font-semibold ${
                      postCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                    }`}
                    type="button"
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Languages</div>
              <div className="flex flex-wrap gap-2">
                {languageDisplayLabels.map((language) => {
                  const selected = languages.includes(language);

                  return (
                    <button
                      key={language}
                      aria-pressed={selected}
                      onClick={() => toggleQuickSelection(language, languages, onLanguagesChange)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        selected ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                      }`}
                      type="button"
                    >
                      {language}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Platforms</div>
              <div className="flex flex-wrap gap-2">
                {['Facebook', 'LinkedIn', 'WordPress', 'Newsletter', 'TikTok'].map((platform) => {
                  const selected = platforms.includes(platform);

                  return (
                    <button
                      key={platform}
                      aria-pressed={selected}
                      onClick={() => toggleQuickSelection(platform, platforms, onPlatformsChange)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        selected ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                      }`}
                      type="button"
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Image Layout</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Single', 'Grid', 'Carousel'].map((item) => (
                    <button
                      key={item}
                      aria-pressed={layout === item}
                      onClick={() => onLayoutChange(item)}
                      className={`h-9 rounded-lg border text-xs font-semibold ${
                        layout === item ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                      }`}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Images to Generate</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 6, 9, 12].map((count) => (
                    <button
                      key={count}
                      aria-pressed={imageCount === count}
                      onClick={() => onImageCountChange(count)}
                      className={`h-9 rounded-lg border text-xs font-semibold ${
                        imageCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                      }`}
                      type="button"
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h4 className="text-sm font-semibold text-[#171717]">AI will handle</h4>
          <p className="mt-1 text-xs text-[#6e6e68]">The same production chain, but with automatic choices.</p>
          <div className="mt-4 grid gap-2">
            {['Find topic from trends', 'Search Knowledge Base sources', 'Write captions first', 'Create visual brief', `Generate ${imageCount} image options`, 'Compose layout for review'].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3 text-xs font-semibold text-[#4f4f49]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[11px]">{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SourceSearchCreatePanel({
  brandVoice,
  category,
  citationStrictness,
  contentGoal,
  cta,
  languages,
  mode,
  onSourceConnectorsChange,
  onOfficialSourceLinksChange,
  platforms,
  officialSourceLinks,
  sourceConnectors,
  targetAudience,
  topic,
}: {
  brandVoice: string;
  category: string;
  citationStrictness: string;
  contentGoal: string;
  cta: string;
  languages: string[];
  mode: 'manual' | 'quick';
  onSourceConnectorsChange: (values: string[]) => void;
  onOfficialSourceLinksChange: (values: string[]) => void;
  platforms: string[];
  officialSourceLinks: string[];
  sourceConnectors: string[];
  targetAudience: string;
  topic: string;
}) {
  const sourceConnectorOptions = ['Knowledge Base', 'Google Drive', 'Obsidian', 'Official Link', 'Manual Upload', 'Auto Search'];
  const hasAutoSearch = sourceConnectors.includes('Auto Search');
  const sourceTopic =
    topic.trim() ||
    (hasAutoSearch
      ? `${contentGoal} in ${category} for ${targetAudience} (auto trend scope in Thailand)`
      : `${category} advisory content for ${targetAudience}`);
  const activeLanguages = getLanguageDisplayLabels(languages);
  const activePlatforms = platforms.length > 0 ? platforms : ['Facebook'];
  const activeSources = sourceConnectors.length > 0 ? sourceConnectors : [];
  const hasOfficialLink = sourceConnectors.includes('Official Link');
  const sourceLinksInput = officialSourceLinks.length > 0 ? officialSourceLinks : [''];
  const officialSourceTrimmed = officialSourceLinks.map((link) => link.trim()).filter((link) => link.length > 0);
  const sourceCardsInput = activeSources.length > 0 ? activeSources : ['Knowledge Base'];
  const sourceSearchSummary = activeSources.length > 0 ? activeSources.join(', ') : 'No source selected yet';
  const sourceLinkSummary = hasOfficialLink
    ? officialSourceTrimmed.length > 0
      ? officialSourceTrimmed.join(', ')
      : 'No official links added yet'
    : 'Not using official links';
  const sourceCards = sourceCardsInput.map((source, index) => ({
    title: source,
    detail:
      source === 'Knowledge Base'
        ? `${category} internal notes matched to ${targetAudience} and ${brandVoice}.`
        : source === 'Official Link'
            ? hasOfficialLink
              ? officialSourceTrimmed.length > 0
                ? `Official references from links (${officialSourceTrimmed.length}): ${officialSourceTrimmed.join(', ')}`
                : 'Official link selected. Add at least one official URL before generation.'
              : `Official reference queued for ${citationStrictness.toLowerCase()} and claim boundaries.`
          : source === 'Auto Search'
            ? 'AI will pull Thai trend signals from public sources and surface the most relevant references for this topic before drafting.'
            : source === 'Google Drive'
              ? `Drive folder will be searched for briefs, memos, and approved advisory material.`
              : source === 'Obsidian'
                ? `Obsidian notes will supply internal context before drafting starts.`
                : `Manual upload will be treated as required evidence before generation.`,
    confidence: `${96 - index * 4}%`,
  }));
  const updateOfficialSourceLink = (index: number, value: string) => {
    const nextLinks = sourceLinksInput.map((link, linkIndex) => (linkIndex === index ? value : link));
    onOfficialSourceLinksChange(nextLinks);
  };
  const addOfficialSourceLink = () => {
    onOfficialSourceLinksChange([...sourceLinksInput, '']);
  };
  const removeOfficialSourceLink = (index: number) => {
    const nextLinks = sourceLinksInput.filter((_, linkIndex) => linkIndex !== index);

    onOfficialSourceLinksChange(nextLinks.length > 0 ? nextLinks : ['']);
  };
  const handoffItems = [
    ['Mode', mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'],
    ['Goal', contentGoal],
    ['Audience', targetAudience],
    ['CTA', cta],
    ['Brand voice', brandVoice],
    ['Citation', citationStrictness],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionKicker>Step 2 / Source Search</SectionKicker>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#171717]">Reference set prepared from your setup</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#304463]">
              {mode === 'quick'
                ? 'Quick AI Mode will keep the setup lightweight, but source search still follows the selected languages, platforms, and citation rule.'
                : 'Manual Setup uses the same source-search workspace as Quick AI Mode, with the brief, audience, CTA, source connectors, and citation strictness already carried into this step.'}
            </p>
          </div>
          <div className="rounded-xl border border-[#cfd8ea] bg-white p-3 text-xs leading-relaxed text-[#2f4f7f]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6c7fa0]">Topic anchor</span>
            <span className="mt-1 block text-lg font-semibold leading-snug tracking-[-0.02em] text-[#172033]">{sourceTopic}</span>
          </div>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {handoffItems.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
            <div className="mt-1 text-sm font-semibold text-[#171717]">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-[#171717]">Source connectors for Source Search</h4>
            <p className="mt-1 text-xs text-[#6e6e68]">
              {mode === 'quick'
                ? 'Use the same connector selection that Quick AI Mode will hand into generation.'
                : 'Manual Setup now uses the same connector controls here, so you can adjust the source package before Generate Text.'}
            </p>
          </div>
          <span className="rounded-full border border-[#d7e1f4] bg-[#f4f7fd] px-2.5 py-1 text-[11px] font-semibold text-[#2f4f7f]">{activeSources.length} selected</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sourceConnectorOptions.map((source) => {
            const selected = sourceConnectors.includes(source);

            return (
              <button
                key={source}
                aria-pressed={selected}
                onClick={() =>
                  onSourceConnectorsChange(selected ? sourceConnectors.filter((item) => item !== source) : [...sourceConnectors, source])
                }
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  selected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-[#deded8] bg-white text-[#6e6e68]'
                }`}
                type="button"
              >
                {source}
              </button>
            );
          })}
        </div>
        {activeSources.length === 0 ? <p className="mt-2 text-xs font-semibold text-rose-700">Select at least one source before moving to Generate Text.</p> : null}
      </section>

      {hasOfficialLink ? (
        <section className="rounded-2xl border border-[#cfd8ea] bg-[#f4f7fd] p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-[#171717]">Official source links</h4>
              <p className="mt-1 text-xs text-[#5d6f8f]">Add at least one official URL for the Source Search package before Generate Text runs.</p>
            </div>
            <button
              onClick={addOfficialSourceLink}
              className="inline-flex items-center gap-1 rounded-full border border-[#d7e1f4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2f4f7f] hover:bg-[#e5edff]"
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              Add link
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {sourceLinksInput.map((link, index) => (
              <div key={`${link}-${index}`} className="rounded-xl border border-[#d7e1f4] bg-white p-2.5">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6c7fa0]">
                    Official link URL {index + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      value={link}
                      onChange={(event) => updateOfficialSourceLink(index, event.target.value)}
                      type="url"
                      className="h-9 flex-1 rounded-lg border border-[#d7e1f4] bg-[#fbfbfa] px-3 text-xs outline-none ring-[#2f4f7f] focus:ring-1"
                      placeholder="https://example.com/official-source"
                    />
                    <button
                      onClick={() => removeOfficialSourceLink(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7e1f4] bg-[#fbfbfa] text-[#8b8b84] hover:bg-[#f4f7fd]"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sourceCards.map((source) => (
          <article key={source.title} className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-[#171717]">{source.title}</h4>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{source.confidence}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">{source.detail}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-[#171717]">Citation and generation checklist</h4>
            <p className="mt-1 text-xs text-[#6e6e68]">These requirements will be handed to Generate Text before any image work begins.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activePlatforms.map((platform) => (
              <Tag key={platform}>{platform}</Tag>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {[
            `Languages prepared: ${activeLanguages.join(', ')}`,
            `Platforms prepared: ${activePlatforms.join(', ')}`,
            `Source connectors: ${sourceSearchSummary}`,
            `Official source URLs: ${sourceLinkSummary}`,
            `Citation rule: ${citationStrictness}`,
            `Audience: ${targetAudience}`,
            `CTA: ${cta}`,
            'No exaggerated professional claims',
            'High-risk claim routes to Review Queue',
          ].map((item) => (
            <div key={item} className="rounded-xl border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49]">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GenerationCreatePanel({
  brandVoice,
  category,
  citationStrictness,
  contentGoal,
  cta,
  imageCount,
  generatedDrafts,
  languages,
  layout,
  platforms,
  sourceConnectors,
  targetAudience,
  topic,
  wordCount,
}: {
  brandVoice: string;
  category: string;
  citationStrictness: string;
  contentGoal: string;
  cta: string;
  imageCount: number;
  generatedDrafts: GeneratedDraft[];
  languages: string[];
  layout: string;
  platforms: string[];
  sourceConnectors: string[];
  targetAudience: string;
  topic: string;
  wordCount: number;
}) {
  const draftLanguageCodes = normalizeLanguageCodes(languages, ['th']);
  const generatedDraftByCode = new Map(generatedDrafts.map((draft) => [draft.languageCode, draft]));
  const draftLanguages = draftLanguageCodes.map((languageCode) => languageCodeLabelMap[languageCode]);
  const activePlatforms = platforms.length > 0 ? platforms : ['Facebook'];
  const activeSources = sourceConnectors.length > 0 ? sourceConnectors : ['Knowledge Base'];
  const complianceAgent = 'Legal Compliance Agent';
  const facebookLayoutGuideline = getFacebookLayoutGuideline(layout, activePlatforms);
  const generationStages = [
    {
      title: '1. Generate Text',
      agent: 'Content Strategy Agent',
      detail: `${wordCount} words for ${targetAudience}, goal: ${contentGoal}, CTA: ${cta}.`,
    },
    {
      title: '2. Compliance Pass',
      agent: complianceAgent,
      detail: `${citationStrictness} using ${activeSources.join(', ')} before image work starts.`,
    },
    {
      title: '3. Create Visual Brief',
      agent: 'Image & Layout Agent',
      detail: `Summarize approved text into scene, mood, objects, overlay, and ${brandVoice.toLowerCase()} constraints.`,
    },
    {
      title: '4. Compose Assets',
      agent: 'Image & Layout Agent',
      detail: `Generate ${imageCount} image option(s), crop for ${activePlatforms.join(', ')}, and compose ${layout.toLowerCase()} layout.`,
    },
  ];
  const generationSummary = [
    ['Category', category],
    ['Audience', targetAudience],
    ['Goal', contentGoal],
    ['Brand', brandVoice],
    ['Citation', citationStrictness],
    ['Sources', activeSources.join(', ')],
  ];

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.74fr)_minmax(600px,1.9fr)_minmax(270px,0.86fr)] xl:items-start">
        <section className="min-w-0 rounded-[26px] border border-[#deded8] bg-[#fbfbfa] p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Content Context</h3>
              <p className="mt-1 text-xs text-[#6e6e68]">Category, audience, goal, and channels used by the text agent.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfd8ea] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2f4f7f] shadow-[0_1px_0_rgba(255,255,255,0.9)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1f5eff] text-[10px] font-bold text-white">3</span>
              Generation
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {[
              ['Category', category],
              ['Audience', targetAudience],
              ['Goal', contentGoal],
              ['Brand voice', brandVoice],
              ['CTA', cta],
              ['Word target', `${wordCount} words`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
                <div className="mt-1 text-xs font-semibold leading-relaxed text-[#171717]">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Output targets</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {draftLanguages.map((language) => (
              <Tag key={language}>{language}</Tag>
            ))}
              {activePlatforms.map((platform) => (
                <Tag key={platform}>{platform}</Tag>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-[28px] border border-[#cfd8ea] bg-white p-5 shadow-[0_12px_34px_rgba(47,79,127,0.10)]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e8e8e4] pb-4">
            <div>
              <SectionKicker>Generation</SectionKicker>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">Generated Text</h3>
              <p className="mt-1 text-xs text-[#6e6e68]">Content Strategy Agent generates text first. Images and layout wait for this approved text package.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Text ready
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {draftLanguageCodes.map((languageCode) => (
              <article key={languageCode} className="min-w-0 rounded-[24px] border border-[#deded8] bg-gradient-to-br from-[#fbfbfa] via-white to-[#f4f7fd] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[#171717]">{languageCodeLabelMap[languageCode]} draft</h4>
                  <span className="rounded-full border border-[#deded8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4f4f49]">Agent draft</span>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-[#304463]">
                  {generatedDraftByCode.get(languageCode)?.body ? (
                    generatedDraftByCode.get(languageCode)?.body
                  ) : (
                    <span className="text-amber-700">
                      Draft is not available yet. Please run text generation (Step 2) before proceeding to this step.
                    </span>
                  )}
                </p>
                <div className="mt-3 rounded-xl border border-[#deded8] bg-white p-3 text-xs leading-relaxed text-[#6e6e68]">
                  Suggested hook, caption body, CTA ({cta}), hashtags, and citation notes from {activeSources.join(', ')} are bundled for reviewer edits.
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-[22px] border border-[#d7e1f4] bg-[#f4f7fd] p-4 text-xs leading-relaxed text-[#2f4f7f]">
            Visual handoff after text: summarize the approved copy into scene, mood, objects, overlay guidance, brand-safe imagery, and {layout.toLowerCase()} platform composition before image generation starts.
          </div>
        </section>

        <section className="min-w-0 rounded-[26px] border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Selected Conditions</h3>
            <p className="mt-1 text-xs text-[#6e6e68]">Generation gates that must pass before asset composition.</p>
          </div>

          <div className="mt-4 space-y-3">
            {generationStages.map((stage) => (
              <article key={stage.title} className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3 transition-colors hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[#171717]">{stage.title}</h4>
                    <p className="mt-1 text-[11px] font-semibold text-[#2f4f7f]">{stage.agent}</p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Pass</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">{stage.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Rules selected</h4>
            <div className="mt-2 space-y-2">
              {[
                ['Citation', citationStrictness],
                ['Sources', activeSources.join(', ')],
                ['Images', `${imageCount} option(s)`],
                ['Layout', layout],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 rounded-xl border border-[#deded8] bg-white px-3 py-2 text-xs">
                  <span className="font-semibold text-[#4f4f49]">{label}</span>
                  <span className="text-right font-semibold text-[#171717]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {facebookLayoutGuideline ? (
            <div className="mt-4 rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-[#172033]">Facebook layout enforcement</h4>
                  <p className="mt-1 text-[11px] font-semibold text-[#2f4f7f]">{facebookLayoutGuideline.title}</p>
                </div>
                <span className="rounded-full border border-[#cfd8ea] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#2f4f7f]">
                  Locked
                </span>
              </div>
              <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-[#4d6281]">
                <p>
                  <span className="font-semibold text-[#172033]">Size:</span> {facebookLayoutGuideline.size}
                </p>
                <p>
                  <span className="font-semibold text-[#172033]">Rule:</span> {facebookLayoutGuideline.guardrail}
                </p>
                <p>
                  <span className="font-semibold text-[#172033]">Asset Composer:</span> {facebookLayoutGuideline.composerRule}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
            Compliance pass means image generation is allowed only after the generated text, citations, and professional rules are clean enough for the review package.
          </div>
        </section>
      </div>
    </div>
  );
}

function ReadyForReviewCreatePanel({
  brandVoice,
  category,
  citationStrictness,
  contentGoal,
  cta,
  imageCount,
  generatedDrafts,
  languages,
  layout,
  mode,
  onEditAssets,
  onEditText,
  onRegenerateImage,
  onSelectedAssetsChange,
  platforms,
  postCount,
  selectedAssets,
  sourceConnectors,
  targetAudience,
  topic,
  wordCount,
}: {
  brandVoice: string;
  category: string;
  citationStrictness: string;
  contentGoal: string;
  cta: string;
  imageCount: number;
  generatedDrafts: GeneratedDraft[];
  languages: string[];
  layout: string;
  mode: 'manual' | 'quick';
  onEditAssets: () => void;
  onEditText: () => void;
  onRegenerateImage: () => void;
  onSelectedAssetsChange: (assets: string[]) => void;
  platforms: string[];
  postCount: number;
  selectedAssets: string[];
  sourceConnectors: string[];
  targetAudience: string;
  topic: string;
  wordCount: number;
}) {
  const reviewTopic = topic.trim() || `${category} content package from ${contentGoal}`;
  const activeLanguages = getLanguageDisplayLabels(languages);
  const reviewLanguageCodes = normalizeLanguageCodes(languages, ['th']);
  const generatedDraftByCode = new Map(generatedDrafts.map((draft) => [draft.languageCode, draft]));
  const activePlatforms = platforms.length > 0 ? platforms : ['Facebook'];
  const activeSources = sourceConnectors.length > 0 ? sourceConnectors : ['Knowledge Base'];
  const selectedImages = Array.from({ length: Math.min(imageCount, 6) }, (_, index) => `Image ${index + 1}`);
  const carouselSlides = Array.from({ length: Math.min(postCount + 2, 5) }, (_, index) => `Slide ${index + 1}`);
  const riskScore = category === 'PDPA' || category === 'Corporate Law' ? 34 : citationStrictness === 'Strict citations' ? 12 : 22;
  const riskLabel = riskScore >= 30 ? 'Medium risk' : 'Low risk';
  const complianceItems = [
    `Text ready for ${targetAudience}`,
    `CTA checked: ${cta}`,
    `${citationStrictness} attached`,
    `${layout} layout composed`,
    `${brandVoice} brand voice applied`,
  ];
  const sourceItems = activeSources.map((source) => `${source} · ${category} evidence`);
  const [activeReviewLanguage, setActiveReviewLanguage] = useState(activeLanguages[0] ?? 'Thai (ไทย)');
  const [activeReviewPlatform, setActiveReviewPlatform] = useState(activePlatforms[0] ?? 'Facebook');
  const [activeReviewSlide, setActiveReviewSlide] = useState(carouselSlides[0] ?? 'Slide 1');
  const selectedReviewImages = selectedAssets.length ? selectedAssets : selectedImages.slice(0, Math.min(3, selectedImages.length));
  const activeReviewLanguageCode = normalizeLanguageCode(activeReviewLanguage) ?? reviewLanguageCodes[0] ?? 'th';
  const activeReviewDraft = generatedDraftByCode.get(activeReviewLanguageCode);
  const toggleReviewImage = (image: string) => {
    onSelectedAssetsChange(selectedReviewImages.includes(image) ? selectedReviewImages.filter((item) => item !== image) : [...selectedReviewImages, image]);
  };
  const packageStats = [
    ['Mode', mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'],
    ['Posts', `${postCount} post(s)`],
    ['Images', `${selectedReviewImages.length}/${imageCount} selected`],
    ['Audience', targetAudience],
    ['Goal', contentGoal],
    ['Target', `${wordCount} words`],
  ];

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div>
          <SectionKicker>Step 4 / Ready for Review</SectionKicker>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#171717]">Final text, image, layout, and compliance package</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-emerald-900">
            Reviewers see the generated text, selected assets, composed layout, citations, and risk notes together before sending the package into the Review Queue.
          </p>
          <p className="mt-2 text-xs font-semibold text-emerald-800">
            Ready package includes text, image selections, platform crops, layout order, citations, and compliance notes.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {packageStats.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-emerald-200 bg-white/80 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">{label}</div>
              <div className="mt-1 text-xs font-semibold text-[#171717]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(230px,0.78fr)_minmax(520px,1.7fr)_minmax(230px,0.78fr)] xl:items-start">
        <section className="min-w-0 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[#171717]">Final Text Package</h4>
              <p className="mt-1 text-xs text-[#6e6e68]">Generated copy by language and platform.</p>
            </div>
            <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-2 py-0.5 text-[11px] font-semibold text-[#1f5eff]">{category}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {activeLanguages.map((language) => (
              <button
                key={language}
                aria-pressed={activeReviewLanguage === language}
                onClick={() => setActiveReviewLanguage(language)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  activeReviewLanguage === language ? 'border-[#1f5eff] bg-[#f4f7fd] text-[#1f5eff]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                }`}
                type="button"
              >
                {language}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Topic</div>
              <h5 className="mt-1 text-sm font-semibold leading-snug text-[#171717]">{reviewTopic}</h5>
              <div className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1f5eff]">{activeReviewLanguage} · {activeReviewPlatform}</div>
              <h6 className="mt-3 text-sm font-semibold text-[#2f4f7f]">
                {activeReviewDraft?.title ?? `${category}: ${reviewTopic}`}
              </h6>
            <p className="mt-3 text-sm leading-relaxed text-[#304463]">
              {activeReviewDraft?.body ?? (
                <span className="text-amber-700">Final draft content is not available yet. Rebuild generation in Step 3 first.</span>
              )}
            </p>
            <div className="mt-3 rounded-xl border border-[#deded8] bg-white p-3 text-xs leading-relaxed text-[#6e6e68]">
              Source trail: {activeSources.join(' → ')}. Goal: {contentGoal}. Reviewer should confirm citation fit before publishing.
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {activePlatforms.map((platform) => (
              <button
                key={platform}
                aria-pressed={activeReviewPlatform === platform}
                onClick={() => setActiveReviewPlatform(platform)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  activeReviewPlatform === platform ? 'bg-[#2f312c] text-white' : 'bg-[#f6f6f2] text-[#4f4f49]'
                }`}
                type="button"
              >
                {platform}
              </button>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[#171717]">Asset & Layout Preview</h4>
              <p className="mt-1 text-xs text-[#6e6e68]">Final visual package from Visual Brief Agent, Image Agent, and Asset Composer.</p>
            </div>
            <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-1 text-xs font-semibold text-[#1f5eff]">{layout}</span>
          </div>

          <div className="mt-4 rounded-[24px] border border-[#d9e1ee] bg-gradient-to-br from-[#f8fbff] via-white to-[#f4f0e7] p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_140px]">
              <div className="min-h-[250px] rounded-[20px] border border-white bg-gradient-to-br from-[#e7eefb] via-[#f8fafc] to-[#dfd8c8] p-5 shadow-inner">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/70 bg-white/55 p-4">
                  <div>
                    <div className="inline-flex rounded-full bg-[#1f5eff] px-3 py-1 text-[11px] font-semibold text-white">{category} advisory</div>
                    <h5 className="mt-4 max-w-sm text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Know the rule before you publish or file.</h5>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {carouselSlides.slice(0, 3).map((slide) => (
                      <div key={slide} className="rounded-xl border border-white bg-white/70 p-2 text-[10px] font-semibold text-[#4f4f49]">
                        {slide === activeReviewSlide ? `${slide} · selected` : slide}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {carouselSlides.map((slide) => (
                  <button
                    key={slide}
                    aria-pressed={activeReviewSlide === slide}
                    onClick={() => setActiveReviewSlide(slide)}
                    className={`rounded-2xl border p-2 text-left text-[11px] font-semibold ${
                      activeReviewSlide === slide ? 'border-[#1f5eff] bg-white text-[#1f5eff]' : 'border-white bg-white/60 text-[#6e6e68]'
                    }`}
                    type="button"
                  >
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-white to-[#dce6f6]" />
                    <span className="mt-1 block">{slide}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-3 text-xs leading-relaxed text-[#2f4f7f]">
            Visual brief from final text: professional advisory setting, clear {category.toLowerCase()} concept for {targetAudience}, {brandVoice.toLowerCase()} tone, CTA focus on {cta.toLowerCase()}, minimal text overlay, brand-safe imagery, and no exaggerated result claims.
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {selectedImages.map((image) => {
              const isSelected = selectedReviewImages.includes(image);

              return (
              <button
                key={image}
                aria-pressed={isSelected}
                onClick={() => toggleReviewImage(image)}
                className={`aspect-square rounded-2xl border p-2 text-left text-[10px] font-semibold ${
                  isSelected ? 'border-[#1f5eff] bg-[#f4f7fd] text-[#1f5eff]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                }`}
                type="button"
              >
                <div className="h-full rounded-xl bg-gradient-to-br from-white via-[#eef3fb] to-[#ddd6c8] p-2">{image}</div>
              </button>
              );
            })}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h4 className="text-sm font-semibold text-[#171717]">Compliance Handoff</h4>
          <p className="mt-1 text-xs text-[#6e6e68]">Final controls before human review.</p>

          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Risk score</div>
                <div className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-emerald-800">{riskScore}%</div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{riskLabel}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${riskScore}%` }} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-3 text-xs leading-relaxed text-[#2f4f7f]">
            Review handoff: {contentGoal} for {targetAudience}. Publishing is blocked until a human reviewer accepts {citationStrictness.toLowerCase()}, source trail, and {brandVoice.toLowerCase()} tone.
          </div>

          <div className="mt-4 space-y-2">
            {complianceItems.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2 text-xs">
                <span className="font-semibold text-[#4f4f49]">{item}</span>
                <span className="font-semibold text-emerald-700">Ready</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <h5 className="text-xs font-semibold text-[#171717]">Sources attached</h5>
            <div className="mt-2 space-y-1.5">
              {sourceItems.map((source) => (
                <div key={source} className="rounded-lg bg-white px-2.5 py-2 text-[11px] font-semibold text-[#6e6e68]">
                  {source}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button onClick={onEditText} className="h-9 rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Edit Text
            </button>
            <button onClick={onEditAssets} className="h-9 rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Edit Assets
            </button>
            <button onClick={onRegenerateImage} className="h-9 rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Regenerate Image
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function LibraryRow({
  item,
  onEdit,
  onRecycle,
  onSelect,
  selected,
}: {
  item: (typeof libraryItems)[number];
  onEdit: (item: (typeof libraryItems)[number]) => void;
  onRecycle: (item: (typeof libraryItems)[number]) => void;
  onSelect: (item: (typeof libraryItems)[number]) => void;
  selected: boolean;
}) {
  const statusStyles: Record<string, string> = {
    Approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'Needs update': 'border-amber-200 bg-amber-50 text-amber-700',
    Draft: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
  };

  return (
    <article className={`grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] lg:grid-cols-[1fr_150px_128px_132px] lg:items-center ${selected ? 'bg-[#f4f7fd]' : ''}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#8a8a82]">{item.id}</span>
          <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{item.category}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[item.status]}`}>{item.status}</span>
        </div>
        <button className="mt-1 block max-w-full truncate text-left text-sm font-semibold text-[#171717] hover:text-[#1f5eff]" onClick={() => onSelect(item)} type="button">
          {item.title}
        </button>
        <div className="mt-1 text-xs text-[#6e6e68]">{item.language} · {item.updated} · Reuse: {item.reuse}</div>
      </div>

      <div className="flex -space-x-2">
        {Array.from({ length: Math.min(item.assets, 5) }).map((_, index) => (
          <span key={index} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white bg-[#ecece7] text-[10px] font-semibold text-[#6e6e68]">
            {index + 1}
          </span>
        ))}
        {item.assets > 5 && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white bg-[#f6f6f2] text-[10px] font-semibold text-[#6e6e68]">
            +{item.assets - 5}
          </span>
        )}
      </div>

      <div className="text-xs font-medium text-[#6e6e68]">{item.assets} assets</div>

      <div className="flex items-center gap-2 lg:justify-end">
        <button className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]" onClick={() => onEdit(item)} type="button">
          Edit
        </button>
        <button className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#6e6e68] hover:bg-[#f6f6f2]" onClick={() => onRecycle(item)} type="button">
          Recycle
        </button>
      </div>
    </article>
  );
}

function KnowledgeSourceRow({ source }: { source: (typeof knowledgeSources)[number] }) {
  const statusStyles: Record<string, string> = {
    Indexed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Processing: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
    'Needs review': 'border-amber-200 bg-amber-50 text-amber-700',
  };

  return (
    <article className="grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] lg:grid-cols-[1fr_132px_118px_120px] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{source.type}</span>
          <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6e6e68]">{source.category}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[source.status]}`}>{source.status}</span>
        </div>
        <h3 className="mt-1 truncate text-sm font-semibold text-[#171717]">{source.name}</h3>
        <p className="mt-1 text-xs text-[#6e6e68]">{source.updated}</p>
      </div>
      <div className="text-xs font-medium text-[#4f4f49]">{source.chunks} chunks</div>
      <div className="text-xs text-[#6e6e68]">RAG ready</div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center lg:justify-end">
        <button className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]" type="button">
          Open
        </button>
        <button className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#6e6e68] hover:bg-[#f6f6f2]" type="button">
          Reindex
        </button>
      </div>
    </article>
  );
}

function KnowledgeConnectionCard({
  description,
  icon: Icon,
  name,
  status,
}: {
  description: string;
  icon: ComponentType<{ className?: string }>;
  name: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-white text-[#171717] shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#171717]">{name}</h3>
          <button className="rounded-lg border border-[#cfcfc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]">
            {status}
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{description}</p>
      </div>
    </div>
  );
}

function ReviewLanguagePanel({ body, language, title }: { body: string; language: string; title: string }) {
  const displayTitle = normalizeTextValue(title);
  const displayBody = normalizeTextValue(body);

  return (
    <div className="min-h-[320px] p-4 sm:min-h-[360px] lg:min-h-[430px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
          {language}
        </span>
        <button className="rounded-lg border border-[#deded8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6e6e68] hover:bg-[#f6f6f2]" type="button">
          Edit
        </button>
      </div>
      <input
        className="mb-3 h-10 w-full rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 text-sm font-semibold text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
        defaultValue={displayTitle}
      />
      <textarea
        className="min-h-[190px] w-full resize-none rounded-xl border border-[#deded8] bg-white p-3 text-sm leading-relaxed text-[#2f3a4b] outline-none ring-[#2f4f7f] focus:ring-1 sm:min-h-[230px] lg:min-h-[290px]"
        defaultValue={displayBody}
      />
    </div>
  );
}

function ComplianceFinding({ finding }: { finding: (typeof complianceFindings)[number] }) {
  const styles: Record<string, string> = {
    High: 'border-rose-200 bg-rose-50 text-rose-800',
    Medium: 'border-amber-200 bg-amber-50 text-amber-800',
    Low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };

  return (
    <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-xs font-semibold leading-relaxed text-[#171717]">{finding.label}</div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>
      <div className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">Source: {finding.source}</div>
    </div>
  );
}

function BrandVoiceCard({ rules, title, tone }: { rules: string[]; title: string; tone: string }) {
  return (
    <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2]">
          <MessageSquareText className="h-4 w-4 text-[#4f4f49]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#171717]">{title}</h2>
          <p className="mt-1 text-xs font-medium text-[#6e6e68]">{tone}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {rules.map((rule) => (
          <div key={rule} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#4f4f49]">
            {rule}
          </div>
        ))}
      </div>
    </section>
  );
}

function RulesPillPanel({ items, title, tone = 'neutral' }: { items: string[]; title: string; tone?: 'neutral' | 'danger' }) {
  return (
    <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#171717]">{title}</h2>
        <button className="rounded-lg border border-[#deded8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]">
          Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              tone === 'danger' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

type AgentCatalogRow = {
  name: string;
  purpose: string;
  model: string;
  provider: string;
  workload: string;
  runs: number;
  activity: number;
  state: DashboardAgent['state'];
};

function AgentTableRow({ agent }: { agent: AgentCatalogRow }) {
  const stateTone =
    agent.state === 'Online'
      ? {
          text: 'text-emerald-700',
          dot: 'bg-emerald-500',
        }
      : agent.state === 'Idle'
        ? {
            text: 'text-amber-800',
            dot: 'bg-amber-500',
          }
        : {
            text: 'text-slate-600',
            dot: 'bg-slate-400',
          };

  return (
    <tr className="hover:bg-[#fbfbfa]">
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-[#f6f6f2]">
            <Bot className="h-4 w-4 text-[#4f4f49]" />
            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${stateTone.dot}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-[#171717]">{agent.name}</h3>
              <span className="rounded border border-[#deded8] bg-[#f6f6f2] px-1.5 py-0.5 text-[10px] font-semibold text-[#6e6e68]">You</span>
            </div>
            <p className="mt-0.5 max-w-[340px] truncate text-xs text-[#6e6e68]">{agent.purpose}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${stateTone.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${stateTone.dot}`} />
          {agent.state}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[#6e6e68]">{agent.workload}</td>
      <td className="px-4 py-3 text-xs font-medium text-[#4f4f49]">{agent.model}</td>
      <td className="px-4 py-3 text-xs text-[#6e6e68]">{agent.provider}</td>
      <td className="px-4 py-3">
        <div className="h-1.5 w-24 rounded-full bg-[#e8e8e4]">
          <div className="h-1.5 rounded-full bg-[#8ca9de]" style={{ width: `${agent.activity}%` }} />
        </div>
      </td>
      <td className="px-4 py-3 text-xs font-medium text-[#4f4f49]">{agent.runs}</td>
      <td className="px-4 py-3 text-right">
        <button aria-label={`Open actions for ${agent.name}`} className="text-[#8a8a82] hover:text-[#171717]" type="button">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function AgentPromptCard({ body, title }: { body: string; title: string }) {
  return (
    <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#171717]">{title}</h2>
        <button className="shrink-0 rounded-lg border border-[#deded8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
          Copy
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#4f4f49]">{body}</p>
    </section>
  );
}

function NewAgentDialog({ onClose, locked }: { onClose: () => void; locked: boolean }) {
  const [provider, setProvider] = useState('Codex runtime');
  const models = modelCatalog[provider] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-2 sm:p-4">
      <div className="max-h-[calc(100dvh-1rem)] w-full max-w-3xl overflow-hidden overflow-y-auto rounded-2xl border border-[#deded8] bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex items-center justify-between border-b border-[#e8e8e4] bg-[#fbfbfa] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#171717]">{locked ? 'New agent locked' : 'New agent'}</h2>
            <p className="mt-1 text-xs text-[#6e6e68]">
              {locked
                ? 'Custom agent creation is an upsell feature. Built-in core agents use Codex runtime model routing first.'
                : 'Create an AI teammate and choose from connected Codex/OpenAI models.'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
            Close
          </button>
        </div>

        {locked ? (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs leading-relaxed text-amber-800">
            Preview mode: users can inspect the setup pattern, but creating custom agents, changing model routing, and editing prompts require Pro/Business.
          </div>
        ) : null}

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#2f3a4b]">Agent name</label>
              <input disabled={locked} className="h-10 w-full rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 text-sm outline-none ring-[#2f4f7f] focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60" defaultValue="New Compliance Agent" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#2f3a4b]">Role / purpose</label>
              <textarea
                disabled={locked}
                className="min-h-24 w-full resize-none rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3 text-sm leading-relaxed outline-none ring-[#2f4f7f] focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60"
                defaultValue="Review content for legal, tax, accounting, citation, and professional ethics risk before publishing."
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#2f3a4b]">Runtime / Provider</label>
                <select
                  disabled={locked}
                  className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value)}
                >
                  {Object.keys(modelCatalog).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#2f3a4b]">Model</label>
                <select disabled={locked} className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60">
                  {models.map((model) => (
                    <option key={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#2f3a4b]">System prompt</label>
              <textarea
                disabled={locked}
                className="min-h-32 w-full resize-none rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed outline-none ring-[#2f4f7f] focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60"
                defaultValue="You are a professional compliance agent for a legal/accounting content platform. Use Knowledge Base sources first, flag unsupported claims, avoid exaggerated promises, compare translations, and recommend Approve, Reject, or Auto Queue."
              />
            </div>
          </section>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-[#deded8] bg-[#f6f6f2] p-4">
              <h3 className="text-sm font-semibold text-[#171717]">Connected APIs</h3>
              <div className="mt-3 space-y-2">
                {Object.keys(modelCatalog).map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs">
                    <span className="font-semibold text-[#4f4f49]">{item}</span>
                    <span className="text-emerald-700">{item === 'Codex runtime' ? 'Primary' : 'Fallback'}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-[#8a6a2f]">
                Hidden for larger packages: {hiddenCodexModels.join(', ')}.
              </p>
              <div className="mt-3 rounded-xl border border-[#d8ceb5] bg-white p-3 text-[11px] leading-relaxed text-[#6e6e68]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#4f4f49]">{imageGenerationConnector.provider}</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">{imageGenerationConnector.defaultModel}</span>
                </div>
                <p className="mt-2">{imageGenerationConnector.thaiTextRule}</p>
                <p className="mt-1 text-[#8a8a82]">Advanced snapshot: {imageGenerationConnector.lockedSnapshot}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#deded8] bg-white p-4">
              <h3 className="text-sm font-semibold text-[#171717]">Permissions</h3>
              <div className="mt-3 space-y-2">
                {['Read Knowledge Base', 'Comment in Review Queue', 'Update status', 'Publish only if approved'].map((permission) => (
                  <label key={permission} className="flex items-center gap-2 text-xs font-medium text-[#4f4f49]">
                    <input disabled={locked} defaultChecked className="h-3.5 w-3.5 accent-[#2f4f7f]" type="checkbox" />
                    {permission}
                  </label>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="flex items-center justify-between border-t border-[#e8e8e4] bg-[#fbfbfa] px-5 py-4">
          <button className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
            Copy config
          </button>
          <button disabled={locked} className="rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-white disabled:cursor-not-allowed disabled:opacity-55" type="button">
            {locked ? 'Upgrade to create' : 'Create agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

function IntegrationAppCard({ app, onAction }: { app: (typeof integrationApps)[number]; onAction: () => void }) {
  const Icon = app.icon;
  const connected = app.status === 'Connected';
  const ready = app.readiness === 'Ready';

  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2] text-[#171717]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#171717]">{app.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{app.description}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {app.readiness}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Scope</div>
          <div className="mt-1 font-semibold text-[#4f4f49]">{app.category} · {app.scope}</div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Auth</div>
            <div className="mt-1 font-semibold text-[#4f4f49]">{app.auth}</div>
          </div>
          <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Last sync</div>
            <div className="mt-1 font-semibold text-[#4f4f49]">{app.lastSync}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'
          }`}
        >
          {app.status}
        </span>
        <button onClick={onAction} className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
          {connected ? 'Manage' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

function LogErrorRow({
  event,
  showChain = false,
  onOpenContentJob,
}: {
  event: LogEvent;
  showChain?: boolean;
  onOpenContentJob?: (id: string) => void;
}) {
  const severityStyles: Record<string, string> = {
    High: 'border-rose-200 bg-rose-50 text-rose-800',
    Medium: 'border-amber-200 bg-amber-50 text-amber-800',
    Low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };
  const workflowId = event.itemId ? getDashboardIdForWorkflowId(event.itemId) : event.relatedId ? getDashboardIdForWorkflowId(event.relatedId) : '';

  return (
    <article className="grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] lg:grid-cols-[80px_140px_minmax(0,1fr)_150px] lg:items-center">
      <div className="text-xs font-semibold text-[#8a8a82]">{event.time}</div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-[#171717]">{event.type}</div>
        <div className="mt-0.5 text-[11px] text-[#6e6e68]">{event.source}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs leading-relaxed text-[#4f4f49]">{event.message}</p>
        {showChain && (event.itemId || event.relatedId || event.status) ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {event.itemId ? <Tag>{event.itemId}</Tag> : null}
            {event.relatedId ? <Tag>{event.relatedId}</Tag> : null}
            {event.status ? <Tag>{event.status}</Tag> : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <span className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${severityStyles[event.severity]}`}>{event.severity}</span>
        {workflowId && onOpenContentJob ? (
          <button
            onClick={() => onOpenContentJob(workflowId)}
            className="rounded-lg border border-[#deded8] bg-white px-2 py-1 text-[10px] font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
            type="button"
          >
            Open job
          </button>
        ) : null}
      </div>
    </article>
  );
}

function LogTable({
  rows,
  title,
  type,
}: {
  rows: typeof agentActivityLogs | typeof userActivityLogs;
  title: string;
  type: 'agent' | 'user';
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="border-b border-[#e8e8e4] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#171717]">{title}</h2>
      </div>
      <div className="divide-y divide-[#e8e8e4]">
        {rows.map((row) =>
          type === 'agent' ? (
            <AgentLogRow key={(row as (typeof agentActivityLogs)[number]).agent} row={row as (typeof agentActivityLogs)[number]} />
          ) : (
            <UserLogRow key={`${(row as (typeof userActivityLogs)[number]).user}-${(row as (typeof userActivityLogs)[number]).time}`} row={row as (typeof userActivityLogs)[number]} />
          ),
        )}
      </div>
    </section>
  );
}

function AgentLogRow({ row }: { row: (typeof agentActivityLogs)[number] }) {
  const failed = row.status === 'Failed';

  return (
    <div className="grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] md:grid-cols-[1fr_92px_120px_72px_64px] md:items-center">
      <div>
        <div className="text-sm font-semibold text-[#171717]">{row.agent}</div>
        <div className="mt-0.5 text-xs text-[#6e6e68]">{row.model}</div>
      </div>
      <span className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${failed ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
        {row.status}
      </span>
      <div className="text-xs text-[#6e6e68]">{row.tokens} tokens</div>
      <div className="text-xs text-[#6e6e68]">{row.duration}</div>
      <button className="text-right text-xs font-semibold text-[#4f4f49] hover:text-[#171717]">Open</button>
    </div>
  );
}

function UserLogRow({ row }: { row: (typeof userActivityLogs)[number] }) {
  return (
    <div className="grid gap-3 px-4 py-3 hover:bg-[#fbfbfa] md:grid-cols-[132px_1fr_64px] md:items-center">
      <div className="text-sm font-semibold text-[#171717]">{row.user}</div>
      <div>
        <div className="text-xs font-medium text-[#4f4f49]">{row.action}</div>
        <div className="mt-0.5 text-xs text-[#6e6e68]">{row.target}</div>
      </div>
      <div className="text-xs font-semibold text-[#8a8a82]">{row.time}</div>
    </div>
  );
}

function SettingsMenuIcon({ name }: { name: string }) {
  const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    Profile: UsersIcon,
    Preferences: Filter,
    Notifications: Bell,
    'API Tokens': KeyIcon,
    Daemon: Bot,
    Updates: UploadCloud,
    General: Settings,
    Repositories: Archive,
    GitHub: GithubIcon,
    'Codex Local': Bot,
    Integrations: PlugIcon,
    Labs: FlaskIcon,
    Members: UsersIcon,
  };
  const Icon = iconMap[name] ?? Settings;
  return <Icon className="h-3.5 w-3.5 text-[#5f5f58]" />;
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m11 12 8-8" />
      <path d="m16 5 3 3" />
      <path d="m14 7 3 3" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.02c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}

function PlugIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M6 8h12v4a6 6 0 0 1-12 0V8z" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DriveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 4h7l6 10.5-3.5 5.5H6L2.5 14.5 8.5 4z" />
      <path d="M8.5 4 12 10.5l-6 9.5" />
      <path d="M15.5 4 12 10.5l6 9.5" />
      <path d="M2.5 14.5h19" />
    </svg>
  );
}

function ObsidianIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5 15.5 2l4.5 6.5-2.5 10L9 22l-5-6.5 1.5-8L7 3.5z" />
      <path d="m7 3.5 4.5 5L20 8.5" />
      <path d="m11.5 8.5-2.5 7L9 22" />
      <path d="m9 15.5 8.5 3" />
      <path d="m5.5 7.5 5.5 1" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 8.5V6.9c0-.8.2-1.3 1.4-1.3H17V2.8c-.8-.1-1.7-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v1.6H7.5v3.2h2.8v8.8H14v-8.8h2.8l.4-3.2H14z" />
    </svg>
  );
}

function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2a4.4 4.4 0 0 1 4.1 2.8 4.4 4.4 0 0 1 4 6.5 4.4 4.4 0 0 1-2.2 7.4 4.4 4.4 0 0 1-7.1 1.1 4.4 4.4 0 0 1-6.9-2.8 4.4 4.4 0 0 1-4-6.5 4.4 4.4 0 0 1 2.2-7.4A4.4 4.4 0 0 1 9.2 3.3 4.5 4.5 0 0 1 12 3.2z" />
      <path d="M7.3 8.5 12 5.7l4.7 2.8v5.4L12 16.7 7.3 13.9V8.5z" />
      <path d="M12 5.7v5.4l4.7 2.8" />
      <path d="m7.3 8.5 4.7 2.6v5.6" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.4 8.6H2.6v12.1h2.8V8.6zM4 3.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM21.4 14.1c0-3.7-2-5.8-4.7-5.8-2.1 0-3.1 1.2-3.6 2V8.6h-2.8v12.1h2.8v-6.4c0-1.7.8-3.2 2.6-3.2 1.7 0 2.8 1.1 2.8 3.4v6.2h2.9v-6.6z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BufferIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v11.2a4.2 4.2 0 1 1-4-4.2" />
      <path d="M14 3c.6 3.2 2.4 5 5 5" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 0 20" />
      <path d="M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  );
}

function CreateStep({ index, label, active = false, completed = false }: { index: number; label: string; active?: boolean; completed?: boolean }) {
  return (
    <div aria-current={active ? 'step' : undefined} className={`flex items-center gap-2 text-xs font-semibold ${active || completed ? 'text-[#172033]' : 'text-[#8a9ab4]'}`}>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
          active
            ? 'border-[#1f5eff] bg-white text-[#1f5eff]'
            : completed
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-transparent bg-[#dbe3ef] text-[#7f91ad]'
        }`}
      >
        {index}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

function SectionKicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#63738c] ${className}`}>{children}</div>;
}

function WorkspaceView({ page }: { page: PageName }) {
  const meta = pageMeta[page];
  const cards = [
    {
      label: `${page} queue`,
      value: page === 'Agents' ? '11' : '18',
      detail: page === 'Settings' ? '3 integrations pending' : 'Updated just now',
      icon: page === 'Agents' ? Bot : Layers3,
    },
    {
      label: 'Needs action',
      value: page === 'Review Queue' ? '7' : '4',
      detail: page === 'Publishing' ? '2 channels need reconnect' : 'Ready for owner',
      icon: ShieldCheck,
    },
    {
      label: 'Agent support',
      value: page === 'Rules & Brand' ? '5 rules' : 'Online',
      detail: 'Automations available',
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <section className="min-w-0 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {cards.map((card) => (
            <MiniPageCard key={card.label} {...card} />
          ))}
        </div>

        <div className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">{page} workspace</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Structured like Multica: compact rows, owner status, and fast operational actions.</p>
            </div>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white">
              <Plus className="h-3.5 w-3.5" />
              Add item
            </button>
          </div>

          <div className="divide-y divide-[#e8e8e4]">
            {[
              `${page} setup and first workflow`,
              `Review current ${meta.group.toLowerCase()} configuration`,
              `Assign agent support for ${page.toLowerCase()}`,
              `Prepare production-ready handoff notes`,
            ].map((item, index) => (
              <div key={item} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 hover:bg-[#fbfbfa]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#deded8] bg-[#f4f4f2] text-[10px] font-semibold text-[#6e6e68]">
                      {index + 1}
                    </span>
                    <h3 className="truncate text-sm font-semibold text-[#171717]">{item}</h3>
                  </div>
                  <p className="mt-1 pl-7 text-xs text-[#6e6e68]">Owner: {index % 2 === 0 ? 'Content Strategy Agent' : 'Human reviewer'} · Status: {index === 0 ? 'In progress' : 'Todo'}</p>
                </div>
                <button className="self-center rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#4f4f49] hover:bg-[#f4f4f2]">
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <h2 className="text-sm font-semibold text-[#171717]">Page options</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{meta.description}</p>
        <div className="mt-4 space-y-2">
          {meta.tabs.map((tab, index) => (
            <button
              key={tab}
              className={`flex h-9 w-full items-center justify-between rounded-lg border px-3 text-sm ${
                index === 0
                  ? 'border-[#cfcfc8] bg-[#f6f6f2] text-[#171717] shadow-sm'
                  : 'border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f4f4f2]'
              }`}
            >
              {tab}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function MobileSidebarDrawer({
  activePage,
  onClose,
  onPageChange,
  onSearchCommand,
  onWorkspace,
  open,
}: {
  activePage: PageName;
  onClose: () => void;
  onPageChange: (page: PageName) => void;
  onSearchCommand: () => void;
  onWorkspace: () => void;
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Close mobile menu"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        type="button"
      />
      <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-[#deded8] bg-[#f6f6f2] text-[#171717] shadow-2xl">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#deded8] px-3">
          <button onClick={onWorkspace} className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-[#ecece7]" type="button">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d7d7d0] bg-white text-[#171717] shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">SiamWealth</div>
              <div className="truncate text-[11px] text-[#74746d]">Content Platform</div>
            </div>
          </button>
          <button
            aria-label="Close mobile menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#4f4f49]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 py-3">
          <button
            onClick={onSearchCommand}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#deded8] bg-white px-3 text-left text-xs text-[#74746d] shadow-sm"
            type="button"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Search or command...</span>
            <span className="rounded border border-[#deded8] bg-[#f6f6f2] px-1.5 py-0.5 text-[10px] text-[#74746d]">Cmd K</span>
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {navGroups.map((group) => (
            <div key={group.group} className="mb-5">
              <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8a82]">{group.group}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.name === activePage;

                  return (
                    <button
                      key={item.name}
                      onClick={() => onPageChange(item.name as PageName)}
                      className={`group flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm transition ${
                        active
                          ? 'border border-[#d7d7d0] bg-white text-[#171717] shadow-sm'
                          : 'border border-transparent text-[#5f5f58] hover:border-[#e3e3dd] hover:bg-[#efefeb] hover:text-[#171717]'
                      }`}
                      type="button"
                    >
                      <span className={`h-4 w-0.5 rounded-full ${active ? 'bg-[#8b8b84]' : 'bg-transparent'}`} />
                      <Icon className={`h-4 w-4 ${active ? 'text-[#171717]' : 'text-[#85857d] group-hover:text-[#171717]'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}

function Sidebar({
  activePage,
  onPageChange,
  onSearchCommand,
  onWorkspace,
}: {
  activePage: PageName;
  onPageChange: (page: PageName) => void;
  onSearchCommand: () => void;
  onWorkspace: () => void;
}) {
  return (
    <aside className="hidden h-full w-[264px] shrink-0 flex-col border-r border-[#deded8] bg-[#f6f6f2] text-[#171717] lg:flex">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#deded8] px-3">
        <button onClick={onWorkspace} className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-[#ecece7]" type="button">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d7d7d0] bg-white text-[#171717] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">SiamWealth</div>
            <div className="truncate text-[11px] text-[#74746d]">Content Platform</div>
          </div>
          <ChevronDown className="ml-auto h-3.5 w-3.5 text-[#74746d]" />
        </button>
      </div>

      <div className="px-3 py-3">
        <button
          onClick={onSearchCommand}
          className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#deded8] bg-white px-3 text-left text-xs text-[#74746d] shadow-sm"
          type="button"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search or command...</span>
          <span className="rounded border border-[#deded8] bg-[#f6f6f2] px-1.5 py-0.5 text-[10px] text-[#74746d]">Cmd K</span>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.group} className="mb-5">
            <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8a82]">{group.group}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.name === activePage;

                return (
                  <button
                    key={item.name}
                    onClick={() => onPageChange(item.name as PageName)}
                    className={`group flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm transition ${
                      active
                        ? 'border border-[#d7d7d0] bg-white text-[#171717] shadow-sm'
                        : 'border border-transparent text-[#5f5f58] hover:border-[#e3e3dd] hover:bg-[#efefeb] hover:text-[#171717]'
                    }`}
                    type="button"
                  >
                    <span className={`h-4 w-0.5 rounded-full ${active ? 'bg-[#8b8b84]' : 'bg-transparent'}`} />
                    <Icon className={`h-4 w-4 ${active ? 'text-[#171717]' : 'text-[#85857d] group-hover:text-[#171717]'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#deded8] p-3">
        <div className="rounded-xl border border-[#deded8] bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-[#171717]" />
            Agent ready
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#74746d]">Draft, review, translate, and schedule content from one workspace.</p>
        </div>
      </div>
    </aside>
  );
}

function TopBar({
  onApiTokenChange,
  authBypassEnabled,
  hasToken,
  onRefresh,
  onSearchCommand,
  onOpenInbox,
  onOpenNotifications,
  onCreate,
  onOpenMobileMenu,
}: {
  onApiTokenChange: (value: string) => void;
  authBypassEnabled: boolean;
  hasToken: boolean;
  onRefresh: () => void;
  onSearchCommand: () => void;
  onOpenInbox: () => void;
  onOpenNotifications: () => void;
  onCreate: () => void;
  onOpenMobileMenu: () => void;
}) {
  const clearAuthSession = useCallback(() => {
    onApiTokenChange('');
  }, [onApiTokenChange]);

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#deded8] bg-white px-3 py-2 sm:flex-nowrap lg:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          aria-label="Open mobile menu"
          onClick={onOpenMobileMenu}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#6e6e68] lg:hidden"
          type="button"
        >
          <Layers3 className="h-4 w-4" />
        </button>
        <div className="hidden h-8 min-w-0 items-center gap-2 rounded-lg border border-[#deded8] bg-[#f4f4f2] px-3 text-sm text-[#6e6e68] md:flex md:w-[min(360px,38vw)]">
          <Search className="h-4 w-4" />
          <span className="min-w-0 flex-1 truncate">Search content, reviews, schedules...</span>
          <span className="rounded border border-[#deded8] bg-white px-1.5 py-0.5 text-[10px]">Cmd K</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto">
        {authBypassEnabled ? (
          <div className="flex h-8 shrink-0 items-center rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 text-xs text-[#5f5f58]">
            Local auth bypass active
          </div>
        ) : hasToken ? (
          <div className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-emerald-300 bg-[#f8fffa] px-3 text-xs text-[#1f6e4f]">
            <Lock className="h-3.5 w-3.5" />
            <span>Session active</span>
            <button
              onClick={clearAuthSession}
              className="ml-1 flex h-6 items-center rounded-md border border-[#c4e6d7] bg-white px-2 text-[11px] text-[#1f6e4f] hover:bg-[#ecffef]"
              type="button"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex h-8 min-w-0 shrink-0 items-center justify-end gap-2">
            <span className="flex h-8 items-center rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 text-xs text-[#6e6e68]">Session inactive</span>
            <button
              className="h-8 rounded-lg border border-[#171717] bg-[#171717] px-3 text-xs font-semibold text-white hover:bg-[#2f2f2f]"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.assign('/login');
                }
              }}
              type="button"
            >
              Sign in
            </button>
          </div>
        )}
        <button
          onClick={onRefresh}
          className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]"
          type="button"
        >
          <span className="hidden sm:inline">Load live data</span>
          <span className="sm:hidden">Load</span>
        </button>
        <button onClick={onSearchCommand} className="hidden h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-medium text-[#4f4f49] sm:flex" type="button">
          <Search className="h-3.5 w-3.5" />
          Command
        </button>
        <button
          onClick={onOpenInbox}
          className="hidden h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-medium text-[#4f4f49] sm:flex"
          type="button"
        >
          <Inbox className="h-3.5 w-3.5" />
          Inbox
        </button>
        <button
          aria-label="Open notifications"
          onClick={onOpenNotifications}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#4f4f49]"
          type="button"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onCreate}
          className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          Create
        </button>
      </div>
    </header>
  );
}

function DashboardHeader({
  activePage,
  activeTab,
  onTabChange,
}: {
  activePage: PageName;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const meta = pageMeta[activePage];

  return (
    <div className="border-b border-[#deded8] bg-white px-4 py-4 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#6e6e68]">
            <span>{meta.group}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-[#171717]">{activePage}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">{meta.title}</h1>
          <p className="mt-1 text-sm text-[#6e6e68]">{meta.description}</p>
        </div>

        {meta.tabs.length > 0 ? (
          <div className="flex max-w-full items-center overflow-x-auto rounded-xl border border-[#deded8] bg-[#f4f4f2] p-1">
            {meta.tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`h-8 shrink-0 rounded-lg px-3 text-xs font-medium ${
                  tab === activeTab ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68] hover:text-[#171717]'
                }`}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MiniPageCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f4f2] text-[#171717]">
          <Icon className="h-4 w-4" />
        </div>
        <button aria-label={`Open actions for ${label}`} className="text-[#8b8b84] hover:text-[#171717]" type="button">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#171717]">{value}</div>
      <div className="mt-1 text-sm font-medium text-[#3d3d38]">{label}</div>
      <div className="mt-1 text-xs text-[#6e6e68]">{detail}</div>
    </div>
  );
}

function CalendarPost({
  draggable = false,
  onReschedule,
  post,
}: {
  post: CalendarDayPost;
  draggable?: boolean;
  onReschedule?: (post: CalendarDayPost) => void;
}) {
  const styles: Record<string, string> = {
    queued: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
    posted: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    draft: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
    issue: 'border-rose-200 bg-rose-50 text-rose-800',
  };

  return (
    <button
      className={`w-full rounded-md border px-2 py-1.5 text-left shadow-[0_1px_1px_rgba(20,20,20,0.025)] ${styles[post.status]}`}
      draggable={draggable}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onReschedule?.(post);
      }}
      onDragStart={(event) => {
        if (!draggable) {
          return;
        }

        event.dataTransfer.setData(
          'application/json',
          JSON.stringify({
            contentItemId: post.id,
          }),
        );
      }}
      onDragEnd={() => {
        // noop
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
        <span className="truncate text-[11px] font-semibold">{post.title}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2 pl-3 text-[10px] opacity-75">
        <span className="truncate">{post.service}</span>
        <span className="shrink-0 font-semibold">Reschedule</span>
      </div>
    </button>
  );
}

function LegendDot({ label, tone }: { label: string; tone: 'queued' | 'posted' | 'draft' | 'issue' }) {
  const styles = {
    queued: 'bg-[#4f6f9f]',
    posted: 'bg-emerald-500',
    draft: 'bg-[#8b8b84]',
    issue: 'bg-rose-500',
  };

  return (
    <div className="flex items-center gap-2 text-xs text-[#4f4f49]">
      <span className={`h-2.5 w-2.5 rounded-full ${styles[tone]}`} />
      {label}
    </div>
  );
}

function ChannelCard({ channel }: { channel: PublishingChannelSummary }) {
  const failed = channel.status === 'Failed';

  return (
    <div
      className={`group flex min-w-[148px] flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 sm:flex-none ${
        failed ? 'border-rose-200 bg-rose-50/70' : 'border-[#deded8] bg-[#fbfbfa] hover:bg-white'
      }`}
      title={`${channel.name}: ${channel.health} · Last sync ${channel.sync}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white ${
          failed ? 'border-rose-200 text-rose-700' : 'border-[#deded8] text-[#4f4f49]'
        }`}
      >
        {getPublishingChannelIcon(channel.name, 'h-4 w-4')}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-xs font-semibold text-[#171717]">{channel.name}</h3>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${failed ? 'bg-rose-500' : 'bg-emerald-500'}`}
            aria-label={channel.status}
          />
        </div>
        <p className={`mt-0.5 truncate text-[10px] font-medium ${failed ? 'text-rose-700' : 'text-[#6e6e68]'}`}>
          {channel.queue} queue · {channel.sync}
        </p>
      </div>
    </div>
  );
}

function getPublishingChannelIcon(name: string, className?: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('facebook')) return <FacebookIcon className={className} />;
  if (normalizedName.includes('buffer')) return <BufferIcon className={className} />;
  if (normalizedName.includes('wordpress')) return <GlobeIcon className={className} />;
  if (normalizedName.includes('newsletter') || normalizedName.includes('email')) return <FileText className={className} />;
  if (normalizedName.includes('linkedin')) return <LinkedInIcon className={className} />;

  return <Send className={className} />;
}

function PublishingStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Ready: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
    Syncing: 'border-amber-200 bg-amber-50 text-amber-700',
    Failed: 'border-rose-200 bg-rose-50 text-rose-700',
    Queued: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
    Cancelled: 'border-[#d4d4d0] bg-[#f4f4f0] text-[#8c8c84]',
    Published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>{status}</span>;
}

function AlertIcon() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700">
      <span className="text-sm font-bold">!</span>
    </div>
  );
}

function MousePointerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l7.5 16 2.2-6.3L20 11.5 4 4z" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
  onMoreAction,
}: {
  label: string;
  value: string;
  change: string;
  icon: ComponentType<{ className?: string }>;
  tone: 'blue' | 'amber' | 'emerald' | 'slate';
  onMoreAction: () => void;
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <button aria-label={`Open actions for ${label}`} onClick={onMoreAction} className="text-[#8b8b84] hover:text-[#171717]" type="button">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{value}</div>
      <div className="mt-1 text-sm font-medium text-[#3d3d38]">{label}</div>
      <div className="mt-1 text-xs text-[#6e6e68]">{change}</div>
    </div>
  );
}

function MobileBoardStack({
  board,
  selectedBoardItemId,
  onAddBoardItem,
  onOpenBoardItem,
}: {
  board: DashboardBoard[];
  selectedBoardItemId?: string | null;
  onAddBoardItem: () => void;
  onOpenBoardItem: (item: BoardItem) => void;
}) {
  return (
    <div className="space-y-3 lg:hidden">
      <div className="rounded-xl border border-[#deded8] bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Mobile pipeline</h3>
            <p className="mt-1 text-xs text-[#6e6e68]">Stacked view for small screens. Desktop keeps the full kanban board.</p>
          </div>
          <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
            {board.reduce((sum, column) => sum + column.items.length, 0)} items
          </span>
        </div>
      </div>
      {board.map((column) => (
        <section key={column.column} className="rounded-xl border border-[#e1e1dc] bg-[#f3f3f0] p-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Circle className="h-2.5 w-2.5 fill-[#8b8b84] text-[#8b8b84]" />
              <h3 className="text-xs font-semibold text-[#3d3d38]">{column.column}</h3>
              <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">{column.count}</span>
            </div>
            <button aria-label={`Add item to ${column.column}`} onClick={onAddBoardItem} className="text-[#8b8b84] hover:text-[#171717]" type="button">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {column.items.slice(0, 3).map((item) => (
              <BoardCard
                key={item.id}
                item={item}
                selected={selectedBoardItemId === item.id}
                onOpenBoardItem={() => onOpenBoardItem(item)}
              />
            ))}
            {column.items.length > 3 ? (
              <button
                onClick={onAddBoardItem}
                className="rounded-lg border border-dashed border-[#cfcfc8] bg-white px-3 py-2 text-left text-xs font-semibold text-[#6e6e68] hover:bg-[#f6f6f2]"
                type="button"
              >
                +{column.items.length - 3} more in {column.column}
              </button>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}

const dashboardLifecycleStages = ['Brief Created', 'Text Ready', 'Assets Ready', 'Ready for Review', 'In Review', 'Publishing Queued', 'Posted / Failed'];

function getWorkflowIdSeed(id: string) {
  return id.replace(/\D/g, '') || id;
}

function getDashboardIdForWorkflowId(id: string) {
  if (id.startsWith('SW-')) {
    return id;
  }

  return `SW-${getWorkflowIdSeed(id)}`;
}

function getReviewIdForWorkflowId(id: string) {
  if (id.startsWith('REV-')) {
    return id;
  }

  if (id.startsWith('PUB-')) {
    return id.replace('PUB-', 'REV-');
  }

  return `REV-${getWorkflowIdSeed(id)}`;
}

function getPublishingIdForWorkflowId(id: string) {
  if (id.startsWith('PUB-')) {
    return id;
  }

  return getReviewIdForWorkflowId(id).replace('REV-', 'PUB-');
}

function normalizeReviewQueueId(value: string) {
  return normalizeTextValue(value).toUpperCase();
}

function extractReviewIdSeed(value: string | undefined | null): string {
  const normalized = normalizeReviewQueueId(value || '');

  return normalized.match(/\d+/g)?.join('') ?? '';
}

function buildReviewIdMatchSignatures(value: string | undefined | null): Set<string> {
  const normalized = normalizeReviewQueueId(value || '');
  if (!normalized) {
    return new Set();
  }

  const signatures = new Set([normalized, normalized.toLowerCase()]);
  const seed = extractReviewIdSeed(normalized);

  if (!seed) {
    return signatures;
  }

  signatures.add(seed);
  signatures.add(`SW-${seed}`);
  signatures.add(`REV-${seed}`);
  signatures.add(`PUB-${seed}`);

  return signatures;
}

function getReviewQueueItemMatchSignatures(item: Pick<ReviewQueueItem, 'id' | 'workflowId' | 'publishingId' | 'sourceIds'>) {
  const signatures = new Set<string>();
  const add = (value: string | undefined | null) => {
    buildReviewIdMatchSignatures(value).forEach((signature) => {
      signatures.add(signature);
    });
  };

  add(item.id);
  add(item.workflowId);
  add(item.publishingId);

  item.sourceIds?.forEach((sourceId) => add(sourceId));

  if (item.workflowId) {
    add(getDashboardIdForWorkflowId(item.workflowId));
    add(getReviewIdForWorkflowId(item.workflowId));
    add(getPublishingIdForWorkflowId(item.workflowId));
  }

  return signatures;
}

function hasReviewQueueTargetMatch(item: Pick<ReviewQueueItem, 'id' | 'workflowId' | 'publishingId'>, targetSignatures: Set<string>) {
  const itemSignatures = getReviewQueueItemMatchSignatures(item);

  return [...targetSignatures].some((signature) => itemSignatures.has(signature));
}

function hasMatchingSignatures(firstSignatures: Set<string>, secondSignatures: Set<string>) {
  return [...firstSignatures].some((signature) => secondSignatures.has(signature));
}

function buildReviewQueueTargetMatchSignatures(values: Array<string | undefined | null>) {
  const signatures = new Set<string>();
  values.forEach((value) => {
    buildReviewIdMatchSignatures(value).forEach((signature) => {
      signatures.add(signature);
    });
  });

  return signatures;
}

function hasReviewQueueValueMatch(value: string | undefined | null, targetSignatures: Set<string>) {
  return hasMatchingSignatures(buildReviewIdMatchSignatures(value), targetSignatures);
}

function normalizeWorkflowStage(value: string | undefined, fallback: string = 'Brief Created') {
  const haystack = (value ?? '').toLowerCase();

  if (haystack.includes('failed') || haystack.includes('posted') || haystack.includes('published')) {
    return 'Posted / Failed';
  }
  if (haystack.includes('publishing') || haystack.includes('queued') || haystack.includes('syncing') || haystack.includes('agent c')) {
    return 'Publishing Queued';
  }
  if (haystack.includes('human review') || haystack.includes('in review')) {
    return 'In Review';
  }
  if (haystack.includes('approved') || haystack.includes('ready for review') || haystack.includes('text + image + layout')) {
    return 'Ready for Review';
  }
  if (haystack.includes('asset') || haystack.includes('visual') || haystack.includes('layout') || haystack.includes('agent b')) {
    return 'Assets Ready';
  }
  if (haystack.includes('text') || haystack.includes('citation') || haystack.includes('agent a')) {
    return 'Text Ready';
  }

  return dashboardLifecycleStages.includes(fallback) ? fallback : 'Brief Created';
}

function inferDashboardLifecycleStage(item: BoardItem) {
  return normalizeWorkflowStage(`${item.stage ?? ''} ${item.due} ${item.owner} ${item.channel}`);
}

function getReviewSurfaceStage(item: ReviewQueueItem | undefined) {
  if (!item) {
    return 'Missing';
  }

  if (item.status === 'Rejected') {
    return 'Text Ready';
  }

  return normalizeWorkflowStage(`${item.status} ${item.due}`);
}

function getPublishingSurfaceStage(row: PublishingQueueRow | undefined) {
  if (!row) {
    return 'Missing';
  }

  return normalizeWorkflowStage(`${row.status} ${row.time}`);
}

function buildWorkflowStatusSnapshot({
  workflowId,
  reviewId,
  publishingId,
  boardItem,
  reviewItem,
  publishingRow,
  events,
  fallbackStage,
}: {
  workflowId: string;
  reviewId: string;
  publishingId: string;
  boardItem?: BoardItem;
  reviewItem?: ReviewQueueItem;
  publishingRow?: PublishingQueueRow;
  events: LogEvent[];
  fallbackStage: string;
}): WorkflowStatusSnapshot {
  const dashboardStage = boardItem ? inferDashboardLifecycleStage(boardItem) : 'Missing';
  const reviewStage = getReviewSurfaceStage(reviewItem);
  const publishingStage = getPublishingSurfaceStage(publishingRow);
  const latestLogStage = events[0]?.status ? normalizeWorkflowStage(events[0].status, fallbackStage) : 'Missing';
  const canonicalStage =
    publishingStage !== 'Missing'
      ? publishingStage
      : reviewStage !== 'Missing'
        ? reviewStage
        : dashboardStage !== 'Missing'
          ? dashboardStage
          : latestLogStage !== 'Missing'
            ? latestLogStage
            : normalizeWorkflowStage(fallbackStage);
  const surfaces: WorkflowStatusSurface[] = [
    {
      surface: 'Dashboard',
      id: workflowId,
      status: boardItem?.stage ?? boardItem?.due ?? 'Not present yet',
      canonicalStage: dashboardStage,
      detail: boardItem ? `${boardItem.owner} · ${boardItem.channel}` : 'No dashboard card has been created for this workflow yet.',
      present: Boolean(boardItem),
    },
    {
      surface: 'Review Queue',
      id: reviewId,
      status: reviewItem?.status ?? 'Not present yet',
      canonicalStage: reviewStage,
      detail: reviewItem ? `${reviewItem.owner} · ${reviewItem.due}` : 'Review package is not in queue for this workflow.',
      present: Boolean(reviewItem),
    },
    {
      surface: 'Publishing Queue',
      id: publishingId,
      status: publishingRow?.status ?? 'Not present yet',
      canonicalStage: publishingStage,
      detail: publishingRow ? `${publishingRow.platform} · ${publishingRow.time}` : 'Publishing job is not queued yet.',
      present: Boolean(publishingRow),
    },
    {
      surface: 'Logs',
      id: workflowId,
      status: events[0]?.status ?? 'No matching event yet',
      canonicalStage: latestLogStage,
      detail: `${events.length} linked workflow event${events.length === 1 ? '' : 's'}`,
      present: events.length > 0,
    },
  ];
  const presentSurfaces = surfaces.filter((surface) => surface.present);
  const mismatchCount = presentSurfaces.filter((surface) => surface.canonicalStage !== canonicalStage).length;
  const syncHealth = mismatchCount > 0 ? 'Needs attention' : presentSurfaces.length >= 3 ? 'Synced' : 'Partial';

  return {
    workflowId,
    reviewId,
    publishingId,
    canonicalStage,
    syncHealth,
    mismatchCount,
    surfaces,
  };
}

function WorkflowStatusSyncPanel({ snapshot }: { snapshot: WorkflowStatusSnapshot }) {
  const healthTone =
    snapshot.syncHealth === 'Synced'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : snapshot.syncHealth === 'Partial'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';

  return (
    <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#171717]">Workflow status sync</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-[#6e6e68]">
            Canonical stage for {snapshot.workflowId}, {snapshot.reviewId}, and {snapshot.publishingId}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${healthTone}`}>
            {snapshot.syncHealth}
          </span>
          <Tag>{snapshot.canonicalStage}</Tag>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {snapshot.surfaces.map((surface) => {
          const aligned = surface.present && surface.canonicalStage === snapshot.canonicalStage;
          const missing = !surface.present;

          return (
            <div
              key={`${surface.surface}-${surface.id}`}
              className={`rounded-xl border p-3 ${
                missing
                  ? 'border-[#deded8] bg-[#fbfbfa]'
                  : aligned
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#171717]">{surface.surface}</div>
                  <div className="mt-0.5 truncate text-[11px] text-[#8a8a82]">{surface.id}</div>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  missing
                    ? 'border-[#deded8] bg-white text-[#8a8a82]'
                    : aligned
                      ? 'border-emerald-200 bg-white text-emerald-700'
                      : 'border-amber-200 bg-white text-amber-800'
                }`}>
                  {missing ? 'Waiting' : aligned ? 'Aligned' : 'Check'}
                </span>
              </div>
              <div className="mt-2 text-xs font-semibold text-[#4f4f49]">{surface.status}</div>
              <div className="mt-1 text-[11px] text-[#6e6e68]">{surface.canonicalStage}</div>
              <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">{surface.detail}</p>
            </div>
          );
        })}
      </div>

      {snapshot.mismatchCount > 0 ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {snapshot.mismatchCount} surface{snapshot.mismatchCount === 1 ? '' : 's'} need status reconciliation before backend source-of-truth migration.
        </p>
      ) : null}
    </section>
  );
}

function ContentJobDetailDrawer({
  detail,
  onClose,
  onOpenDashboard,
  onOpenReview,
  onOpenPublishing,
  onOpenLogs,
  onDelete,
  deleteLoading,
}: {
  detail: ContentJobDetail;
  onClose: () => void;
  onOpenDashboard: () => void;
  onOpenReview: () => void;
  onOpenPublishing: () => void;
  onOpenLogs: () => void;
  onDelete: () => void;
  deleteLoading?: boolean;
}) {
  const currentStage = detail.statusSnapshot.canonicalStage;
  const currentIndex = dashboardLifecycleStages.indexOf(currentStage);
  const generatedDrafts = detail.reviewItem?.generatedDrafts?.length ? detail.reviewItem.generatedDrafts : detail.boardItem?.generatedDrafts ?? [];
  const generatedDraftCount = generatedDrafts.length;
  const selectedAssets =
    detail.reviewItem?.selectedAssets?.length ? detail.reviewItem.selectedAssets : detail.boardItem?.selectedAssets ?? [];
  const generatedAssets =
    detail.reviewItem?.generatedAssets?.length ? detail.reviewItem.generatedAssets : detail.boardItem?.generatedAssets ?? [];
  const realImageAssets = generatedAssets.filter(
    (asset) =>
      !asset.isPlaceholder &&
      Boolean(asset.url || asset.storagePath) &&
      (asset.assetType === 'image' || asset.assetType === 'thumbnail' || asset.assetType === 'carousel_slide' || Boolean(asset.url)),
  );
  const pendingImageAssets = generatedAssets.filter((asset) => asset.isPlaceholder || asset.availabilityStatus === 'pending');
  const failedImageAssets = generatedAssets.filter((asset) => asset.availabilityStatus === 'failed');
  const assetLayoutPlan =
    detail.reviewItem?.assetLayoutPlan?.length ? detail.reviewItem.assetLayoutPlan : detail.boardItem?.assetLayoutPlan ?? [];
  const imageCount = detail.reviewItem?.imageCount ?? detail.boardItem?.imageCount ?? realImageAssets.length ?? selectedAssets.length;
  const visualBrief = detail.reviewItem?.visualBrief || detail.boardItem?.visualBrief;
  const creativeSummary = detail.reviewItem?.creativeSummary;
  const approvalRecommendation = detail.reviewItem?.approvalRecommendation ?? detail.reviewItem?.approvalSummary;
  const requiredFix = detail.reviewItem?.requiredFix;
  const degradedMessage = detail.reviewItem?.degradedMessage;
  const layout = detail.reviewItem?.layout || detail.boardItem?.layout;
  const wordCount = detail.reviewItem?.wordCount ?? detail.boardItem?.wordCount;
  const contentItemStatus = detail.reviewItem?.contentItemStatus || detail.boardItem?.contentItemStatus || detail.stage;
  const hasGeneratedText = generatedDraftCount > 0;
  const hasGeneratedImageEvidence = realImageAssets.length > 0;
  const metadata = [
    ['Workflow', detail.workflowId],
    ['Review', detail.reviewId],
    ['Publishing', detail.publishingId],
    ['Created by', detail.createdBy],
    ['Created at', detail.createdAtLabel],
    ['Stage', currentStage],
    ['Owner', detail.owner],
    ['Channel', detail.channel],
    ['Due', detail.due],
    ['Category', detail.category],
  ];
  const timeline = [
    ...detail.events.map((event) => ({
      time: event.time,
      title: event.type,
      detail: event.message,
      source: event.source,
      status: event.status ?? '',
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 p-0 backdrop-blur-[1px] sm:p-4">
      <aside className="flex h-full w-full max-w-3xl flex-col overflow-hidden border border-[#d7d7d0] bg-[#fbfbfa] shadow-2xl sm:rounded-2xl">
        <div className="max-h-[48dvh] overflow-y-auto border-b border-[#e3e3dd] bg-white p-3 sm:max-h-none sm:overflow-visible sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
                  Content Job Detail
                </span>
                <RiskBadge risk={detail.risk} />
                <Tag>{currentStage}</Tag>
              </div>
              <h2 className="truncate text-lg font-semibold tracking-[-0.02em] text-[#171717]">{detail.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">
                Single source view for {detail.workflowId}, {detail.reviewId}, and {detail.publishingId}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f6f6f2]"
              type="button"
              aria-label="Close content job detail"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {metadata.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
                <div className="mt-1 truncate text-xs font-semibold text-[#171717]">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <WorkflowStatusSyncPanel snapshot={detail.statusSnapshot} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onOpenDashboard} className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Open Dashboard
            </button>
            <button onClick={onOpenReview} className="rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#2f4f7f] hover:bg-white" type="button">
              Open Review
            </button>
            <button
              onClick={() => document.getElementById('content-job-generated-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-white"
              type="button"
            >
              Open Generated Content
            </button>
            <button onClick={onOpenPublishing} className="rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white" type="button">
              Open Publishing
            </button>
            <button onClick={onOpenLogs} className="rounded-lg bg-[#171717] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2f2f2b]" type="button">
              Open Logs
            </button>
            <button
              onClick={onDelete}
              disabled={deleteLoading}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#171717]">Lifecycle</h3>
                <p className="mt-0.5 text-xs text-[#6e6e68]">The same content item across Dashboard, Review Queue, Publishing Queue, and Logs.</p>
              </div>
              <Tag>{detail.events.length} log event{detail.events.length === 1 ? '' : 's'}</Tag>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
              {dashboardLifecycleStages.map((stage, index) => {
                const done = index < currentIndex;
                const active = index === currentIndex;

                return (
                  <div
                    key={stage}
                    className={`rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                      active
                        ? 'border-[#1f5eff] bg-[#f4f7fd] text-[#1f5eff]'
                        : done
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-[#deded8] bg-white text-[#8a8a82]'
                    }`}
                  >
                    <div>{stage}</div>
                    <div className="mt-1 text-[10px] font-medium opacity-75">{active ? 'Current' : done ? 'Done' : 'Pending'}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="content-job-generated-content" className="mt-4 scroll-mt-4 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#171717]">Generated content evidence</h3>
                <p className="mt-0.5 text-xs text-[#6e6e68]">
                  Shows whether this content job already has generated text and image/layout output from the live workflow.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  hasGeneratedText ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  Text {hasGeneratedText ? 'generated' : 'pending'}
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  hasGeneratedImageEvidence ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  Image {hasGeneratedImageEvidence ? 'output ready' : failedImageAssets.length ? 'failed' : pendingImageAssets.length ? 'pending generation' : 'pending'}
                </span>
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#171717]">Content text</div>
                    <p className="mt-0.5 text-[11px] text-[#8a8a82]">
                      {generatedDraftCount} generated draft{generatedDraftCount === 1 ? '' : 's'}
                      {typeof wordCount === 'number' ? ` · ${wordCount} target words` : ''}
                    </p>
                  </div>
                  <Tag>{contentItemStatus}</Tag>
                </div>
                <div className="mt-3 space-y-3">
                  {generatedDrafts.length ? (
                    generatedDrafts.map((draft) => (
                      <article key={`${draft.languageCode}-${draft.title}`} className="rounded-lg border border-[#e3e3dd] bg-white p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-[#171717]">{draft.title}</span>
                          <Tag>{draft.languageLabel}</Tag>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#4f4f49]">{normalizeTextValue(draft.body)}</p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                      Content text has not been generated for this job yet. It should stay in Todo/In Progress until the text agent writes at least one draft.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="text-xs font-semibold text-[#171717]">Image / layout evidence</div>
                  <div className="mt-2 space-y-2 text-xs text-[#4f4f49]">
                    <div className="rounded-lg border border-[#e3e3dd] bg-white p-2">
                      Image output: {realImageAssets.length ? `${realImageAssets.length} ready` : pendingImageAssets.length ? `${pendingImageAssets.length} pending generation` : failedImageAssets.length ? 'Generation failed' : 'Pending'}
                    </div>
                    <div className="rounded-lg border border-[#e3e3dd] bg-white p-2">Layout: {layout || 'Pending layout'}</div>
                    <div className="rounded-lg border border-[#e3e3dd] bg-white p-2">
                      <div className="mb-1">Selected assets:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAssets.length ? (
                          selectedAssets.map((asset, idx) => {
                            const isUrl = asset.startsWith('http');
                            return isUrl ? (
                              <img key={idx} src={asset} alt="Selected" className="h-8 w-8 rounded border border-[#deded8] object-cover" />
                            ) : (
                              <Tag key={idx}>{asset}</Tag>
                            );
                          })
                        ) : (
                          <span className="text-[#8a8a82]">Pending asset selection</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="text-xs font-semibold text-[#171717]">Generated images</div>
                  <div className="mt-3 grid gap-2">
                    {realImageAssets.length ? (
                      realImageAssets.map((asset, index) => (
                        <figure key={`${asset.url ?? asset.storagePath ?? asset.altText}-${index}`} className="overflow-hidden rounded-xl border border-[#e3e3dd] bg-white">
                          {asset.url ? (
                            <img
                              src={asset.url}
                              alt={asset.altText || `Generated image ${index + 1}`}
                              className="aspect-[4/3] w-full bg-[#f6f6f2] object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex aspect-[4/3] w-full items-center justify-center bg-amber-50 px-3 text-center text-xs font-medium text-amber-800">
                              Real asset exists, but no public image URL is available yet.
                            </div>
                          )}
                          <figcaption className="space-y-1 p-2 text-[11px] text-[#6e6e68]">
                            <div className="font-semibold text-[#171717]">{asset.altText || `Generated image ${index + 1}`}</div>
                            <div>{asset.layoutType || asset.assetType}{asset.source ? ` · ${asset.source}` : ''}</div>
                            {asset.storagePath ? <div className="truncate">Storage: {asset.storagePath}</div> : null}
                          </figcaption>
                        </figure>
                      ))
                    ) : failedImageAssets.length ? (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs leading-relaxed text-rose-700">
                        Image generation failed for this job. Review packaging should not treat placeholder assets as complete output.
                      </div>
                    ) : pendingImageAssets.length ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs leading-relaxed text-amber-800">
                        Real image output is still pending. {pendingImageAssets.length} placeholder slot{pendingImageAssets.length === 1 ? '' : 's'} exist, but they are not treated as completed visual assets.
                      </div>
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs leading-relaxed text-amber-800">
                        No real generated image records are attached yet. This tab will render images from content_assets.url once Image & Layout Agent creates them.
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="text-xs font-semibold text-[#171717]">Visual brief</div>
                  <p className="mt-2 text-xs leading-relaxed text-[#4f4f49]">{normalizeTextValue(visualBrief) || 'Pending text-to-image summary'}</p>
                  {normalizeTextValue(creativeSummary) ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">Creative summary: {normalizeTextValue(creativeSummary)}</p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="text-xs font-semibold text-[#171717]">Asset layout plan</div>
                  <div className="mt-2 space-y-1">
                    {assetLayoutPlan.length ? (
                      assetLayoutPlan.map((step, index) => (
                        <div key={`${step}-${index}`} className="rounded-lg border border-[#e3e3dd] bg-white px-2 py-1.5 text-xs text-[#4f4f49]">
                          {step}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">Pending image/layout agent output</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h3 className="text-sm font-semibold text-[#171717]">Workflow timeline</h3>
            <div className="mt-4 space-y-3">
              {timeline.length === 0 ? (
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-3 text-xs text-[#6e6e68]">
                  No runtime workflow events yet. This panel updates from live backend logs as each agent completes.
                </div>
              ) : (
                timeline.map((event, index) => (
                  <div key={`${event.time}-${event.title}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#8b8b84]" />
                      {index !== timeline.length - 1 ? <span className="mt-1 h-full w-px bg-[#deded8]" /> : null}
                    </div>
                    <div className="min-w-0 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#171717]">{event.title}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a82]">{event.time}</span>
                        {event.status ? <Tag>{event.status}</Tag> : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#4f4f49]">{event.detail}</p>
                      <p className="mt-1 text-[11px] text-[#8a8a82]">{event.source}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
                <h3 className="text-sm font-semibold text-[#171717]">Review package</h3>
                <div className="mt-3 space-y-2 text-xs text-[#4f4f49]">
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">Status: {detail.reviewItem?.status ?? 'Not in review yet'}</div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">Sources: {detail.reviewItem?.sourceConnectors?.join(', ') ?? 'Pending source handoff'}</div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">Layout: {detail.reviewItem?.layout ?? 'Pending asset composer'}</div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                    Assets: {detail.reviewItem?.selectedAssets?.length ? detail.reviewItem.selectedAssets.join(', ') : 'Pending asset selection'}
                  </div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                    Visual brief: {detail.reviewItem?.visualBrief ?? 'Pending text-to-image summary'}
                  </div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                    Approval recommendation: {approvalRecommendation ?? 'Pending compliance output'}
                  </div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                    Required fix: {requiredFix ?? 'No required fix recorded'}
                  </div>
                  {degradedMessage ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
                      {degradedMessage}
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
                <h3 className="text-sm font-semibold text-[#171717]">Agent handoff</h3>
                <div className="mt-3 space-y-2">
                  {detail.agentJobs.length ? (
                    detail.agentJobs.map((job) => (
                      <div key={job.id} className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold text-[#171717]">{job.agent}</span>
                          <Tag>{job.status}</Tag>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{job.stage}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#6e6e68]">
                      No live agent handoff has been recorded for this content item yet.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DashboardLifecycleDetail({ item }: { item: BoardItem }) {
  const currentStage = inferDashboardLifecycleStage(item);
  const currentIndex = dashboardLifecycleStages.indexOf(currentStage);
  const reviewId = getReviewIdForWorkflowId(item.id);
  const publishingId = getPublishingIdForWorkflowId(item.id);

  return (
    <section className="mt-3 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-[#171717]">Lifecycle detail</h3>
          <p className="mt-0.5 text-[11px] text-[#6e6e68]">Same content item across Dashboard, Review Queue, Publishing Queue, and Logs.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Tag>{reviewId}</Tag>
          <Tag>{publishingId}</Tag>
          <Tag>{currentStage}</Tag>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-7">
        {dashboardLifecycleStages.map((stage, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <div
              key={stage}
              className={`rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                active
                  ? 'border-[#1f5eff] bg-[#f4f7fd] text-[#1f5eff]'
                  : done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-[#deded8] bg-white text-[#8a8a82]'
              }`}
            >
              <div>{stage}</div>
              <div className="mt-1 text-[10px] font-medium opacity-75">{active ? 'Current' : done ? 'Done' : 'Pending'}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BoardColumn({
  column,
  count,
  items,
  selectedBoardItemId,
  onAddBoardItem,
  onOpenBoardItem,
}: {
  column: string;
  count: number;
  items: BoardItem[];
  selectedBoardItemId?: string | null;
  onAddBoardItem: () => void;
  onOpenBoardItem: (item: BoardItem) => void;
}) {
  return (
    <div className="min-h-[430px] rounded-xl border border-[#e1e1dc] bg-[#f3f3f0] p-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Circle className="h-2.5 w-2.5 fill-[#8b8b84] text-[#8b8b84]" />
          <h3 className="text-xs font-semibold text-[#3d3d38]">{column}</h3>
          <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">{count}</span>
        </div>
        <button aria-label={`Add item to ${column}`} onClick={onAddBoardItem} className="text-[#8b8b84] hover:text-[#171717]" type="button">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <BoardCard
            key={item.id}
            item={item}
            selected={selectedBoardItemId === item.id}
            onOpenBoardItem={() => onOpenBoardItem(item)}
          />
        ))}
      </div>
    </div>
  );
}

function BoardCard({
  item,
  selected = false,
  onOpenBoardItem,
}: {
  item: BoardItem;
  selected?: boolean;
  onOpenBoardItem: () => void;
}) {
  const accents = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    slate: 'bg-[#8b8b84]',
  };

  return (
    <button
      type="button"
      onClick={onOpenBoardItem}
      className={`w-full rounded-lg border bg-white p-2.5 text-left shadow-[0_1px_1px_rgba(20,20,20,0.035)] transition hover:border-[#c9c9c1] hover:shadow-[0_2px_6px_rgba(20,20,20,0.06)] ${
        selected ? 'border-[#2f4f7f] bg-[#f4f7fd]' : 'border-[#deded8]'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${accents[item.tone]}`} />
          <span className="truncate text-[11px] font-semibold text-[#6e6e68]">{item.id}</span>
        </div>
        <RiskBadge risk={item.risk} />
      </div>
      <h4 className="line-clamp-2 text-[13px] font-medium leading-snug text-[#20201d]">{item.title}</h4>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Tag>{item.channel}</Tag>
        <Tag>{item.due}</Tag>
        {item.stage ? <Tag>{item.stage}</Tag> : null}
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-[#eeeeea] pt-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#deded8] bg-[#f6f6f2] text-[9px] font-bold text-[#3d3d38]">
            {item.owner.slice(0, 1)}
          </div>
          <span className="truncate text-[11px] text-[#6e6e68]">{item.owner}</span>
        </div>
            <span className="text-[#8b8b84]" aria-hidden="true">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </span>
      </div>
    </button>
  );
}

function AgentPanel({
  agents,
  activity,
  queueJobs,
  onAgentOpen,
  onSavePrompt,
  onRunPrompt,
  isRunning,
}: {
  agents: DashboardAgent[];
  activity: DashboardActivity[];
  queueJobs: AgentQueueJob[];
  onAgentOpen: () => void;
  onSavePrompt: () => void;
  onRunPrompt: () => void;
  isRunning?: boolean;
}) {
  const agentList = agents.filter((agent) => coreAgentNames.includes(agent.name));
  const activityList = activity;
  const agentQueueList = queueJobs;
  const stateBadgeClass = (state: DashboardAgent['state']) =>
    state === 'Online'
      ? 'bg-emerald-50 text-emerald-700'
      : state === 'Idle'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-slate-100 text-slate-600';

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#171717]">Agent workforce</h2>
          <p className="mt-0.5 text-xs text-[#6e6e68]">Assistants embedded into the content workflow.</p>
        </div>
        <button onClick={onAgentOpen} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-medium text-[#4f4f49]" type="button">
          <Bot className="h-3.5 w-3.5" />
          Agent
        </button>
      </div>

      <div className="space-y-2">
        {agentList.map((agent) => (
          <div key={agent.name} className="rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2] text-[#171717]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold text-[#171717]">{agent.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${stateBadgeClass(agent.state)}`}>{agent.state}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{agent.task}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[#e8e8e4]">
                    <div className="h-1.5 rounded-full bg-[#8b8b84]" style={{ width: `${agent.load}%` }} />
                  </div>
                  <span className="text-[11px] font-medium text-[#6e6e68]">{agent.runs} runs</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PanelSection title="Agent queue">
        <div className="space-y-2">
          {agentQueueList.map((job) => (
            <AgentQueueCard key={job.id} job={job} />
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Activity">
        <div className="space-y-3">
          {activityList.map((item, index) => (
            <div key={`${item.message}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#8b8b84]" />
                {index !== activityList.length - 1 && <span className="mt-1 h-full w-px bg-[#deded8]" />}
              </div>
              <div className="pb-2 text-xs leading-relaxed text-[#4f4f49]">
                <p>{item.actorName ? `${item.actorName}: ${item.message}` : item.message}</p>
                {item.createdAt ? <p className="mt-1 text-[11px] text-[#8a8a82]">{formatDashboardActivityDate(item.createdAt)}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Agent command">
        <div className="rounded-2xl border border-[#deded8] bg-[#f4f4f2] p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#171717]">
            <MessageSquareText className="h-4 w-4 text-[#171717]" />
            Ask agents to continue the next step
          </div>
          <textarea
            className="min-h-24 w-full resize-none rounded-xl border border-[#deded8] bg-white p-3 text-xs text-[#171717] outline-none ring-[#171717] placeholder:text-[#8b8b84] focus:ring-1"
            placeholder="Create 3 post angles from SW-124, check legal risk, then schedule the safest one..."
          />
          <div className="mt-2 flex justify-between">
            <button
              onClick={onSavePrompt}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-medium text-[#4f4f49]"
              type="button"
            >
              <Archive className="h-3.5 w-3.5" />
              Save prompt
            </button>
            <button
              onClick={onRunPrompt}
              disabled={Boolean(isRunning)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-white px-3 text-xs font-semibold text-[#171717] ${isRunning ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#f6f6f2]'}`}
              type="button"
            >
              <Send className="h-3.5 w-3.5" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>
      </PanelSection>
    </div>
  );
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6e6e68]">{title}</h2>
      {children}
    </section>
  );
}

function AgentQueueCard({ job }: { job: AgentQueueJob }) {
  const createdAtLabel = formatAgentQueueTime(job.createdAt);
  const updatedAtLabel = formatAgentQueueTime(job.updatedAt);
  const statusStyles = {
    Done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Running: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#1f5eff]',
    Queued: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
    'Waiting review': 'border-amber-200 bg-amber-50 text-amber-700',
  }[job.status];

  return (
    <article className="rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-[#deded8] bg-[#fbfbfa] px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{job.agent}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles}`}>{job.status}</span>
            {job.runMode ? <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-2 py-0.5 text-[10px] font-semibold text-[#2f4f7f]">{job.runMode}</span> : null}
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-[#171717]">{job.stage}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{job.detail}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-col text-[10px] text-[#6e6e68]">
        <span>สร้าง: {createdAtLabel}</span>
        <span>อัปเดต: {updatedAtLabel}</span>
        {job.handoffTarget ? <span>ส่งต่อ: {job.handoffTarget}</span> : null}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2 text-[11px]">
        <span className="font-semibold text-[#4f4f49]">{job.owner}</span>
        <span className="font-medium text-[#8a8a82]">{job.id}</span>
      </div>
    </article>
  );
}

function RiskBadge({ risk }: { risk: BoardItem['risk'] }) {
  const styles = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[risk]}`}>{risk}</span>;
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-[#deded8] bg-[#f4f4f2] px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">{children}</span>;
}
