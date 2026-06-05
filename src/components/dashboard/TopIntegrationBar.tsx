'use client';

import { integrations } from '@/data/officeDashboard';
import type { IntegrationStatus } from '@/data/officeDashboard';

const STATUS_COLOR: Record<IntegrationStatus, string> = {
  connected: '#22c55e',
  warning:   '#eab308',
  offline:   '#ef4444',
};

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  connected: 'Live',
  warning:   'Warn',
  offline:   'Down',
};

export function TopIntegrationBar() {
  const connected = integrations.filter(i => i.status === 'connected').length;

  return (
    <div
      className="flex items-center gap-0 shrink-0 overflow-hidden"
      style={{
        height: '44px',
        background: 'rgba(2,6,23,0.92)',
        borderBottom: '1px solid rgba(6,182,212,0.1)',
      }}
    >
      {/* Left label */}
      <div
        className="flex items-center gap-2 px-4 shrink-0 h-full"
        style={{ borderRight: '1px solid rgba(6,182,212,0.1)', minWidth: '130px' }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px #22c55e' }} />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Integrations
        </span>
        <span className="text-[10px] font-bold" style={{ color: '#22c55e' }}>
          {connected}/{integrations.length}
        </span>
      </div>

      {/* Integration pills */}
      <div className="flex items-center gap-0 overflow-x-auto flex-1">
        {integrations.map((integration) => {
          const color = STATUS_COLOR[integration.status];
          return (
            <div
              key={integration.id}
              className="flex items-center gap-1.5 px-3 h-full shrink-0 cursor-default transition-all duration-150 group"
              style={{
                borderRight: '1px solid rgba(6,182,212,0.07)',
              }}
            >
              <span className="text-sm">{integration.icon}</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold leading-none" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {integration.name}
                </span>
                <span className="text-[9px] leading-none mt-0.5 font-bold" style={{ color }}>
                  {STATUS_LABEL[integration.status]}
                </span>
              </div>
              <div
                className="w-1.5 h-1.5 rounded-full ml-0.5"
                style={{
                  background: color,
                  boxShadow: `0 0 5px ${color}`,
                  animation: integration.status === 'connected' ? 'pulse 2s infinite' : 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Right — timestamp */}
      <div
        className="px-4 shrink-0 h-full flex items-center"
        style={{ borderLeft: '1px solid rgba(6,182,212,0.1)' }}
      >
        <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
