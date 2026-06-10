'use client';

import { Bot, Lock, MoreHorizontal, Plus, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import {
  agentBlueprints,
  agentEscalationRules,
  agentOperatingWorkflow,
  agentRoutingRows,
  hiddenCodexModels,
  imageGenerationConnector,
  modelCatalog,
} from '@/features/prd/config/agent-catalog';
import { coreAgentNames } from '@/features/prd/config/agents';
import { planEntitlements, showPlanBanner } from '@/features/prd/config/plan-entitlements';
import { RiskPill } from '@/features/prd/components/primitives/RiskPill';
import { Tag } from '@/features/prd/components/primitives/Tag';
import type { DashboardAgent } from '@/features/prd/types/dashboard';
import type { AgentRuntimePreference } from '@/features/prd/types/runtime';

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
export function AgentsView({
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
