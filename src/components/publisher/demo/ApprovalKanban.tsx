"use client";

import { DEMO_KANBAN_COLUMNS, type DemoPost } from "@/lib/publisher/demo/types";
import { PostCard } from "./PostCard";

interface ApprovalKanbanProps {
  posts: DemoPost[];
  onSelectPost?: (id: string) => void;
}

export function ApprovalKanban({ posts, onSelectPost }: ApprovalKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {DEMO_KANBAN_COLUMNS.map((col) => {
        const colPosts = posts.filter((p) => col.statuses.includes(p.status));
        return (
          <div
            key={col.id}
            className="min-w-[220px] max-w-[260px] flex-shrink-0 rounded-2xl border border-slate-200 bg-[#f8fafc] p-3 flex flex-col gap-2"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${col.accentClass}`} />
              <span className="text-xs font-semibold text-slate-700 flex-1">{col.label}</span>
              <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                {colPosts.length}
              </span>
            </div>

            {/* Cards */}
            {colPosts.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400">Drop here</p>
              </div>
            ) : (
              colPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showActions
                  onSelect={onSelectPost}
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
