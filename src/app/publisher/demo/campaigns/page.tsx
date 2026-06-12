"use client";

import { useState } from "react";
import { useDemoStore } from "@/lib/publisher/demo/store";
import {
  TrendingUp, TrendingDown, Plus, Megaphone,
  ChevronDown, BarChart2, Users, FileText,
  Flame, RefreshCw, ExternalLink, Search,
  ArrowUpRight, ArrowDownRight, Eye, Settings2,
  Globe, Hash, Sparkles, CircleDot,
} from "lucide-react";
import { PlatformIcon } from "@/components/publisher/demo/PlatformIcon";

// ── Types ─────────────────────────────────────────────────────────────────────
type CampaignStatus = "active" | "planning" | "completed" | "paused";
type ContentTheme = "educational" | "promotional" | "entertaining" | "inspirational" | "news";

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  platforms: ("facebook" | "instagram" | "linkedin" | "tiktok")[];
  postsTotal: number;
  postsPublished: number;
  reach: number;
  engagement: number;
  color: string;
  themes: ContentTheme[];
  budget?: number;
  budgetSpent?: number;
  targetAudience: string;
};

type TrendTopic = {
  id: string;
  keyword: string;
  score: number;       // 0-100
  delta: number;       // % change
  category: string;
  sparkline: number[]; // 7 data points
  relatedCampaign?: string;
  isRising: boolean;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "Q2 Product Launch",
    status: "active",
    startDate: "Jun 1",
    endDate: "Jun 30",
    platforms: ["facebook", "instagram", "linkedin"],
    postsTotal: 24,
    postsPublished: 18,
    reach: 142000,
    engagement: 6.4,
    color: "#6366f1",
    themes: ["educational", "promotional"],
    budget: 50000,
    budgetSpent: 33200,
    targetAudience: "Tech professionals 25-40",
  },
  {
    id: "c2",
    name: "Mid-Year Sale",
    status: "active",
    startDate: "Jun 15",
    endDate: "Jul 5",
    platforms: ["facebook", "instagram", "tiktok"],
    postsTotal: 16,
    postsPublished: 8,
    reach: 89000,
    engagement: 4.8,
    color: "#f59e0b",
    themes: ["promotional", "entertaining"],
    budget: 30000,
    budgetSpent: 12400,
    targetAudience: "Shoppers 18-35",
  },
  {
    id: "c3",
    name: "Brand Awareness Q3",
    status: "planning",
    startDate: "Jul 1",
    endDate: "Sep 30",
    platforms: ["linkedin", "facebook"],
    postsTotal: 36,
    postsPublished: 0,
    reach: 0,
    engagement: 0,
    color: "#10b981",
    themes: ["educational", "inspirational", "news"],
    budget: 80000,
    budgetSpent: 0,
    targetAudience: "B2B decision makers",
  },
  {
    id: "c4",
    name: "New Year Campaign 2025",
    status: "completed",
    startDate: "Dec 20",
    endDate: "Jan 5",
    platforms: ["facebook", "instagram"],
    postsTotal: 12,
    postsPublished: 12,
    reach: 210000,
    engagement: 8.2,
    color: "#8b5cf6",
    themes: ["inspirational", "entertaining"],
    budget: 25000,
    budgetSpent: 24800,
    targetAudience: "General consumer 18-45",
  },
];

const MOCK_TRENDS: TrendTopic[] = [
  {
    id: "t1",
    keyword: "AI Content Marketing",
    score: 94,
    delta: +42,
    category: "Technology",
    sparkline: [35, 42, 51, 48, 67, 82, 94],
    relatedCampaign: "c1",
    isRising: true,
  },
  {
    id: "t2",
    keyword: "Short-form Video",
    score: 88,
    delta: +28,
    category: "Content Format",
    sparkline: [60, 65, 70, 68, 75, 82, 88],
    relatedCampaign: "c2",
    isRising: true,
  },
  {
    id: "t3",
    keyword: "Sustainable Brand",
    score: 76,
    delta: +15,
    category: "Brand Values",
    sparkline: [55, 58, 62, 65, 68, 72, 76],
    relatedCampaign: "c3",
    isRising: true,
  },
  {
    id: "t4",
    keyword: "Influencer Collaboration",
    score: 71,
    delta: -8,
    category: "Distribution",
    sparkline: [80, 78, 76, 74, 72, 71, 71],
    relatedCampaign: undefined,
    isRising: false,
  },
  {
    id: "t5",
    keyword: "Interactive Polls",
    score: 65,
    delta: +22,
    category: "Engagement",
    sparkline: [30, 38, 44, 50, 55, 60, 65],
    relatedCampaign: "c2",
    isRising: true,
  },
  {
    id: "t6",
    keyword: "Behind the Scenes",
    score: 61,
    delta: +10,
    category: "Content Style",
    sparkline: [48, 50, 53, 55, 57, 59, 61],
    relatedCampaign: "c1",
    isRising: true,
  },
  {
    id: "t7",
    keyword: "Product Tutorials",
    score: 58,
    delta: -3,
    category: "Content Type",
    sparkline: [62, 61, 60, 60, 59, 58, 58],
    relatedCampaign: undefined,
    isRising: false,
  },
  {
    id: "t8",
    keyword: "Live Streaming",
    score: 54,
    delta: +18,
    category: "Format",
    sparkline: [25, 30, 36, 42, 46, 51, 54],
    relatedCampaign: "c3",
    isRising: true,
  },
];

const THEME_LABELS: Record<ContentTheme, string> = {
  educational: "Educational",
  promotional: "Promotional",
  entertaining: "Entertaining",
  inspirational: "Inspirational",
  news: "News",
};
const THEME_COLORS: Record<ContentTheme, { bg: string; text: string }> = {
  educational:  { bg: "#eff6ff", text: "#1d4ed8" },
  promotional:  { bg: "#fef3c7", text: "#b45309" },
  entertaining: { bg: "#fce7f3", text: "#9d174d" },
  inspirational:{ bg: "#f0fdf4", text: "#15803d" },
  news:         { bg: "#f3f4f6", text: "#374151" },
};

const STATUS_CONFIG: Record<CampaignStatus, { label: string; dot: string; text: string; bg: string }> = {
  active:    { label: "Active",     dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  planning:  { label: "Planning",   dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50"    },
  completed: { label: "Completed",  dot: "bg-gray-400",    text: "text-gray-600",    bg: "bg-gray-100"   },
  paused:    { label: "Paused",     dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"   },
};

function fmtNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
}
function fmtBaht(n: number) {
  if (n >= 1000) return "฿" + (n / 1000).toFixed(0) + "K";
  return "฿" + n;
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color, rising }: { data: number[]; color: string; rising: boolean }) {
  const w = 72, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M${pts.join(" L")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={pathD} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* end dot */}
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

// ── Trend Score bar ───────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#ef4444" : score >= 60 ? "#f59e0b" : "#6366f1";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

// ── Campaign Row ──────────────────────────────────────────────────────────────
function CampaignRow({ campaign, trends }: { campaign: Campaign; trends: TrendTopic[] }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_CONFIG[campaign.status];
  const progress = campaign.postsTotal > 0 ? (campaign.postsPublished / campaign.postsTotal) * 100 : 0;
  const budgetProgress = campaign.budget && campaign.budgetSpent !== undefined
    ? (campaign.budgetSpent / campaign.budget) * 100 : null;
  const relatedTrends = trends.filter((t) => t.relatedCampaign === campaign.id);

  return (
    <>
      <tr
        className="border-b border-[#f0f0f0] hover:bg-[#fafafa] cursor-pointer transition-colors group"
        onClick={() => setExpanded((x) => !x)}
      >
        {/* Campaign name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: campaign.color }} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 leading-tight truncate">{campaign.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                <Users size={9} /> {campaign.targetAudience}
              </p>
            </div>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </td>

        {/* Platforms */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {campaign.platforms.map((p) => <PlatformIcon key={p} platform={p} size={16} />)}
          </div>
        </td>

        {/* Date range */}
        <td className="px-4 py-3">
          <span className="text-[12px] text-gray-600 whitespace-nowrap">{campaign.startDate} – {campaign.endDate}</span>
        </td>

        {/* Posts */}
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-gray-700 font-medium">{campaign.postsPublished}/{campaign.postsTotal}</span>
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: campaign.color }} />
            </div>
          </div>
        </td>

        {/* Reach */}
        <td className="px-4 py-3">
          <span className="text-[13px] font-semibold text-gray-800">{campaign.reach ? fmtNum(campaign.reach) : "–"}</span>
        </td>

        {/* Engagement */}
        <td className="px-4 py-3">
          <span className={`text-[13px] font-semibold ${campaign.engagement >= 5 ? "text-emerald-600" : campaign.engagement > 0 ? "text-gray-700" : "text-gray-400"}`}>
            {campaign.engagement ? campaign.engagement.toFixed(1) + "%" : "–"}
          </span>
        </td>

        {/* Budget */}
        <td className="px-4 py-3">
          {campaign.budget ? (
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-gray-600">
                {fmtBaht(campaign.budgetSpent ?? 0)} / {fmtBaht(campaign.budget)}
              </span>
              {budgetProgress !== null && (
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(budgetProgress, 100)}%`, background: budgetProgress > 90 ? "#ef4444" : "#10b981" }}
                  />
                </div>
              )}
            </div>
          ) : <span className="text-gray-300 text-[12px]">–</span>}
        </td>

        {/* Trends */}
        <td className="px-4 py-3">
          {relatedTrends.length > 0 ? (
            <div className="flex items-center gap-1">
              <Flame size={11} className="text-orange-400" />
              <span className="text-[11px] text-orange-500 font-medium">{relatedTrends.length} trending</span>
            </div>
          ) : <span className="text-[11px] text-gray-300">–</span>}
        </td>

        {/* Expand arrow */}
        <td className="px-3 py-3">
          <button
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} campaign details`}
            className="w-full flex items-center justify-center p-1"
            onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x); }}
          >
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </td>
      </tr>

      {/* Expanded row */}
      {expanded && (
        <tr className="bg-[#f9f8ff]">
          <td colSpan={10} className="px-6 py-4">
            <div className="grid grid-cols-3 gap-5">
              {/* Content themes */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Hash size={10} /> Content Themes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.themes.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: THEME_COLORS[t].bg, color: THEME_COLORS[t].text }}
                    >
                      {THEME_LABELS[t]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Google Trends */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <TrendingUp size={10} /> Google Trends Match
                </p>
                {relatedTrends.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {relatedTrends.map((t) => (
                      <div key={t.id} className="flex items-center gap-2">
                        {t.isRising
                          ? <ArrowUpRight size={11} className="text-emerald-500 flex-shrink-0" />
                          : <ArrowDownRight size={11} className="text-red-400 flex-shrink-0" />}
                        <span className="text-[12px] text-gray-700 font-medium flex-1">{t.keyword}</span>
                        <span className={`text-[10px] font-bold ${t.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {t.delta >= 0 ? "+" : ""}{t.delta}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-400">No matching trends found</p>
                )}
              </div>

              {/* AI Suggestion */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={10} /> AI Suggestion
                </p>
                <div className="bg-white rounded-xl border border-[#e0e7ff] p-3">
                  <p className="text-[12px] text-[#4f46e5] leading-relaxed">
                    {campaign.status === "active"
                      ? "Try incorporating short-form video — trend score is rising 28% this week. Pair with interactive polls for 2× engagement."
                      : campaign.status === "planning"
                      ? "AI content marketing is peaking at 94/100. Build educational series around this trend before competitors."
                      : "Campaign exceeded avg engagement by 3.2×. Clone this structure for your next Q3 campaign."}
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Google Trends panel ───────────────────────────────────────────────────────
function TrendsPanel({ trends }: { trends: TrendTopic[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#4285F4] flex items-center justify-center">
            <Globe size={11} className="text-white" />
          </div>
          <span className="text-[13px] font-bold text-gray-800">Google Trends</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">7-day</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">Last synced 2 hours ago</span>
          <button aria-label="Refresh trends" className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors">
            <RefreshCw size={12} />
          </button>
          <button className="text-[11px] text-[#4285F4] font-medium flex items-center gap-1 hover:underline">
            <ExternalLink size={10} /> Open Trends
          </button>
        </div>
      </div>

      {/* Trend rows */}
      <div className="divide-y divide-[#f5f5f5]">
        {trends.map((trend, i) => (
          <div key={trend.id} className="flex items-center gap-4 px-5 py-2.5 hover:bg-[#fafafa] transition-colors">
            {/* Rank */}
            <span className="text-[12px] font-bold text-gray-300 w-4 flex-shrink-0">{i + 1}</span>

            {/* Keyword + category */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-gray-800 truncate">{trend.keyword}</span>
                {trend.isRising && <Flame size={10} className="text-orange-400 flex-shrink-0" />}
              </div>
              <span className="text-[10px] text-gray-400">{trend.category}</span>
            </div>

            {/* Sparkline */}
            <Sparkline data={trend.sparkline} color={trend.isRising ? "#10b981" : "#ef4444"} rising={trend.isRising} />

            {/* Score bar */}
            <div className="w-28 flex-shrink-0">
              <ScoreBar score={trend.score} />
            </div>

            {/* Delta */}
            <div className={`flex items-center gap-0.5 w-14 flex-shrink-0 justify-end text-[12px] font-bold ${trend.delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {trend.delta >= 0
                ? <ArrowUpRight size={12} />
                : <ArrowDownRight size={12} />}
              {Math.abs(trend.delta)}%
            </div>

            {/* Linked campaign badge */}
            {trend.relatedCampaign && (() => {
              const c = MOCK_CAMPAIGNS.find((x) => x.id === trend.relatedCampaign);
              return c ? (
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: c.color }}
                  title={c.name}
                />
              ) : null;
            })()}
            {!trend.relatedCampaign && <div className="w-2.5 h-2.5 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [newCampaignName, setNewCampaignName] = useState("");
  const { posts } = useDemoStore();

  const enrichedCampaigns = campaigns.map((c) => ({
    ...c,
    postsPublished: posts.filter((p) => p.campaign === c.name && p.status === "published").length || c.postsPublished,
  }));

  const filtered = enrichedCampaigns.filter((c) => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Summary KPIs
  const active = enrichedCampaigns.filter((c) => c.status === "active");
  const totalReach = active.reduce((s, c) => s + c.reach, 0);
  const avgEng = active.filter((c) => c.engagement > 0).reduce((s, c, _, a) => s + c.engagement / a.length, 0);
  const totalPosts = posts.length || campaigns.reduce((s, c) => s + c.postsTotal, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f9fafb]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#e8e8e8] bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Megaphone size={18} className="text-[#4f46e5]" />
          <span className="text-[16px] font-bold text-gray-900">Campaign Manager</span>
          <span className="text-[12px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
            {campaigns.length} campaigns
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[13px] text-gray-500 border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings2 size={13} /> Columns
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white px-4 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #4f46e5, #8b5cf6)" }}
          >
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5 flex flex-col gap-5">

        {/* ── KPI summary ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Campaigns", value: active.length,       sub: "running now",          icon: <CircleDot size={16} className="text-emerald-500" />, color: "#10b981" },
            { label: "Total Posts",       value: totalPosts,          sub: "across all campaigns", icon: <FileText size={16} className="text-[#4f46e5]" />,    color: "#4f46e5" },
            { label: "Total Reach",       value: fmtNum(totalReach),  sub: "active campaigns",     icon: <Eye size={16} className="text-blue-500" />,          color: "#3b82f6" },
            { label: "Avg Engagement",    value: avgEng.toFixed(1)+"%",sub: "active campaigns",    icon: <BarChart2 size={16} className="text-amber-500" />,   color: "#f59e0b" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: kpi.color + "15" }}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-[20px] font-extrabold text-gray-900 leading-tight">{kpi.value}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Google Trends ── */}
        <TrendsPanel trends={MOCK_TRENDS} />

        {/* ── Campaign Table ── */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-sm">
          {/* Table header / filter row */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2">
              {(["all", "active", "planning", "completed", "paused"] as const).map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-lg capitalize transition-colors active:scale-[0.98] ${
                    filter === f
                      ? "bg-[#f0f0f9] text-[#4f46e5] font-bold"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {f === "all" ? "All campaigns" : f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-gray-400 bg-gray-50 border border-[#e5e7eb] rounded-lg px-3 py-1.5">
              <Search size={12} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns…"
                aria-label="Search campaigns"
                className="text-[12px] bg-transparent outline-none w-36 placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                  {["Campaign", "Status", "Platforms", "Period", "Posts", "Reach", "Engagement", "Budget", "Trends", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-gray-400 text-[13px]">
                      No campaigns match your filter
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <CampaignRow key={c.id} campaign={c} trends={MOCK_TRENDS} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── New Campaign modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(10,10,20,0.4)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-[16px] font-bold text-gray-900 mb-5">New Campaign</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Campaign name</label>
                <input placeholder="e.g. Q3 Brand Awareness" value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#4f46e5] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Start date</label>
                  <input type="date" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#4f46e5] transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">End date</label>
                  <input type="date" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#4f46e5] transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Target audience</label>
                <input placeholder="e.g. Tech professionals 25-40" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#4f46e5] transition-colors" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#e5e7eb] text-[13px] text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newCampaignName.trim()) {
                    setCampaigns((prev) => [...prev, {
                      id: `c-${prev.length + 1}`,
                      name: newCampaignName.trim(),
                      status: "planning" as CampaignStatus,
                      startDate: "", endDate: "",
                      platforms: [],
                      postsTotal: 0, postsPublished: 0,
                      reach: 0, engagement: 0,
                      color: "#6366f1",
                      themes: [],
                      targetAudience: "",
                    }]);
                  }
                  setNewCampaignName("");
                  setShowModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #4f46e5, #8b5cf6)" }}
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
