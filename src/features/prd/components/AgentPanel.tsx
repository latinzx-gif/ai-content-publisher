'use client';

import { Archive, Bot, MessageSquareText, Send } from 'lucide-react';

import { AgentQueueCard } from '@/features/prd/components/AgentQueueCard';
import { PanelSection } from '@/features/prd/components/primitives/PanelSection';
import { coreAgentNames } from '@/features/prd/config/agents';
import { formatDashboardActivityDate } from '@/features/prd/lib/datetime';
import type { AgentQueueJob, DashboardActivity, DashboardAgent } from '@/features/prd/types/dashboard';

export type AgentPanelProps = {
  agents: DashboardAgent[];
  activity: DashboardActivity[];
  queueJobs: AgentQueueJob[];
  onAgentOpen: () => void;
  onSavePrompt: () => void;
  onRunPrompt: () => void;
  isRunning?: boolean;
};

export function AgentPanel({
  agents,
  activity,
  queueJobs,
  onAgentOpen,
  onSavePrompt,
  onRunPrompt,
  isRunning,
}: AgentPanelProps) {
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
            className="min-h-24 w-full resize-none rounded-xl border border-[#deded8] bg-white p-3 text-xs text-[#171717] outline-none ring-[#171717] placeholder:text-[#8b8a84] focus:ring-1"
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
