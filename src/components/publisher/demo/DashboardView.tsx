"use client";

import Link from "next/link";
import { useDemoStore } from "@/lib/publisher/demo/store";
import { MetricCard } from "./MetricCard";
import { AttentionItems } from "./AttentionItems";
import { DashboardKanban } from "./DashboardKanban";

export function DashboardView() {
  const { posts } = useDemoStore();

  const metrics = [
    { label: "Total Posts", count: posts.length },
    { label: "Scheduled", count: posts.filter((p) => p.status === "scheduled").length },
    { label: "Published", count: posts.filter((p) => p.status === "published").length },
    { label: "In Review", count: posts.filter((p) => ["text_approved", "creative_approved", "changes_requested"].includes(p.status)).length },
    { label: "Failed", count: posts.filter((p) => p.status === "failed").length },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--line-warm)] bg-[var(--paper)] flex-shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d92d20] mb-0.5">Dashboard</p>
          <h1 className="text-lg font-bold text-[var(--navy)]">Content OS</h1>
        </div>
        <Link
          href="/publisher/demo/create"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#d92d20] hover:bg-[#b42318] text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + New Post
        </Link>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Metric cards */}
        <div className="flex gap-4 flex-wrap">
          {metrics.map((m) => (
            <MetricCard key={m.label} label={m.label} count={m.count} />
          ))}
        </div>

        {/* Attention items */}
        <AttentionItems posts={posts} />

        {/* Kanban */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--charcoal)] uppercase tracking-wide mb-3">
            Pipeline Board
          </h2>
          <DashboardKanban posts={posts} />
        </div>
      </div>
    </div>
  );
}
