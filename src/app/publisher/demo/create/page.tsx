"use client";

import { useState, useRef } from "react";
import { Sparkles, ImageIcon, Loader2 } from "lucide-react";

type Platform = "facebook" | "instagram" | "linkedin" | "tiktok";

const CHAR_LIMIT = 280;

const PLATFORMS: { id: Platform; label: string; color: string }[] = [
  { id: "facebook",  label: "Facebook",  color: "#1877F2" },
  { id: "instagram", label: "Instagram", color: "#C13584" },
  { id: "linkedin",  label: "LinkedIn",  color: "#0A66C2" },
  { id: "tiktok",    label: "TikTok",    color: "#000000" },
];

// ── AI mock content per platform ─────────────────────────────────────────────
const AI_CAPTIONS: Record<Platform, string> = {
  facebook:
    "🚀 ระบบ HR ใหม่ของ DataClaw ช่วยลดเวลาจัดการพนักงานลงถึง 60%\n\nไม่ว่าจะเป็น payroll, ระบบ leave หรือ performance review — ทุกอย่างอยู่ในที่เดียว ง่าย รวดเร็ว แม่นยำ\n\n✅ ลดงาน manual\n✅ ลด error\n✅ เพิ่มเวลาให้ทีม HR โฟกัสกับงานสำคัญ\n\nสมัครใช้ฟรี 30 วันได้เลยวันนี้ 👇",
  instagram:
    "ระบบ HR ที่ SME ไทยต้องการ 🇹🇭\n\nDataClaw ช่วยให้ทีมของคุณทำงานน้อยลง ผลลัพธ์ดีขึ้น ✨\n\n— Payroll อัตโนมัติ\n— ติดตาม performance real-time\n— สรุปรายงาน 1 คลิก",
  linkedin:
    "กว่า 500 บริษัท SME ในไทยเลือกใช้ DataClaw เพื่อจัดการงาน HR และ payroll\n\nจากประสบการณ์ทำงานกับลูกค้าหลายร้อยราย พบว่าปัญหาใหญ่ที่สุดของ SME คือ 'เวลา' — เวลาที่หมดไปกับงาน manual ที่ระบบดีๆ สามารถทำแทนได้\n\nDataClaw v2.4 เพิ่งออก feature ใหม่ที่ตอบโจทย์ตรงนี้โดยตรง\n\nสนใจ demo สด? ติดต่อทีมเราได้เลยครับ",
  tiktok:
    "HR เดิมๆ vs HR กับ DataClaw ⚡️\n\nก่อน: Excel + กระดาษ + โทรถามทีละคน 😵\nหลัง: Dashboard เดียว รู้ทุกอย่าง 1 วินาที ✅\n\nลองดูได้เลย ลิงก์ใน bio 👆",
};

const AI_HASHTAGS: Record<Platform, string> = {
  facebook:  "#DataClaw #HRSystem #SMEThailand #PayrollSoftware #HRTech",
  instagram: "#DataClaw #HRTech #SME #ธุรกิจไทย #HRSystem #Startup",
  linkedin:  "#HRTech #SME #DataClaw #PayrollAutomation #BusinessGrowth",
  tiktok:    "#DataClaw #HRTok #SMEThailand #TechTok #ทำงานง่ายขึ้น",
};

const AI_IMAGES: Record<Platform, { gradient: string; label: string }> = {
  facebook:  { gradient: "from-blue-400 to-blue-600",   label: "HR Dashboard — Clean Office" },
  instagram: { gradient: "from-pink-400 to-purple-600", label: "Team Collaboration — Vibrant" },
  linkedin:  { gradient: "from-sky-400 to-blue-700",    label: "Professional Workspace" },
  tiktok:    { gradient: "from-slate-600 to-slate-900", label: "Dynamic Product Screen" },
};

// ── typewriter effect ─────────────────────────────────────────────────────────
async function typewrite(
  text: string,
  setter: (v: string) => void,
  signal: AbortSignal,
  charsPerTick = 3,
  delay = 18
) {
  let i = 0;
  while (i < text.length && !signal.aborted) {
    const chunk = text.slice(0, i + charsPerTick);
    setter(chunk);
    i += charsPerTick;
    await new Promise((r) => setTimeout(r, delay));
  }
  if (!signal.aborted) setter(text);
}

// ── Platform tab icon ─────────────────────────────────────────────────────────
function PlatformTabIcon({ id }: { id: Platform }) {
  if (id === "facebook") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
  if (id === "instagram") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
  if (id === "linkedin") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

// ── Phone preview components ──────────────────────────────────────────────────
function PhoneFacebookPreview({ text, imageMeta }: { text: string; imageMeta: { gradient: string; label: string } | null }) {
  return (
    <div className="bg-white">
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">D</div>
        <div><p className="text-[11px] font-semibold text-slate-800">DataClaw</p><p className="text-[9px] text-slate-400">Just now · 🌐</p></div>
      </div>
      <div className="px-3 pb-2">
        <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap line-clamp-4">
          {text || <span className="text-slate-300">Your caption will appear here…</span>}
        </p>
      </div>
      <div className={`h-28 bg-gradient-to-br ${imageMeta?.gradient ?? "from-slate-200 to-slate-300"} flex items-center justify-center`}>
        <span className="text-[9px] text-white/70">{imageMeta?.label ?? "Image"}</span>
      </div>
      <div className="px-3 py-1.5 border-t border-slate-100 flex gap-3">
        {["👍 Like", "💬", "↗"].map((a) => (<span key={a} className="text-[10px] text-slate-500">{a}</span>))}
      </div>
    </div>
  );
}

function PhoneInstagramPreview({ text, imageMeta }: { text: string; imageMeta: { gradient: string; label: string } | null }) {
  return (
    <div className="bg-white">
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full p-0.5 flex-shrink-0" style={{ background: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" }}>
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[8px] font-bold text-pink-600">D</div>
        </div>
        <span className="text-[11px] font-semibold text-slate-800 flex-1">dataclaw</span>
        <span className="text-slate-400 font-bold text-sm">···</span>
      </div>
      <div className={`h-36 bg-gradient-to-br ${imageMeta?.gradient ?? "from-slate-200 to-slate-300"} flex items-center justify-center`}>
        <span className="text-[9px] text-white/50">{imageMeta?.label ?? "Image"}</span>
      </div>
      <div className="px-3 py-2">
        <div className="flex gap-2 mb-1 text-base"><span>♡</span><span>💬</span><span>↗</span></div>
        <p className="text-[11px] text-slate-700 line-clamp-3">
          <span className="font-semibold">dataclaw</span>{" "}{text || <span className="text-slate-300">Your caption…</span>}
        </p>
      </div>
    </div>
  );
}

function PhoneLinkedInPreview({ text, imageMeta }: { text: string; imageMeta: { gradient: string; label: string } | null }) {
  return (
    <div className="bg-white">
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-[#0A66C2] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">D</div>
        <div><p className="text-[11px] font-semibold text-slate-800">DataClaw</p><p className="text-[9px] text-slate-400">1st · Just now</p></div>
      </div>
      <div className="px-3 pb-2">
        <p className="text-[11px] text-slate-700 line-clamp-3 leading-relaxed">
          {text || <span className="text-slate-300">Your caption…</span>}
        </p>
        {text.length > 80 && <span className="text-[10px] text-[#0A66C2] font-semibold">…see more</span>}
      </div>
      <div className={`h-24 bg-gradient-to-br ${imageMeta?.gradient ?? "from-slate-200 to-slate-300"} flex items-center justify-center`}>
        <span className="text-[9px] text-white/50">{imageMeta?.label ?? "Image"}</span>
      </div>
      <div className="px-3 py-1.5 border-t border-slate-100 flex gap-3">
        {["👍", "💬", "↗"].map((a) => (<span key={a} className="text-[10px] text-slate-500">{a}</span>))}
      </div>
    </div>
  );
}

function PhoneTikTokPreview({ text }: { text: string }) {
  return (
    <div className="bg-black h-full min-h-[260px] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-900" />
      <div className="absolute bottom-4 left-3 right-12 z-10">
        <p className="text-white font-semibold text-[11px]">@dataclaw</p>
        <p className="text-white/80 text-[10px] mt-0.5 line-clamp-2">{text || "Your caption…"}</p>
      </div>
      <div className="absolute right-2 bottom-10 z-10 flex flex-col items-center gap-3">
        {[["♡","2.3k"],["💬","48"],["↗",""]].map(([icon, label]) => (
          <div key={icon} className="flex flex-col items-center text-white">
            <span className="text-base">{icon}</span>
            {label ? <span className="text-[9px]">{label}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function PhonePreview({ platform, text, imageMeta }: { platform: Platform; text: string; imageMeta: { gradient: string; label: string } | null }) {
  switch (platform) {
    case "instagram": return <PhoneInstagramPreview text={text} imageMeta={imageMeta} />;
    case "linkedin":  return <PhoneLinkedInPreview  text={text} imageMeta={imageMeta} />;
    case "tiktok":    return <PhoneTikTokPreview    text={text} />;
    default:          return <PhoneFacebookPreview  text={text} imageMeta={imageMeta} />;
  }
}

// ── Phone frame ───────────────────────────────────────────────────────────────
function PhoneMockup({ platform, text, imageMeta }: { platform: Platform; text: string; imageMeta: { gradient: string; label: string } | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 248 }}>
        <div className="absolute -left-[9px] top-[72px] w-[7px] h-8 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[9px] top-[112px] w-[7px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[9px] top-[136px] w-[7px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-[9px] top-[100px] w-[7px] h-16 bg-slate-700 rounded-r-sm" />
        <div className="rounded-[40px] overflow-hidden shadow-2xl" style={{ background: "#1c1c1e", padding: "10px", boxShadow: "0 0 0 1px #3a3a3c, 0 24px 48px rgba(0,0,0,0.5)" }}>
          <div className="rounded-[32px] overflow-hidden bg-white flex flex-col" style={{ height: 490 }}>
            <div className="relative bg-white flex items-center justify-between px-5 pt-3 pb-1 flex-shrink-0">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[72px] h-[22px] bg-[#1c1c1e] rounded-full z-10" />
              <span className="text-[11px] font-semibold text-slate-900 z-0">9:41</span>
              <div className="flex items-center gap-1 z-0">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="#1c1c1e">
                  <rect x="0" y="6" width="2.5" height="4" rx="0.5" /><rect x="3.5" y="4" width="2.5" height="6" rx="0.5" />
                  <rect x="7" y="2" width="2.5" height="8" rx="0.5" /><rect x="10.5" y="0" width="2.5" height="10" rx="0.5" />
                </svg>
                <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
                  <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke="#1c1c1e" strokeWidth="1" />
                  <rect x="1.5" y="1.5" width="14" height="8" rx="1.5" fill="#1c1c1e" />
                  <path d="M19.5 3.5v4a1.5 1.5 0 0 0 0-4z" fill="#1c1c1e" />
                </svg>
              </div>
            </div>
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center gap-1.5 flex-shrink-0">
              <PlatformTabIcon id={platform} />
              <span className="text-xs font-semibold text-slate-700 capitalize">{platform}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PhonePreview platform={platform} text={text} imageMeta={imageMeta} />
            </div>
            <div className="flex justify-center py-2 bg-white flex-shrink-0">
              <div className="w-20 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center max-w-[200px]">Live preview — rendering varies per platform.</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CreatePage() {
  const [activePlatform, setActivePlatform] = useState<Platform>("facebook");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [generatingText, setGeneratingText] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ gradient: string; label: string } | null>(null);
  const [aiDegraded, setAiDegraded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const platform = PLATFORMS.find((p) => p.id === activePlatform)!;
  const charCount = caption.length;
  const isOverLimit = charCount > CHAR_LIMIT;
  const isNearLimit = charCount > CHAR_LIMIT * 0.85;
  const fullText = caption + (hashtags ? "\n\n" + hashtags : "");

  async function handleGenerateText() {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setGeneratingText(true);
    setCaption("");
    setHashtags("");
    setImageMeta(null);
    setAiDegraded(false);

    try {
      const { CONTENT_AGENT_PROMPT } = await import('@/lib/agents/runtime/prompts');
      const systemPrompt = CONTENT_AGENT_PROMPT({
        brand: "DataClaw",
        platform: activePlatform,
        count: 1,
        topic: "",
        language: "TH",
        wordCount: "150w",
        imageStyle: "Professional",
      });

      const res = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `เขียน caption สั้น 1 โพสต์สำหรับ ${activePlatform} ของ DataClaw`,
          systemPrompt,
          runtimeType: 'gemini',
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      outer: while (!ctrl.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (ctrl.signal.aborted) break outer;
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (raw === "[DONE]") break outer;
          let parsed: { chunk?: string; error?: string };
          try { parsed = JSON.parse(raw); } catch { continue; }
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.chunk) setCaption((prev) => prev + parsed.chunk!);
        }
      }

      if (ctrl.signal.aborted) return;
      await new Promise((r) => setTimeout(r, 300));
      await typewrite(AI_HASHTAGS[activePlatform], setHashtags, ctrl.signal, 6, 12);
    } catch (err) {
      if (ctrl.signal.aborted || (err as Error).name === "AbortError") return;
      // AI failed — show degraded state and fall back to local example content
      setAiDegraded(true);
      setCaption("");
      await typewrite(AI_CAPTIONS[activePlatform], setCaption, ctrl.signal);
      if (ctrl.signal.aborted) return;
      await new Promise((r) => setTimeout(r, 300));
      await typewrite(AI_HASHTAGS[activePlatform], setHashtags, ctrl.signal, 6, 12);
    }

    if (!ctrl.signal.aborted) setGeneratingText(false);
  }

  async function handleGenerateImage() {
    if (generatingImage) return;
    setGeneratingImage(true);
    setImageMeta(null);
    await new Promise((r) => setTimeout(r, 1800));
    setImageMeta(AI_IMAGES[activePlatform]);
    setGeneratingImage(false);
  }

  return (
    <div className="p-6 min-h-screen bg-[#f5f5f0]">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Compose</h1>
        <p className="text-sm text-slate-500 mt-0.5">Write once, preview across platforms</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Left: Compose panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Platform tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {PLATFORMS.map((p) => {
              const active = activePlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0"
                  style={active ? { color: p.color, borderColor: p.color } : { color: "#94a3b8", borderColor: "transparent" }}
                >
                  <PlatformTabIcon id={p.id} />
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Compose area */}
          <div className="flex-1 flex flex-col p-5 gap-4">
            {/* Brand avatar + AI Generate Text button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: platform.color }}>D</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">DataClaw</p>
                  <p className="text-xs text-slate-400">Posting as Page</p>
                </div>
              </div>

              {/* AI Generate Text */}
              <button
                onClick={handleGenerateText}
                disabled={generatingText}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border"
                style={
                  generatingText
                    ? { color: "#6366f1", borderColor: "#c7d2fe", background: "#eef2ff", cursor: "wait" }
                    : { color: "#6366f1", borderColor: "#c7d2fe", background: "#eef2ff" }
                }
              >
                {generatingText
                  ? <><Loader2 size={14} className="motion-safe:animate-spin" /> Generating…</>
                  : <><Sparkles size={14} /> Generate Text</>}
              </button>
            </div>

            {/* AI degraded state notice */}
            {aiDegraded && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
                <span>⚠</span>
                <span><span className="font-semibold">AI unavailable</span> — showing local example content</span>
              </div>
            )}

            {/* Caption textarea */}
            <div className="flex flex-col gap-1.5 flex-1">
              <textarea
                className="w-full text-sm rounded-xl border border-slate-200 p-3.5 resize-none focus:outline-none focus:ring-2 min-h-[180px] leading-relaxed placeholder:text-slate-300"
                style={{ "--tw-ring-color": platform.color } as React.CSSProperties}
                placeholder={`Write your ${platform.label} caption…`}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className="flex items-center justify-end px-1">
                <span className={`text-xs font-medium tabular-nums ${isOverLimit ? "text-rose-600" : isNearLimit ? "text-amber-500" : "text-slate-400"}`}>
                  {CHAR_LIMIT - charCount}
                </span>
              </div>
              {isOverLimit && <p className="text-xs text-rose-500 px-1">{charCount - CHAR_LIMIT} characters over limit</p>}
            </div>

            {/* Hashtag input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Hashtags</label>
              <input
                type="text"
                className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-300"
                placeholder="#hashtag #yourtag"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              {/* AI Generate Image */}
              <button
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors font-medium"
                style={
                  generatingImage
                    ? { color: "#f59e0b", background: "#fef3c7", cursor: "wait" }
                    : { color: "#d97706", background: "#fef3c7" }
                }
              >
                {generatingImage
                  ? <><Loader2 size={14} className="motion-safe:animate-spin" /> Generating image…</>
                  : <><ImageIcon size={14} /> Generate Image</>}
              </button>

              <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                Schedule
              </button>

              <div className="flex-1" />

              <button
                className="text-sm px-5 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: platform.color }}
                onClick={() => alert("Post added to queue!")}
              >
                Publish
              </button>
            </div>
          </div>
        </div>

        {/* Right: Phone mockup preview */}
        <div className="flex justify-center lg:justify-start pt-2">
          <PhoneMockup platform={activePlatform} text={fullText} imageMeta={imageMeta} />
        </div>
      </div>
    </div>
  );
}
