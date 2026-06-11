'use client';

import { getFacebookLayoutGuideline } from '@/features/prd/config/create-post-workflow';
import { SectionKicker } from '@/features/prd/components/primitives/SectionKicker';
import { Tag } from '@/features/prd/components/primitives/Tag';
import { languageCodeLabelMap, normalizeLanguageCodes } from '@/features/prd/lib/review-display';
import type { GeneratedDraft } from '@/features/prd/types/content';

export function GenerationCreatePanel({
  brandVoice,
  category,
  citationStrictness,
  contentGoal,
  cta,
  imageCount,
  generatedDrafts,
  languages,
  layout,
  platforms,
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
  platforms: string[];
  sourceConnectors: string[];
  targetAudience: string;
  topic: string;
  wordCount: number;
}) {
  const draftLanguageCodes = normalizeLanguageCodes(languages, ['th']);
  const generatedDraftByCode = new Map(generatedDrafts.map((draft) => [draft.languageCode, draft]));
  const draftLanguages = draftLanguageCodes.map((languageCode) => languageCodeLabelMap[languageCode]);
  const activePlatforms = platforms.length > 0 ? platforms : ['Facebook'];
  const activeSources = sourceConnectors.length > 0 ? sourceConnectors : ['Knowledge Base'];
  const complianceAgent = 'Legal Compliance Agent';
  const facebookLayoutGuideline = getFacebookLayoutGuideline(layout, activePlatforms);
  const generationStages = [
    {
      title: '1. Generate Text',
      agent: 'Content Strategy Agent',
      detail: `${wordCount} words on “${topic}” for ${targetAudience}, goal: ${contentGoal}, CTA: ${cta}.`,
    },
    {
      title: '2. Compliance Pass',
      agent: complianceAgent,
      detail: `${citationStrictness} using ${activeSources.join(', ')} before image work starts.`,
    },
    {
      title: '3. Create Visual Brief',
      agent: 'Image & Layout Agent',
      detail: `Summarize approved text into scene, mood, objects, overlay, and ${brandVoice.toLowerCase()} constraints.`,
    },
    {
      title: '4. Compose Assets',
      agent: 'Image & Layout Agent',
      detail: `Generate ${imageCount} image option(s), crop for ${activePlatforms.join(', ')}, and compose ${layout.toLowerCase()} layout.`,
    },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.74fr)_minmax(600px,1.9fr)_minmax(270px,0.86fr)] xl:items-start">
        <section className="min-w-0 rounded-[26px] border border-[#deded8] bg-[#fbfbfa] p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Content Context</h3>
              <p className="mt-1 text-xs text-[#6e6e68]">Category, audience, goal, and channels used by the text agent.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfd8ea] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2f4f7f] shadow-[0_1px_0_rgba(255,255,255,0.9)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1f5eff] text-[10px] font-bold text-white">3</span>
              Generation
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {[
              ['Category', category],
              ['Audience', targetAudience],
              ['Goal', contentGoal],
              ['Brand voice', brandVoice],
              ['CTA', cta],
              ['Word target', `${wordCount} words`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
                <div className="mt-1 text-xs font-semibold leading-relaxed text-[#171717]">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Output targets</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {draftLanguages.map((language) => (
              <Tag key={language}>{language}</Tag>
            ))}
              {activePlatforms.map((platform) => (
                <Tag key={platform}>{platform}</Tag>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-[28px] border border-[#cfd8ea] bg-white p-5 shadow-[0_12px_34px_rgba(47,79,127,0.10)]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e8e8e4] pb-4">
            <div>
              <SectionKicker>Generation</SectionKicker>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">Generated Text</h3>
              <p className="mt-1 text-xs text-[#6e6e68]">Content Strategy Agent generates text first. Images and layout wait for this approved text package.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Draft template – not AI generated
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {draftLanguageCodes.map((languageCode) => (
              <article key={languageCode} className="min-w-0 rounded-[24px] border border-[#deded8] bg-gradient-to-br from-[#fbfbfa] via-white to-[#f4f7fd] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[#171717]">{languageCodeLabelMap[languageCode]} draft</h4>
                  <span className="rounded-full border border-[#deded8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4f4f49]">Agent draft</span>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-[#304463]">
                  {generatedDraftByCode.get(languageCode)?.body ? (
                    generatedDraftByCode.get(languageCode)?.body
                  ) : (
                    <span className="text-amber-700">
                      Draft is not available yet. Please run text generation (Step 2) before proceeding to this step.
                    </span>
                  )}
                </p>
                <div className="mt-3 rounded-xl border border-[#deded8] bg-white p-3 text-xs leading-relaxed text-[#6e6e68]">
                  Suggested hook, caption body, CTA ({cta}), hashtags, and citation notes from {activeSources.join(', ')} are bundled for reviewer edits.
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-[22px] border border-[#d7e1f4] bg-[#f4f7fd] p-4 text-xs leading-relaxed text-[#2f4f7f]">
            Visual handoff after text: summarize the approved copy into scene, mood, objects, overlay guidance, brand-safe imagery, and {layout.toLowerCase()} platform composition before image generation starts.
          </div>
        </section>

        <section className="min-w-0 rounded-[26px] border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Selected Conditions</h3>
            <p className="mt-1 text-xs text-[#6e6e68]">Generation gates that must pass before asset composition.</p>
          </div>

          <div className="mt-4 space-y-3">
            {generationStages.map((stage) => (
              <article key={stage.title} className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3 transition-colors hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[#171717]">{stage.title}</h4>
                    <p className="mt-1 text-[11px] font-semibold text-[#2f4f7f]">{stage.agent}</p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Pass</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">{stage.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <h4 className="text-xs font-semibold text-[#171717]">Rules selected</h4>
            <div className="mt-2 space-y-2">
              {[
                ['Citation', citationStrictness],
                ['Sources', activeSources.join(', ')],
                ['Images', `${imageCount} option(s)`],
                ['Layout', layout],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 rounded-xl border border-[#deded8] bg-white px-3 py-2 text-xs">
                  <span className="font-semibold text-[#4f4f49]">{label}</span>
                  <span className="text-right font-semibold text-[#171717]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {facebookLayoutGuideline ? (
            <div className="mt-4 rounded-2xl border border-[#d7e1f4] bg-[#f4f7fd] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-[#172033]">Facebook layout enforcement</h4>
                  <p className="mt-1 text-[11px] font-semibold text-[#2f4f7f]">{facebookLayoutGuideline.title}</p>
                </div>
                <span className="rounded-full border border-[#cfd8ea] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#2f4f7f]">
                  Locked
                </span>
              </div>
              <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-[#4d6281]">
                <p>
                  <span className="font-semibold text-[#172033]">Size:</span> {facebookLayoutGuideline.size}
                </p>
                <p>
                  <span className="font-semibold text-[#172033]">Rule:</span> {facebookLayoutGuideline.guardrail}
                </p>
                <p>
                  <span className="font-semibold text-[#172033]">Asset Composer:</span> {facebookLayoutGuideline.composerRule}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
            Compliance pass means image generation is allowed only after the generated text, citations, and professional rules are clean enough for the review package.
          </div>
        </section>
      </div>
    </div>
  );
}
