"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/publisher/ui/badge";
import { buttonVariants } from "@/components/publisher/ui/button";
import { AGENT_PIPELINE } from "@/lib/publisher/agent-roles";
import { listAllPosts } from "@/lib/publisher/db";
import type { AcpPost, AcpPostStatus } from "@/lib/publisher/supabase/types";
import { cn } from "@/lib/utils";

// ── Kanban column definitions ────────────────────────────────────────────────

type KanbanCol = {
  id: string;
  label: string;
  statuses: AcpPostStatus[];
  accent: string;
};

const KANBAN_COLUMNS: KanbanCol[] = [
  {
    id: "briefing",
    label: "Briefing",
    statuses: ["draft"],
    accent: "bg-[var(--charcoal)]",
  },
  {
    id: "revision",
    label: "Revision",
    statuses: ["revision_requested"],
    accent: "bg-yellow-500",
  },
  {
    id: "approved",
    label: "Approved",
    statuses: ["approved"],
    accent: "bg-[var(--emerald)]",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    statuses: ["scheduled", "publishing"],
    accent: "bg-[var(--blue-ink)]",
  },
  {
    id: "published",
    label: "Published",
    statuses: ["published"],
    accent: "bg-purple-600",
  },
  {
    id: "failed",
    label: "Failed",
    statuses: ["failed"],
    accent: "bg-red-500",
  },
];

// ── Attention items definition ───────────────────────────────────────────────

type AttentionItem = {
  label: string;
  count: number;
  href: string;
  colorClass: string;
};

function buildAttentionItems(posts: AcpPost[]): AttentionItem[] {
  const count = (statuses: AcpPostStatus[]) =>
    posts.filter((p) => statuses.includes(p.status)).length;

  return [
    {
      label: "Drafts waiting for content",
      count: count(["draft"]),
      // Create page is paused — Brief Builder is the working entry point.
      href: "/publisher/briefs",
      colorClass: "text-[var(--charcoal)]",
    },
    {
      label: "Posts with revision requested",
      count: count(["revision_requested"]),
      href: "/publisher/review",
      colorClass: "text-yellow-600",
    },
    {
      label: "Approved — not yet scheduled",
      count: count(["approved"]),
      href: "/publisher/calendar",
      colorClass: "text-[var(--emerald)]",
    },
    {
      label: "Failed to publish",
      count: count(["failed"]),
      href: "/publisher/publishing",
      colorClass: "text-red-600",
    },
  ].filter((item) => item.count > 0);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const [posts, setPosts] = useState<AcpPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllPosts()
      .then(setPosts)
      .catch((err) => console.error("DashboardHome: failed to load posts", err))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = (statuses: AcpPostStatus[]) =>
    posts.filter((p) => statuses.includes(p.status));

  const attentionItems = buildAttentionItems(posts);
  const nextAction = attentionItems[0] ?? null;

  const metrics = [
    {
      label: "Working drafts",
      count: byStatus(["draft", "revision_requested"]).length,
    },
    {
      label: "Ready to review",
      count: byStatus(["approved"]).length,
    },
    {
      label: "Scheduled",
      count: byStatus(["scheduled", "publishing"]).length,
    },
    {
      label: "Published",
      count: byStatus(["published"]).length,
    },
  ];

  return (
    <div className="p-6 space-y-6 min-h-screen bg-[var(--bg)]">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--gold)] mb-1">
            Dashboard
          </p>
          <h1 className="text-2xl font-black text-[var(--navy)] leading-tight">
            Operations command center
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Today&rsquo;s publishing operation — drafts, agent outputs, and the next-action queue.
          </p>
        </div>
        <Link className={cn(buttonVariants(), "flex-shrink-0")} href="/publisher/briefs">
          + New Brief
        </Link>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* Metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-[var(--line-warm)] bg-[var(--paper)] p-4"
              >
                <div className="text-4xl font-black text-[var(--navy)]">
                  {loading ? "—" : m.count}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* What needs attention today? */}
          <div className="rounded-lg border border-[var(--line-warm)] bg-[var(--paper)] p-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">
              What needs attention today?
            </h2>

            {loading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading…</p>
            ) : attentionItems.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                All clear — nothing needs your attention right now.
              </p>
            ) : (
              <ol className="space-y-3">
                {attentionItems.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 group rounded-md px-2 py-1 hover:bg-[var(--bg)] transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-[var(--navy)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-[var(--charcoal)] group-hover:text-[var(--navy)] transition-colors">
                        {item.label}
                      </span>
                      <span className={cn("text-sm font-bold", item.colorClass)}>
                        {item.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Pipeline / Kanban board */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
              Pipeline
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-3">
              {KANBAN_COLUMNS.map((col) => {
                const colPosts = byStatus(col.statuses);
                return (
                  <div
                    key={col.id}
                    className="min-w-[170px] flex-shrink-0 rounded-lg border border-[var(--line-warm)] bg-[var(--paper)] p-3"
                  >
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn("w-2 h-2 rounded-full flex-shrink-0", col.accent)}
                        />
                        <span className="text-xs font-bold uppercase tracking-wide text-[var(--charcoal)]">
                          {col.label}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {colPosts.length}
                      </Badge>
                    </div>

                    {/* Post cards */}
                    <div className="space-y-1.5">
                      {colPosts.slice(0, 4).map((post) => (
                        <div
                          key={post.post_id}
                          className="rounded border border-[var(--line-warm)] bg-[var(--bg)] px-2 py-1.5"
                        >
                          <p className="text-xs font-medium text-[var(--charcoal)] truncate">
                            {post.brand ?? "No brand"}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] truncate">
                            {post.platform ?? "—"} &middot;{" "}
                            {post.post_id.slice(0, 8)}
                          </p>
                        </div>
                      ))}
                      {colPosts.length > 4 && (
                        <p className="text-[10px] text-[var(--text-muted)] text-center py-1">
                          +{colPosts.length - 4} more
                        </p>
                      )}
                      {colPosts.length === 0 && (
                        <p className="text-[10px] text-[var(--text-muted)] text-center py-3">
                          Empty
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">

          {/* Next action card */}
          {nextAction ? (
            <div className="rounded-lg border border-[var(--gold)] bg-[var(--gold-soft)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold-ink)] mb-1">
                Next Action
              </p>
              <p className="text-sm font-semibold text-[var(--charcoal)] mb-3">
                {nextAction.label}{" "}
                <span className="font-black">({nextAction.count})</span>
              </p>
              <Link
                className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}
                href={nextAction.href}
              >
                Open →
              </Link>
            </div>
          ) : !loading ? (
            <div className="rounded-lg border border-[var(--emerald-soft)] bg-[var(--emerald-soft)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--emerald)] mb-1">
                Status
              </p>
              <p className="text-sm text-[var(--charcoal)]">
                Pipeline is clear. Ready to create new content.
              </p>
            </div>
          ) : null}

          {/* Agent workforce */}
          <div className="rounded-lg border border-[var(--line-warm)] bg-[var(--paper)] p-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
              Agent Workforce
            </h2>
            <div className="space-y-3">
              {AGENT_PIPELINE.map((agent) => (
                <div key={agent.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[var(--navy)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 leading-none">
                    {agent.shortName.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--charcoal)] leading-tight">
                      {agent.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {agent.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-lg border border-[var(--line-warm)] bg-[var(--paper)] p-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
              Quick Links
            </h2>
            <div className="space-y-1">
              {[
                { label: "Brief Builder", href: "/publisher/briefs" },
                { label: "Review queue", href: "/publisher/review" },
                { label: "Calendar", href: "/publisher/calendar" },
                { label: "Publishing", href: "/publisher/publishing" },
                { label: "Audit logs", href: "/publisher/logs" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between text-xs text-[var(--charcoal)] hover:text-[var(--navy)] py-1 px-2 rounded hover:bg-[var(--bg)] transition-colors"
                >
                  {link.label}
                  <span className="text-[var(--text-muted)]">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
