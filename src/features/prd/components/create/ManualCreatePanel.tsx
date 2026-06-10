'use client';

import { OpenAIIcon } from '@/features/prd/components/icons/prd-icons';
import { Tag } from '@/features/prd/components/primitives/Tag';
import { getLanguageDisplayLabels, languageDisplayLabels } from '@/features/prd/lib/review-display';

export function ManualCreatePanel({
  brandVoice,
  category,
  citationStrictness,
  contentGoal,
  cta,
  imageCount,
  languages,
  layout,
  onBrandVoiceChange,
  onCategoryChange,
  onCitationStrictnessChange,
  onContentGoalChange,
  onCtaChange,
  onImageCountChange,
  onLanguagesChange,
  onLayoutChange,
  onPlatformsChange,
  onPostCountChange,
  onSourceConnectorsChange,
  onTargetAudienceChange,
  onTopicChange,
  onWordCountChange,
  platforms,
  postCount,
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
  languages: string[];
  layout: string;
  onBrandVoiceChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCitationStrictnessChange: (value: string) => void;
  onContentGoalChange: (value: string) => void;
  onCtaChange: (value: string) => void;
  onImageCountChange: (value: number) => void;
  onLanguagesChange: (values: string[]) => void;
  onLayoutChange: (value: string) => void;
  onPlatformsChange: (values: string[]) => void;
  onPostCountChange: (value: number) => void;
  onSourceConnectorsChange: (values: string[]) => void;
  onTargetAudienceChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onWordCountChange: (value: number) => void;
  platforms: string[];
  postCount: number;
  sourceConnectors: string[];
  targetAudience: string;
  topic: string;
  wordCount: number;
}) {
  const toggleManualSelection = (value: string, currentValues: string[], onChange: (values: string[]) => void) => {
    onChange(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  };
  const activeLanguages = getLanguageDisplayLabels(languages);
  const activePlatforms = platforms.length > 0 ? platforms : ['Facebook'];
  const readinessItems = [
    { label: 'Topic brief', ready: Boolean(topic.trim()), detail: topic.trim() ? 'Brief captured' : 'Required before Source Search' },
    { label: 'Sources required', ready: sourceConnectors.length > 0, detail: sourceConnectors.length ? `${sourceConnectors.length} connector(s)` : 'Pick at least one source' },
    {
      label: 'Languages selected',
      ready: activeLanguages.length > 0,
      detail: activeLanguages.length ? activeLanguages.join(', ') : 'Pick at least one language',
    },
    { label: 'Platforms selected', ready: platforms.length > 0, detail: platforms.length ? platforms.join(', ') : 'Pick at least one platform' },
    { label: 'Image layout', ready: Boolean(layout), detail: layout || 'Pick layout' },
    { label: 'Citation rule', ready: Boolean(citationStrictness), detail: citationStrictness || 'Pick citation rule' },
    { label: 'Human review required', ready: true, detail: 'Always routed to Review Queue' },
  ];
  const readinessScore = Math.round((readinessItems.filter((item) => item.ready).length / readinessItems.length) * 100);
  const manualReady = readinessItems.every((item) => item.ready);
  const sourceSearchPreview = [
    ['Topic', topic.trim() || 'Missing topic brief'],
    ['Service', category],
    ['Audience', targetAudience],
    ['CTA', cta],
    ['Sources', sourceConnectors.length ? sourceConnectors.join(', ') : 'Missing source connector'],
    ['Output', `${postCount} post(s), ${activeLanguages.length} language(s), ${activePlatforms.length} platform(s)`],
  ];
  const pipelineSteps = [
    {
      title: 'Source Search',
      agent: 'Content Strategy Agent',
      status: sourceConnectors.length > 0 ? 'Ready' : 'Required',
      detail: 'Ground Knowledge Base, Drive, Obsidian, and official references before drafting.',
    },
    {
      title: 'Generate Text',
      agent: 'Content Strategy Agent',
      status: topic.trim() ? 'Ready' : 'Waiting brief',
      detail: `${wordCount} words across ${activeLanguages.length} language(s), text first before images.`,
    },
    {
      title: 'Compliance Check',
      agent: 'Legal Compliance Agent',
      status: 'Required',
      detail: 'Check citations, prohibited claims, professional ethics, and risk wording.',
    },
    {
      title: 'Localization',
      agent: 'Content Strategy Agent',
      status: activeLanguages.length > 1 ? 'Ready' : 'Optional',
      detail: `Preserve meaning across ${activeLanguages.join(', ')} outputs inside the MVP content flow.`,
    },
    {
      title: 'Image & Layout',
      agent: 'Image & Layout Agent',
      status: 'After text',
      detail: `Create visual brief, generate ${imageCount} image option(s), then compose ${layout.toLowerCase()} layout.`,
    },
    {
      title: 'Review Package',
      agent: 'Legal Compliance Agent',
      status: 'Human review',
      detail: 'Bundle final text, images, layout, citations, and risk notes for Review Queue.',
    },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_minmax(380px,1.15fr)_minmax(280px,1fr)] xl:items-start">
        <section className="space-y-3 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Brief Details</h3>
            <p className="mt-1 text-xs text-[#6e6e68]">Define what to generate, for whom, and which business outcome it supports.</p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Topic / Brief</span>
            <textarea
              value={topic}
              onChange={(event) => onTopicChange(event.target.value)}
              className="min-h-28 w-full resize-none rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2 text-sm leading-relaxed text-[#171717] outline-none ring-[#2f4f7f] placeholder:text-[#8a8a82] focus:ring-1"
              placeholder="เช่น สรุปประเด็นภาษีสำหรับ SME ปี 2026 พร้อม CTA ให้จองปรึกษาก่อนยื่นเอกสาร"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Service Category</span>
              <select
                value={category}
                onChange={(event) => onCategoryChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
              >
                <option>Tax</option>
                <option>Accounting</option>
                <option>Corporate Law</option>
                <option>PDPA</option>
                <option>Labor Law</option>
                <option>Visa & Work Permit</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Content Goal</span>
              <select
                value={contentGoal}
                onChange={(event) => onContentGoalChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
              >
                {['Educate & Lead', 'Build trust', 'Announce update', 'Drive consultation', 'Recycle evergreen'].map((goal) => (
                  <option key={goal}>{goal}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Target Audience</div>
            <div className="flex flex-wrap gap-2">
              {['SME Owners', 'Foreign Investors', 'Startup Founders', 'Japanese Executives', 'Chinese Investors'].map((audience) => (
                <button
                  key={audience}
                  aria-pressed={targetAudience === audience}
                  onClick={() => onTargetAudienceChange(audience)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    targetAudience === audience ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-[#fbfbfa] text-[#6e6e68]'
                  }`}
                  type="button"
                >
                  {audience}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">CTA</span>
              <select
                value={cta}
                onChange={(event) => onCtaChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
              >
                {['Book consultation', 'Download checklist', 'Read full article', 'Contact office', 'Join newsletter'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Brand Voice</span>
              <select
                value={brandVoice}
                onChange={(event) => onBrandVoiceChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
              >
                {['Legal advisory', 'Accounting advisory', 'Executive summary', 'Plain-language educator'].map((voice) => (
                  <option key={voice}>{voice}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Output Quantity</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 5, 7].map((count) => (
                <button
                  key={count}
                  aria-pressed={postCount === count}
                  onClick={() => onPostCountChange(count)}
                  className={`h-8 rounded-lg border text-xs font-semibold ${
                    postCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#4f4f49]'
                  }`}
                  type="button"
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-[#4f4f49]">Word Count</div>
            <div className="grid grid-cols-3 gap-1.5">
              {[500, 1000, 1500].map((count) => (
                <button
                  key={count}
                  aria-pressed={wordCount === count}
                  onClick={() => onWordCountChange(count)}
                  className={`h-8 rounded-lg border text-xs font-semibold ${
                    wordCount === count ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#4f4f49]'
                  }`}
                  type="button"
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#171717]">Distribution Setup</span>
              <span className="text-[11px] font-semibold text-[#8a8a82]">Manual controlled</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="mb-1.5 text-[11px] font-semibold text-[#4f4f49]">Languages</div>
                <div className="flex flex-wrap gap-1.5">
                  {languageDisplayLabels.map((language) => {
                    const selected = languages.includes(language);

                    return (
                      <button
                        key={language}
                        aria-pressed={selected}
                        onClick={() => toggleManualSelection(language, languages, onLanguagesChange)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          selected ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
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
                <div className="mb-1.5 text-[11px] font-semibold text-[#4f4f49]">Platforms</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Facebook', 'LinkedIn', 'WordPress', 'Newsletter', 'TikTok'].map((platform) => {
                    const selected = platforms.includes(platform);

                    return (
                      <button
                        key={platform}
                        aria-pressed={selected}
                        onClick={() => toggleManualSelection(platform, platforms, onPlatformsChange)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          selected ? 'border-[#2f4f7f] bg-[#f4f7fd] text-[#2f4f7f]' : 'border-[#deded8] bg-white text-[#6e6e68]'
                        }`}
                        type="button"
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#4f4f49]">Image Layout</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Single', 'Grid', 'Carousel'].map((item) => (
                      <button
                        key={item}
                        aria-pressed={layout === item}
                        onClick={() => onLayoutChange(item)}
                        className={`h-8 rounded-lg border text-[11px] font-semibold ${
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
                  <div className="mb-1.5 text-[11px] font-semibold text-[#4f4f49]">Images</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[3, 6, 9, 12].map((count) => (
                      <button
                        key={count}
                        aria-pressed={imageCount === count}
                        onClick={() => onImageCountChange(count)}
                        className={`h-8 rounded-lg border text-[11px] font-semibold ${
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
        </section>

        <section className="space-y-3 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">AI Production Pipeline</h3>
              <p className="mt-1 text-xs text-[#6e6e68]">Text is generated first, then summarized into visual direction before images/layout.</p>
            </div>
            <span
              aria-label="OpenAI agents"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]"
              title="OpenAI agents"
            >
              <OpenAIIcon className="h-4 w-4" />
            </span>
          </div>

          <div className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#171717]">Source connectors</span>
              <span className="text-[11px] font-semibold text-[#8a8a82]">{sourceConnectors.length} active</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Knowledge Base', 'Google Drive', 'Obsidian', 'Official Link', 'Manual Upload'].map((source) => {
                const selected = sourceConnectors.includes(source);

                return (
                  <button
                    key={source}
                    aria-pressed={selected}
                    onClick={() => toggleManualSelection(source, sourceConnectors, onSourceConnectorsChange)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      selected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-[#deded8] bg-white text-[#6e6e68]'
                    }`}
                    type="button"
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {pipelineSteps.map((step, index) => (
              <article key={step.title} className="relative rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
                {index < pipelineSteps.length - 1 ? <div className="absolute left-6 top-[52px] h-5 w-px bg-[#deded8]" /> : null}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-white text-xs font-semibold text-[#4f4f49]">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#171717]">{step.title}</h4>
                      <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">{step.status}</span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#2f4f7f]">{step.agent}</div>
                    <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">{step.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Readiness & Preview</h3>
            <p className="mt-1 text-xs text-[#6e6e68]">Check whether this job is safe enough to generate text first.</p>
          </div>

          <div className="rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2f4f7f]">Readiness</div>
                <div className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-[#172033]">{readinessScore}%</div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2f4f7f]">
                {readinessScore >= 80 ? 'Ready soon' : 'Needs setup'}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-[#2f4f7f]" style={{ width: `${readinessScore}%` }} />
            </div>
            <p className={`mt-3 text-xs font-semibold ${manualReady ? 'text-emerald-700' : 'text-amber-700'}`}>
              Manual production gate: {manualReady ? 'ready to start Source Search' : 'blocked until required setup is complete'}.
            </p>
          </div>

          <div className="space-y-2">
            {readinessItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2 text-xs">
                <span className="font-semibold text-[#4f4f49]">{item.label}</span>
                <span className={`text-right font-semibold ${item.ready ? 'text-emerald-700' : 'text-amber-700'}`}>{item.ready ? item.detail : 'Missing'}</span>
              </div>
            ))}
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[#4f4f49]">Citation Strictness</span>
            <select
              value={citationStrictness}
              onChange={(event) => onCitationStrictnessChange(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#deded8] bg-white px-3 text-sm text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
            >
              {['Strict citations', 'Balanced citations', 'Light citations'].map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Selected output</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeLanguages.map((language) => (
                <Tag key={language}>{language}</Tag>
              ))}
              {activePlatforms.map((platform) => (
                <Tag key={platform}>{platform}</Tag>
              ))}
              <Tag>{layout}</Tag>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6e6e68]">
              {postCount} post(s), {imageCount} image option(s), {wordCount} words, {brandVoice}, CTA: {cta}.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            {category === 'PDPA' || category === 'Corporate Law'
              ? 'Medium risk: citation and human legal review are required before publishing.'
              : 'Low risk by default, but source citation is still required before generation.'}
          </div>

          <div className="rounded-2xl border border-[#deded8] bg-white p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Source Search preview</h4>
            <div className="mt-2 grid gap-2">
              {sourceSearchPreview.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
                  <div className="mt-1 text-xs font-semibold text-[#4f4f49]">{value}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6e6e68]">
              The next step will search sources for {category}, then generate text first. Image & Layout Agent will only start after the text becomes a visual brief.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
