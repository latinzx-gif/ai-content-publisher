'use client';

import { useRef, useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { agentsById, roomsById, dashboardAgents } from '@/data/officeDashboard';
import type { AgentStatus, RiskLevel, TaskStatus } from '@/data/officeDashboard';
import { Send, Brain, Code2, Search, BookMarked, ArrowRight, X } from 'lucide-react';

const STATUS_COLOR: Record<AgentStatus, string> = {
  active:  '#22c55e',
  idle:    '#64748b',
  busy:    '#f59e0b',
  offline: '#ef4444',
  review:  '#a855f7',
};

const RISK_COLOR: Record<RiskLevel, string> = {
  low:    '#22c55e',
  medium: '#f59e0b',
  high:   '#ef4444',
};

const TASK_COLOR: Record<TaskStatus, string> = {
  'done':        '#22c55e',
  'in-progress': '#06b6d4',
  'pending':     '#64748b',
  'blocked':     '#ef4444',
};

const TASK_ICON: Record<TaskStatus, string> = {
  'done':        '✓',
  'in-progress': '◉',
  'pending':     '○',
  'blocked':     '✕',
};

type LocalMsg = { from: 'user' | 'agent'; text: string; time: string };

const ACTION_BTNS = [
  { label: 'Ask Hermes',    Icon: Brain,       color: '#06b6d4' },
  { label: 'Ask Codex',     Icon: Code2,       color: '#22c55e' },
  { label: 'Ask Gemini',    Icon: Search,      color: '#a855f7' },
  { label: 'Save to Brain', Icon: BookMarked,  color: '#f59e0b' },
  { label: 'Next Task',     Icon: ArrowRight,  color: '#0ea5e9' },
] as const;

export function RightChatPanel() {
  const { selectedAgentId, selectedRoomId, selectAgent } = useDashboardStore();
  const [inputValue, setInputValue] = useState('');
  const [extra, setExtra] = useState<Record<string, LocalMsg[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = agentsById[selectedAgentId];
  const room  = roomsById[selectedRoomId];
  const accent = agent?.accentColor ?? '#06b6d4';

  const messages: LocalMsg[] = [
    ...(agent?.messages ?? []),
    ...(extra[selectedAgentId] ?? []),
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedAgentId]);

  const handleSend = () => {
    if (!inputValue.trim() || !agent) return;
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setExtra(prev => ({
      ...prev,
      [selectedAgentId]: [
        ...(prev[selectedAgentId] ?? []),
        { from: 'user',  text: inputValue.trim(), time: now },
        { from: 'agent', text: `[${agent.name.split(' ')[0]}] Noted. Processing…`, time: now },
      ],
    }));
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const clearChat = () => setExtra(prev => ({ ...prev, [selectedAgentId]: [] }));

  if (!agent) return null;

  return (
    <div
      className="flex flex-col shrink-0 h-full"
      style={{ width: '320px', background: 'rgba(3,10,25,0.97)', borderLeft: `1px solid ${accent}1a` }}
    >
      {/* ── Agent switcher strip ── */}
      <div
        className="flex items-center gap-1 px-2 py-2 overflow-x-auto shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '52px' }}
      >
        {dashboardAgents.map(a => {
          const isSel = a.id === selectedAgentId;
          return (
            <button
              key={a.id}
              onClick={() => selectAgent(a.id, a.roomId)}
              title={a.name}
              className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg shrink-0 transition-all duration-150"
              style={{
                background: isSel ? `${a.accentColor}1a` : 'transparent',
                border: `1px solid ${isSel ? a.accentColor + '55' : 'transparent'}`,
                outline: isSel ? `1px solid ${a.accentColor}30` : 'none',
                outlineOffset: '2px',
              }}
            >
              <div
                className="flex items-center justify-center font-black"
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `${a.accentColor}22`,
                  border: `1.5px solid ${a.accentColor}${isSel ? 'dd' : '44'}`,
                  color: a.accentColor, fontSize: '9px',
                  boxShadow: isSel ? `0 0 8px ${a.accentColor}55` : 'none',
                }}
              >
                {a.initials}
              </div>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLOR[a.status] }} />
            </button>
          );
        })}
      </div>

      {/* ── Selected agent card ── */}
      <div
        className="px-3 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${accent}18` }}
      >
        <div className="flex items-center gap-3">
          {/* Large avatar */}
          <div
            className="flex items-center justify-center font-black shrink-0"
            style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: `radial-gradient(circle at 35% 35%, ${accent}40, ${accent}10)`,
              border: `2px solid ${accent}70`,
              color: accent, fontSize: '14px',
              boxShadow: `0 0 14px ${accent}30`,
            }}
          >
            {agent.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm font-bold text-white leading-tight truncate">{agent.name}</span>
              {/* Status pill */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
                style={{ background: `${STATUS_COLOR[agent.status]}18`, border: `1px solid ${STATUS_COLOR[agent.status]}35` }}
              >
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLOR[agent.status], boxShadow: `0 0 5px ${STATUS_COLOR[agent.status]}` }} />
                <span className="text-[9px] font-bold" style={{ color: STATUS_COLOR[agent.status] }}>
                  {agent.status.toUpperCase()}
                </span>
              </div>
            </div>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{agent.role}</span>

            {/* Stats inline */}
            <div className="flex gap-2 mt-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}>
                Queue {agent.queue}
              </span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${RISK_COLOR[agent.risk]}14`, color: RISK_COLOR[agent.risk] }}
              >
                Risk {agent.risk}
              </span>
            </div>
          </div>
        </div>

        {/* Current task strip */}
        <div
          className="mt-2 px-2.5 py-1.5 rounded-lg flex items-center gap-2"
          style={{ background: `${accent}0e`, border: `1px solid ${accent}20` }}
        >
          <span className="text-[8px] uppercase font-bold tracking-widest shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>NOW</span>
          <span className="text-[10px] truncate" style={{ color: accent }}>{agent.currentTask}</span>
        </div>

        {/* Tool chips */}
        <div className="flex flex-wrap gap-1 mt-2">
          {agent.tools.map(tool => (
            <span key={tool} className="text-[8px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* ── Task list ── */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${accent}10` }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Tasks</p>
        <div className="flex flex-col gap-1">
          {agent.tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-center shrink-0" style={{ width: '10px', color: TASK_COLOR[task.status] }}>
                {TASK_ICON[task.status]}
              </span>
              <span
                className="text-[10px] flex-1 truncate"
                style={{
                  color: task.status === 'done' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                }}
              >
                {task.label}
              </span>
              <span
                className="text-[8px] font-bold shrink-0 px-1 rounded"
                style={{ background: `${TASK_COLOR[task.status]}15`, color: TASK_COLOR[task.status] }}
              >
                {task.status.replace('in-progress', '⬤')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat thread (scrollable, fills remaining) ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 flex flex-col gap-2" style={{ minHeight: 0 }}>
        {messages.map((msg, i) => {
          const isUser = msg.from === 'user';
          return (
            <div key={i} className={`flex flex-col gap-0.5 ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className="max-w-[90%] px-2.5 py-1.5 text-[11px] leading-relaxed"
                style={{
                  background: isUser ? `${accent}28` : 'rgba(255,255,255,0.045)',
                  border: isUser ? `1px solid ${accent}38` : '1px solid rgba(255,255,255,0.07)',
                  color: isUser ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.72)',
                  borderRadius: isUser ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                }}
              >
                {msg.text}
              </div>
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.18)' }}>{msg.time}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Command input — always visible, sticky bottom ── */}
      <div
        className="shrink-0 px-3 pt-2 pb-2"
        style={{ borderTop: `1px solid ${accent}15` }}
      >
        {/* Input row */}
        <div
          className="flex items-end gap-1.5 rounded-lg px-2.5 py-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}22` }}
        >
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent.name.split(' ')[0]}…`}
            rows={2}
            className="flex-1 resize-none bg-transparent text-[11px] outline-none leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.8)', caretColor: accent }}
          />
          <button
            onClick={handleSend}
            className="p-1.5 rounded-lg shrink-0 transition-all"
            style={{
              background: inputValue.trim() ? accent : 'rgba(255,255,255,0.05)',
              color: inputValue.trim() ? '#020617' : 'rgba(255,255,255,0.18)',
            }}
          >
            <Send style={{ width: '13px', height: '13px' }} />
          </button>
        </div>

        {/* Action buttons — 2-row wrap */}
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {ACTION_BTNS.map(({ label, Icon, color }) => (
            <button
              key={label}
              className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[8px] font-bold transition-all"
              style={{ background: `${color}10`, border: `1px solid ${color}28`, color }}
            >
              <Icon style={{ width: '9px', height: '9px' }} />
              {label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: `${accent}55` }}>
            {room?.name ?? '—'}
          </span>
          <button onClick={clearChat} className="flex items-center gap-0.5 text-[8px] transition-colors" style={{ color: 'rgba(255,255,255,0.18)' }}>
            <X style={{ width: '9px', height: '9px' }} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
