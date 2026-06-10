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
import { isPublicApiAuthBypassEnabled } from '@/lib/auth-bypass';
import type { ContentJobDetail } from '@/features/prd/types/content-job';
import { buildWorkflowStatusSnapshot, getReviewSurfaceStage } from '@/features/prd/lib/workflow-status-snapshot';
import { DashboardView } from '@/features/prd/views/DashboardView';
import { CalendarView } from '@/features/prd/views/CalendarView';
import { PublishingView } from '@/features/prd/views/PublishingView';
import { ReviewQueueView } from '@/features/prd/views/ReviewQueueView';
import { AgentsView } from '@/features/prd/views/AgentsView';
import { LogsView } from '@/features/prd/views/LogsView';
import {
  APP_TIMEZONE,
  APP_TIMEZONE_OFFSET,
  DAY_IN_MS,
  createBangkokDateTime,
  formatFocusTime,
  monthLabels,
  toAppDateKey,
  toBangkokDateParts,
  parseCalendarMinutes,
  toCalendarSlotIso,
  toDateParts,
} from '@/features/prd/lib/calendar-display';
import {
  buildReviewDraftTitle,
  getLanguageDisplayLabels,
  languageCodeLabelMap,
  languageDisplayLabels,
  normalizeLanguageCode,
  normalizeLanguageCodes,
} from '@/features/prd/lib/review-display';
import {
  buildReviewIdMatchSignatures,
  buildReviewQueueTargetMatchSignatures,
  getReviewQueueItemMatchSignatures,
  hasReviewQueueTargetMatch,
  hasReviewQueueValueMatch,
  getReviewQueueSortValue,
  hasMatchingSignatures,
  sortReviewQueueItems,
} from '@/features/prd/lib/review-queue-match';
import type { LogEvent } from '@/features/prd/types/logs';
import { ContentJobDetailDrawer } from '@/features/prd/components/ContentJobDetailDrawer';
import { AgentPanel } from '@/features/prd/components/AgentPanel';
import { BoardColumn } from '@/features/prd/components/BoardColumn';
import { DashboardLifecycleDetail } from '@/features/prd/components/DashboardLifecycleDetail';
import { DashboardHeader } from '@/features/prd/components/DashboardHeader';
import { CreateStep } from '@/features/prd/components/CreateStep';
import { CalendarPost } from '@/features/prd/components/CalendarPost';
import { BoardCard } from '@/features/prd/components/BoardCard';
import { ChannelCard } from '@/features/prd/components/ChannelCard';
import { MobileBoardStack } from '@/features/prd/components/MobileBoardStack';
import { CommandCenterHero } from '@/features/prd/components/CommandCenterHero';
import { PublishingStatus } from '@/features/prd/components/PublishingStatus';
import { StatCard } from '@/features/prd/components/StatCard';
import { LegendDot } from '@/features/prd/components/LegendDot';
import { MiniPageCard } from '@/features/prd/components/MiniPageCard';
import { MobileSidebarDrawer } from '@/features/prd/components/MobileSidebarDrawer';
import { Sidebar } from '@/features/prd/components/Sidebar';
import { TopBar } from '@/features/prd/components/TopBar';
import { PrdPageLoadingFallback } from '@/features/prd/components/PrdPageLoadingFallback';
import {
  SafetyConfirmationDialog,
  type SafetyConfirmation,
} from '@/features/prd/components/SafetyConfirmationDialog';
import { WorkspaceView } from '@/features/prd/components/WorkspaceView';
import { AlertIcon } from '@/features/prd/components/primitives/AlertIcon';
import { PanelSection } from '@/features/prd/components/primitives/PanelSection';
import { SectionKicker } from '@/features/prd/components/primitives/SectionKicker';
import { RiskBadge } from '@/features/prd/components/primitives/RiskBadge';
import { RiskPill } from '@/features/prd/components/primitives/RiskPill';
import { Tag } from '@/features/prd/components/primitives/Tag';
import { coreAgentNames } from '@/features/prd/config/agents';
import { dashboardLifecycleStages } from '@/features/prd/config/dashboard-lifecycle';
import { navGroups, pageMeta, type PageName } from '@/features/prd/config/navigation';
import { getCommandCenterCounts } from '@/features/prd/lib/command-center';
import {
  filterDashboardBoardByTab,
  formatBoardItemContextLabel,
  normalizeDashboardTab,
} from '@/features/prd/lib/dashboard-tabs';
import { normalizeTextValue } from '@/features/prd/lib/text';
import {
  getDashboardIdForWorkflowId,
  getPublishingIdForWorkflowId,
  getReviewIdForWorkflowId,
  getWorkflowIdSeed,
} from '@/features/prd/lib/workflow-ids';
import { inferDashboardLifecycleStage, normalizeWorkflowStage } from '@/features/prd/lib/workflow-stage';
import type {
  AgentExecuteResponse,
  CalendarApiResponse,
  CalendarCapacity,
  CalendarDay,
  CalendarDayPost,
  CalendarFocusPost,
  CalendarPayload,
  CalendarPostStatus,
  CalendarQueueItem,
  CalendarWeekCoverageItem,
  ContentJobCreateResponse,
  ErrorLogApiRow,
  LocalRuntimeTool,
  LogsApiResponse,
  PublishingApiResponse,
  PublishingChannelSummary,
  PublishingErrorApiRow,
  PublishingErrorRow,
  PublishingIntegrationApiRow,
  PublishingJobApiRow,
  PublishingQueueApiRow,
  PublishingQueueRow,
  RagChatApiResponse,
  RagCitationApiRow,
  RagCitationCard,
  ReviewApiResponse,
  ReviewApiRow,
  RuntimeCandidate,
  RuntimeDiscoveryResponse,
  SystemLogApiRow,
} from '@/features/prd/types/api';
import { normalizeBoardRisk, type BoardItem } from '@/features/prd/types/board';
import type { GeneratedAsset, GeneratedDraft, LanguageCode } from '@/features/prd/types/content';
import type {
  AgentQueueJob,
  CommandCenterCounts,
  DashboardActivity,
  DashboardAgent,
  DashboardApiPayload,
  DashboardBoard,
  DashboardBoardTab,
  DashboardPayload,
  DashboardStat,
  DashboardStatAction,
  DashboardStatIcon,
  DashboardStatSource,
  DashboardTone,
} from '@/features/prd/types/dashboard';
import type { AgentRuntimePreference } from '@/features/prd/types/runtime';
import type { ReviewDecision } from '@/features/prd/types/review-queue';

import { AnalyticsView } from '@/features/prd/views/AnalyticsView';
import { CreatePostView } from '@/features/prd/views/CreatePostView';
import { ContentLibraryView } from '@/features/prd/views/ContentLibraryView';
import { KnowledgeBaseView } from '@/features/prd/views/KnowledgeBaseView';
import { RulesBrandView } from '@/features/prd/views/RulesBrandView';
import { SettingsView } from '@/features/prd/views/SettingsView';
import { createNextDraftWorkflowId, getFacebookLayoutGuideline } from '@/features/prd/config/create-post-workflow';
import type { CreateReviewPackage } from '@/features/prd/types/review-queue';
import type { ReviewQueueItem } from '@/features/prd/types/review-queue';
import {
  buildDraftPackageFromContext,
  buildDraftPackageSignature,
  deriveBrandVoice,
  mapGeneratedAssetsFromMetadata,
  mapGeneratedDraftsFromMetadata,
  normalizeStringList,
} from '@/features/prd/lib/create-post-package';

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



function toIsoDate(date: Date) {
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




const stageAuditEvents: LogEvent[] = [];

const fallbackAgentQueueJobs: AgentQueueJob[] = [];





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


export function PrdPageClient() {
  const defaultPrdPage = 'Dashboard' as PageName;
  const authBypassEnabled = isPublicApiAuthBypassEnabled();
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
    router.replace(`/?page=${toPrdRouteSlug(page)}&tab=${toPrdRouteSlug(nextTab)}`, { scroll: false });
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

    router.replace(`/?${params.toString()}`, { scroll: false });
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
  const dashboardBoard = useMemo(
    () => filterDashboardBoardByTab(dashboardState.board, dashboardActiveTab, normalizeDashboardCounts),
    [dashboardState.board, dashboardActiveTab],
  );
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
