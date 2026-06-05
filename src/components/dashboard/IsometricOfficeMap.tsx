'use client';

import { useState } from 'react';
import { dashboardRooms, dashboardAgents, agentsById } from '@/data/officeDashboard';
import type { AgentStatus } from '@/data/officeDashboard';
import { useDashboardStore } from '@/store/dashboardStore';

const STATUS_COLOR: Record<AgentStatus, string> = {
  active:  '#22c55e',
  idle:    '#64748b',
  busy:    '#f59e0b',
  offline: '#ef4444',
  review:  '#a855f7',
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  active:  'Active',
  idle:    'Idle',
  busy:    'Busy',
  offline: 'Offline',
  review:  'Review',
};

/** Tiny desk/console rectangles rendered inside each room tile */
function DeskElement({ color, index }: { color: string; index: number }) {
  const positions = [
    { top: '28%', left: '12%', w: 22, h: 12 },
    { top: '52%', left: '62%', w: 18, h: 10 },
    { top: '68%', left: '20%', w: 20, h: 10 },
  ];
  const p = positions[index % positions.length];
  return (
    <div
      style={{
        position: 'absolute',
        top: p.top,
        left: p.left,
        width: p.w,
        height: p.h,
        borderRadius: '3px',
        background: `${color}14`,
        border: `1px solid ${color}30`,
        boxShadow: `0 1px 0 ${color}20`,
      }}
    />
  );
}

export function IsometricOfficeMap() {
  const { selectedRoomId, selectAgent } = useDashboardStore();
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4 pt-3 gap-3" style={{ minHeight: 0 }}>
      {/* ── Panel header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }}
          />
          <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Agent Live Map
          </h2>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-bold"
            style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}
          >
            HEAD OFFICE · FLOOR 1
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {[
            { label: 'Active', color: '#22c55e' },
            { label: 'Busy',   color: '#f59e0b' },
            { label: 'Review', color: '#a855f7' },
            { label: 'Idle',   color: '#64748b' },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Map area ── */}
      <div
        className="flex-1 rounded-xl overflow-hidden relative"
        style={{
          minHeight: 0,
          background: '#030b18',
          border: '1px solid rgba(6,182,212,0.14)',
          backgroundImage: [
            /* fine dot grid */
            'radial-gradient(rgba(6,182,212,0.07) 1px, transparent 1px)',
            /* vertical hallway lines */
            'linear-gradient(to right, rgba(6,182,212,0.04) 1px, transparent 1px)',
            /* horizontal hallway lines */
            'linear-gradient(to bottom, rgba(6,182,212,0.04) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '24px 24px, 25% 100%, 25% 25%',
        }}
      >
        {/* Corner glow effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Room grid */}
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: '8px',
            padding: '10px',
          }}
        >
          {/* Empty corridor corners */}
          <div style={{ gridArea: '1 / 1 / 2 / 2' }}>
            {/* corridor marker */}
            <div className="w-full h-full flex items-center justify-center">
              <div style={{ width: '2px', height: '70%', background: 'rgba(6,182,212,0.06)', borderRadius: '2px' }} />
            </div>
          </div>
          <div style={{ gridArea: '1 / 4 / 2 / 5' }}>
            <div className="w-full h-full flex items-center justify-center">
              <div style={{ width: '2px', height: '70%', background: 'rgba(6,182,212,0.06)', borderRadius: '2px' }} />
            </div>
          </div>

          {dashboardRooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const agents = room.agentIds.map(id => agentsById[id]).filter(Boolean);
            const primaryAgent = agents[0];
            const statusColor = primaryAgent ? STATUS_COLOR[primaryAgent.status] : '#64748b';

            const isHovered = hoveredRoomId === room.id;

            return (
              <div
                key={room.id}
                className="relative rounded-lg overflow-visible cursor-pointer transition-all duration-200"
                style={{
                  gridArea: room.gridArea,
                  background: `linear-gradient(160deg, ${room.bgColor} 0%, ${room.accent}0a 100%)`,
                  border: `1px solid ${isSelected ? room.accent + '99' : isHovered ? room.accent + '55' : room.accent + '22'}`,
                  boxShadow: isSelected
                    ? `0 0 24px ${room.accent}30, 0 0 0 1px ${room.accent}50, inset 0 1px 0 ${room.accent}30`
                    : isHovered
                    ? `0 0 16px ${room.accent}22, 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 ${room.accent}25`
                    : `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 ${room.accent}18`,
                  transform: isSelected ? 'translateY(-1px) scale(1.008)' : isHovered ? 'translateY(-1px) scale(1.004)' : 'scale(1)',
                }}
                onClick={() => { if (primaryAgent) selectAgent(primaryAgent.id, room.id); }}
                onMouseEnter={() => setHoveredRoomId(room.id)}
                onMouseLeave={() => setHoveredRoomId(null)}
              >
                {/* Accent top edge */}
                <div
                  className="absolute top-0 left-0 right-0 rounded-t-lg"
                  style={{
                    height: isSelected ? '2px' : '1px',
                    background: `linear-gradient(to right, ${room.accent}${isSelected ? 'ee' : '60'}, transparent 70%)`,
                  }}
                />

                {/* Desk/console elements */}
                {Array.from({ length: Math.min(room.desks, 3) }).map((_, i) => (
                  <DeskElement key={i} color={room.accent} index={i} />
                ))}

                {/* Room label — top left */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                  <span className="text-[11px] leading-none">{room.icon}</span>
                  <span
                    className="text-[8px] font-black tracking-[0.12em] uppercase leading-none"
                    style={{ color: `${room.accent}cc` }}
                  >
                    {room.shortName}
                  </span>
                </div>

                {/* Status badge — top right */}
                {primaryAgent && (
                  <div
                    className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full z-10"
                    style={{
                      background: `${statusColor}18`,
                      border: `1px solid ${statusColor}35`,
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: statusColor,
                        boxShadow: `0 0 4px ${statusColor}`,
                        display: 'inline-block',
                        animation: primaryAgent.status === 'active' || primaryAgent.status === 'busy' ? 'pulse 1.8s infinite' : 'none',
                      }}
                    />
                    <span className="text-[8px] font-bold" style={{ color: statusColor }}>
                      {STATUS_LABEL[primaryAgent.status]}
                    </span>
                  </div>
                )}

                {/* Agent avatar — centered */}
                {primaryAgent && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-1">
                      {/* Avatar circle with "chair" shadow */}
                      <div
                        className="relative flex items-center justify-center font-black"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: `radial-gradient(circle at 38% 38%, ${primaryAgent.accentColor}50 0%, ${primaryAgent.accentColor}18 100%)`,
                          border: `2px solid ${primaryAgent.accentColor}${isSelected ? 'cc' : '70'}`,
                          color: primaryAgent.accentColor,
                          fontSize: '11px',
                          boxShadow: `0 0 ${isSelected ? 16 : 8}px ${primaryAgent.accentColor}${isSelected ? '55' : '30'}, 0 4px 8px rgba(0,0,0,0.4)`,
                        }}
                      >
                        {primaryAgent.initials}
                        {/* "online ring" for active agents */}
                        {primaryAgent.status === 'active' && (
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{ border: `1px solid ${primaryAgent.accentColor}50`, transform: 'scale(1.25)', animation: 'ping 2s infinite' }}
                          />
                        )}
                      </div>
                      <span
                        className="text-[8px] font-semibold text-center leading-none"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                      >
                        {primaryAgent.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                )}

                {/* Task bar — bottom */}
                {primaryAgent && (
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2 py-1.5 rounded-b-lg"
                    style={{ background: `linear-gradient(to top, ${room.bgColor}f0 0%, transparent 100%)` }}
                  >
                    <p className="text-[8px] font-medium truncate text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {primaryAgent.currentTask}
                    </p>
                  </div>
                )}

                {/* Hover tooltip — driven by state, not CSS group-hover */}
                {isHovered && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-50"
                    style={{
                      background: 'rgba(3,10,25,0.98)',
                      border: `1px solid ${room.accent}50`,
                      color: '#e2e8f0',
                      boxShadow: `0 8px 28px rgba(0,0,0,0.6), 0 0 0 1px ${room.accent}18`,
                    }}
                  >
                    <span style={{ color: room.accent }} className="font-bold">{room.name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}> — {room.tooltip}</span>
                  </div>
                )}

                {/* Selection ring overlay */}
                {isSelected && (
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      border: `2px solid ${room.accent}80`,
                      boxShadow: `inset 0 0 16px ${room.accent}10`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer status bar */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-1.5 flex items-center justify-between"
          style={{ background: 'linear-gradient(to top, rgba(3,11,24,0.9), transparent)' }}
        >
          <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: 'rgba(6,182,212,0.35)' }}>
            {dashboardAgents.filter(a => a.status === 'active').length} Active ·{' '}
            {dashboardAgents.filter(a => a.status === 'busy').length} Busy ·{' '}
            {dashboardRooms.length} Departments
          </span>
          <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Click room to inspect agent
          </span>
        </div>
      </div>
    </div>
  );
}
