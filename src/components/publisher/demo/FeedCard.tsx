"use client";

import type { DemoPost } from "@/lib/publisher/demo/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/publisher/demo/types";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "./PlatformIcon";

const PLATFORM_BORDER: Record<string, string> = {
  facebook: "border-l-[4px] border-l-[#1877f2]",
  instagram: "border-l-[4px] border-l-[#e1306c]",
  linkedin: "border-l-[4px] border-l-[#0a66c2]",
  tiktok: "border-l-[4px] border-l-[#010101]",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  post: DemoPost;
  onSelect: (id: string) => void;
}

export default function FeedCard({ post, onSelect }: Props) {
  const imageOption = post.imageOptions?.find((o) => o.id === post.selectedImageId)
    ?? post.imageOptions?.[0];

  return (
    <article
      className={cn(
        "bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col",
        PLATFORM_BORDER[post.platform]
      )}
    >
      {/* Top: avatar + meta */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="w-8 h-8 rounded-full bg-[#d92d20] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {post.brand.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#101828] truncate">{post.brand}</p>
          <p className="text-[11px] text-[#98a2b3]">{timeAgo(post.createdAt)}</p>
        </div>
        <PlatformIcon platform={post.platform as "facebook"|"instagram"|"linkedin"|"tiktok"} size={18} />
      </div>

      {/* Caption */}
      <p className="px-4 text-sm text-[#344054] leading-relaxed line-clamp-3">
        {post.caption}
      </p>

      {/* Image area */}
      <div
        className="mx-4 mt-3 rounded-xl flex items-center justify-center text-xs text-[#667085]"
        style={{
          height: 160,
          background: imageOption ? imageOption.color : "#f2f4f7",
        }}
      >
        {imageOption ? (
          <span className="font-medium text-[#344054]">{imageOption.label}</span>
        ) : (
          <span>No image</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 mt-auto">
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_COLORS[post.status])}>
          {STATUS_LABELS[post.status]}
        </span>
        <button
          onClick={() => onSelect(post.id)}
          className="text-sm font-medium text-[#d92d20] hover:underline"
        >
          Open →
        </button>
      </div>
    </article>
  );
}
