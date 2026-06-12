"use client";

import { useState } from "react";
import { useDemoStore } from "@/lib/publisher/demo/store";
import {
  Bot, Sparkles, Image as ImageIcon, ShieldCheck, Send,
  Zap, Activity, CheckCircle2, AlertCircle, Clock,
  ChevronDown, RefreshCw, Play,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type AgentStatus = "running" | "idle" | "queued" | "error";

interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  tasksToday: number;
  avgTime: string;
  queueCount: number;
  description: string;
  color: string;
  gradient: string;
  step: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const ORCHESTRATOR = {
  name: "Orchestrator",
  role: "Pipeline Controller",
  description: "Coordinates all agents — routes tasks, manages dependencies, and retries on failure.",
  model: "Internal",
  status: "running" as AgentStatus,
};

const AGENTS: Agent[] = [
  {
    id: "content",
    name: "Content Agent",
    role: "Text Generation",
    model: "GPT-4o-mini",
    status: "running",
    tasksToday: 14,
    avgTime: "8s",
    queueCount: 3,
    description: "Writes captions, posts, and copy per platform — Thai & EN, brand-voice aligned.",
    color: "#6366f1",
    gradient: "from-[#6366f1] to-[#818cf8]",
    step: 1,
  },
  {
    id: "image",
    name: "Image Agent",
    role: "Visual Generation",
    model: "DALL-E 3",
    status: "queued",
    tasksToday: 9,
    avgTime: "22s",
    queueCount: 2,
    description: "Generates platform-ready visuals and persists them to Supabase Storage.",
    color: "#f59e0b",
    gradient: "from-[#f59e0b] to-[#fbbf24]",
    step: 2,
  },
  {
    id: "qa",
    name: "QA Agent",
    role: "Quality Assurance",
    model: "GPT-4o",
    status: "idle",
    tasksToday: 11,
    avgTime: "5s",
    queueCount: 0,
    description: "Runs 7 automated quality checks — grammar, brand alignment, policy compliance.",
    color: "#10b981",
    gradient: "from-[#10b981] to-[#34d399]",
    step: 3,
  },
  {
    id: "publish",
    name: "Publish Agent",
    role: "Distribution",
    model: "Native API",
    status: "idle",
    tasksToday: 7,
    avgTime: "3s",
    queueCount: 0,
    description: "Dispatches approved posts to connected platforms with retry and audit log.",
    color: "#3b82f6",
    gradient: "from-[#3b82f6] to-[#60a5fa]",
    step: 4,
  },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<AgentStatus, { dot: string; ring: string; label: string; pulse: boolean }> = {
  running: { dot: "bg-emerald-400",  ring: "ring-emerald-200",  label: "Running", pulse: true  },
  queued:  { dot: "bg-amber-400",    ring: "ring-amber-200",    label: "Queued",  pulse: false },
  idle:    { dot: "bg-gray-300",     ring: "ring-gray-100",     label: "Idle",    pulse: false },
  error:   { dot: "bg-red-500",      ring: "ring-red-200",      label: "Error",   pulse: true  },
};

// ── Agent SVG icons (distinctive per agent) ───────────────────────────────────
function AgentAvatar({ agent, size = 56 }: { agent: Agent | typeof ORCHESTRATOR & { color?: string; gradient?: string }; size?: number }) {
  const isOrch = !("step" in agent);
  const color = "color" in agent ? agent.color : "#6366f1";
  const grad = "gradient" in agent ? agent.gradient : "from-[#6366f1] to-[#818cf8]";

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg flex-shrink-0`}
      style={{ width: size, height: size }}
    >
      {isOrch && <Bot size={size * 0.44} className="text-white" strokeWidth={1.6} />}
      {"id" in agent && agent.id === "content"  && <Sparkles    size={size * 0.44} className="text-white" strokeWidth={1.6} />}
      {"id" in agent && agent.id === "image"    && <ImageIcon   size={size * 0.44} className="text-white" strokeWidth={1.6} />}
      {"id" in agent && agent.id === "qa"       && <ShieldCheck size={size * 0.44} className="text-white" strokeWidth={1.6} />}
      {"id" in agent && agent.id === "publish"  && <Send        size={size * 0.44} className="text-white" strokeWidth={1.6} />}
    </div>
  );
}

// ── Status dot ────────────────────────────────────────────────────────────────
function StatusDot({ status, size = "md" }: { status: AgentStatus; size?: "sm" | "md" | "lg" }) {
  const sc = STATUS[status];
  const dim = size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4";
  return (
    <span className={`${dim} rounded-full ${sc.dot} ring-2 ${sc.ring} flex-shrink-0 ${sc.pulse ? "motion-safe:animate-pulse" : ""}`} />
  );
}

// ── Orchestrator node ─────────────────────────────────────────────────────────
function OrchestratorNode() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-white border-2 border-[#6366f1]/30 rounded-3xl px-8 py-5 flex items-center gap-5 shadow-xl"
        style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.15)" }}>
        {/* Status dot */}
        <div className="absolute -top-1.5 -right-1.5">
          <StatusDot status="running" size="lg" />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center shadow-lg">
          <Bot size={26} className="text-white" strokeWidth={1.6} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[16px] font-bold text-gray-800">Orchestrator</span>
            <span className="text-[10px] font-bold bg-[#f0f0ff] text-[#6366f1] border border-[#c7d2fe] px-2 py-0.5 rounded-full uppercase tracking-wide">
              Controller
            </span>
          </div>
          <p className="text-[12px] text-gray-400 max-w-[280px] leading-relaxed">
            Routes tasks, manages agent dependencies &amp; retries on failure
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" /> Running
            </span>
            <span className="text-[11px] text-gray-400">3 tasks in flight</span>
          </div>
        </div>
      </div>

      {/* Connector down */}
      <div className="flex flex-col items-center">
        <div className="w-px h-8 bg-gradient-to-b from-[#6366f1]/40 to-[#6366f1]/10" />
        <div className="w-2 h-2 rounded-full bg-[#6366f1]/30" />
      </div>
    </div>
  );
}

// ── Agent card (org chart node) ───────────────────────────────────────────────
function AgentNode({ agent }: { agent: Agent }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sc = STATUS[agent.status];

  return (
    <div className="flex flex-col items-center">
      {/* Connector up */}
      <div className="flex flex-col items-center mb-0">
        <div className="w-2 h-2 rounded-full bg-[#e5e7eb]" />
        <div className="w-px h-6 bg-gradient-to-b from-[#e5e7eb] to-[#d1d5db]" />
      </div>

      {/* Node card */}
      <div
        className="bg-white rounded-2xl border-2 transition-all w-[220px] overflow-hidden cursor-pointer hover:shadow-xl"
        style={{
          borderColor: open ? agent.color + "60" : "#e8e8e8",
          boxShadow: open ? `0 8px 32px ${agent.color}18` : "0 2px 8px rgba(0,0,0,0.06)",
        }}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Top colour band */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${agent.gradient}`} />

        <div className="p-4">
          {/* Avatar + status dot */}
          <div className="relative w-fit mx-auto mb-3">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-md`}
            >
              {agent.id === "content"  && <Sparkles    size={24} className="text-white" strokeWidth={1.6} />}
              {agent.id === "image"    && <ImageIcon   size={24} className="text-white" strokeWidth={1.6} />}
              {agent.id === "qa"       && <ShieldCheck size={24} className="text-white" strokeWidth={1.6} />}
              {agent.id === "publish"  && <Send        size={24} className="text-white" strokeWidth={1.6} />}
            </div>
            {/* Status dot — bottom right of avatar */}
            <div className="absolute -bottom-1 -right-1">
              <StatusDot status={agent.status} size="md" />
            </div>
            {/* Step badge */}
            <div
              className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow"
              style={{ background: agent.color }}
            >
              {agent.step}
            </div>
          </div>

          {/* Name + role */}
          <div className="text-center mb-3">
            <p className="text-[13px] font-bold text-gray-800 leading-tight">{agent.name}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{agent.role}</p>
          </div>

          {/* Status pill */}
          <div className="flex justify-center mb-3">
            <span
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border`}
              style={{
                background: agent.color + "14",
                color: agent.color,
                borderColor: agent.color + "40",
              }}
            >
              <StatusDot status={agent.status} size="sm" />
              {sc.label}
            </span>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-1 text-center">
            {[
              { v: agent.tasksToday, l: "Today" },
              { v: agent.avgTime,    l: "Avg" },
              { v: agent.queueCount, l: "Queue" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl py-1.5 px-1" style={{ background: agent.color + "0d" }}>
                <p className="text-[13px] font-bold" style={{ color: agent.color }}>{s.v}</p>
                <p className="text-[9px] text-gray-400 font-medium leading-tight">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Expand footer */}
        <div
          className="flex items-center justify-between px-4 py-2 border-t"
          style={{ borderColor: agent.color + "20", background: agent.color + "06" }}
        >
          <span className="text-[10px] font-semibold text-gray-400">{agent.model}</span>
          <ChevronDown
            size={13}
            className="text-gray-400 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>

        {/* Expanded detail */}
        {open && (
          <div className="px-4 pb-4 border-t" style={{ borderColor: agent.color + "20" }}>
            <p className="text-[11px] text-gray-500 leading-relaxed mt-3 mb-3">
              {agent.description}
            </p>
            <div className="flex gap-1.5">
              <button
                className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 rounded-lg border transition-colors"
                style={{ borderColor: agent.color + "40", color: agent.color, background: agent.color + "0d" }}
                onClick={(e) => { e.stopPropagation(); setRunning(true); setTimeout(() => setRunning(false), 1500); }}
              >
                <Play size={10} /> {running ? "Running…" : "Run"}
              </button>
              <button
                className="flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 px-3 rounded-lg border border-[#e5e7eb] text-gray-500 hover:bg-gray-50 transition-colors"
                onClick={(e) => { e.stopPropagation(); setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }}
              >
                <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Activity feed ─────────────────────────────────────────────────────────────
const ACTIVITY = [
  { time: "2m ago",  icon: "success", text: "Content Agent — Generated caption for Q3 HR Spotlight (Facebook)" },
  { time: "5m ago",  icon: "success", text: "Image Agent — Created visual for Product Launch (Instagram)" },
  { time: "8m ago",  icon: "success", text: "QA Agent — Approved score 94/100 — Payroll Feature (LinkedIn)" },
  { time: "12m ago", icon: "success", text: "Publish Agent — Published Brand Visual (TikTok)" },
  { time: "18m ago", icon: "warn",    text: "QA Agent — Low readiness score 62/100, returned to Content Agent" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const [runningAll, setRunningAll] = useState(false);
  const { activities } = useDemoStore();
  const running  = AGENTS.filter((a) => a.status === "running").length;
  const queued   = AGENTS.filter((a) => a.status === "queued").length;
  const idle     = AGENTS.filter((a) => a.status === "idle").length;

  const displayActivity = activities.length > 0
    ? activities.slice(0, 10).map((ev) => ({
        time: new Date(ev.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        icon: "success" as const,
        text: ev.message,
      }))
    : ACTIVITY;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fc]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#f0f0f0] bg-white flex-shrink-0">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="font-semibold text-gray-800">DataClaw</span>
          <span className="text-gray-300">/</span>
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            <Bot size={14} className="text-[#6366f1]" /> Agents
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Status pills */}
          <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
            {running} running
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {queued} queued
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            {idle} idle
          </span>
          <button
            className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm ml-2"
            onClick={() => { setRunningAll(true); setTimeout(() => setRunningAll(false), 2000); }}
          >
            <Zap size={13} /> {runningAll ? "Running…" : "Run all"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center gap-0 min-h-0">

        {/* ── Org chart ── */}
        <div className="flex flex-col items-center w-full max-w-[1000px]">

          {/* Orchestrator */}
          <OrchestratorNode />

          {/* Horizontal connector bar */}
          <div className="relative flex items-start justify-center w-full" style={{ maxWidth: 900 }}>
            {/* Top horizontal line */}
            <div
              className="absolute top-0 left-[12.5%] right-[12.5%] h-px bg-[#e5e7eb]"
              style={{ marginLeft: 8, marginRight: 8 }}
            />
            {/* 4 agent columns */}
            <div className="grid grid-cols-4 w-full gap-4 pt-0">
              {AGENTS.map((agent) => (
                <AgentNode key={agent.id} agent={agent} />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-8 mb-2">
            {[
              { dot: "bg-emerald-400", label: "Running",  ring: "ring-emerald-200" },
              { dot: "bg-amber-400",   label: "Queued",   ring: "ring-amber-200" },
              { dot: "bg-gray-300",    label: "Idle",     ring: "ring-gray-100" },
              { dot: "bg-red-500",     label: "Error",    ring: "ring-red-200" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${l.dot} ring-2 ${l.ring}`} />
                <span className="text-[12px] text-gray-500 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity feed ── */}
        <div className="w-full max-w-[1000px] mt-6">
          <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-gray-400" />
                <span className="text-[13px] font-semibold text-gray-700">Recent activity</span>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" /> Live
              </span>
            </div>
            <div className="divide-y divide-[#f8f8f8]">
              {displayActivity.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  {ev.icon === "success"
                    ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                    : ev.icon === "warn"
                    ? <AlertCircle  size={14} className="text-amber-400 flex-shrink-0" />
                    : <AlertCircle  size={14} className="text-red-400 flex-shrink-0" />}
                  <span className="text-[12.5px] text-gray-600 flex-1">{ev.text}</span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0">
                    <Clock size={11} />
                    {ev.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
