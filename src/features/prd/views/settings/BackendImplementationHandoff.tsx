'use client';

import { Tag } from '@/features/prd/components/primitives/Tag';
import {
  backendHandoffChecklist,
  backendImplementationHandoff,
  backendRlsPolicyHandoff,
} from '@/features/prd/config/settings-display';

export function BackendImplementationHandoff() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-[#171717]">Backend implementation handoff package</h3>
              <span className="rounded-full border border-[#d8d4c8] bg-[#f6f1df] px-2 py-0.5 text-[11px] font-semibold text-[#7a5b18]">Stage 11</span>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[#6e6e68]">
              Converts the Stage 9 map and Stage 10 simulation into a backend-ready checklist for Supabase Cloud, Next.js routes, OpenAI workers, and final QA.
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Handoff ready
          </span>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 overflow-x-auto p-3">
          <div className="grid min-w-[980px] gap-3">
            {backendImplementationHandoff.map((item, index) => (
              <article key={item.phase} className="grid gap-3 rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-3 lg:grid-cols-[44px_150px_150px_minmax(0,1fr)_minmax(0,1fr)_110px] lg:items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cfcfc8] bg-white text-xs font-semibold text-[#4f4f49]">{index + 1}</div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">Phase</div>
                  <p className="mt-1 text-xs font-semibold text-[#171717]">{item.phase}</p>
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8a82]">Owner</div>
                  <p className="mt-1 text-xs font-semibold text-[#4f4f49]">{item.owner}</p>
                </div>
                <p className="text-xs leading-relaxed text-[#6e6e68]">{item.deliverable}</p>
                <p className="text-xs leading-relaxed text-[#4f4f49]">Gate: {item.gate}</p>
                <Tag>{item.status}</Tag>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-3 border-t border-[#e8e8e4] bg-[#fbfbfa] p-4 xl:border-l xl:border-t-0">
          <section className="rounded-2xl border border-[#deded8] bg-white p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Supabase policy starter</h4>
            <div className="mt-3 space-y-2">
              {backendRlsPolicyHandoff.map((item) => (
                <div key={item.policy} className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#171717]">{item.table}</span>
                    <span className="font-mono text-[10px] text-[#8a8780]">{item.policy}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{item.access}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <h4 className="text-xs font-semibold text-amber-900">Implementation guardrails</h4>
            <div className="mt-2 space-y-2">
              {backendHandoffChecklist.map((item) => (
                <p key={item} className="text-[11px] leading-relaxed text-amber-800">• {item}</p>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

