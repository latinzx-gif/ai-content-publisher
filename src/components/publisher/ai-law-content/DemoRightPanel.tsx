"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { useDemoStore } from "@/lib/publisher/ai-law-content/store";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/publisher/ai-law-content/types";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "./PlatformIcon";

const ROLE_COLORS: Record<string, string> = {
  creator:  "bg-blue-100 text-blue-700",
  approver: "bg-purple-100 text-purple-700",
  client:   "bg-green-100 text-green-700",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  postId: string | null;
  onClose: () => void;
}

export default function DemoRightPanel({ postId, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [schedulingForId, setSchedulingForId] = useState<string | null>(null);
  const [scheduleValue, setScheduleValue] = useState("");
  const { posts, updatePost, schedulePost } = useDemoStore();

  if (!postId) return null;
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const isScheduling = schedulingForId === postId;

  const selectedImage =
    post.imageOptions?.find((o) => o.id === post.selectedImageId) ??
    post.imageOptions?.[0];

  function addComment() {
    const text = commentText.trim();
    if (!text) return;

    updatePost(post.id, {
      comments: [
        ...post.comments,
        {
          id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          author: "Approver",
          role: "approver",
          text,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    setCommentText("");
  }

  return (
    <aside className="w-[300px] flex-shrink-0 h-full flex flex-col bg-white border-l border-[#e8e8e8] shadow-[-4px_0_16px_rgba(0,0,0,0.06)]">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#ececec] bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-[#e8e8e8] text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
            Saved
            <span className="w-[17px] h-[17px] rounded-full bg-[#6366f1] text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
              1
            </span>
          </button>
          <button className="px-2 py-1 rounded-md text-[12px] text-gray-400 hover:text-gray-600 hover:bg-white hover:border hover:border-[#e8e8e8] transition-colors">
            Details
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Post card (Postable-style) ───────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="border border-[#e8e8e8] rounded-xl overflow-hidden hover:border-[#6366f1] transition-colors cursor-pointer">

          {/* Card top bar: platform icon + status */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#f0f0f0]">
            <PlatformIcon platform={post.platform as "facebook" | "instagram" | "linkedin" | "tiktok"} size={18} />
            <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", STATUS_COLORS[post.status])}>
              {STATUS_LABELS[post.status]}
            </span>
          </div>

          {/* Card body */}
          <div className="p-3 flex flex-col gap-3">
            {/* Image placeholder */}
            {selectedImage ? (
              <div
                className="w-full h-[110px] rounded-lg flex items-center justify-center"
                style={{ background: selectedImage.color }}
              >
                <span className="text-[11px] font-medium text-gray-600">{selectedImage.label}</span>
              </div>
            ) : (
              <div className="w-full h-[110px] rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <span className="text-2xl">🌟</span>
              </div>
            )}

            {/* Title */}
            <div>
              <p className="text-[13px] font-semibold text-gray-900 leading-snug">{post.title}</p>
              <p className={cn("text-[12px] text-gray-500 leading-relaxed mt-1", expanded ? "" : "line-clamp-3")}>
                {post.caption}
              </p>
              {post.caption.length > 100 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-[11px] text-[#6366f1] mt-0.5 font-medium"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map((t) => (
                  <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Action buttons ─────────────────────────────────── */}
        <div className="mt-3 space-y-2">
          {post.status === "text_generated" && (
            <button
              onClick={() => updatePost(post.id, { status: "text_approved" })}
              className="w-full py-2 rounded-lg text-[13px] font-semibold bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors"
            >
              ✅ Approve Text
            </button>
          )}
          {post.status === "text_approved" && (
            <button
              onClick={() => updatePost(post.id, { status: "image_pending" })}
              className="w-full py-2 rounded-lg text-[13px] font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              🎨 Generate Image
            </button>
          )}
          {post.status === "image_ready" && (
            <button
              onClick={() => updatePost(post.id, { status: "creative_approved" })}
              className="w-full py-2 rounded-lg text-[13px] font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              ✨ Approve Creative
            </button>
          )}
          {post.status === "creative_approved" && (
            isScheduling ? (
              <div className="flex flex-col gap-2">
                <input
                  type="datetime-local"
                  value={scheduleValue}
                  onChange={(e) => setScheduleValue(e.target.value)}
                  className="w-full text-[12px] border border-[#e5e7eb] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#6366f1] transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (scheduleValue) {
                        schedulePost(post.id, new Date(scheduleValue).toISOString());
                        setSchedulingForId(null);
                        setScheduleValue("");
                      }
                    }}
                    disabled={!scheduleValue}
                    className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setSchedulingForId(null); setScheduleValue(""); }}
                    className="px-3 py-1.5 rounded-lg text-[12px] border border-[#e5e7eb] text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSchedulingForId(post.id)}
                className="w-full py-2 rounded-lg text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                🚀 Schedule Post
              </button>
            )
          )}
          <button
            onClick={() => updatePost(post.id, { status: "changes_requested" })}
            className="w-full py-2 rounded-lg text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Request changes
          </button>
        </div>

        {/* ── Comments ──────────────────────────────────────── */}
        {post.comments.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Comments
            </p>
            <div className="space-y-3">
              {post.comments.map((c) => (
                <div key={c.id} className="bg-[#fafafa] rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-semibold text-gray-800">{c.author}</span>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", ROLE_COLORS[c.role] ?? "bg-gray-100 text-gray-600")}>
                      {c.role}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Comment input ──────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-[#ececec] px-3 py-2.5 bg-white">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold leading-none">J</span>
          </div>
          {/* Input */}
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addComment();
              }
            }}
            placeholder="Add a comment…"
            className="flex-1 text-[12px] bg-[#f4f4f6] rounded-lg px-3 py-1.5 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#6366f1]/40 transition"
          />
          {/* Send */}
          <button
            disabled={!commentText.trim()}
            onClick={addComment}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
              commentText.trim()
                ? "bg-[#6366f1] text-white hover:bg-[#4f46e5]"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            )}
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
