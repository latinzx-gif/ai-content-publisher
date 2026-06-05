'use client';

import { useOfficeStore } from '@/store/officeStore';
import { officeRooms } from '@/data/mockData';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Colour-code data values by key convention
function valueColor(key: string, value: unknown): string {
  const k = key.toLowerCase();
  if (k.includes('risk') || k.includes('failure') || k.includes('alert') || k.includes('urgent') || k.includes('high'))
    return '#f87171';
  if (k.includes('revenue') || k.includes('roi') || k.includes('mrr') || k.includes('aum') || k.includes('win'))
    return '#4ade80';
  if (k.includes('pending') || k.includes('delayed') || k.includes('next'))
    return '#facc15';
  if (k.includes('status') || k.includes('uptime') || k.includes('health') || k.includes('online'))
    return '#34d399';
  if (typeof value === 'string' && value.startsWith('+'))
    return '#4ade80';
  if (typeof value === 'string' && value.startsWith('-'))
    return '#f87171';
  return '#e2e8f0';
}

// Map object types to a readable badge label
const TYPE_LABELS: Record<string, string> = {
  dashboard: '⬛ DASHBOARD',
  board:     '📋 BOARD',
  screen:    '🖥 SCREEN',
  table:     '🪑 TABLE',
  desk:      '🗂 DESK',
  panel:     '📊 PANEL',
  console:   '⌨️ CONSOLE',
  ring:      '📡 RADAR',
  radar:     '📡 RADAR',
  vault:     '🗄 VAULT',
  shelf:     '📚 SHELF',
  map:       '🗺 MAP',
  hologram:  '💡 HOLOGRAM',
  queue:     '🔔 QUEUE',
  station:   '🖥 STATION',
};

export function SidePanel() {
  const { isPanelOpen, activeObjectId, closePanel, activeRoomId } = useOfficeStore();

  const room         = officeRooms[activeRoomId];
  const activeObject = room?.objects.find(obj => obj.id === activeObjectId);

  const accentColor = activeObject?.color ?? '#3b82f6';
  const typeLabel   = TYPE_LABELS[activeObject?.type ?? ''] ?? activeObject?.type ?? '';

  return (
    <AnimatePresence>
      {isPanelOpen && activeObject && (
        <motion.aside
          key={activeObject.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="absolute top-0 right-0 h-full w-full max-w-[360px] z-20 pointer-events-auto"
        >
          <div
            className="h-full flex flex-col"
            style={{
              background: 'rgba(2,6,23,0.72)',
              backdropFilter: 'blur(24px)',
              borderLeft: `1px solid ${accentColor}33`,
              boxShadow: `-20px 0 60px rgba(0,0,0,0.6), inset 1px 0 0 ${accentColor}22`,
            }}
          >
            {/* ── Header ── */}
            <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: `${accentColor}22` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Type badge */}
                  <div
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest mb-3"
                    style={{
                      color: accentColor,
                      background: `${accentColor}18`,
                      border: `1px solid ${accentColor}44`,
                    }}
                  >
                    {typeLabel}
                  </div>

                  <h2 className="text-lg font-bold text-white leading-tight tracking-tight truncate">
                    {activeObject.name}
                  </h2>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    {activeObject.description}
                  </p>
                </div>

                <button
                  onClick={closePanel}
                  className="ml-3 shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Accent divider */}
              <div
                className="mt-4 h-px rounded-full"
                style={{ background: `linear-gradient(to right, ${accentColor}88, transparent)` }}
              />
            </div>

            {/* ── Data cards ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {Object.entries(activeObject.data).map(([key, value]) => {
                const label   = key.replace(/([A-Z])/g, ' $1').trim();
                const isArray = Array.isArray(value);
                const color   = valueColor(key, value);

                return (
                  <div
                    key={key}
                    className="rounded-xl p-4"
                    style={{
                      background: `rgba(255,255,255,0.04)`,
                      border: `1px solid ${color}22`,
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                      {label}
                    </p>

                    {isArray ? (
                      <ul className="space-y-1.5">
                        {(value as unknown[]).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                            <span style={{ color: accentColor }} className="mt-0.5">▸</span>
                            {String(item)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className="text-2xl font-light tracking-tight"
                        style={{ color }}
                      >
                        {String(value)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Footer ── */}
            <div className="px-6 pb-6 pt-4 border-t" style={{ borderColor: `${accentColor}22` }}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                />
                <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                  {room?.name ?? 'Room'}
                </span>
              </div>

              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: `${accentColor}18`,
                  border: `1px solid ${accentColor}44`,
                  color: accentColor,
                }}
              >
                Open Full View →
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
