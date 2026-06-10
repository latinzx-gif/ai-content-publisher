'use client';

import { useCallback } from 'react';
import { Bell, Inbox, Layers3, Lock, Plus, Search } from 'lucide-react';

export type TopBarProps = {
  onApiTokenChange: (value: string) => void;
  authBypassEnabled: boolean;
  hasToken: boolean;
  onRefresh: () => void;
  onSearchCommand: () => void;
  onOpenInbox: () => void;
  onOpenNotifications: () => void;
  onCreate: () => void;
  onOpenMobileMenu: () => void;
};

export function TopBar({
  onApiTokenChange,
  authBypassEnabled,
  hasToken,
  onRefresh,
  onSearchCommand,
  onOpenInbox,
  onOpenNotifications,
  onCreate,
  onOpenMobileMenu,
}: TopBarProps) {
  const clearAuthSession = useCallback(() => {
    onApiTokenChange('');
  }, [onApiTokenChange]);

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#deded8] bg-white px-3 py-2 sm:flex-nowrap lg:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          aria-label="Open mobile menu"
          onClick={onOpenMobileMenu}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#6e6e68] lg:hidden"
          type="button"
        >
          <Layers3 className="h-4 w-4" />
        </button>
        <div className="hidden h-8 min-w-0 items-center gap-2 rounded-lg border border-[#deded8] bg-[#f4f4f2] px-3 text-sm text-[#6e6e68] md:flex md:w-[min(360px,38vw)]">
          <Search className="h-4 w-4" />
          <span className="min-w-0 flex-1 truncate">Search content, reviews, schedules...</span>
          <span className="rounded border border-[#deded8] bg-white px-1.5 py-0.5 text-[10px]">Cmd K</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto">
        {authBypassEnabled ? (
          <div className="flex h-8 shrink-0 items-center rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 text-xs text-[#5f5f58]">
            Local auth bypass active
          </div>
        ) : hasToken ? (
          <div className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-emerald-300 bg-[#f8fffa] px-3 text-xs text-[#1f6e4f]">
            <Lock className="h-3.5 w-3.5" />
            <span>Session active</span>
            <button
              onClick={clearAuthSession}
              className="ml-1 flex h-6 items-center rounded-md border border-[#c4e6d7] bg-white px-2 text-[11px] text-[#1f6e4f] hover:bg-[#ecffef]"
              type="button"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex h-8 min-w-0 shrink-0 items-center justify-end gap-2">
            <span className="flex h-8 items-center rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 text-xs text-[#6e6e68]">Session inactive</span>
            <button
              className="h-8 rounded-lg border border-[#171717] bg-[#171717] px-3 text-xs font-semibold text-white hover:bg-[#2f2f2f]"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.assign('/login');
                }
              }}
              type="button"
            >
              Sign in
            </button>
          </div>
        )}
        <button
          onClick={onRefresh}
          className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]"
          type="button"
        >
          <span className="hidden sm:inline">Load live data</span>
          <span className="sm:hidden">Load</span>
        </button>
        <button onClick={onSearchCommand} className="hidden h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-medium text-[#4f4f49] sm:flex" type="button">
          <Search className="h-3.5 w-3.5" />
          Command
        </button>
        <button
          onClick={onOpenInbox}
          className="hidden h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-medium text-[#4f4f49] sm:flex"
          type="button"
        >
          <Inbox className="h-3.5 w-3.5" />
          Inbox
        </button>
        <button
          aria-label="Open notifications"
          onClick={onOpenNotifications}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#4f4f49]"
          type="button"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onCreate}
          className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          Create
        </button>
      </div>
    </header>
  );
}
