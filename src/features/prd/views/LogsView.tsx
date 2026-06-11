'use client';

import { useState } from 'react';
import { MiniPageCard } from '@/features/prd/components/MiniPageCard';
import { Tag } from '@/features/prd/components/primitives/Tag';
import {
  agentActivityLogs,
  errorEvents,
  featureUsage,
  logExports,
  logSummary,
  userActivityLogs,
} from '@/features/prd/config/logs-display';
import type { LogEvent } from '@/features/prd/types/logs';
import { planEntitlements } from '@/features/prd/config/plan-entitlements';
import { getDashboardIdForWorkflowId, getPublishingIdForWorkflowId, getReviewIdForWorkflowId } from '@/features/prd/lib/workflow-ids';

export function LogsView({
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
