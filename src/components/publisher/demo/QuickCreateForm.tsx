"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PostCard } from "./PostCard";
import type { DemoPost } from "@/lib/publisher/demo/types";

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "TikTok"] as const;
const LANGUAGES = ["TH", "EN", "TH+EN"] as const;
const POST_COUNTS = [5, 10, 30] as const;
const WORD_COUNTS = [
  { label: "Short", value: "80w" },
  { label: "Medium", value: "150w" },
  { label: "Long", value: "250w" },
] as const;
const IMAGE_STYLES = ["Professional", "Bold", "Minimalist", "Playful"] as const;

const MOCK_GENERATED: DemoPost[] = [
  {
    id: "gen-1", title: "AI-Generated Post #1", platform: "facebook", status: "text_generated",
    brand: "DataClaw", caption: "ระบบ HR ใหม่จาก DataClaw ช่วยทีมของคุณทำงานได้เร็วขึ้น 3 เท่า ลองใช้ฟรีวันนี้!",
    tags: ["HR", "AI"], createdAt: new Date().toISOString(), comments: [],
  },
  {
    id: "gen-2", title: "AI-Generated Post #2", platform: "linkedin", status: "text_generated",
    brand: "DataClaw", caption: "5 เหตุผลที่ธุรกิจ SME ควรเปลี่ยนมาใช้ระบบ Payroll อัตโนมัติในปี 2026",
    tags: ["Payroll", "SME"], createdAt: new Date().toISOString(), comments: [],
  },
  {
    id: "gen-3", title: "AI-Generated Post #3", platform: "instagram", status: "text_generated",
    brand: "DataClaw", caption: "📊 dashboard เดียว ดูได้ทุกอย่าง — HR, บัญชี, คลังสินค้า ครบในที่เดียว",
    tags: ["Dashboard", "Feature"], createdAt: new Date().toISOString(), comments: [],
  },
];

interface QuickCreateFormProps {
  onSubmit?: (data: FormData) => void;
}

export function QuickCreateForm({ onSubmit: _onSubmit }: QuickCreateFormProps) {
  const [step, setStep] = useState(1);

  // Step 1
  const [topic, setTopic] = useState("");
  const [brand] = useState("DataClaw");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>("TH");
  const [postCount, setPostCount] = useState<number>(5);

  // Step 2
  const [wordCount, setWordCount] = useState("150w");
  const [imageStyle, setImageStyle] = useState("Professional");
  const [knowledgeSource, setKnowledgeSource] = useState(false);
  const [notes, setNotes] = useState("");

  // Step 3
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const { CONTENT_AGENT_PROMPT } = await import('@/lib/agents/runtime/prompts');

      const systemPrompt = CONTENT_AGENT_PROMPT({
        brand,
        platform: selectedPlatforms.join(', ') || 'Facebook',
        count: postCount,
        topic,
        language,
        wordCount,
        imageStyle,
      });

      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `สร้าง ${postCount} โพสตามที่กำหนด`,
          systemPrompt,
          runtimeType: 'gemini', // default to gemini (fast + free)
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Try to parse JSON from result
        const jsonMatch = data.result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          // Successfully got real AI posts - set generated
          setGenerated(true);
          // Store raw result for display
          setAiResult(data.result);
        } else {
          setGenerated(true); // fallback: show mock
        }
      } else {
        setGenerated(true); // fallback to mock on error
      }
    } catch {
      setGenerated(true); // fallback to mock
    } finally {
      setGenerating(false);
    }
  }

  const stepLabels = ["Brief", "Style", "Preview & Generate"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-5">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={n} className="flex items-center gap-2">
              <div className={
                active
                  ? "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-red-600 text-white"
                  : done
                  ? "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-500 text-white"
                  : "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-400"
              }>
                {done ? "✓" : n}
              </div>
              <span className={cn("text-xs font-medium", active ? "text-slate-800" : "text-slate-400")}>
                {label}
              </span>
              {i < stepLabels.length - 1 && <span className="text-slate-300 text-xs">→</span>}
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Campaign Objective</label>
            <textarea
              className="w-full text-sm rounded-lg border border-slate-200 p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={3}
              placeholder="Describe what this campaign is about..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
            <select className="w-full text-sm rounded-lg border border-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-red-400" value={brand} onChange={() => {}}>
              <option>DataClaw</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                    selectedPlatforms.includes(p)
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-md border font-medium transition-colors",
                    language === l
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Posts</label>
            <div className="flex gap-2">
              {POST_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setPostCount(n)}
                  className={cn(
                    "text-sm px-4 py-1.5 rounded-md border font-semibold transition-colors",
                    postCount === n
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Word Count</label>
            <div className="flex gap-2">
              {WORD_COUNTS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setWordCount(value)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-md border font-medium transition-colors",
                    wordCount === value
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {label} ({value})
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Image Style</label>
            <div className="flex flex-wrap gap-2">
              {IMAGE_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setImageStyle(s)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                    imageStyle === s
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Knowledge Source</label>
            <button
              onClick={() => setKnowledgeSource(!knowledgeSource)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors",
                knowledgeSource ? "bg-red-600" : "bg-slate-300"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow motion-safe:transition-transform",
                knowledgeSource ? "translate-x-5" : "translate-x-0.5"
              )} />
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              className="w-full text-sm rounded-lg border border-slate-200 p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={3}
              placeholder="Any additional instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          {/* Summary card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
            <p className="font-semibold text-slate-800 text-sm mb-2">Summary</p>
            <p><span className="text-slate-500">Brand:</span> {brand}</p>
            <p><span className="text-slate-500">Topic:</span> {topic || "(none)"}</p>
            <p><span className="text-slate-500">Platforms:</span> {selectedPlatforms.join(", ") || "(none)"}</p>
            <p><span className="text-slate-500">Language:</span> {language}</p>
            <p><span className="text-slate-500">Posts:</span> {postCount}</p>
            <p><span className="text-slate-500">Word count:</span> {wordCount}</p>
            <p><span className="text-slate-500">Image style:</span> {imageStyle}</p>
            <p><span className="text-slate-500">Knowledge source:</span> {knowledgeSource ? "On" : "Off"}</p>
          </div>

          {!generated ? (
            <button
              className="w-full py-3 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 disabled:opacity-60 enabled:active:scale-[0.98]"
              style={{ backgroundColor: "#d92d20" }}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generating..." : `Generate ${postCount} Posts`}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                ✓ {postCount} posts generated
              </p>
              {aiResult && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 font-mono overflow-auto max-h-40">
                  <p className="font-bold text-blue-600 mb-1">AI Response (raw):</p>
                  {aiResult.slice(0, 500)}...
                </div>
              )}
              {MOCK_GENERATED.map((post) => (
                <PostCard key={post.id} post={post} showActions />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex justify-between pt-2 border-t border-slate-100">
        <button
          className="text-sm px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98]"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Back
        </button>
        <button
          className="text-sm px-4 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 active:scale-[0.98]"
          onClick={() => setStep((s) => Math.min(3, s + 1))}
          disabled={step === 3}
        >
          Next
        </button>
      </div>
    </div>
  );
}
