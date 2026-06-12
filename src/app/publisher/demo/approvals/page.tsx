"use client";

import { useState, useEffect } from "react";
import {
  Eye, CheckCheck, MessageSquare, X, Check,
  RotateCcw, Clock,
  Tag, AlignLeft, Send, XCircle,
} from "lucide-react";
import { useDemoStore } from "@/lib/publisher/demo/store";
import { StatusBadge } from "@/components/publisher/demo/StatusBadge";
import { PlatformIcon } from "@/components/publisher/demo/PlatformIcon";
import type { DemoPost, DemoPostStatus } from "@/lib/publisher/demo/types";

// ── Columns ───────────────────────────────────────────────────────────────────
type ColId = "awaiting" | "feedback" | "approved" | "rejected";

const COLUMNS: {
  id: ColId; label: string; statuses: DemoPostStatus[];
  badgeStyle: "red" | "plain" | "green" | "crimson"; emptyIcon: "awaiting" | "feedback" | "approved" | "rejected"; emptyText: string;
}[] = [
  { id: "awaiting", label: "Awaiting approval", statuses: ["text_generated","text_approved","image_ready"], badgeStyle: "red",     emptyIcon: "awaiting", emptyText: "No posts awaiting your approval" },
  { id: "feedback", label: "Changes requested", statuses: ["changes_requested"],                            badgeStyle: "plain",   emptyIcon: "feedback", emptyText: "No posts with feedback left" },
  { id: "approved", label: "Approved",          statuses: ["creative_approved","scheduled","published"],    badgeStyle: "green",   emptyIcon: "approved", emptyText: "No posts approved this month" },
  { id: "rejected", label: "Rejected",          statuses: ["rejected"],                                     badgeStyle: "crimson", emptyIcon: "rejected", emptyText: "No rejected posts" },
];

const PLATFORM_GRADIENTS: Record<string, string> = {
  facebook:  "linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)",
  instagram: "linear-gradient(135deg, #f09433 0%, #e1306c 50%, #833ab4 100%)",
  linkedin:  "linear-gradient(135deg, #0a66c2 0%, #0d8fe3 100%)",
  tiktok:    "linear-gradient(135deg, #010101 0%, #333 100%)",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyIllustration({ type }: { type: ColId }) {
  if (type === "awaiting") return (
    <div className="relative w-14 h-14 flex items-center justify-center mx-auto mb-3">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="absolute inset-0">
        <circle cx="28" cy="28" r="24" stroke="#f5b731" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
      </svg>
      <div className="w-9 h-9 rounded-full bg-[#fff3cd] flex items-center justify-center">
        <Check size={16} className="text-[#f5b731]" strokeWidth={2.5} />
      </div>
    </div>
  );
  if (type === "feedback") return (
    <div className="w-14 h-14 rounded-full bg-[#fff7ed] flex items-center justify-center mx-auto mb-3">
      <RotateCcw size={22} className="text-[#f59e0b]" />
    </div>
  );
  if (type === "rejected") return (
    <div className="w-14 h-14 rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto mb-3">
      <XCircle size={22} className="text-[#ef4444]" />
    </div>
  );
  return (
    <div className="w-14 h-14 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-3">
      <CheckCheck size={22} className="text-[#4caf50]" />
    </div>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({
  post, allPosts, onClose, onApprove, onRequestChanges, onReject,
}: {
  post: DemoPost;
  allPosts: DemoPost[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const idx = allPosts.findIndex((p) => p.id === post.id);

  function handleApprove() { onApprove(post.id); onClose(); }
  function handleChanges() { onRequestChanges(post.id); onClose(); }
  function handleReject()  { onReject(post.id);  onClose(); }
  function handleSendComment() { if (comment.trim()) { setComment(""); setSubmitted(true); } }

  const platform = post.platform as "facebook" | "instagram" | "linkedin" | "tiktok";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Review post"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,10,20,0.55)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl overflow-hidden flex w-full mx-4"
        style={{ maxWidth: 860, maxHeight: "90vh", boxShadow: "0 40px 100px rgba(0,0,0,0.3)" }}
      >
        {/* ── Left: Visual preview ── */}
        <div
          className="w-[340px] flex-shrink-0 flex flex-col items-center justify-center relative"
          style={{ background: PLATFORM_GRADIENTS[post.platform] }}
        >
          {/* Platform watermark */}
          <div className="absolute top-4 left-4 opacity-60">
            <PlatformIcon platform={platform} size={22} />
          </div>

          {/* Mock image card */}
          <div className="w-[220px] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            {/* Image area */}
            <div
              className="h-[200px] flex items-center justify-center relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              {/* Abstract pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/40" />
                <div className="absolute bottom-6 right-6 w-24 h-24 rounded-full bg-white/20" />
                <div className="absolute top-12 right-8 w-10 h-10 rounded-full bg-white/30" />
              </div>
              {/* Brand initial */}
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white text-xl font-bold">{post.brand?.[0] ?? "D"}</span>
              </div>
            </div>
            {/* Caption preview */}
            <div className="p-3 bg-white/10">
              <p className="text-white text-[11px] leading-relaxed line-clamp-3 font-medium">
                {post.caption}
              </p>
            </div>
          </div>

          {/* Post index */}
          <p className="absolute bottom-4 text-white/60 text-[11px] font-medium">
            {idx + 1} of {allPosts.length}
          </p>
        </div>

        {/* ── Right: Details + Actions ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <PlatformIcon platform={platform} size={20} />
              <div>
                <p className="text-[13px] font-bold text-gray-800 leading-tight">{post.brand}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock size={10} /> {timeAgo(post.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={post.status} size="sm" />
              <button
                aria-label="Close review modal"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {/* Title */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <AlignLeft size={11} /> Content
              </p>
              <h3 className="text-[16px] font-bold text-gray-800 leading-snug mb-2">{post.title}</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">{post.caption}</p>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Tag size={11} /> Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((t) => (
                    <span key={t} className="text-[12px] bg-[#ede9fe] text-[#4f46e5] border border-[#c4b5fd] px-2.5 py-0.5 rounded-full font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled time */}
            {post.scheduledAt && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#e8e8e8]">
                <Clock size={13} className="text-gray-400" />
                <span className="text-[12px] text-gray-600 font-medium">
                  Scheduled: {new Date(post.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}

            {/* Comment box */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={11} /> Leave a comment
              </p>
              {submitted ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Check size={13} className="text-emerald-500" />
                  <span className="text-[12px] text-emerald-600 font-medium">Comment sent</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add feedback or note for the team…"
                    rows={2}
                    className="flex-1 text-[13px] border border-[#e5e7eb] rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#4f46e5] transition-colors placeholder:text-gray-300"
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!comment.trim()}
                    className="self-end w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={comment.trim()
                      ? { background: "#4f46e5", color: "white" }
                      : { background: "#f3f4f6", color: "#d1d5db", cursor: "not-allowed" }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer: 3-action buttons */}
          <div className="px-6 py-4 border-t border-[#f0f0f0] flex gap-2 flex-shrink-0 bg-[#fafafa]">
            {/* Reject */}
            <button
              onClick={handleReject}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#fecaca] text-[#dc2626] font-semibold text-[13px] hover:bg-[#fef2f2] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#4f46e5]"
            >
              <XCircle size={14} /> Reject
            </button>
            {/* Request changes */}
            <button
              onClick={handleChanges}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-[#e5e7eb] text-gray-600 font-semibold text-[13px] hover:border-[#fde68a] hover:bg-[#fffbeb] hover:text-[#b45309] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#4f46e5]"
            >
              <RotateCcw size={14} /> Request changes
            </button>
            {/* Approve */}
            <button
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-[13px] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#4f46e5]"
              style={{ boxShadow: "0 4px 14px rgba(22,163,74,0.28)" }}
            >
              <Check size={14} strokeWidth={2.5} /> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Approval card (kanban) ────────────────────────────────────────────────────
function ApprovalCard({
  post, onOpen, onApprove, onRequestChanges, onReject,
}: {
  post: DemoPost;
  onOpen: (id: string) => void;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const platform = post.platform as "facebook" | "instagram" | "linkedin" | "tiktok";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Review: ${post.title}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(post.id); } }}
      onClick={() => onOpen(post.id)}
      className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden cursor-pointer group transition-[transform,box-shadow,border-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-lg hover:border-[#c7d2fe]"
    >
      {/* Thumb — compact */}
      <div className="relative h-[72px] overflow-hidden">
        <div className="absolute inset-0" style={{ background: PLATFORM_GRADIENTS[post.platform] }} />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl bg-white/25 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{post.brand?.[0] ?? "D"}</span>
          </div>
        </div>
        <div className="absolute top-2 right-2"><StatusBadge status={post.status} size="sm" /></div>
        <div className="absolute bottom-2 left-2"><PlatformIcon platform={platform} size={14} /></div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-white text-[11px] font-semibold bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm transition-all">
            Review
          </span>
        </div>
      </div>

      {/* Body — compact */}
      <div className="px-3 pt-2.5 pb-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-gray-400 capitalize">{post.platform}</span>
          <span className="text-[9px] text-gray-300 flex items-center gap-0.5">
            <Clock size={8} /> {timeAgo(post.createdAt)}
          </span>
        </div>
        <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-1 group-hover:text-[#4f46e5] transition-colors">
          {post.title}
        </p>
        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
          {post.caption}
        </p>

        {/* 3 quick actions */}
        <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onApprove(post.id)}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 hover:bg-emerald-100 active:scale-[0.98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#4f46e5]"
          >
            <Check size={10} strokeWidth={3} /> Approve
          </button>
          <button
            aria-label="Request changes"
            onClick={() => onRequestChanges(post.id)}
            className="flex items-center justify-center px-2.5 py-2 rounded-lg border border-[#e5e7eb] text-gray-400 hover:text-[#f59e0b] hover:border-[#fde68a] hover:bg-[#fffbeb] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#4f46e5]"
            title="Request changes"
          >
            <RotateCcw size={10} />
          </button>
          <button
            aria-label="Reject"
            onClick={() => onReject(post.id)}
            className="flex items-center justify-center px-2.5 py-2 rounded-lg border border-[#e5e7eb] text-gray-400 hover:text-[#dc2626] hover:border-[#fecaca] hover:bg-[#fef2f2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#4f46e5]"
            title="Reject"
          >
            <XCircle size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ApprovalsPage() {
  const [localStatuses, setLocalStatuses] = useState<Record<string, DemoPostStatus>>({});
  const [reviewId, setReviewId] = useState<string | null>(null);

  function resolvedStatus(post: DemoPost): DemoPostStatus {
    return localStatuses[post.id] ?? post.status;
  }
  function approve(id: string) {
    setLocalStatuses((prev) => ({ ...prev, [id]: "creative_approved" }));
  }
  function requestChanges(id: string) {
    setLocalStatuses((prev) => ({ ...prev, [id]: "changes_requested" }));
  }
  function reject(id: string) {
    setLocalStatuses((prev) => ({ ...prev, [id]: "rejected" }));
  }

  const { posts: storePosts } = useDemoStore();
  const posts = storePosts.map((p) => ({ ...p, status: resolvedStatus(p) }));
  const reviewPost = reviewId ? posts.find((p) => p.id === reviewId) ?? null : null;
  const awaitingPosts = posts.filter((p) => COLUMNS[0].statuses.includes(p.status));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#f0f0f0] flex-shrink-0">
        <div className="flex items-center gap-2 text-[13px] text-gray-500">
          <span className="font-semibold text-gray-800">DataClaw</span>
          <span className="text-gray-300">/</span>
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            Approvals <Eye size={14} className="text-gray-400" />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => awaitingPosts.forEach((p) => approve(p.id))}
            className="text-[13px] text-gray-400 hover:text-gray-700 px-3 py-1.5 transition-colors"
          >
            Approve all
          </button>
          <button
            onClick={() => awaitingPosts[0] && setReviewId(awaitingPosts[0].id)}
            className="text-[13px] font-medium text-gray-700 border border-[#d1d5db] hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Eye size={13} /> Review posts
          </button>
        </div>
      </div>

      {/* ── Kanban ── */}
      <div className="flex-1 overflow-auto px-4 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ minHeight: "calc(100vh - 120px)" }}>
          {COLUMNS.map((col) => {
            const colPosts = posts.filter((p) => col.statuses.includes(p.status));
            return (
              <div key={col.id} className="flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-1">
                  {col.badgeStyle === "red" && (
                    <>
                      <span className="text-[13px] font-semibold text-gray-700">{col.label}</span>
                      {colPosts.length > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-[#ef4444] text-white flex items-center justify-center leading-none">
                          {colPosts.length}
                        </span>
                      )}
                    </>
                  )}
                  {col.badgeStyle === "green" && (
                    <>
                      <div className="w-4 h-4 rounded-full bg-[#4caf50] flex items-center justify-center flex-shrink-0">
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="10 3 5 9 2 6" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700">{col.label}</span>
                      <span className="text-[13px] text-gray-400">{colPosts.length}</span>
                    </>
                  )}
                  {col.badgeStyle === "plain" && (
                    <>
                      <span className="text-[13px] font-semibold text-gray-700">{col.label}</span>
                      <span className="text-[13px] text-gray-400">{colPosts.length}</span>
                    </>
                  )}
                  {col.badgeStyle === "crimson" && (
                    <>
                      <span className="text-[13px] font-semibold text-gray-700">{col.label}</span>
                      {colPosts.length > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-[#dc2626] text-white flex items-center justify-center leading-none">
                          {colPosts.length}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Column body */}
                <div className="flex-1 rounded-2xl p-3 flex flex-col gap-3" style={{ background: "#f4f3ff", minHeight: 480 }}>
                  {colPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center min-h-[200px]">
                      <EmptyIllustration type={col.emptyIcon} />
                      <p className="text-[13px] text-gray-400 leading-snug">{col.emptyText}</p>
                    </div>
                  ) : (
                    colPosts.map((post) => (
                      <ApprovalCard
                        key={post.id}
                        post={post}
                        onOpen={setReviewId}
                        onApprove={approve}
                        onRequestChanges={requestChanges}
                        onReject={reject}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Review modal ── */}
      {reviewPost && (
        <ReviewModal
          post={reviewPost}
          allPosts={awaitingPosts}
          onClose={() => setReviewId(null)}
          onApprove={approve}
          onRequestChanges={requestChanges}
          onReject={reject}
        />
      )}
    </div>
  );
}
