"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, Sparkles, Loader2, Link2, MessageSquare,
  Smile, MapPin, Settings, ChevronDown, Clock,
  Image as ImageIcon, Film, AlignLeft, Hash,
} from "lucide-react";
import { PlatformIcon } from "./PlatformIcon";
import { BrandIcon } from "./BrandIcon";
import { useDemoStore } from "@/lib/publisher/demo/store";

type Platform = "facebook" | "instagram" | "linkedin" | "tiktok";


const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

// ── Mock AI captions ──────────────────────────────────────────────────────────
const AI_CAPTIONS: Record<Platform, string> = {
  facebook:
    "🚀 ระบบ HR ใหม่ของ DataClaw ช่วยลดเวลาจัดการพนักงานลงถึง 60%\n\nไม่ว่าจะเป็น payroll, ระบบ leave หรือ performance review — ทุกอย่างอยู่ในที่เดียว ง่าย รวดเร็ว แม่นยำ\n\n✅ ลดงาน manual\n✅ ลด error\n✅ เพิ่มเวลาให้ทีม HR โฟกัสกับงานสำคัญ",
  instagram:
    "ระบบ HR ที่ SME ไทยต้องการ 🇹🇭\n\nDataClaw ช่วยให้ทีมของคุณทำงานน้อยลง ผลลัพธ์ดีขึ้น ✨\n\n— Payroll อัตโนมัติ\n— ติดตาม performance real-time\n— สรุปรายงาน 1 คลิก",
  linkedin:
    "กว่า 500 บริษัท SME ในไทยเลือกใช้ DataClaw เพื่อจัดการงาน HR และ payroll\n\nปัญหาใหญ่ที่สุดของ SME คือ 'เวลา' ที่หมดไปกับงาน manual ที่ระบบดีๆ สามารถทำแทนได้\n\nสนใจ demo สด? ติดต่อทีมเราได้เลยครับ",
  tiktok:
    "HR เดิมๆ vs HR กับ DataClaw ⚡️\n\nก่อน: Excel + กระดาษ + โทรถามทีละคน 😵\nหลัง: Dashboard เดียว รู้ทุกอย่าง 1 วินาที ✅\n\n#DataClaw #HRTech #SMEไทย",
};

const PREVIEW_COLORS: Record<Platform, string> = {
  facebook:  "linear-gradient(135deg, #e7f3ff 0%, #d0e8ff 100%)",
  instagram: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)",
  linkedin:  "linear-gradient(135deg, #e8f4fd 0%, #cce4f6 100%)",
  tiktok:    "linear-gradient(135deg, #f0e6ff 0%, #e0d0ff 100%)",
};

async function typewrite(
  text: string,
  setter: (v: string) => void,
  signal: AbortSignal,
  charsPerTick = 4,
  delay = 14,
) {
  let i = 0;
  while (i < text.length && !signal.aborted) {
    setter(text.slice(0, i + charsPerTick));
    i += charsPerTick;
    await new Promise((r) => setTimeout(r, delay));
  }
  if (!signal.aborted) setter(text);
}

// ── Phone preview mini-component ─────────────────────────────────────────────
function PhonePreview({ platform, caption, hasImage }: { platform: Platform; caption: string; hasImage: boolean }) {
  const icon = <PlatformIcon platform={platform} size={14} />;
  const bg = PREVIEW_COLORS[platform];

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Preview</p>

      {/* Phone shell */}
      <div
        className="relative rounded-[28px] overflow-hidden shadow-2xl flex-shrink-0"
        style={{ width: 200, height: 390, background: "#111", boxShadow: "0 20px 60px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.08)" }}
      >
        {/* Screen */}
        <div className="absolute inset-[3px] rounded-[25px] overflow-hidden bg-white flex flex-col">

          {/* Dynamic island */}
          <div className="flex justify-center pt-2 pb-1 bg-white flex-shrink-0">
            <div className="w-[72px] h-[22px] rounded-full bg-black" />
          </div>

          {/* App header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              {icon}
              <span className="text-[10px] font-semibold text-gray-700">{PLATFORM_LABELS[platform]}</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-gray-200" />
          </div>

          {/* Post content */}
          <div className="flex-1 overflow-hidden px-2.5 py-2 flex flex-col gap-2">
            {/* Author row */}
            <div className="flex items-center gap-1.5">
              <div className="w-[22px] h-[22px] rounded-full bg-[#d92d20] flex-shrink-0" />
              <div>
                <div className="text-[9px] font-semibold text-gray-800 leading-tight">DataClaw</div>
                <div className="text-[8px] text-gray-400 leading-tight">Just now</div>
              </div>
            </div>

            {/* Media placeholder */}
            {hasImage && (
              <div
                className="w-full h-[90px] rounded-lg flex-shrink-0"
                style={{ background: bg }}
              >
                <div className="w-full h-full flex items-center justify-center opacity-40">
                  <ImageIcon size={22} className="text-gray-500" />
                </div>
              </div>
            )}

            {/* Caption */}
            <p className="text-[9px] text-gray-700 leading-[1.5] overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: hasImage ? 5 : 10, WebkitBoxOrient: "vertical" }}>
              {caption || <span className="text-gray-300 italic">Your caption will appear here…</span>}
            </p>
          </div>

          {/* Engagement row */}
          <div className="flex items-center justify-around px-2 py-2 border-t border-gray-100 flex-shrink-0">
            {["👍", "💬", "↗️"].map((e) => (
              <button key={e} className="text-[10px] opacity-50">{e}</button>
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-1.5 bg-white flex-shrink-0">
            <div className="w-[52px] h-[3px] rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
interface Props { onClose: () => void; }

export default function DemoComposeModal({ onClose }: Props) {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [postType, setPostType] = useState<"Post" | "Reels">("Post");
  const [caption, setCaption] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [activeHeaderTab, setActiveHeaderTab] = useState<"Template" | "Campaign" | "Labels" | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addPost } = useDemoStore();

  function handleSaveDraft() {
    const title = caption.trim().split("\n")[0].slice(0, 60) || "Untitled Post";
    addPost({
      title,
      caption: caption.trim(),
      platform,
      status: "draft",
      brand: "DataClaw",
      tags: [],
      createdAt: new Date().toISOString(),
      comments: [],
    });
    onClose();
  }

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  async function handleGenerateAI() {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setGenerating(true);
    setCaption("");
    await new Promise((r) => setTimeout(r, 400));
    await typewrite(AI_CAPTIONS[platform], setCaption, ctrl.signal);
    if (!ctrl.signal.aborted) setGenerating(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,15,30,0.45)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full mx-4"
        style={{ maxWidth: 780, maxHeight: "92vh", boxShadow: "0 32px 80px rgba(0,0,0,0.22)" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-[#f0f0f0] flex-shrink-0">
          <span className="text-[15px] font-semibold text-gray-800 mr-3">New post</span>

          {(["Template", "Campaign", "Labels"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveHeaderTab(activeHeaderTab === tab ? null : tab)}
              className="flex items-center gap-1.5 px-3 py-2 text-[12.5px] rounded-lg transition-colors font-medium"
              style={activeHeaderTab === tab
                ? { color: "#6366f1", background: "#f0f0ff" }
                : { color: "#9ca3af" }}
            >
              {tab === "Template" && (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="1" y="1" width="14" height="14" rx="2.5" />
                  <path d="M1 6h14M5 6v9" />
                </svg>
              )}
              {tab === "Campaign" && (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <polygon points="8,1 15,8 8,15 1,8" />
                </svg>
              )}
              {tab === "Labels" && (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 2h5.2l7 7-5.2 5.2-7-7V2z" />
                  <circle cx="5" cy="5" r="1" fill="currentColor" />
                </svg>
              )}
              {tab}
            </button>
          ))}

          <div className="flex-1" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body: two columns ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Left: Compose ── */}
          <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

            {/* Platform selector */}
            <div className="px-5 pt-4 pb-3 border-b border-[#f8f8f8]">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Post to</p>
              <div className="flex items-center gap-2 flex-wrap">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border-2 transition-all font-medium text-[13px]"
                    style={platform === p
                      ? { borderColor: "#6366f1", background: "#f5f3ff", color: "#4f46e5" }
                      : { borderColor: "#e8e8e8", background: "white", color: "#6b7280" }}
                  >
                    <PlatformIcon platform={p} size={22} />
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Post type tabs */}
            <div className="flex gap-0 px-5 pt-3 border-b border-[#f0f0f0]">
              {(["Post", "Reels", "Story"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPostType(t === "Story" ? "Post" : t)}
                  className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors"
                  style={(postType === t || (t === "Story" && false))
                    ? { color: "#6366f1", borderColor: "#6366f1" }
                    : { color: "#9ca3af", borderColor: "transparent" }}
                >
                  {t === "Post" && <AlignLeft size={13} />}
                  {t === "Reels" && <Film size={13} />}
                  {t === "Story" && <ImageIcon size={13} />}
                  {t}
                </button>
              ))}
            </div>

            {/* Text area */}
            <div className="flex-1 px-5 pt-4 pb-2 min-h-[160px]">
              <textarea
                ref={textareaRef}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something… or type :balloon: to insert a 🎈"
                className="w-full text-[14px] text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none leading-[1.65] min-h-[160px]"
                style={{ fontFamily: "inherit" }}
              />
            </div>

            {/* Media preview strip */}
            {hasImage && (
              <div className="px-5 pb-3">
                <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden flex-shrink-0 group">
                  <div style={{ background: PREVIEW_COLORS[platform] }} className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-gray-400 opacity-50" />
                  </div>
                  <button
                    onClick={() => setHasImage(false)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* AI generate button */}
            <div className="px-5 pb-3">
              {!caption && !generating && (
                <button
                  onClick={handleGenerateAI}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold border border-[#c7d2fe] text-[#6366f1] bg-[#f5f3ff] hover:bg-[#ede9fe] transition-all shadow-sm hover:shadow"
                >
                  <Sparkles size={14} />
                  Generate with AI
                </button>
              )}
              {generating && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold border border-[#c7d2fe] text-[#6366f1] bg-[#f5f3ff] w-fit">
                  <Loader2 size={14} className="animate-spin" />
                  Generating…
                </div>
              )}
              {caption && !generating && (
                <button
                  onClick={handleGenerateAI}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#6366f1] hover:text-[#4f46e5] transition-colors"
                >
                  <Sparkles size={12} />
                  Regenerate
                </button>
              )}
            </div>

            {/* Hashtag suggestion */}
            {caption && (
              <div className="px-5 pb-3">
                <button className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
                  <Hash size={12} /> Add hashtags
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className="border-t border-[#f0f0f0] px-4 py-2 flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => setHasImage((v) => !v)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6366f1] transition-colors"
                title="Image"
              >
                <ImageIcon size={17} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="GIF">
                <span className="text-[11px] font-bold text-gray-400 leading-none">GIF</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Carousel">
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <rect x="4" y="2" width="10" height="14" rx="2" />
                  <path d="M1.5 5v8M16.5 5v8" />
                </svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Canva">
                <span className="text-[12px] font-bold leading-none" style={{ color: "#00C4CC" }}>C</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Link">
                <Link2 size={16} />
              </button>
              {/* Google Drive */}
              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Attach from Google Drive">
                <BrandIcon brand="googledrive" size={18} />
              </button>
              {/* Obsidian */}
              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Attach from Obsidian">
                <BrandIcon brand="obsidian" size={18} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="First comment">
                <MessageSquare size={16} />
              </button>

              <div className="flex-1" />

              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Location">
                <MapPin size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Settings">
                <Settings size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Emoji">
                <Smile size={16} />
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-[#f0f0f0] px-5 py-3 flex items-center justify-between flex-shrink-0">
              <button className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 transition-colors rounded-lg px-2 py-1.5 hover:bg-gray-50">
                <Clock size={14} />
                Select date &amp; time
                <ChevronDown size={12} />
              </button>

              <div className="flex items-center rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[13px] font-semibold px-5 py-2.5 transition-colors"
                >
                  Save draft
                </button>
                <div className="w-px h-full bg-[#818cf8]" />
                <button className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-2.5 py-2.5 transition-colors">
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Phone preview ── */}
          <div
            className="flex-shrink-0 flex items-center justify-center py-6 px-5 border-l border-[#f0f0f0]"
            style={{ width: 240, background: "#fafafa" }}
          >
            <PhonePreview platform={platform} caption={caption} hasImage={hasImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
