"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Bell, LayoutGrid, ChevronDown, ChevronRight,
  UserPlus, Plus, BarChart2, CheckSquare, Bot,
  Megaphone, HelpCircle, PanelLeftClose, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "./PlatformIcon";

const NAV_ITEMS = [
  { label: "Content",       href: "/publisher/demo",             icon: LayoutGrid },
  { label: "Campaigns",     href: "/publisher/demo/campaigns",   icon: Megaphone },
  { label: "My approvals",  href: "/publisher/demo/approvals",   icon: CheckSquare },
  { label: "Agents",        href: "/publisher/demo/agents",      icon: Bot },
  { label: "Analytics",     href: "/publisher/demo/analytics",   icon: BarChart2 },
  { label: "Settings",      href: "/publisher/demo/settings",    icon: Settings  },
];

export default function DemoSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/publisher/demo") {
      return (
        pathname === "/publisher/demo" ||
        pathname === "/publisher/demo/feed" ||
        pathname === "/publisher/demo/create"
      );
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[248px] flex-shrink-0 h-full flex flex-col bg-white border-r border-[#e8e8e8] select-none">
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-[14px]">
        <div className="flex items-center gap-2">
          {/* 4-colour grid icon */}
          <div className="grid grid-cols-2 gap-[2.5px] w-[22px] h-[22px]">
            <div className="rounded-[3px] bg-[#ff6b6b]" />
            <div className="rounded-[3px] bg-[#ffd93d]" />
            <div className="rounded-[3px] bg-[#6bcb77]" />
            <div className="rounded-[3px] bg-[#4d96ff]" />
          </div>
          <span className="font-semibold text-[15px] text-[#1a1a2e] tracking-tight">
            Postable
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* ── Search + Notifications ────────────────────────────── */}
      <div className="px-2 space-y-0.5 mb-1">
        <button className="flex items-center gap-2.5 w-full px-3 py-[7px] rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          Search
        </button>
        <button className="flex items-center gap-2.5 w-full px-3 py-[7px] rounded-lg text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={15} className="text-gray-400 flex-shrink-0" />
          Notifications
        </button>
      </div>

      <div className="h-px bg-[#f0f0f0] mx-3 my-1" />

      {/* ── Workspace section ─────────────────────────────────── */}
      <div className="px-2 mt-1">
        <div className="flex items-center justify-between px-3 py-1.5 mb-0.5">
          <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
            Workspace
            <ChevronDown size={12} />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 transition-colors">
            <UserPlus size={14} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors relative group",
                  active
                    ? "bg-[#ede9fe] text-[#4f46e5] font-medium"
                    : "text-[#595959] hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-[5px] bottom-[5px] w-[3px] bg-[#4f46e5] rounded-r-full" />
                )}
                <Icon size={15} className={cn("flex-shrink-0", active ? "text-[#4f46e5]" : "text-gray-400 group-hover:text-gray-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Channels ──────────────────────────────────────────── */}
      <div className="px-2 mt-3">
        <div className="flex items-center justify-between px-3 py-1.5 mb-0.5">
          <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
            Channels
            <ChevronDown size={12} />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 transition-colors">
            <Plus size={14} />
          </button>
        </div>

        {/* Facebook — active */}
        <div className="relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg bg-[#f0f0f0]">
          <span className="absolute left-0 top-[5px] bottom-[5px] w-[3px] bg-[#1877f2] rounded-r-full" />
          <PlatformIcon platform="facebook" size={18} />
          <span className="text-[13px] text-gray-800 font-medium flex-1 truncate">DataClaw FB</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title="Connected" />
        </div>

        {/* Instagram */}
        <div className="relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg hover:bg-gray-50 cursor-pointer mt-0.5">
          <PlatformIcon platform="instagram" size={18} />
          <span className="text-[13px] text-gray-500 flex-1 truncate">DataClaw IG</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title="Connected" />
        </div>

        {/* LinkedIn */}
        <div className="relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg hover:bg-gray-50 cursor-pointer mt-0.5">
          <PlatformIcon platform="linkedin" size={18} />
          <span className="text-[13px] text-gray-500 flex-1 truncate">DataClaw LI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title="Connected" />
        </div>

        {/* Add channel */}
        <button className="flex items-center gap-2.5 w-full px-3 py-[7px] rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors mt-0.5">
          <div className="w-[18px] h-[18px] rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
            <Plus size={9} className="text-gray-300" />
          </div>
          Add channel
        </button>
      </div>

      {/* ── Spacer ────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Get started ───────────────────────────────────────── */}
      <div className="px-3 pb-2">
        <button className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
          {/* Progress ring (33%) */}
          <svg width="30" height="30" viewBox="0 0 30 30" className="flex-shrink-0 -rotate-90">
            <circle cx="15" cy="15" r="11" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
            <circle
              cx="15" cy="15" r="11" fill="none"
              stroke="#4f46e5" strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 11 * 0.33} ${2 * Math.PI * 11}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 leading-tight">Get started</p>
            <p className="text-[11px] text-gray-400">33% completed</p>
          </div>
          <ChevronRight size={15} className="text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* ── User profile ──────────────────────────────────────── */}
      <div className="px-3 pb-3">
        <div className="h-px bg-[#f0f0f0] mb-2" />
        <div className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#d92d20] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            J
          </div>
          <span className="text-[13px] text-gray-700 flex-1 text-left font-medium truncate">
            Jakarin Osk
          </span>
          <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
          <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0">
            <HelpCircle size={12} />
          </span>
        </div>
      </div>
    </aside>
  );
}
