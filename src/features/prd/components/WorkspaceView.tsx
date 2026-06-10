'use client';

import { Bot, ChevronRight, Layers3, Plus, ShieldCheck, Sparkles } from 'lucide-react';

import { MiniPageCard } from '@/features/prd/components/MiniPageCard';
import { pageMeta, type PageName } from '@/features/prd/config/navigation';

export type WorkspaceViewProps = {
  page: PageName;
};

export function WorkspaceView({ page }: WorkspaceViewProps) {
  const meta = pageMeta[page];
  const cards = [
    {
      label: `${page} queue`,
      value: page === 'Agents' ? '11' : '18',
      detail: page === 'Settings' ? '3 integrations pending' : 'Updated just now',
      icon: page === 'Agents' ? Bot : Layers3,
    },
    {
      label: 'Needs action',
      value: page === 'Review Queue' ? '7' : '4',
      detail: page === 'Publishing' ? '2 channels need reconnect' : 'Ready for owner',
      icon: ShieldCheck,
    },
    {
      label: 'Agent support',
      value: page === 'Rules & Brand' ? '5 rules' : 'Online',
      detail: 'Automations available',
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <section className="min-w-0 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {cards.map((card) => (
            <MiniPageCard key={card.label} {...card} />
          ))}
        </div>

        <div className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">{page} workspace</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Structured like Multica: compact rows, owner status, and fast operational actions.</p>
            </div>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white">
              <Plus className="h-3.5 w-3.5" />
              Add item
            </button>
          </div>

          <div className="divide-y divide-[#e8e8e4]">
            {[
              `${page} setup and first workflow`,
              `Review current ${meta.group.toLowerCase()} configuration`,
              `Assign agent support for ${page.toLowerCase()}`,
              `Prepare production-ready handoff notes`,
            ].map((item, index) => (
              <div key={item} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 hover:bg-[#fbfbfa]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#deded8] bg-[#f4f4f2] text-[10px] font-semibold text-[#6e6e68]">
                      {index + 1}
                    </span>
                    <h3 className="truncate text-sm font-semibold text-[#171717]">{item}</h3>
                  </div>
                  <p className="mt-1 pl-7 text-xs text-[#6e6e68]">Owner: {index % 2 === 0 ? 'Content Strategy Agent' : 'Human reviewer'} · Status: {index === 0 ? 'In progress' : 'Todo'}</p>
                </div>
                <button className="self-center rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#4f4f49] hover:bg-[#f4f4f2]">
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <h2 className="text-sm font-semibold text-[#171717]">Page options</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{meta.description}</p>
        <div className="mt-4 space-y-2">
          {meta.tabs.map((tab, index) => (
            <button
              key={tab}
              className={`flex h-9 w-full items-center justify-between rounded-lg border px-3 text-sm ${
                index === 0
                  ? 'border-[#cfcfc8] bg-[#f6f6f2] text-[#171717] shadow-sm'
                  : 'border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f4f4f2]'
              }`}
            >
              {tab}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
