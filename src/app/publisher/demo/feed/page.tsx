"use client";

import { useState } from "react";
import { MOCK_POSTS } from "@/lib/publisher/demo/mock-data";
import type { DemoPlatform } from "@/lib/publisher/demo/types";
import FeedCard from "@/components/publisher/demo/FeedCard";
import { useDemoShell } from "@/components/publisher/demo/DemoAppShell";
import { cn } from "@/lib/utils";

/* ── Platform icon badges ─────────────────────────────────────────── */
function FacebookIcon() {
  return (
    <div className="w-4 h-4 rounded-full bg-[#1877f2] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-[9px] font-bold leading-none">f</span>
    </div>
  );
}
function InstagramIcon() {
  return (
    <div className="w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0"
      style={{ background: "linear-gradient(135deg,#f09433 0%,#e1306c 50%,#833ab4 100%)" }}>
      <span className="text-white text-[7px] font-bold leading-none">ig</span>
    </div>
  );
}
function LinkedInIcon() {
  return (
    <div className="w-4 h-4 rounded-[3px] bg-[#0a66c2] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-[7px] font-bold leading-none">in</span>
    </div>
  );
}
function TikTokIcon() {
  return (
    <div className="w-4 h-4 rounded-[3px] bg-[#010101] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-[7px] font-bold leading-none">TT</span>
    </div>
  );
}

type TabValue = DemoPlatform | "all";

interface PlatformTab {
  label: string;
  value: TabValue;
  icon?: React.ReactNode;
  activeClass: string;
}

const PLATFORM_TABS: PlatformTab[] = [
  {
    label: "All",
    value: "all",
    activeClass: "bg-[#344054] text-white border-[#344054]",
  },
  {
    label: "Facebook",
    value: "facebook",
    icon: <FacebookIcon />,
    activeClass: "bg-[#1877f2] text-white border-[#1877f2]",
  },
  {
    label: "Instagram",
    value: "instagram",
    icon: <InstagramIcon />,
    activeClass: "text-white border-transparent",
  },
  {
    label: "LinkedIn",
    value: "linkedin",
    icon: <LinkedInIcon />,
    activeClass: "bg-[#0a66c2] text-white border-[#0a66c2]",
  },
  {
    label: "TikTok",
    value: "tiktok",
    icon: <TikTokIcon />,
    activeClass: "bg-[#010101] text-white border-[#010101]",
  },
];

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const { openPost } = useDemoShell();

  const filtered =
    activeTab === "all"
      ? MOCK_POSTS
      : MOCK_POSTS.filter((p) => p.platform === activeTab);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-[#101828]">Feed View</h1>

        {/* Platform filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PLATFORM_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all",
                  isActive
                    ? tab.value === "instagram"
                      ? "border-transparent text-white"
                      : tab.activeClass
                    : "bg-white text-[#344054] border-[#e5e7eb] hover:bg-[#f9fafb]"
                )}
                style={
                  isActive && tab.value === "instagram"
                    ? { background: "linear-gradient(135deg,#f09433 0%,#e1306c 50%,#833ab4 100%)" }
                    : undefined
                }
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-[#98a2b3]">No posts for this platform.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((post) => (
            <FeedCard key={post.id} post={post} onSelect={openPost} />
          ))}
        </div>
      )}
    </div>
  );
}
