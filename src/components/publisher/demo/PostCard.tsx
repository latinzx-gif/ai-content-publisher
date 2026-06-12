"use client";

import { cn } from "@/lib/utils";
import { type DemoPost } from "@/lib/publisher/demo/types";
import { StatusBadge } from "./StatusBadge";
import { PlatformIcon } from "./PlatformIcon";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700",
  instagram: "bg-pink-100 text-pink-700",
  linkedin: "bg-sky-100 text-sky-700",
  tiktok: "bg-slate-100 text-slate-700",
};

interface PostCardProps {
  post: DemoPost;
  onSelect?: (id: string) => void;
  showActions?: boolean;
}

export function PostCard({ post, onSelect, showActions = false }: PostCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-3 shadow-sm space-y-2",
        onSelect && "cursor-pointer hover:border-blue-300 transition-colors"
      )}
      onClick={() => onSelect?.(post.id)}
    >
      {/* Top row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <PlatformIcon platform={post.platform as "facebook"|"instagram"|"linkedin"|"tiktok"} size={16} />
        <StatusBadge status={post.status} size="sm" />
        <span className="text-xs text-slate-400 ml-auto">{timeAgo(post.createdAt)}</span>
      </div>

      {/* Title */}
      <p className="font-semibold text-sm text-slate-800 truncate">{post.title}</p>

      {/* Caption */}
      <p className="text-xs text-slate-500 line-clamp-2">{post.caption}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div
          className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            onClick={() => alert("AI: Rewriting...")}
          >
            Rewrite
          </button>
          <button
            className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            onClick={() => alert("AI: Shortening...")}
          >
            Shorten
          </button>
          {(post.status === "text_generated" || post.status === "text_approved") && (
            <button
              className="text-xs px-2 py-1 rounded-md bg-green-100 hover:bg-green-200 text-green-700 font-medium transition-colors"
              onClick={() => alert(`Approving post ${post.id}...`)}
            >
              Approve →
            </button>
          )}
          {post.status === "text_approved" && (
            <button
              className="text-xs px-2 py-1 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium transition-colors"
              onClick={() => alert(`Generating image for post ${post.id}...`)}
            >
              Generate Image
            </button>
          )}
        </div>
      )}
    </div>
  );
}
