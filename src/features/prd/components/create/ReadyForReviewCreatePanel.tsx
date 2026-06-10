'use client';

import { useState } from 'react';
import { SectionKicker } from '@/features/prd/components/primitives/SectionKicker';
import {
  getLanguageDisplayLabels,
  languageCodeLabelMap,
  normalizeLanguageCode,
  normalizeLanguageCodes,
} from '@/features/prd/lib/review-display';
import type { GeneratedDraft } from '@/features/prd/types/content';

export function ReadyForReviewCreatePanel({
  brandVoice,
  category,
  citationStrictness,
  contentGoal,
  cta,
  imageCount,
  generatedDrafts,
  languages,
  layout,
  mode,
  onEditAssets,
  onEditText,
  onRegenerateImage,
  onSelectedAssetsChange,
  platforms,
  postCount,
  selectedAssets,
  sourceConnectors,
  targetAudience,
  topic,
  wordCount,
}: {
  brandVoice: string;
  category: string;
  citationStrictness: string;
  contentGoal: string;
  cta: string;
  imageCount: number;
  generatedDrafts: GeneratedDraft[];
  languages: string[];
  layout: string;
  mode: 'manual' | 'quick';
  onEditAssets: () => void;
  onEditText: () => void;
  onRegenerateImage: () => void;
  onSelectedAssetsChange: (assets: string[]) => void;
  platforms: string[];
  postCount: number;
  selectedAssets: string[];
  sourceConnectors: string[];
  targetAudience: string;
  topic: string;
  wordCount: number;
}) {
  const reviewTopic = topic.trim() || `${category} content package from ${contentGoal}`;
  const activeLanguages = getLanguageDisplayLabels(languages);
  const reviewLanguageCodes = normalizeLanguageCodes(languages, ['th']);
  const generatedDraftByCode = new Map(generatedDrafts.map((draft) => [draft.languageCode, draft]));
  const activePlatforms = platforms.length > 0 ? platforms : ['Facebook'];
  const activeSources = sourceConnectors.length > 0 ? sourceConnectors : ['Knowledge Base'];
  const selectedImages = Array.from({ length: Math.min(imageCount, 6) }, (_, index) => `Image ${index + 1}`);
  const carouselSlides = Array.from({ length: Math.min(postCount + 2, 5) }, (_, index) => `Slide ${index + 1}`);
  const riskScore = category === 'PDPA' || category === 'Corporate Law' ? 34 : citationStrictness === 'Strict citations' ? 12 : 22;
  const riskLabel = riskScore >= 30 ? 'Medium risk' : 'Low risk';
  const complianceItems = [
    `Text ready for ${targetAudience}`,
    `CTA checked: ${cta}`,
    `${citationStrictness} attached`,
    `${layout} layout composed`,
    `${brandVoice} brand voice applied`,
  ];
  const sourceItems = activeSources.map((source) => `${source} · ${category} evidence`);
  const [activeReviewLanguage, setActiveReviewLanguage] = useState(activeLanguages[0] ?? 'Thai (ไทย)');
  const [activeReviewPlatform, setActiveReviewPlatform] = useState(activePlatforms[0] ?? 'Facebook');
  const [activeReviewSlide, setActiveReviewSlide] = useState(carouselSlides[0] ?? 'Slide 1');
  const selectedReviewImages = selectedAssets.length ? selectedAssets : selectedImages.slice(0, Math.min(3, selectedImages.length));
  const activeReviewLanguageCode = normalizeLanguageCode(activeReviewLanguage) ?? reviewLanguageCodes[0] ?? 'th';
  const activeReviewDraft = generatedDraftByCode.get(activeReviewLanguageCode);
  const toggleReviewImage = (image: string) => {
    onSelectedAssetsChange(selectedReviewImages.includes(image) ? selectedReviewImages.filter((item) => item !== image) : [...selectedReviewImages, image]);
  };
  const packageStats = [
    ['Mode', mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'],
    ['Posts', `${postCount} post(s)`],
    ['Images', `${selectedReviewImages.length}/${imageCount} selected`],
    ['Audience', targetAudience],
    ['Goal', contentGoal],
    ['Target', `${wordCount} words`],
  ];

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div>
          <SectionKicker>Step 4 / Ready for Review</SectionKicker>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#171717]">Final text, image, layout, and compliance package</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-emerald-900">
            Reviewers see the generated text, selected assets, composed layout, citations, and risk notes together before sending the package into the Review Queue.
          </p>
          <p className="mt-2 text-xs font-semibold text-emerald-800">
            Ready package includes text, image selections, platform crops, layout order, citations, and compliance notes.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {packageStats.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-emerald-200 bg-white/80 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">{label}</div>
              <div className="mt-1 text-xs font-semibold text-[#171717]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(230px,0.78fr)_minmax(520px,1.7fr)_minmax(230px,0.78fr)] xl:items-start">
        <section className="min-w-0 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[#171717]">Final Text Package</h4>
              <p className="mt-1 text-xs text-[#6e6e68]">Generated copy by language and platform.</p>
            </div>
            <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-2 py-0.5 text-[11px] font-semibold text-[#1f5eff]">{category}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {activeLanguages.map((language) => (
              <button
                key={language}
                aria-pressed={activeReviewLanguage === language}
                onClick={() => setActiveReviewLanguage(language)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  activeReviewLanguage === language ? 'border-[#1f5eff] bg-[#f4f7fd] text-[#1f5eff]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                }`}
                type="button"
              >
                {language}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Topic</div>
              <h5 className="mt-1 text-sm font-semibold leading-snug text-[#171717]">{reviewTopic}</h5>
              <div className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1f5eff]">{activeReviewLanguage} · {activeReviewPlatform}</div>
              <h6 className="mt-3 text-sm font-semibold text-[#2f4f7f]">
                {activeReviewDraft?.title ?? `${category}: ${reviewTopic}`}
              </h6>
            <p className="mt-3 text-sm leading-relaxed text-[#304463]">
              {activeReviewDraft?.body ?? (
                <span className="text-amber-700">Final draft content is not available yet. Rebuild generation in Step 3 first.</span>
              )}
            </p>
            <div className="mt-3 rounded-xl border border-[#deded8] bg-white p-3 text-xs leading-relaxed text-[#6e6e68]">
              Source trail: {activeSources.join(' → ')}. Goal: {contentGoal}. Reviewer should confirm citation fit before publishing.
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {activePlatforms.map((platform) => (
              <button
                key={platform}
                aria-pressed={activeReviewPlatform === platform}
                onClick={() => setActiveReviewPlatform(platform)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  activeReviewPlatform === platform ? 'bg-[#2f312c] text-white' : 'bg-[#f6f6f2] text-[#4f4f49]'
                }`}
                type="button"
              >
                {platform}
              </button>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[#171717]">Asset & Layout Preview</h4>
              <p className="mt-1 text-xs text-[#6e6e68]">Final visual package from Visual Brief Agent, Image Agent, and Asset Composer.</p>
            </div>
            <span className="rounded-full border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-1 text-xs font-semibold text-[#1f5eff]">{layout}</span>
          </div>

          <div className="mt-4 rounded-[24px] border border-[#d9e1ee] bg-gradient-to-br from-[#f8fbff] via-white to-[#f4f0e7] p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_140px]">
              <div className="min-h-[250px] rounded-[20px] border border-white bg-gradient-to-br from-[#e7eefb] via-[#f8fafc] to-[#dfd8c8] p-5 shadow-inner">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/70 bg-white/55 p-4">
                  <div>
                    <div className="inline-flex rounded-full bg-[#1f5eff] px-3 py-1 text-[11px] font-semibold text-white">{category} advisory</div>
                    <h5 className="mt-4 max-w-sm text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Know the rule before you publish or file.</h5>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {carouselSlides.slice(0, 3).map((slide) => (
                      <div key={slide} className="rounded-xl border border-white bg-white/70 p-2 text-[10px] font-semibold text-[#4f4f49]">
                        {slide === activeReviewSlide ? `${slide} · selected` : slide}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {carouselSlides.map((slide) => (
                  <button
                    key={slide}
                    aria-pressed={activeReviewSlide === slide}
                    onClick={() => setActiveReviewSlide(slide)}
                    className={`rounded-2xl border p-2 text-left text-[11px] font-semibold ${
                      activeReviewSlide === slide ? 'border-[#1f5eff] bg-white text-[#1f5eff]' : 'border-white bg-white/60 text-[#6e6e68]'
                    }`}
                    type="button"
                  >
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-white to-[#dce6f6]" />
                    <span className="mt-1 block">{slide}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-3 text-xs leading-relaxed text-[#2f4f7f]">
            Visual brief from final text: professional advisory setting, clear {category.toLowerCase()} concept for {targetAudience}, {brandVoice.toLowerCase()} tone, CTA focus on {cta.toLowerCase()}, minimal text overlay, brand-safe imagery, and no exaggerated result claims.
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {selectedImages.map((image) => {
              const isSelected = selectedReviewImages.includes(image);

              return (
              <button
                key={image}
                aria-pressed={isSelected}
                onClick={() => toggleReviewImage(image)}
                className={`aspect-square rounded-2xl border p-2 text-left text-[10px] font-semibold ${
                  isSelected ? 'border-[#1f5eff] bg-[#f4f7fd] text-[#1f5eff]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                }`}
                type="button"
              >
                <div className="h-full rounded-xl bg-gradient-to-br from-white via-[#eef3fb] to-[#ddd6c8] p-2">{image}</div>
              </button>
              );
            })}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h4 className="text-sm font-semibold text-[#171717]">Compliance Handoff</h4>
          <p className="mt-1 text-xs text-[#6e6e68]">Final controls before human review.</p>

          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Risk score</div>
                <div className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-emerald-800">{riskScore}%</div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{riskLabel}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${riskScore}%` }} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-3 text-xs leading-relaxed text-[#2f4f7f]">
            Review handoff: {contentGoal} for {targetAudience}. Publishing is blocked until a human reviewer accepts {citationStrictness.toLowerCase()}, source trail, and {brandVoice.toLowerCase()} tone.
          </div>

          <div className="mt-4 space-y-2">
            {complianceItems.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2 text-xs">
                <span className="font-semibold text-[#4f4f49]">{item}</span>
                <span className="font-semibold text-emerald-700">Ready</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <h5 className="text-xs font-semibold text-[#171717]">Sources attached</h5>
            <div className="mt-2 space-y-1.5">
              {sourceItems.map((source) => (
                <div key={source} className="rounded-lg bg-white px-2.5 py-2 text-[11px] font-semibold text-[#6e6e68]">
                  {source}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button onClick={onEditText} className="h-9 rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Edit Text
            </button>
            <button onClick={onEditAssets} className="h-9 rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Edit Assets
            </button>
            <button onClick={onRegenerateImage} className="h-9 rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Regenerate Image
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
