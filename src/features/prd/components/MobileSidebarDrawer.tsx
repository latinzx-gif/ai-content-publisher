'use client';

import { Search, ShieldCheck, X } from 'lucide-react';

import { navGroups, type PageName } from '@/features/prd/config/navigation';

export type MobileSidebarDrawerProps = {
  activePage: PageName;
  onClose: () => void;
  onPageChange: (page: PageName) => void;
  onSearchCommand: () => void;
  onWorkspace: () => void;
  open: boolean;
};

export function MobileSidebarDrawer({
  activePage,
  onClose,
  onPageChange,
  onSearchCommand,
  onWorkspace,
  open,
}: MobileSidebarDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Close mobile menu"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        type="button"
      />
      <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-[#deded8] bg-[#f6f6f2] text-[#171717] shadow-2xl">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#deded8] px-3">
          <button onClick={onWorkspace} className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-[#ecece7]" type="button">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d7d7d0] bg-white text-[#171717] shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">SiamWealth</div>
              <div className="truncate text-[11px] text-[#74746d]">Content Platform</div>
            </div>
          </button>
          <button
            aria-label="Close mobile menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#4f4f49]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 py-3">
          <button
            onClick={onSearchCommand}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#deded8] bg-white px-3 text-left text-xs text-[#74746d] shadow-sm"
            type="button"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Search or command...</span>
            <span className="rounded border border-[#deded8] bg-[#f6f6f2] px-1.5 py-0.5 text-[10px] text-[#74746d]">Cmd K</span>
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {navGroups.map((group) => (
            <div key={group.group} className="mb-5">
              <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8a82]">{group.group}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.name === activePage;

                  return (
                    <button
                      key={item.name}
                      onClick={() => onPageChange(item.name as PageName)}
                      className={`group flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm transition ${
                        active
                          ? 'border border-[#d7d7d0] bg-white text-[#171717] shadow-sm'
                          : 'border border-transparent text-[#5f5f58] hover:border-[#e3e3dd] hover:bg-[#efefeb] hover:text-[#171717]'
                      }`}
                      type="button"
                    >
                      <span className={`h-4 w-0.5 rounded-full ${active ? 'bg-[#8b8b84]' : 'bg-transparent'}`} />
                      <Icon className={`h-4 w-4 ${active ? 'text-[#171717]' : 'text-[#85857d] group-hover:text-[#171717]'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
