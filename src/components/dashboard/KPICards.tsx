'use client';

import { useState } from 'react';
import { businessKPIs, systemKPIs } from '@/data/officeDashboard';

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '—' };
const TREND_COLOR: Record<string, string> = { up: '#4ade80', down: '#f87171', stable: '#94a3b8' };

function KPICard({ card, compact = false }: { card: typeof businessKPIs[0]; compact?: boolean }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl shrink-0 cursor-default transition-all duration-200 hover:scale-[1.02]"
      style={{
        minWidth: compact ? '140px' : '168px',
        background: `linear-gradient(135deg, ${card.color}0e 0%, rgba(3,10,25,0.85) 100%)`,
        border: `1px solid ${card.color}30`,
        boxShadow: `0 0 12px ${card.color}0c`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg shrink-0 text-base"
        style={{
          width: compact ? '30px' : '36px',
          height: compact ? '30px' : '36px',
          background: `${card.color}18`,
          border: `1px solid ${card.color}28`,
        }}
      >
        {card.icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {card.label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-bold leading-none truncate" style={{ color: card.color, fontSize: compact ? '14px' : '17px' }}>
            {card.value}
          </span>
          <span className="text-[9px] font-bold" style={{ color: TREND_COLOR[card.trend] }}>
            {TREND_ICON[card.trend]}
          </span>
        </div>
        <span className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
          {card.sub}
        </span>
      </div>
    </div>
  );
}

export function KPICards() {
  const [showSystem, setShowSystem] = useState(false);

  return (
    <div
      className="shrink-0"
      style={{ borderBottom: '1px solid rgba(6,182,212,0.08)' }}
    >
      {/* ── Business KPIs (primary row) ── */}
      <div className="flex items-center gap-0">
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto flex-1">
          {businessKPIs.map(card => <KPICard key={card.id} card={card} />)}
        </div>

        {/* Toggle to show system KPIs */}
        <button
          onClick={() => setShowSystem(v => !v)}
          className="shrink-0 mr-3 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all"
          style={{
            background: showSystem ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${showSystem ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: showSystem ? '#06b6d4' : 'rgba(255,255,255,0.3)',
          }}
          title={showSystem ? 'Hide system metrics' : 'Show system metrics'}
        >
          {showSystem ? '⬆ SYS' : '⬇ SYS'}
        </button>
      </div>

      {/* ── System KPIs (secondary row, collapsible) ── */}
      {showSystem && (
        <div
          className="flex gap-2 px-4 pb-2 overflow-x-auto"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span
            className="self-center text-[9px] font-bold uppercase tracking-widest shrink-0 mr-1"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            SYS
          </span>
          {systemKPIs.map(card => <KPICard key={card.id} card={card} compact />)}
        </div>
      )}
    </div>
  );
}
