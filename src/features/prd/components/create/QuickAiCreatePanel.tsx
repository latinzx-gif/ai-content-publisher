'use client';

import { Bot } from 'lucide-react';
import { getLanguageDisplayLabels, languageDisplayLabels } from '@/features/prd/lib/review-display';

export function QuickAiCreatePanel({
  imageCount,
  languages,
  layout,
  onImageCountChange,
  onLanguagesChange,
  onLayoutChange,
  onPlatformsChange,
  onPostCountChange,
  platforms,
  postCount,
}: {
  imageCount: number;
  languages: string[];
  layout: string;
  onImageCountChange: (value: number) => void;
  onLanguagesChange: (values: string[]) => void;
  onLayoutChange: (value: string) => void;
  onPlatformsChange: (values: string[]) => void;
  onPostCountChange: (value: number) => void;
  platforms: string[];
  postCount: number;
}) {
  const toggleQuickSelection = (value: string, currentValues: string[], onChange: (values: string[]) => void) => {
    onChange(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  };
  const activeLanguages = getLanguageDisplayLabels(languages);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <section className="rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2f4f7f] shadow-sm">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[#171717]">Quick AI Mode</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#304463]">
              Choose only the production limits. AI will pick the angle, search sources, write text first, then create images and layout for review.
            </p>
          </div>
          <div className="rounded-2xl border border-[#cfd8ea] bg-white p-3 text-xs leading-relaxed text-[#2f4f7f]">
            Ready settings: {postCount} post(s), {activeLanguages.length} language(s), {platforms.join(', ') || 'no platform'}, {imageCount} image option(s), {layout || 'no layout'} layout.
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h4 className="text-sm font-semibold text-[#171717]">Quick controls</h4>
          <p className="mt-1 text-xs text-[#6e6e68]">Keep this short: quantity, destinations, language, and image setup only.</p>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Posts to Generate</div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 7].map((count) => (
                  <button
                    key={count}
                    aria-pressed={postCount === count}
                    onClick={() => onPostCountChange(count)}
                    className={`h-9 rounded-lg border text-xs font-semibold ${
                      postCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                    }`}
                    type="button"
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Languages</div>
              <div className="flex flex-wrap gap-2">
                {languageDisplayLabels.map((language) => {
                  const selected = languages.includes(language);

                  return (
                    <button
                      key={language}
                      aria-pressed={selected}
                      onClick={() => toggleQuickSelection(language, languages, onLanguagesChange)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        selected ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                      }`}
                      type="button"
                    >
                      {language}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Platforms</div>
              <div className="flex flex-wrap gap-2">
                {['Facebook', 'LinkedIn', 'WordPress', 'Newsletter', 'TikTok'].map((platform) => {
                  const selected = platforms.includes(platform);

                  return (
                    <button
                      key={platform}
                      aria-pressed={selected}
                      onClick={() => toggleQuickSelection(platform, platforms, onPlatformsChange)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        selected ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                      }`}
                      type="button"
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Image Layout</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Single', 'Grid', 'Carousel'].map((item) => (
                    <button
                      key={item}
                      aria-pressed={layout === item}
                      onClick={() => onLayoutChange(item)}
                      className={`h-9 rounded-lg border text-xs font-semibold ${
                        layout === item ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                      }`}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Images to Generate</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 6, 9, 12].map((count) => (
                    <button
                      key={count}
                      aria-pressed={imageCount === count}
                      onClick={() => onImageCountChange(count)}
                      className={`h-9 rounded-lg border text-xs font-semibold ${
                        imageCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                      }`}
                      type="button"
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h4 className="text-sm font-semibold text-[#171717]">AI will handle</h4>
          <p className="mt-1 text-xs text-[#6e6e68]">The same production chain, but with automatic choices.</p>
          <div className="mt-4 grid gap-2">
            {['Find topic from trends', 'Search Knowledge Base sources', 'Write captions first', 'Create visual brief', `Generate ${imageCount} image options`, 'Compose layout for review'].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3 text-xs font-semibold text-[#4f4f49]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[11px]">{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
