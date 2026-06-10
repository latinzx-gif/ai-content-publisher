'use client';

import { integrationApps } from '@/features/prd/config/settings-display';

export function IntegrationAppCard({ app, onAction }: { app: (typeof integrationApps)[number]; onAction: () => void }) {
  const Icon = app.icon;
  const connected = app.status === 'Connected';
  const ready = app.readiness === 'Ready';

  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2] text-[#171717]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#171717]">{app.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{app.description}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {app.readiness}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Scope</div>
          <div className="mt-1 font-semibold text-[#4f4f49]">{app.category} · {app.scope}</div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Auth</div>
            <div className="mt-1 font-semibold text-[#4f4f49]">{app.auth}</div>
          </div>
          <div className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Last sync</div>
            <div className="mt-1 font-semibold text-[#4f4f49]">{app.lastSync}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'
          }`}
        >
          {app.status}
        </span>
        <button onClick={onAction} className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
          {connected ? 'Manage' : 'Connect'}
        </button>
      </div>
    </div>
  );
}
