'use client';

import { Plus, X } from 'lucide-react';
import { SectionKicker } from '@/features/prd/components/primitives/SectionKicker';
import { Tag } from '@/features/prd/components/primitives/Tag';
import { getLanguageDisplayLabels } from '@/features/prd/lib/review-display';

export function SourceSearchCreatePanel({
  brandVoice,
  category,
  citationStrictness,
  contentGoal,
  cta,
  languages,
  mode,
  onSourceConnectorsChange,
  onOfficialSourceLinksChange,
  platforms,
  officialSourceLinks,
  sourceConnectors,
  targetAudience,
  topic,
}: {
  brandVoice: string;
  category: string;
  citationStrictness: string;
  contentGoal: string;
  cta: string;
  languages: string[];
  mode: 'manual' | 'quick';
  onSourceConnectorsChange: (values: string[]) => void;
  onOfficialSourceLinksChange: (values: string[]) => void;
  platforms: string[];
  officialSourceLinks: string[];
  sourceConnectors: string[];
  targetAudience: string;
  topic: string;
}) {
  const sourceConnectorOptions = ['Knowledge Base', 'Google Drive', 'Obsidian', 'Official Link', 'Manual Upload', 'Auto Search'];
  const hasAutoSearch = sourceConnectors.includes('Auto Search');
  const sourceTopic =
    topic.trim() ||
    (hasAutoSearch
      ? `${contentGoal} in ${category} for ${targetAudience} (auto trend scope in Thailand)`
      : `${category} advisory content for ${targetAudience}`);
  const activeLanguages = getLanguageDisplayLabels(languages);
  const activePlatforms = platforms.length > 0 ? platforms : ['Facebook'];
  const activeSources = sourceConnectors.length > 0 ? sourceConnectors : [];
  const hasOfficialLink = sourceConnectors.includes('Official Link');
  const sourceLinksInput = officialSourceLinks.length > 0 ? officialSourceLinks : [''];
  const officialSourceTrimmed = officialSourceLinks.map((link) => link.trim()).filter((link) => link.length > 0);
  const sourceCardsInput = activeSources.length > 0 ? activeSources : ['Knowledge Base'];
  const sourceSearchSummary = activeSources.length > 0 ? activeSources.join(', ') : 'No source selected yet';
  const sourceLinkSummary = hasOfficialLink
    ? officialSourceTrimmed.length > 0
      ? officialSourceTrimmed.join(', ')
      : 'No official links added yet'
    : 'Not using official links';
  const sourceCards = sourceCardsInput.map((source, index) => ({
    title: source,
    detail:
      source === 'Knowledge Base'
        ? `${category} internal notes matched to ${targetAudience} and ${brandVoice}.`
        : source === 'Official Link'
            ? hasOfficialLink
              ? officialSourceTrimmed.length > 0
                ? `Official references from links (${officialSourceTrimmed.length}): ${officialSourceTrimmed.join(', ')}`
                : 'Official link selected. Add at least one official URL before generation.'
              : `Official reference queued for ${citationStrictness.toLowerCase()} and claim boundaries.`
          : source === 'Auto Search'
            ? 'AI will pull Thai trend signals from public sources and surface the most relevant references for this topic before drafting.'
            : source === 'Google Drive'
              ? `Drive folder will be searched for briefs, memos, and approved advisory material.`
              : source === 'Obsidian'
                ? `Obsidian notes will supply internal context before drafting starts.`
                : `Manual upload will be treated as required evidence before generation.`,
    confidence: `${96 - index * 4}%`,
  }));
  const updateOfficialSourceLink = (index: number, value: string) => {
    const nextLinks = sourceLinksInput.map((link, linkIndex) => (linkIndex === index ? value : link));
    onOfficialSourceLinksChange(nextLinks);
  };
  const addOfficialSourceLink = () => {
    onOfficialSourceLinksChange([...sourceLinksInput, '']);
  };
  const removeOfficialSourceLink = (index: number) => {
    const nextLinks = sourceLinksInput.filter((_, linkIndex) => linkIndex !== index);

    onOfficialSourceLinksChange(nextLinks.length > 0 ? nextLinks : ['']);
  };
  const handoffItems = [
    ['Mode', mode === 'quick' ? 'Quick AI Mode' : 'Manual Setup'],
    ['Goal', contentGoal],
    ['Audience', targetAudience],
    ['CTA', cta],
    ['Brand voice', brandVoice],
    ['Citation', citationStrictness],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionKicker>Step 2 / Source Search</SectionKicker>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#171717]">Reference set prepared from your setup</h3>
            <p className="mt-1 text-[11px] font-medium text-amber-600">Source preview — no search run yet</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#304463]">
              {mode === 'quick'
                ? 'Quick AI Mode will keep the setup lightweight, but source search still follows the selected languages, platforms, and citation rule.'
                : 'Manual Setup uses the same source-search workspace as Quick AI Mode, with the brief, audience, CTA, source connectors, and citation strictness already carried into this step.'}
            </p>
          </div>
          <div className="rounded-xl border border-[#cfd8ea] bg-white p-3 text-xs leading-relaxed text-[#2f4f7f]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6c7fa0]">Topic anchor</span>
            <span className="mt-1 block text-lg font-semibold leading-snug tracking-[-0.02em] text-[#172033]">{sourceTopic}</span>
          </div>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {handoffItems.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#deded8] bg-white p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
            <div className="mt-1 text-sm font-semibold text-[#171717]">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-[#deded8] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-[#171717]">Source connectors for Source Search</h4>
            <p className="mt-1 text-xs text-[#6e6e68]">
              {mode === 'quick'
                ? 'Use the same connector selection that Quick AI Mode will hand into generation.'
                : 'Manual Setup now uses the same connector controls here, so you can adjust the source package before Generate Text.'}
            </p>
          </div>
          <span className="rounded-full border border-[#d7e1f4] bg-[#f4f7fd] px-2.5 py-1 text-[11px] font-semibold text-[#2f4f7f]">{activeSources.length} selected</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sourceConnectorOptions.map((source) => {
            const selected = sourceConnectors.includes(source);

            return (
              <button
                key={source}
                aria-pressed={selected}
                onClick={() =>
                  onSourceConnectorsChange(selected ? sourceConnectors.filter((item) => item !== source) : [...sourceConnectors, source])
                }
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
        {activeSources.length === 0 ? <p className="mt-2 text-xs font-semibold text-rose-700">Select at least one source before moving to Generate Text.</p> : null}
      </section>

      {hasOfficialLink ? (
        <section className="rounded-2xl border border-[#cfd8ea] bg-[#f4f7fd] p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-[#171717]">Official source links</h4>
              <p className="mt-1 text-xs text-[#5d6f8f]">Add at least one official URL for the Source Search package before Generate Text runs.</p>
            </div>
            <button
              onClick={addOfficialSourceLink}
              className="inline-flex items-center gap-1 rounded-full border border-[#d7e1f4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2f4f7f] hover:bg-[#e5edff]"
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              Add link
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {sourceLinksInput.map((link, index) => (
              <div key={`${link}-${index}`} className="rounded-xl border border-[#d7e1f4] bg-white p-2.5">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6c7fa0]">
                    Official link URL {index + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      value={link}
                      onChange={(event) => updateOfficialSourceLink(index, event.target.value)}
                      type="url"
                      className="h-9 flex-1 rounded-lg border border-[#d7e1f4] bg-[#fbfbfa] px-3 text-xs outline-none ring-[#2f4f7f] focus:ring-1"
                      placeholder="https://example.com/official-source"
                    />
                    <button
                      onClick={() => removeOfficialSourceLink(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7e1f4] bg-[#fbfbfa] text-[#8b8b84] hover:bg-[#f4f7fd]"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sourceCards.map((source) => (
          <article key={source.title} className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-[#171717]">{source.title}</h4>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{source.confidence}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">{source.detail}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-[#171717]">Citation and generation checklist</h4>
            <p className="mt-1 text-xs text-[#6e6e68]">These requirements will be handed to Generate Text before any image work begins.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activePlatforms.map((platform) => (
              <Tag key={platform}>{platform}</Tag>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {[
            `Languages prepared: ${activeLanguages.join(', ')}`,
            `Platforms prepared: ${activePlatforms.join(', ')}`,
            `Source connectors: ${sourceSearchSummary}`,
            `Official source URLs: ${sourceLinkSummary}`,
            `Citation rule: ${citationStrictness}`,
            `Audience: ${targetAudience}`,
            `CTA: ${cta}`,
            'No exaggerated professional claims',
            'High-risk claim routes to Review Queue',
          ].map((item) => (
            <div key={item} className="rounded-xl border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49]">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
