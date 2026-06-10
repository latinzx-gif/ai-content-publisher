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

import {
  fallbackDashboardData,
  mapDashboardPayload,
  normalizeDashboardCounts,
  syncDashboardBoardWithInReviewItems,
} from '@/features/prd/lib/api-mappers/dashboard';
import {
  fallbackCalendarDays,
  fallbackFocusDayPosts,
  getCalendarWindow,
  mapCalendarPayload,
} from '@/features/prd/lib/api-mappers/calendar';
import {
  fallbackPublishingChannels,
  fallbackPublishingErrors,
  fallbackPublishingQueue,
  mapPublishingPayload,
} from '@/features/prd/lib/api-mappers/publishing';
import {
  buildReviewQueueTitle,
  getReviewModeLabel,
  mapReviewPayload,
} from '@/features/prd/lib/api-mappers/review';
import { formatReviewItemDate, mapLogsPayload, toTimestampString } from '@/features/prd/lib/api-mappers/logs';
import {
  isUuidLike,
  toPublishingApiPlatform,
  toReviewDecisionApiValue,
} from '@/features/prd/lib/api-mappers/api-decisions';
import {
  persistReviewQueueItems,
  readStoredReviewQueueItems,
  REVIEW_QUEUE_LOCAL_STORAGE_KEY,
} from '@/features/prd/lib/api-mappers/review-queue-storage';
import { extractActorDisplayNameFromToken, parseReviewTimestamp } from '@/features/prd/lib/api-mappers/metadata';
import {
  getPrdPageFromSearchParams,
  getPrdTabFromSearchParams,
  toPrdRouteSlug,
} from '@/features/prd/lib/prd-navigation';
import { fallbackAgentQueueJobs, stageAuditEvents } from '@/features/prd/lib/workspace-fallbacks';


export function usePrdWorkspace() {
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
