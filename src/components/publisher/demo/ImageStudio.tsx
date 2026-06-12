"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { type DemoPost, type DemoImageOption } from "@/lib/publisher/demo/types";

const DEFAULT_IMAGE_OPTIONS: DemoImageOption[] = [
  { id: "default-a", label: "Option A — Professional", color: "#dbeafe" },
  { id: "default-b", label: "Option B — Bold Red", color: "#fee2e2" },
  { id: "default-c", label: "Option C — Minimalist", color: "#f0fdf4" },
];

const ASPECT_RATIOS = ["1:1", "4:5", "16:9"] as const;

interface ImageStudioProps {
  post: DemoPost;
  onApprove?: (imageId: string) => void;
}

export function ImageStudio({ post, onApprove }: ImageStudioProps) {
  const imageOptions = post.imageOptions?.length ? post.imageOptions : DEFAULT_IMAGE_OPTIONS;
  const [selected, setSelected] = useState<string>(post.selectedImageId ?? imageOptions[0].id);
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [onBrand, setOnBrand] = useState(true);
  const [prompt, setPrompt] = useState(
    "Professional HR dashboard, red-white brand, clean layout, modern office setting"
  );

  return (
    <div className="flex gap-6">
      {/* Left column */}
      <div className="w-1/3 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Creative Prompt</label>
          <textarea
            className="w-full text-xs rounded-lg border border-slate-200 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Aspect Ratio</label>
          <div className="flex gap-1.5">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={cn(
                  "text-xs px-2 py-1 rounded-md border font-medium transition-colors",
                  aspectRatio === ar
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="on-brand"
            type="checkbox"
            checked={onBrand}
            onChange={(e) => setOnBrand(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-600"
          />
          <label htmlFor="on-brand" className="text-xs font-medium text-slate-700">
            On brand
          </label>
        </div>

        <button
          className="w-full text-sm font-semibold py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: "#d92d20" }}
          onClick={() => alert("Regenerating images...")}
        >
          Regenerate Images
        </button>
      </div>

      {/* Right area — image grid */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {imageOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={cn(
                "cursor-pointer rounded-xl overflow-hidden border-2 transition-all",
                selected === opt.id
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div
                className="w-full rounded-t-xl"
                style={{ backgroundColor: opt.color, height: 160 }}
              />
              <p className="text-xs text-slate-600 text-center py-1.5 px-1 bg-white border-t border-slate-100 truncate">
                {opt.label}
              </p>
            </div>
          ))}
        </div>

        <button
          className="w-full text-sm font-semibold py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#101828" }}
          onClick={() => onApprove?.(selected)}
        >
          Approve Creative &amp; Schedule
        </button>
      </div>
    </div>
  );
}
