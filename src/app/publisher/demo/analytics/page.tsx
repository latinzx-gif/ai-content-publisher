"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, Eye, Heart, Send,
  Clock, BarChart2, Calendar, Bot, ChevronDown,
} from "lucide-react";
import { PlatformIcon } from "@/components/publisher/demo/PlatformIcon";

// ── Types ─────────────────────────────────────────────────────────────────────
type Range = "7d" | "30d" | "90d";

// ── Mock data ─────────────────────────────────────────────────────────────────
const KPI: Record<Range, { published: number; reach: number; engagement: number; approvalTime: number; dPublished: number; dReach: number; dEngagement: number; dApproval: number }> = {
  "7d":  { published: 12,  reach: 48200,  engagement: 4.8, approvalTime: 1.4, dPublished: 20,  dReach: 12,   dEngagement: 0.3,  dApproval: -0.2 },
  "30d": { published: 47,  reach: 183500, engagement: 4.2, approvalTime: 1.8, dPublished: 8,   dReach: 22,   dEngagement: -0.1, dApproval: 0.3  },
  "90d": { published: 138, reach: 512000, engagement: 3.9, approvalTime: 2.1, dPublished: 15,  dReach: 31,   dEngagement: 0.5,  dApproval: -0.5 },
};

const PLATFORM_DATA: Record<Range, { platform: "facebook"|"instagram"|"linkedin"|"tiktok"; label: string; posts: number; reach: number; eng: number; color: string }[]> = {
  "7d": [
    { platform: "instagram", label: "Instagram", posts: 4, reach: 21000, eng: 6.2, color: "#e1306c" },
    { platform: "facebook",  label: "Facebook",  posts: 3, reach: 14500, eng: 3.8, color: "#1877f2" },
    { platform: "tiktok",    label: "TikTok",    posts: 3, reach: 9200,  eng: 5.4, color: "#010101" },
    { platform: "linkedin",  label: "LinkedIn",  posts: 2, reach: 3500,  eng: 2.9, color: "#0a66c2" },
  ],
  "30d": [
    { platform: "instagram", label: "Instagram", posts: 16, reach: 84000, eng: 5.9, color: "#e1306c" },
    { platform: "facebook",  label: "Facebook",  posts: 14, reach: 56000, eng: 3.5, color: "#1877f2" },
    { platform: "tiktok",    label: "TikTok",    posts: 10, reach: 31000, eng: 5.1, color: "#010101" },
    { platform: "linkedin",  label: "LinkedIn",  posts: 7,  reach: 12500, eng: 2.7, color: "#0a66c2" },
  ],
  "90d": [
    { platform: "instagram", label: "Instagram", posts: 48, reach: 240000, eng: 5.4, color: "#e1306c" },
    { platform: "facebook",  label: "Facebook",  posts: 41, reach: 162000, eng: 3.2, color: "#1877f2" },
    { platform: "tiktok",    label: "TikTok",    posts: 30, reach: 82000,  eng: 4.8, color: "#010101" },
    { platform: "linkedin",  label: "LinkedIn",  posts: 19, reach: 28000,  eng: 2.5, color: "#0a66c2" },
  ],
};

// Sparkline data — 14 data points for each KPI (relative %)
const SPARKLINES: Record<Range, number[]> = {
  "7d":  [40, 55, 35, 70, 60, 80, 65, 90, 75, 85, 70, 95, 88, 100],
  "30d": [30, 45, 50, 38, 60, 55, 72, 65, 80, 75, 85, 78, 92, 100],
  "90d": [20, 35, 28, 45, 52, 48, 62, 58, 70, 74, 80, 85, 92, 100],
};

// Bar chart — weekly post counts (last 8 weeks)
const WEEKLY_BARS: Record<Range, { week: string; count: number }[]> = {
  "7d":  [{ week: "Mon", count: 1 }, { week: "Tue", count: 2 }, { week: "Wed", count: 0 }, { week: "Thu", count: 3 }, { week: "Fri", count: 2 }, { week: "Sat", count: 1 }, { week: "Sun", count: 3 }],
  "30d": [{ week: "W1", count: 9 }, { week: "W2", count: 12 }, { week: "W3", count: 8 }, { week: "W4", count: 11 }, { week: "W5", count: 7 }],
  "90d": [{ week: "Jan", count: 28 }, { week: "Feb", count: 35 }, { week: "Mar", count: 42 }, { week: "Apr", count: 33 }],
};

// Top posts
const TOP_POSTS = [
  { title: "ระบบ HR ใหม่ของ DataClaw", platform: "instagram" as const, reach: 18400, eng: 8.2, type: "Reel" },
  { title: "Q2 Payroll Feature Launch",  platform: "facebook"  as const, reach: 14200, eng: 5.7, type: "Post" },
  { title: "HR Tech Insights 2026",      platform: "linkedin"  as const, reach: 9800,  eng: 6.1, type: "Article" },
  { title: "Before vs After DataClaw",   platform: "tiktok"    as const, reach: 8900,  eng: 9.4, type: "Video" },
  { title: "SME HR Pain Points",         platform: "instagram" as const, reach: 7600,  eng: 7.8, type: "Carousel" },
];

// Agent throughput (tasks/day last 7 days)
const AGENT_BARS = [
  { name: "Content", color: "#6366f1", values: [3, 5, 2, 6, 4, 5, 7] },
  { name: "Image",   color: "#f59e0b", values: [2, 4, 1, 5, 3, 4, 6] },
  { name: "QA",      color: "#10b981", values: [3, 4, 2, 5, 4, 4, 6] },
  { name: "Publish", color: "#3b82f6", values: [2, 3, 1, 4, 3, 3, 5] },
];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// GitHub-style heatmap for June 2026
function buildHeatmap() {
  const cells: { day: number; month: number; val: number }[] = [];
  const seeds = [0,3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6,2,6,4,3,3,8,3,2];
  for (let d = 1; d <= 30; d++) {
    cells.push({ day: d, month: 6, val: seeds[(d - 1) % seeds.length] % 5 });
  }
  return cells;
}
const HEATMAP = buildHeatmap();

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 80; const H = 28; const pad = 2;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (W - pad * 2));
  const ys = data.map((v) => H - pad - (v / 100) * (H - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const area = `${path} L${xs[xs.length - 1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`sg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.slice(1)})`} />
      <path d={path} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, unit, delta, color, sparkData }: {
  icon: React.ReactNode; label: string; value: string | number; unit?: string;
  delta: number; color: string; sparkData: number[];
}) {
  const up = delta >= 0;
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <Sparkline data={sparkData} color={color} />
      </div>
      <div>
        <p className="text-[12px] font-medium text-gray-400 mb-0.5">{label}</p>
        <div className="flex items-end gap-1.5">
          <span className="text-[28px] font-bold text-gray-800 leading-none">{value}</span>
          {unit && <span className="text-[14px] text-gray-400 mb-0.5">{unit}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[12px] font-semibold">
        {up ? <TrendingUp size={13} className="text-emerald-500" /> : <TrendingDown size={13} className="text-red-400" />}
        <span className={up ? "text-emerald-600" : "text-red-500"}>
          {up ? "+" : ""}{delta}{typeof delta === "number" && Math.abs(delta) < 10 ? "%" : "%"}
        </span>
        <span className="text-gray-400 font-normal">vs prev period</span>
      </div>
    </div>
  );
}

// ── Donut chart (SVG) ─────────────────────────────────────────────────────────
function DonutChart({ data }: { data: typeof PLATFORM_DATA["7d"] }) {
  const total = data.reduce((s, d) => s + d.posts, 0);
  const R = 52; const cx = 68; const cy = 68; const stroke = 22;
  let acc = 0;
  const slices = data.map((d) => {
    const pct = d.posts / total;
    const start = acc; acc += pct;
    return { ...d, pct, start };
  });

  function arc(start: number, end: number) {
    const a1 = (start * 360 - 90) * (Math.PI / 180);
    const a2 = (end * 360 - 90) * (Math.PI / 180);
    const x1 = cx + R * Math.cos(a1); const y1 = cy + R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2); const y2 = cy + R * Math.sin(a2);
    const large = end - start > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <div className="flex items-center gap-6">
      <svg width={136} height={136} viewBox="0 0 136 136">
        {slices.map((s) => (
          <path
            key={s.platform}
            d={arc(s.start, s.start + s.pct)}
            stroke={s.color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1f2937">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#9ca3af">posts</text>
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((s) => (
          <div key={s.platform} className="flex items-center gap-2.5">
            <PlatformIcon platform={s.platform} size={16} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[12px] font-medium text-gray-600">{s.label}</span>
                <span className="text-[12px] font-bold text-gray-800">{s.posts}</span>
              </div>
              <div className="mt-0.5 h-1 rounded-full bg-gray-100 w-[90px]">
                <div className="h-full rounded-full" style={{ width: `${s.pct * 100}%`, background: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ bars, color = "#6366f1" }: { bars: { week: string; count: number }[]; color?: string }) {
  const max = Math.max(...bars.map((b) => b.count), 1);
  return (
    <div className="flex items-end gap-2 h-[80px]">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
            style={{ height: `${(b.count / max) * 68}px`, background: color, opacity: 0.8 + 0.2 * (i / bars.length) }}
          />
          <span className="text-[9px] text-gray-400 font-medium">{b.week}</span>
        </div>
      ))}
    </div>
  );
}

// ── Engagement bar ────────────────────────────────────────────────────────────
function EngagementBar({ data }: { data: typeof PLATFORM_DATA["7d"] }) {
  const max = Math.max(...data.map((d) => d.eng));
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.platform} className="flex items-center gap-3">
          <PlatformIcon platform={d.platform} size={16} />
          <div className="flex-1">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(d.eng / max) * 100}%`, background: d.color }}
              />
            </div>
          </div>
          <span className="text-[12px] font-bold text-gray-700 w-10 text-right">{d.eng}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
const HEAT_COLORS = ["#f3f4f6", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1"];
function Heatmap() {
  const weeks: typeof HEATMAP[] = [];
  const june1Day = 1; // June 1 = Monday
  let week: typeof HEATMAP = [];
  // Pad to start on Mon
  for (let i = 0; i < june1Day; i++) week.push({ day: 0, month: 0, val: -1 });
  HEATMAP.forEach((c) => {
    week.push(c);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length) { while (week.length < 7) week.push({ day: 0, month: 0, val: -1 }); weeks.push(week); }

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="w-7 text-center text-[9px] text-gray-400 font-medium">{d}</div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex gap-1">
            {wk.map((c, di) => (
              <div
                key={di}
                title={c.day ? `Jun ${c.day}: ${c.val} posts` : ""}
                className="w-7 h-7 rounded-md transition-all hover:scale-110 cursor-default"
                style={{ background: c.val < 0 ? "transparent" : HEAT_COLORS[Math.min(c.val, 4)] }}
              >
                {c.day > 0 && (
                  <span className="flex items-center justify-center h-full text-[8px] text-gray-400/60 select-none">
                    {c.day}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-gray-400">Less</span>
        {HEAT_COLORS.map((c) => <div key={c} className="w-4 h-4 rounded" style={{ background: c }} />)}
        <span className="text-[10px] text-gray-400">More</span>
      </div>
    </div>
  );
}

// ── Agent throughput grouped bar ──────────────────────────────────────────────
function AgentThroughput() {
  const maxVal = Math.max(...AGENT_BARS.flatMap((a) => a.values));
  return (
    <div>
      <div className="flex items-end gap-3 h-[100px]">
        {DAYS.map((day, di) => (
          <div key={di} className="flex-1 flex items-end gap-0.5">
            {AGENT_BARS.map((ag) => (
              <div
                key={ag.name}
                className="flex-1 rounded-t-sm transition-all hover:opacity-70"
                style={{ height: `${(ag.values[di] / maxVal) * 88}px`, background: ag.color }}
                title={`${ag.name}: ${ag.values[di]} tasks`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-1">
        {DAYS.map((d, i) => <span key={i} className="flex-1 text-center text-[9px] text-gray-400">{d}</span>)}
      </div>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {AGENT_BARS.map((ag) => (
          <div key={ag.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: ag.color }} />
            <span className="text-[11px] text-gray-500 font-medium">{ag.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");
  const kpi = KPI[range];
  const platforms = PLATFORM_DATA[range];
  const bars = WEEKLY_BARS[range];
  const spark = SPARKLINES[range];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fc]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#f0f0f0] bg-white flex-shrink-0">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="font-semibold text-gray-800">DataClaw</span>
          <span className="text-gray-300">/</span>
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            <BarChart2 size={14} className="text-[#6366f1]" /> Analytics
          </span>
        </div>
        {/* Range picker */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-all"
              style={range === r
                ? { background: "white", color: "#6366f1", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "#6b7280" }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-5">

          {/* ── KPI cards ── */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard
              icon={<Send size={16} />}
              label="Posts Published"
              value={kpi.published}
              delta={kpi.dPublished}
              color="#6366f1"
              sparkData={spark}
            />
            <KpiCard
              icon={<Eye size={16} />}
              label="Total Reach"
              value={fmt(kpi.reach)}
              delta={kpi.dReach}
              color="#f59e0b"
              sparkData={[...spark].reverse()}
            />
            <KpiCard
              icon={<Heart size={16} />}
              label="Avg Engagement"
              value={kpi.engagement}
              unit="%"
              delta={kpi.dEngagement}
              color="#e1306c"
              sparkData={spark.map((v, i) => (v * (0.8 + i * 0.015)))}
            />
            <KpiCard
              icon={<Clock size={16} />}
              label="Avg Approval Time"
              value={kpi.approvalTime}
              unit="h"
              delta={kpi.dApproval}
              color="#10b981"
              sparkData={spark.map((v) => 100 - v * 0.6)}
            />
          </div>

          {/* ── Row 2: Platform breakdown + Publishing activity ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Platform donut */}
            <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm p-5 col-span-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-gray-700">Posts by Platform</p>
              </div>
              <DonutChart data={platforms} />
            </div>

            {/* Engagement per platform */}
            <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm p-5 col-span-1">
              <p className="text-[13px] font-semibold text-gray-700 mb-4">Engagement Rate</p>
              <EngagementBar data={platforms} />
              <div className="mt-4 pt-3 border-t border-[#f0f0f0] grid grid-cols-2 gap-2">
                {platforms.map((p) => (
                  <div key={p.platform} className="flex items-center gap-1.5">
                    <PlatformIcon platform={p.platform} size={14} />
                    <span className="text-[11px] text-gray-500 flex-1 truncate">{p.label}</span>
                    <span className="text-[11px] font-bold" style={{ color: p.color }}>{fmt(p.reach)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Publishing volume bar */}
            <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm p-5 col-span-1">
              <p className="text-[13px] font-semibold text-gray-700 mb-4">Publishing Volume</p>
              <BarChart bars={bars} color="#6366f1" />
            </div>
          </div>

          {/* ── Row 3: Heatmap + Top posts ── */}
          <div className="grid grid-cols-5 gap-4">

            {/* Heatmap */}
            <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm p-5 col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={14} className="text-gray-400" />
                <p className="text-[13px] font-semibold text-gray-700">Publishing Heatmap — June 2026</p>
              </div>
              <Heatmap />
            </div>

            {/* Top posts */}
            <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm p-5 col-span-3">
              <p className="text-[13px] font-semibold text-gray-700 mb-4">Top Performing Posts</p>
              <div className="flex flex-col gap-2">
                {TOP_POSTS.map((post, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <span className="text-[13px] font-bold text-gray-300 w-4 flex-shrink-0">{i + 1}</span>
                    <PlatformIcon platform={post.platform} size={18} />
                    <p className="flex-1 text-[13px] font-medium text-gray-700 truncate group-hover:text-[#6366f1] transition-colors">
                      {post.title}
                    </p>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      {post.type}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-[12px] text-gray-500">
                        <Eye size={11} /> {fmt(post.reach)}
                      </div>
                      <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: post.eng > 7 ? "#10b981" : "#6366f1" }}>
                        <Heart size={11} /> {post.eng}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 4: Agent throughput ── */}
          <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-[#6366f1]" />
                <p className="text-[13px] font-semibold text-gray-700">Agent Throughput — Last 7 days</p>
              </div>
              <span className="text-[12px] text-gray-400">Tasks processed per day</span>
            </div>
            <AgentThroughput />
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
