"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown, ChevronLeft, ChevronRight,
  Star, Filter, Share2, PenLine,
  CircleDot, SlidersHorizontal, Image, Plus,
} from "lucide-react";
import { useDemoStore } from "@/lib/publisher/ai-law-content/store";
import type { DemoPost, DemoPostStatus } from "@/lib/publisher/ai-law-content/types";
import { PlatformIcon } from "./PlatformIcon";
import { useDemoShell } from "./DemoAppShell";
import { cn } from "@/lib/utils";

// ── Month-view calendar data (June 2026) ────────────────────────────────────
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CALENDAR_WEEKS: ReadonlyArray<ReadonlyArray<{ day: number; month: "jun" | "jul" }>> = [
  [
    { day: 1, month: "jun" }, { day: 2, month: "jun" }, { day: 3, month: "jun" },
    { day: 4, month: "jun" }, { day: 5, month: "jun" }, { day: 6, month: "jun" }, { day: 7, month: "jun" },
  ],
  [
    { day: 8, month: "jun" }, { day: 9, month: "jun" }, { day: 10, month: "jun" },
    { day: 11, month: "jun" }, { day: 12, month: "jun" }, { day: 13, month: "jun" }, { day: 14, month: "jun" },
  ],
  [
    { day: 15, month: "jun" }, { day: 16, month: "jun" }, { day: 17, month: "jun" },
    { day: 18, month: "jun" }, { day: 19, month: "jun" }, { day: 20, month: "jun" }, { day: 21, month: "jun" },
  ],
  [
    { day: 22, month: "jun" }, { day: 23, month: "jun" }, { day: 24, month: "jun" },
    { day: 25, month: "jun" }, { day: 26, month: "jun" }, { day: 27, month: "jun" }, { day: 28, month: "jun" },
  ],
  [
    { day: 29, month: "jun" }, { day: 30, month: "jun" },
    { day: 1, month: "jul" }, { day: 2, month: "jul" }, { day: 3, month: "jul" },
    { day: 4, month: "jul" }, { day: 5, month: "jul" },
  ],
];

// ISO week numbers for each row of June 2026 (Jun 1 = W23)
const WEEK_NUMBERS = [23, 24, 25, 26, 27] as const;

// ── Week-view navigation ─────────────────────────────────────────────────────
// Base: Monday 8 Jun 2026 = start of W24 (the "current" demo week, today = Jun 11)
const BASE_MON_EPOCH = Date.UTC(2026, 5, 8); // month 5 = June
const MS_PER_DAY = 86_400_000;
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const WEEKDAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type WeekDay = {
  day: number;
  monthNum: number;   // 1-based
  monthAbbr: string;
  weekday: string;
  isToday: boolean;   // demo "today" = June 11 2026
};

function buildWeekDays(offset: number): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const ts = BASE_MON_EPOCH + (offset * 7 + i) * MS_PER_DAY;
    const d = new Date(ts);
    const day = d.getUTCDate();
    const monthNum = d.getUTCMonth() + 1;
    return {
      day,
      monthNum,
      monthAbbr: MONTH_ABBR[d.getUTCMonth()],
      weekday: WEEKDAY_ABBR[i],
      isToday: monthNum === 6 && day === 11,
    };
  });
}

function fmtWeekRange(days: WeekDay[]): string {
  const a = days[0];
  const z = days[6];
  if (a.monthNum === z.monthNum) return `${a.monthAbbr} ${a.day} – ${z.day}`;
  return `${a.monthAbbr} ${a.day} – ${z.monthAbbr} ${z.day}`;
}

// ── Time slots ───────────────────────────────────────────────────────────────
// 8 AM … 10 PM (integers 8–22)
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);

function fmtHour(h: number): string {
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function PlatformDot({ platform }: { platform: string }) {
  return <PlatformIcon platform={platform as "facebook" | "instagram" | "linkedin" | "tiktok"} size={13} />;
}

// ── Status colours ───────────────────────────────────────────────────────────
const PILL_BORDER: Record<DemoPostStatus, string> = {
  draft:             "border-l-gray-300",
  text_generated:    "border-l-blue-400",
  text_approved:     "border-l-blue-500",
  image_pending:     "border-l-amber-400",
  image_ready:       "border-l-amber-500",
  creative_approved: "border-l-violet-500",
  scheduled:         "border-l-emerald-500",
  published:         "border-l-green-500",
  failed:            "border-l-red-500",
  changes_requested: "border-l-orange-400",
  rejected:          "border-l-red-600",
  archived:          "border-l-gray-200",
};

const PILL_STATUS_DOT: Record<DemoPostStatus, string> = {
  draft:             "bg-gray-300",
  text_generated:    "bg-blue-400",
  text_approved:     "bg-blue-500",
  image_pending:     "bg-amber-400",
  image_ready:       "bg-amber-500",
  creative_approved: "bg-violet-500",
  scheduled:         "bg-emerald-500",
  published:         "bg-green-500",
  failed:            "bg-red-500",
  changes_requested: "bg-orange-400",
  rejected:          "bg-red-600",
  archived:          "bg-gray-200",
};

// ── Post queries ─────────────────────────────────────────────────────────────
function getPostsForCell(allPosts: DemoPost[], day: number, month: "jun" | "jul"): DemoPost[] {
  const monthNum = month === "jun" ? 6 : 7;
  return allPosts.filter((p) => {
    const d = new Date(p.scheduledAt ?? p.createdAt);
    return d.getUTCMonth() + 1 === monthNum && d.getUTCDate() === day;
  });
}

function getPostsForSlot(allPosts: DemoPost[], day: number, monthNum: number, hour: number): DemoPost[] {
  return allPosts.filter((p) => {
    const d = new Date(p.scheduledAt ?? p.createdAt);
    return (
      d.getUTCMonth() + 1 === monthNum &&
      d.getUTCDate() === day &&
      d.getUTCHours() === hour
    );
  });
}

// ── Post pill (shared by both views) ────────────────────────────────────────
function PostPill({ post, onSelect }: { post: DemoPost; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(post.id)}
      title={post.title}
      className={cn(
        "w-full flex items-center gap-1.5 bg-white border border-[#e8e8e8] border-l-[3px] rounded-[5px]",
        "px-1.5 py-[3px] text-left hover:border-[#6366f1] hover:shadow-sm transition-all group",
        PILL_BORDER[post.status],
      )}
    >
      <PlatformDot platform={post.platform} />
      <span className="text-[11px] text-gray-700 truncate flex-1 leading-snug group-hover:text-gray-900">
        {post.title}
      </span>
      <span className={cn("w-[6px] h-[6px] rounded-full flex-shrink-0", PILL_STATUS_DOT[post.status])} />
    </button>
  );
}

// ── Month calendar cell ──────────────────────────────────────────────────────
const MAX_VISIBLE = 3;

// Best-time suggestions keyed by day-of-week (0=Sun)
const BEST_TIMES = ["09:15", "10:30", "08:45", "11:00", "09:00", "14:30", "16:00"];

function CalCell({
  day, month, isToday, onSelect, openCompose, allPosts,
}: {
  day: number;
  month: "jun" | "jul";
  isToday: boolean;
  onSelect: (id: string) => void;
  openCompose: () => void;
  allPosts: DemoPost[];
}) {
  const [hovered, setHovered] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const posts = getPostsForCell(allPosts, day, month);
  const isOther = month !== "jun";
  const visible = posts.slice(0, MAX_VISIBLE);
  const overflow = posts.length - MAX_VISIBLE;

  // Deterministic "best time" per day-of-week
  const june2026StartDay = 1; // June 1, 2026 is a Monday (day 1)
  const dayOfWeek = ((june2026StartDay + day - 1) % 7);
  const bestTime = BEST_TIMES[dayOfWeek] ?? "10:00";
  const nowHour = 11; // demo "current" hour
    const bestHour = parseInt(bestTime.split(":")[0]);
    const diffMins = Math.abs((bestHour - nowHour) * 60);
    const inLabel = diffMins < 60 ? `in ${diffMins} min` : `in ${Math.round(diffMins / 60)}h`;
    const noteLabel = useMemo(() => `Added a note for ${day}/${month}`, [day, month]);

  return (
    <div
      className={cn(
        "border-r border-[#f0f0f0] last:border-r-0 p-1.5 flex flex-col gap-1 min-w-0 relative group min-h-[90px]",
        isOther && "bg-[#fafafa]",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
    >
      <div className="flex items-center justify-between h-5">
        <span
          className={cn(
            "w-[22px] h-[22px] flex items-center justify-center text-[12px] rounded-full font-medium transition-colors",
            isToday
              ? "bg-[#ef4444] text-white font-semibold"
              : isOther
              ? "text-gray-300"
              : "text-gray-500",
          )}
        >
          {day}
        </span>
        {hovered && !isOther && (
          <button
            onClick={(e) => { e.stopPropagation(); setPopupOpen((o) => !o); }}
            className="w-[18px] h-[18px] rounded flex items-center justify-center text-[#6366f1] hover:bg-[#eef2ff] transition-colors"
            title="Add post"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {/* Post / Note popup */}
      {popupOpen && !isOther && (
        <>
          {/* Invisible backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setPopupOpen(false)}
          />
          <div
            className="absolute top-6 right-0 z-20 bg-white rounded-xl shadow-xl border border-[#e8e8e8] p-2 min-w-[160px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Post & Note buttons */}
            <div className="flex gap-1.5 mb-2">
              <button
                onClick={() => { setPopupOpen(false); openCompose(); }}
                className="flex items-center gap-1.5 flex-1 justify-center border border-[#d1d5db] hover:border-[#6366f1] hover:text-[#6366f1] rounded-lg px-2 py-1.5 text-[12px] font-medium text-gray-600 transition-colors"
              >
                <PenLine size={12} /> Post
              </button>
              <button
                onClick={() => alert(noteLabel)}
                className="flex items-center gap-1.5 flex-1 justify-center border border-[#d1d5db] hover:border-gray-400 rounded-lg px-2 py-1.5 text-[12px] font-medium text-gray-600 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 5h6M5 8h4"/></svg>
                Note
              </button>
            </div>
            {/* Best time */}
            <div className="border-t border-[#f0f0f0] pt-1.5">
              <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">Best time to post</p>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                <span className="text-[13px] font-semibold text-gray-800">{bestTime}</span>
                <span className="text-[11px] text-gray-400">{inLabel}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-[3px]">
        {visible.map((post) => (
          <PostPill key={post.id} post={post} onSelect={onSelect} />
        ))}
        {overflow > 0 && (
          <button className="text-left text-[11px] text-[#6366f1] hover:text-[#4f46e5] font-medium px-1 py-0.5 hover:bg-[#eef2ff] rounded transition-colors">
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
}

// ── Week view ────────────────────────────────────────────────────────────────
const TIME_COL = "52px";
const MONTH_WK_COL = "28px";

function WeekView({
  weekDays,
  weekNum,
  onSelect,
  allPosts,
}: {
  weekDays: WeekDay[];
  weekNum: number;
  onSelect: (id: string) => void;
  allPosts: DemoPost[];
}) {
  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
      {/* Sticky day-header row */}
      <div
        className="grid flex-shrink-0 bg-[#fafafa] border-b border-[#f0f0f0]"
        style={{ gridTemplateColumns: `${TIME_COL} repeat(7, 1fr)` }}
      >
        {/* Week number label */}
        <div className="border-r border-[#f0f0f0] flex items-center justify-center py-2">
          <span className="text-[10px] font-bold text-[#6366f1] tracking-wide">W{weekNum}</span>
        </div>

        {weekDays.map((d) => (
          <div
            key={`${d.monthNum}-${d.day}`}
            className="py-2 px-1 flex flex-col items-center gap-0.5 border-r border-[#f0f0f0] last:border-r-0"
          >
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{d.weekday}</span>
            <span
              className={cn(
                "w-[26px] h-[26px] flex items-center justify-center rounded-full text-[13px] font-semibold transition-colors",
                d.isToday
                  ? "bg-[#ef4444] text-white"
                  : "text-gray-700 hover:bg-gray-100 cursor-default",
              )}
            >
              {d.day}
            </span>
            {/* Month abbr shown when switching months mid-week */}
            {(d.day === 1) && (
              <span className="text-[9px] text-gray-400 leading-none -mt-0.5">{d.monthAbbr}</span>
            )}
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid border-b border-[#f5f5f5] last:border-b-0"
            style={{ gridTemplateColumns: `${TIME_COL} repeat(7, 1fr)`, minHeight: "54px" }}
          >
            {/* Time label */}
            <div className="border-r border-[#f0f0f0] px-2 pt-1.5 flex items-start flex-shrink-0 bg-[#fafafa]">
              <span className="text-[10px] text-gray-400 whitespace-nowrap leading-none">{fmtHour(hour)}</span>
            </div>

            {/* One slot per day */}
            {weekDays.map((d) => {
              const posts = getPostsForSlot(allPosts, d.day, d.monthNum, hour);
              return (
                <div
                  key={`${d.monthNum}-${d.day}`}
                  className={cn(
                    "border-r border-[#f5f5f5] last:border-r-0 p-1 flex flex-col gap-1",
                    d.isToday && "bg-[#fffbfb]",
                  )}
                >
                  {posts.map((post) => (
                    <PostPill key={post.id} post={post} onSelect={onSelect} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DemoCalendarView() {
  const [calView, setCalView] = useState<"Month" | "Week">("Month");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = W24 (current demo week)
  const { openPost, openCompose } = useDemoShell();
  const { posts } = useDemoStore();

  const weekDays = buildWeekDays(weekOffset);
  // W24 = offset 0; rough ISO approximation for demo purposes
  const weekNum = 24 + weekOffset;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* ── Breadcrumb bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#ececec] flex-shrink-0 h-[46px]">
        <div className="flex items-center gap-1.5 text-[13px]">
          <Link
            href="/publisher/index/settings"
            aria-label="Go to settings"
            className="w-[20px] h-[20px] rounded-[5px] bg-[#16a34a] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/40"
          >
            O
          </Link>
          <span className="font-medium text-gray-800">OpenClaw</span>
          <ChevronDown size={12} className="text-gray-400" />
          <span className="text-gray-300 mx-0.5">/</span>
          <span className="text-gray-500">Content</span>
          <span className="text-gray-300 mx-0.5">/</span>
          <span className="text-gray-500 flex items-center gap-1">
            <span>🗓</span> Calendar
          </span>
          <ChevronDown size={12} className="text-gray-400" />
          <button
            onClick={() => alert("OpenClaw shortcut saved to favorites")}
            className="ml-1 text-gray-300 hover:text-amber-400 transition-colors"
          >
            <Star size={13} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => alert("Filter panel will be available in next iteration")}
            className="flex items-center gap-1.5 text-[13px] text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Filter size={13} className="text-gray-400" /> Filter
          </button>
          <button
            onClick={() => alert("Media library is coming soon")}
            className="flex items-center gap-1.5 text-[13px] text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Image size={13} className="text-gray-400" /> Media
          </button>
          <button
            onClick={() => {
              if (typeof window === "undefined") return;
              void navigator.clipboard?.writeText(window.location.href);
              alert("Calendar link copied to clipboard");
            }}
            className="text-[13px] text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
          >
            <Share2 size={13} className="text-gray-400" /> Share
          </button>
          <button
            onClick={openCompose}
            className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-colors ml-1 shadow-sm"
          >
            <PenLine size={13} /> Compose
          </button>
        </div>
      </div>

      {/* ── Calendar toolbar ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-[9px] border-b border-[#ececec] flex-shrink-0">
        <div className="flex items-center gap-2">

          {/* Month / Week toggle */}
          <div className="flex border border-[#e0e0e0] rounded-lg overflow-hidden text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {(["Month", "Week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setCalView(v)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  calView === v
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 bg-[#f7f7f7]"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Prev / Today / Next — Today only shown in Week view */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => calView === "Week" && setWeekOffset((o) => o - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={15} />
            </button>

            {calView === "Week" && (
              <button
                onClick={() => setWeekOffset(0)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors border",
                  weekOffset === 0
                    ? "border-[#6366f1] text-[#6366f1] bg-[#eef2ff]"
                    : "border-[#e0e0e0] text-gray-600 hover:bg-gray-100 bg-white",
                )}
              >
                Today
              </button>
            )}

            <button
              onClick={() => calView === "Week" && setWeekOffset((o) => o + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Date range title */}
          <h2 className="text-[15px] font-semibold text-gray-800 ml-0.5 tracking-tight">
            {calView === "Week" ? (
              <>
                {fmtWeekRange(weekDays)}{" "}
                <span className="font-normal text-gray-400">2026</span>
              </>
            ) : (
              <>June <span className="font-normal text-gray-400">2026</span></>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-[13px]">
          <button
            onClick={() => alert("Approval request action is coming in next release")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <CircleDot size={14} className="text-gray-400" />
            Request approvals
          </button>
          <button
            onClick={() => alert("View options coming soon")}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <SlidersHorizontal size={14} />
          </button>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] flex-shrink-0" />
            <span>1 calendar</span>
          </div>
        </div>
      </div>

      {/* ── Week view ──────────────────────────────────────────── */}
      {calView === "Week" && (
        <WeekView weekDays={weekDays} weekNum={weekNum} onSelect={openPost} allPosts={posts} />
      )}

      {/* ── Month view ─────────────────────────────────────────── */}
      {calView === "Month" && (
        <>
          {/* Day-of-week headers with week# gutter */}
          <div
            className="grid border-b border-[#f0f0f0] flex-shrink-0 bg-[#fafafa]"
            style={{ gridTemplateColumns: `${MONTH_WK_COL} repeat(7, 1fr)` }}
          >
            <div className="border-r border-[#f0f0f0]" />
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-semibold text-gray-400 border-r border-[#f0f0f0] last:border-r-0 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* 5-week grid */}
          <div
            className="flex-1 overflow-hidden min-h-0"
            style={{ display: "grid", gridTemplateRows: "repeat(5, 1fr)" }}
          >
            {CALENDAR_WEEKS.map((week, wi) => (
              <div
                key={wi}
                className="border-b border-[#f0f0f0] last:border-b-0"
                style={{ display: "grid", gridTemplateColumns: `${MONTH_WK_COL} repeat(7, 1fr)` }}
              >
                {/* Week number */}
                <div className="border-r border-[#f0f0f0] flex items-start justify-center pt-[9px] bg-[#fafafa] flex-shrink-0">
                  <span className="text-[9px] font-bold text-gray-400 leading-none tracking-wide">
                    W{WEEK_NUMBERS[wi]}
                  </span>
                </div>
                {week.map((cell, di) => (
                  <CalCell
                    key={di}
                    day={cell.day}
                    month={cell.month}
                    isToday={cell.month === "jun" && cell.day === 11}
                    onSelect={openPost}
                    openCompose={openCompose}
                    allPosts={posts}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Show next month */}
          <div className="border-t border-[#f0f0f0] py-2 flex justify-center flex-shrink-0 bg-white">
            <button
              onClick={() => alert("Next month pagination is coming soon")}
              className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              ↓ Show next month
            </button>
          </div>
        </>
      )}
    </div>
  );
}
