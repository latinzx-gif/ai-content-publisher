'use client';

import { useState } from 'react';
import { DashboardLayout }  from '@/components/dashboard/DashboardLayout';
import { OfficeScene }      from '@/components/three/OfficeScene';
import { RoomNavigator }    from '@/components/ui/RoomNavigator';
import { SidePanel }        from '@/components/ui/SidePanel';

export default function Home() {
  const [view, setView] = useState<'dashboard' | '3d'>('dashboard');

  return (
    <>
      {/* ── Toggle button — always on top ── */}
      <div className="fixed top-3 right-4 z-50">
        <button
          onClick={() => setView(v => v === 'dashboard' ? '3d' : 'dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          style={{
            background: view === '3d' ? 'rgba(6,182,212,0.2)' : 'rgba(2,6,23,0.8)',
            border: '1px solid rgba(6,182,212,0.3)',
            color: '#06b6d4',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 12px rgba(6,182,212,0.15)',
          }}
        >
          {view === 'dashboard' ? '⬡ 3D Scene' : '⊞ Dashboard'}
        </button>
      </div>

      {/* ── Dashboard view (primary) ── */}
      {view === 'dashboard' && <DashboardLayout />}

      {/* ── 3D scene view (preserved) ── */}
      {view === '3d' && (
        <main className="relative w-screen h-screen overflow-hidden bg-black">
          <OfficeScene />
          <div className="absolute inset-0 pointer-events-none">
            <header
              className="absolute top-0 left-0 right-0 px-6 pt-4 pb-3 flex items-center justify-between pointer-events-auto"
              style={{ background: 'linear-gradient(to bottom, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0) 100%)' }}
            >
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-base font-black text-white tracking-widest uppercase leading-none">
                    Head Office
                  </h1>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
                    Global Command Center
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Projects',  value: '8',     color: '#4ade80' },
                  { label: 'Approvals', value: '5',     color: '#facc15' },
                  { label: 'Pipeline',  value: '$1.2M', color: '#22d3ee' },
                  { label: 'P1 Today',  value: '3',     color: '#c084fc' },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md"
                    style={{ background: 'rgba(2,6,23,0.6)', border: `1px solid ${color}33` }}
                  >
                    <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider hidden sm:block">{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </header>
            <SidePanel />
            <RoomNavigator />
          </div>
        </main>
      )}
    </>
  );
}
