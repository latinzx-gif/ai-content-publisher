'use client';

import { Tag } from '@/features/prd/components/primitives/Tag';
import { releaseDeployPath, releaseOpenRisks, releaseReadinessGates } from '@/features/prd/config/settings-display';

export function SettingsReleaseReadiness() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-[#171717]">Release readiness center</h2>
            <span className="rounded-full border border-[#d8d4c8] bg-[#f6f1df] px-2 py-0.5 text-[11px] font-semibold text-[#7a5b18]">Stage 12</span>
          </div>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#6e6e68]">
            Deployment prep for preview, production promotion, rollback, and post-release audit. This page is a readiness gate, not a production deploy trigger.
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          Deploy later · Prep now
        </span>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Release gates', value: releaseReadinessGates.length, detail: 'QA, backend, env, security, rollback' },
          { label: 'Deploy path', value: releaseDeployPath.length, detail: 'Preview → inspect → smoke → promote → rollback' },
          { label: 'Open risks', value: releaseOpenRisks.length, detail: 'Blocked before production enablement' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{item.value}</div>
            <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#171717]">Production readiness gates</h3>
          <p className="mt-0.5 text-xs text-[#6e6e68]">Every gate needs evidence before a preview deployment can be promoted to production.</p>
        </div>
        <div className="divide-y divide-[#e8e8e4]">
          {releaseReadinessGates.map((item) => (
            <div key={item.gate} className="grid gap-3 px-4 py-4 lg:grid-cols-[180px_140px_minmax(0,1fr)_150px] lg:items-start">
              <div className="text-xs font-semibold text-[#171717]">{item.gate}</div>
              <div className="text-xs font-semibold text-[#4f4f49]">{item.owner}</div>
              <p className="text-xs leading-relaxed text-[#6e6e68]">{item.evidence}</p>
              <Tag>{item.status}</Tag>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h3 className="text-sm font-semibold text-[#171717]">Recommended deployment path</h3>
          <div className="mt-3 space-y-2">
            {releaseDeployPath.map((item, index) => (
              <div key={item.step} className="grid gap-3 rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-3 sm:grid-cols-[32px_90px_minmax(0,180px)_1fr] sm:items-start">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#cfcfc8] bg-white text-[11px] font-semibold text-[#4f4f49]">{index + 1}</span>
                <span className="text-xs font-semibold text-[#171717]">{item.step}</span>
                <span className="font-mono text-[11px] text-[#4f4f49]">{item.command}</span>
                <p className="text-xs leading-relaxed text-[#6e6e68]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-900">Production blockers</h3>
            <div className="mt-3 space-y-2">
              {releaseOpenRisks.map((item) => (
                <p key={item} className="rounded-xl border border-amber-200 bg-white/70 px-3 py-2 text-xs leading-relaxed text-amber-800">{item}</p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#d9e0ef] bg-[#f4f7fd] p-4">
            <h3 className="text-sm font-semibold text-[#2f4f7f]">Release note draft</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#2f4f7f]">
              Preview includes complete PRD UI, agent workflow model, Settings readiness, Logs audit trail, and seed workflow SW-134. Production deploy waits for Supabase RLS, server routes, env secrets, and publishing token tests.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}

