'use client';

import { ChevronRight } from 'lucide-react';

import { pageMeta, type PageName } from '@/features/prd/config/navigation';

export type DashboardHeaderProps = {
  activePage: PageName;
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function DashboardHeader({ activePage, activeTab, onTabChange }: DashboardHeaderProps) {
  const meta = pageMeta[activePage];

  return (
    <div className="border-b border-[#deded8] bg-white px-4 py-4 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#6e6e68]">
            <span>{meta.group}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-[#171717]">{activePage}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">{meta.title}</h1>
          <p className="mt-1 text-sm text-[#6e6e68]">{meta.description}</p>
        </div>

        {meta.tabs.length > 0 ? (
          <div className="flex max-w-full items-center overflow-x-auto rounded-xl border border-[#deded8] bg-[#f4f4f2] p-1">
            {meta.tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`h-8 shrink-0 rounded-lg px-3 text-xs font-medium ${
                  tab === activeTab ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6e6e68] hover:text-[#171717]'
                }`}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
