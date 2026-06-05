'use client';

import { dashboardAgents, workflowItems, sopItems, weeklyReportSections } from '@/data/officeDashboard';
import type { TaskStatus } from '@/data/officeDashboard';
import { useDashboardStore } from '@/store/dashboardStore';

const TASK_COLOR: Record<TaskStatus, string> = {
  'done':        '#22c55e',
  'in-progress': '#06b6d4',
  'pending':     '#64748b',
  'blocked':     '#ef4444',
};

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#22c55e',
};

// ─── Sub-panel: Agents directory ────────────────────────────────────────────

function AgentsPanel() {
  const { selectAgent } = useDashboardStore();
  return (
    <div className="p-6 space-y-3">
      <h2 className="text-sm font-bold text-white mb-4">Agent Directory</h2>
      {dashboardAgents.map(agent => (
        <button
          key={agent.id}
          onClick={() => selectAgent(agent.id, agent.roomId)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:scale-[1.01]"
          style={{
            background: `${agent.accentColor}0d`,
            border: `1px solid ${agent.accentColor}28`,
          }}
        >
          <div
            className="flex items-center justify-center font-black shrink-0"
            style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: `${agent.accentColor}20`,
              border: `1.5px solid ${agent.accentColor}60`,
              color: agent.accentColor, fontSize: '12px',
            }}
          >
            {agent.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">{agent.name}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{agent.role} · Queue: {agent.queue}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${agent.accentColor}20`, color: agent.accentColor }}>
              {agent.status}
            </span>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{agent.tools[0]}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Sub-panel: Workflow Board ───────────────────────────────────────────────

function WorkflowPanel() {
  const COLUMN_LABELS: Record<TaskStatus, string> = {
    'blocked':     'Blocked',
    'in-progress': 'In Progress',
    'pending':     'Pending',
    'done':        'Done',
  };
  const COLUMNS: TaskStatus[] = ['blocked', 'in-progress', 'pending', 'done'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Workflow Board</h2>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
          {workflowItems.length} Tasks Total
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const items = workflowItems.filter(w => w.status === col);
          return (
            <div key={col}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: TASK_COLOR[col] }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {COLUMN_LABELS[col]}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${TASK_COLOR[col]}18`, color: TASK_COLOR[col] }}>
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {items.length === 0 ? (
                  <div className="px-3 py-3 rounded-lg text-center text-[9px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)' }}>
                    No items
                  </div>
                ) : items.map(item => (
                  <div
                    key={item.id}
                    className="px-3 py-2.5 rounded-lg transition-all hover:scale-[1.01]"
                    style={{
                      background: col === 'done' ? 'rgba(255,255,255,0.02)' : `${TASK_COLOR[item.status]}0a`,
                      border: col === 'done' ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${TASK_COLOR[item.status]}20`,
                      opacity: col === 'done' ? 0.6 : 1,
                    }}
                  >
                    <p className="text-[11px] font-medium leading-snug mb-1" style={{ color: col === 'done' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.8)', textDecoration: col === 'done' ? 'line-through' : 'none' }}>
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.assignee}</span>
                      <div className="flex items-center gap-1">
                        {col !== 'done' && (
                          <span className="text-[8px] font-bold" style={{ color: PRIORITY_COLOR[item.priority] }}>
                            {item.priority.toUpperCase()}
                          </span>
                        )}
                        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{item.due}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-panel: SOP Library ─────────────────────────────────────────────────

function SOPPanel() {
  const categories = [...new Set(sopItems.map(s => s.category))];
  return (
    <div className="p-6">
      <h2 className="text-sm font-bold text-white mb-4">Skills / SOP Library</h2>
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(6,182,212,0.7)' }}>{cat}</p>
            <div className="space-y-1.5">
              {sopItems.filter(s => s.category === cat).map(sop => (
                <div
                  key={sop.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:scale-[1.01] transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-base">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-white/80 truncate">{sop.title}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Updated {sop.lastUpdated}</p>
                  </div>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}
                  >
                    {sop.version}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-panel: Weekly Report ────────────────────────────────────────────────

function ReportsPanel() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Weekly Executive Review</h2>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
          Week 23 · Jun 2026
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {weeklyReportSections.map(section => (
          <div
            key={section.id}
            className="px-4 py-3 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${section.color}0d, rgba(3,10,25,0.8))`,
              border: `1px solid ${section.color}25`,
            }}
          >
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{section.title}</p>
            <p className="text-lg font-bold leading-none" style={{ color: section.color }}>{section.value}</p>
            <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{section.trend}</p>
          </div>
        ))}
      </div>

      <div
        className="px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-[10px] font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Executive Notes</p>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Q3 pipeline on track. Fastwork delivery at risk due to client delay — Hermes escalated.
          DataClaw vault expanding; recommend additional storage provisioning by EOW.
          Investment portfolio healthy at +14.2% ROI; DCA schedule proceeding as planned.
        </p>
      </div>
    </div>
  );
}

// ─── Sub-panel: Chat Center ──────────────────────────────────────────────────

function ChatCenterPanel() {
  return (
    <div className="p-6">
      <h2 className="text-sm font-bold text-white mb-4">Chat Center</h2>
      <div className="space-y-2">
        {dashboardAgents.map(agent => {
          const lastMsg = agent.messages[agent.messages.length - 1];
          return (
            <div
              key={agent.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:scale-[1.01] transition-all"
              style={{ background: `${agent.accentColor}0a`, border: `1px solid ${agent.accentColor}20` }}
            >
              <div
                className="flex items-center justify-center font-black shrink-0"
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${agent.accentColor}20`, border: `1.5px solid ${agent.accentColor}55`, color: agent.accentColor, fontSize: '11px' }}
              >
                {agent.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white/80">{agent.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{lastMsg?.text ?? 'No messages'}</p>
              </div>
              <span className="text-[9px] shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>{lastMsg?.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-panel: Settings ─────────────────────────────────────────────────────

function SettingsPanel() {
  const integrationsList = [
    { name: 'Codex / Local',     icon: '⌨️', status: 'Connected',    color: '#22c55e' },
    { name: 'Hermes Brain',      icon: '🧠', status: 'Connected',    color: '#22c55e' },
    { name: 'Obsidian Vault',    icon: '💎', status: 'Connected',    color: '#22c55e' },
    { name: 'Google Drive',      icon: '📁', status: 'Connected',    color: '#22c55e' },
    { name: 'Gmail',             icon: '📧', status: 'Auth Warning', color: '#f59e0b' },
    { name: 'Google Ads',        icon: '📊', status: 'Connected',    color: '#22c55e' },
    { name: 'Facebook / Buffer', icon: '📱', status: 'Offline',      color: '#ef4444' },
    { name: 'Telegram',          icon: '✈️', status: 'Live',         color: '#22c55e' },
  ];
  return (
    <div className="p-6">
      <h2 className="text-sm font-bold text-white mb-4">Integration Settings</h2>
      <div className="space-y-2">
        {integrationsList.map(item => (
          <div
            key={item.name}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-white/80">{item.name}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 5px ${item.color}` }} />
              <span className="text-[9px] font-bold" style={{ color: item.color }}>{item.status}</span>
            </div>
            <button
              className="text-[9px] px-2 py-1 rounded-md transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Config
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function SidebarContent() {
  const { activeSidebarSection } = useDashboardStore();

  switch (activeSidebarSection) {
    case 'chat':     return <ChatCenterPanel />;
    case 'agents':   return <AgentsPanel />;
    case 'workflow': return <WorkflowPanel />;
    case 'sops':     return <SOPPanel />;
    case 'reports':  return <ReportsPanel />;
    case 'settings': return <SettingsPanel />;
    default:         return null; // 'overview' renders the map
  }
}
