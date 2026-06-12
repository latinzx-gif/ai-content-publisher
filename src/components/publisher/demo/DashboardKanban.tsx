"use client";

import { cn } from "@/lib/utils";
import { DEMO_KANBAN_COLUMNS, STATUS_COLORS, STATUS_LABELS } from "@/lib/publisher/demo/types";
import type { DemoPost } from "@/lib/publisher/demo/types";
import { PlatformIcon } from "./PlatformIcon";

interface DashboardKanbanProps {
  posts: DemoPost[];
}

export function DashboardKanban({ posts }: DashboardKanbanProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {DEMO_KANBAN_COLUMNS.map((col) => {
          const colPosts = posts.filter((p) => col.statuses.includes(p.status));
          const visible = colPosts.slice(0, 5);
          const overflow = colPosts.length - visible.length;

          return (
            <div
              key={col.id}
              className="w-56 flex-shrink-0 rounded-xl border border-[var(--line-warm)] bg-[var(--paper)] p-4 flex flex-col gap-3"
            >
              {/* Column header */}
              <div className="flex items-center gap-2">
                <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", col.accentClass)} />
                <span className="text-xs font-semibold text-[var(--charcoal)] flex-1 truncate">
                  {col.label}
                </span>
                <span className="text-xs font-medium bg-[var(--bg)] text-[var(--text-muted)] px-1.5 py-0.5 rounded-full">
                  {colPosts.length}
                </span>
              </div>

              {/* Cards */}
              {visible.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-3">Empty</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {visible.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-[var(--line-warm)] bg-[var(--bg)] p-3 flex flex-col gap-1.5"
                    >
                      <p className="text-xs font-medium text-[var(--charcoal)] line-clamp-2 leading-snug">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <PlatformIcon platform={post.platform as "facebook"|"instagram"|"linkedin"|"tiktok"} size={14} />
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded",
                            STATUS_COLORS[post.status]
                          )}
                        >
                          {STATUS_LABELS[post.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                  {overflow > 0 && (
                    <p className="text-xs text-[var(--text-muted)] text-center">+{overflow} more</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
