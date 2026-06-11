'use client';

import { ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RiskBadge } from '@/features/prd/components/primitives/RiskBadge';
import { Tag } from '@/features/prd/components/primitives/Tag';
import { buildReviewDraftTitle, languageCodeLabelMap, normalizeLanguageCodes } from '@/features/prd/lib/review-display';
import {
  buildReviewIdMatchSignatures,
  buildReviewQueueTargetMatchSignatures,
  hasReviewQueueTargetMatch,
  sortReviewQueueItems,
} from '@/features/prd/lib/review-queue-match';
import { normalizeTextValue } from '@/features/prd/lib/text';
import { getDashboardIdForWorkflowId } from '@/features/prd/lib/workflow-ids';
import { normalizeBoardRisk, type BoardItem } from '@/features/prd/types/board';
import type { ReviewDecision, ReviewQueueItem } from '@/features/prd/types/review-queue';

const complianceFindings = [
  { label: 'Legal claim needs citation', severity: 'High', source: 'PDPA Guideline section 24' },
  { label: 'Translation meaning drift', severity: 'Medium', source: 'Thai vs English paragraph 2' },
  { label: 'Brand tone is acceptable', severity: 'Low', source: 'Rules & Brand voice policy' },
  { label: 'No prohibited guarantee language', severity: 'Low', source: 'Claim restriction policy' },
];

function ReviewLanguagePanel({ body, language, title }: { body: string; language: string; title: string }) {
  const displayTitle = normalizeTextValue(title);
  const displayBody = normalizeTextValue(body);

  return (
    <div className="min-h-[320px] p-4 sm:min-h-[360px] lg:min-h-[430px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
          {language}
        </span>
        <button
          className="cursor-not-allowed rounded-lg border border-[#deded8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#8a8a82] opacity-50"
          type="button"
          disabled
          title="Edit not available in this view"
        >
          Edit
        </button>
      </div>
      <input
        className="mb-3 h-10 w-full rounded-lg border border-[#deded8] bg-[#fbfbfa] px-3 text-sm font-semibold text-[#171717] outline-none ring-[#2f4f7f] focus:ring-1"
        defaultValue={displayTitle}
      />
      <textarea
        className="min-h-[190px] w-full resize-none rounded-xl border border-[#deded8] bg-white p-3 text-sm leading-relaxed text-[#2f3a4b] outline-none ring-[#2f4f7f] focus:ring-1 sm:min-h-[230px] lg:min-h-[290px]"
        defaultValue={displayBody}
      />
    </div>
  );
}

function ComplianceFinding({ finding }: { finding: (typeof complianceFindings)[number] }) {
  const styles: Record<string, string> = {
    High: 'border-rose-200 bg-rose-50 text-rose-800',
    Medium: 'border-amber-200 bg-amber-50 text-amber-800',
    Low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };

  return (
    <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-xs font-semibold leading-relaxed text-[#171717]">{finding.label}</div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>
      <div className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">Source: {finding.source}</div>
    </div>
  );
}

const REVIEW_TABS = ['Awaiting review', 'Risk flagged', 'Approved'] as const;

export function ReviewQueueView({
  items,
  error = '',
  targetReviewItemId,
  actorDisplayName,
  activeTab,
  onNoopAction,
  onReviewDecision,
  onRequestReviewDecision,
  onOpenContentJob,
  onTabChange,
}: {
  items: ReviewQueueItem[];
  loading?: boolean;
  error?: string;
  targetReviewItemId?: string | null;
  actorDisplayName?: string;
  activeTab?: string;
  onNoopAction: (message: string) => void;
  onReviewDecision: (item: ReviewQueueItem, decision: ReviewDecision) => void;
  onRequestReviewDecision: (item: ReviewQueueItem, decision: ReviewDecision, reason: string, applyDecision: () => void) => void;
  onOpenContentJob: (id: string) => void;
  onTabChange?: (tab: string) => void;
}) {
  const [selectedReviewItemId, setSelectedReviewItemId] = useState(items[0]?.id ?? '');
  const [reviewDecision, setReviewDecision] = useState<'pending' | 'approved' | 'rejected' | 'queued'>('pending');
  const [reviewReason, setReviewReason] = useState('Citations match the PDPA guideline and translation meaning is consistent across Thai, English, and Chinese.');
  const [reviewQueueSearch, setReviewQueueSearch] = useState('');
  const targetReviewItem = useMemo(() => {
    if (!targetReviewItemId) {
      return null;
    }

    const targetMatchSignatures = buildReviewIdMatchSignatures(targetReviewItemId);

    return (
      items.find((item) => {
        return hasReviewQueueTargetMatch(item, targetMatchSignatures);
      }) ?? null
    );
  }, [items, targetReviewItemId]);
  const orderedReviewItems = useMemo(() => {
    const sorted = sortReviewQueueItems(items);
    if (!targetReviewItem) {
      return sorted;
    }

    const targetSignatures = buildReviewQueueTargetMatchSignatures([
      targetReviewItem.id,
      targetReviewItem.workflowId,
      targetReviewItem.publishingId,
    ]);

    return [
      targetReviewItem,
      ...sorted.filter((item) => !hasReviewQueueTargetMatch(item, targetSignatures)),
    ];
  }, [items, targetReviewItem]);
  const activeReviewTab = activeTab ?? 'Awaiting review';
  const tabFilteredItems = useMemo(() => {
    if (activeReviewTab === 'Risk flagged') {
      return orderedReviewItems.filter((item) => item.risk === 'High' || item.risk === 'Medium');
    }
    if (activeReviewTab === 'Approved') {
      return orderedReviewItems.filter((item) => item.status === 'Approved');
    }
    return orderedReviewItems.filter((item) => item.status !== 'Approved');
  }, [orderedReviewItems, activeReviewTab]);
  const reviewQueueSearchQuery = reviewQueueSearch.trim().toLowerCase();
  const reviewQueueItems = useMemo(() => {
    if (!reviewQueueSearchQuery) {
      return tabFilteredItems;
    }

    return tabFilteredItems.filter((item) => {
      const searchable = [
        item.id,
        item.title,
        item.workflowId,
        item.publishingId,
        item.owner,
        item.category,
        item.createdBy,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(reviewQueueSearchQuery);
    });
  }, [tabFilteredItems, reviewQueueSearchQuery]);
  const selectedReviewItem = targetReviewItem ?? reviewQueueItems.find((item) => item.id === selectedReviewItemId) ?? tabFilteredItems[0] ?? null;

  if (!selectedReviewItem) {
    return (
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {REVIEW_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange?.(tab)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                activeReviewTab === tab
                  ? 'bg-[#171717] text-white'
                  : 'border border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f6f6f2]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-[#deded8] bg-white p-4 text-sm text-[#6e6e68]">
          No items in &ldquo;{activeReviewTab}&rdquo;.
        </div>
      </div>
    );
  }
  const effectiveReviewReason = targetReviewItem
    ? `Focused from Dashboard: check ${targetReviewItem.id} before moving the same content item forward. ${reviewReason}`
    : reviewReason;
  const reviewPackageLanguageCodes = normalizeLanguageCodes(selectedReviewItem.languages, ['th', 'en', 'zh']);
  const reviewPackageLanguages = reviewPackageLanguageCodes.map((languageCode) => languageCodeLabelMap[languageCode]);
  const reviewPackagePlatforms = selectedReviewItem.platforms?.length ? selectedReviewItem.platforms : ['Facebook', 'LinkedIn'];
  const reviewPackageSources = selectedReviewItem.sourceConnectors?.length ? selectedReviewItem.sourceConnectors : ['Knowledge Base', 'Internal advisory guideline', `${selectedReviewItem.owner} handoff package`];
  const reviewDraftByLanguage = new Map((selectedReviewItem.generatedDrafts ?? []).map((draft) => [draft.languageCode, draft]));
  const reviewPackageMeta = [
    ['Workflow', selectedReviewItem.workflowId ?? getDashboardIdForWorkflowId(selectedReviewItem.id)],
    [
      'Mode',
      selectedReviewItem.mode === 'quick'
        ? 'Quick Mode'
        : selectedReviewItem.mode === 'manual'
          ? 'Manual Mode'
          : 'Manual/Quick',
    ],
    ['Goal', selectedReviewItem.contentGoal ?? 'Educate & Lead'],
    ['Audience', selectedReviewItem.targetAudience ?? 'SME Owners'],
    ['CTA', selectedReviewItem.cta ?? 'Book consultation'],
    ['Brand', selectedReviewItem.brandVoice ?? 'Legal advisory'],
    ['Citation', selectedReviewItem.citationStrictness ?? 'Strict citations'],
    ['Layout', selectedReviewItem.layout ?? 'Carousel'],
    ['Platforms', reviewPackagePlatforms.join(', ')],
    ['Assets', `${(selectedReviewItem.selectedAssets ?? []).length || selectedReviewItem.imageCount || 0} selected`],
  ];
  const selectedReviewSources = reviewPackageSources.map((source) => `${source} · ${selectedReviewItem.category} evidence`);
  const selectedReviewDrafts = reviewPackageLanguageCodes.map((languageCode) => ({
    language: languageCodeLabelMap[languageCode],
    title: normalizeTextValue(reviewDraftByLanguage.get(languageCode)?.title ?? `${normalizeTextValue(selectedReviewItem.category) || 'Review'}: ${buildReviewDraftTitle(selectedReviewItem.category, selectedReviewItem.title)}`),
    body: normalizeTextValue(
      reviewDraftByLanguage.get(languageCode)?.body ??
        `Draft content is not available for ${languageCodeLabelMap[languageCode]}. Open the original Create workflow and generate Step 3 before review.`
    ),
  }));
  const decisionMeta = {
    pending: { label: 'Awaiting decision', tone: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]', detail: 'No human decision has been recorded yet.' },
    approved: { label: 'Approved', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800', detail: 'Content passed human review and is ready for creative or publishing queue.' },
    rejected: { label: 'Rejected', tone: 'border-rose-200 bg-rose-50 text-rose-800', detail: 'Content must be revised before it can continue in the workflow.' },
    queued: { label: 'Auto queued', tone: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]', detail: 'Content was approved for automatic scheduling after review.' },
  }[reviewDecision];
  const canMoveFromReviewQueue = normalizeTextValue(actorDisplayName) === 'Agent Orchestrator';
  const recordReviewDecision = (decision: ReviewDecision) => {
    if (!canMoveFromReviewQueue) {
      onNoopAction(`Only Agent Orchestrator can move ${selectedReviewItem.id} from In Review.`);
      return;
    }

    const reason = effectiveReviewReason.trim();
    if (decision === 'rejected' && !reason) {
      onNoopAction(`Reject requires reviewer reason for ${selectedReviewItem.id}`);
      return;
    }

    onRequestReviewDecision(selectedReviewItem, decision, reason, () => {
      setReviewDecision(decision);
      onNoopAction(`Review decision recorded for ${selectedReviewItem.id}: ${decision}`);
      onReviewDecision(selectedReviewItem, decision);
    });
  };
  const selectReviewItem = (item: ReviewQueueItem) => {
    setSelectedReviewItemId(item.id);
    setReviewDecision('pending');
    setReviewReason(`Reviewing ${buildReviewDraftTitle(item.category, item.title)}. Check citations, claim risk, translation consistency, and asset handoff before approval.`);
    onNoopAction(`Open review item ${item.id}`);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_1fr_340px]">
      <aside className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="border-b border-[#e8e8e4] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">In Review</h2>
          <p className="mt-1 text-xs text-[#6e6e68]">Human-in-the-loop queue for lawyers and accountants.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {REVIEW_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange?.(tab)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeReviewTab === tab
                    ? 'bg-[#171717] text-white'
                    : 'border border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f6f6f2]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {error ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
              {error}
            </div>
          ) : null}
        </div>

      <div className="divide-y divide-[#e8e8e4]">
          {reviewQueueItems.map((item) => (
            <button
              key={item.id}
              onClick={() => selectReviewItem(item)}
              className={`w-full p-3 text-left hover:bg-[#fbfbfa] ${selectedReviewItem.id === item.id ? 'bg-[#f6f6f2]' : ''}`}
              type="button"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#8a8a82]">{item.id}</span>
                <RiskBadge risk={item.risk as BoardItem['risk']} />
              </div>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#171717]">{item.title}</h3>
              <p className="mt-1 text-[11px] text-[#6e6e68]">
                {(item.mode === 'quick' ? 'Quick Mode' : item.mode === 'manual' ? 'Manual Mode' : 'Manual / Quick')} ·{' '}
                {item.workflowId ?? item.id}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Tag>{item.category}</Tag>
                <Tag>{item.due}</Tag>
              </div>
              <div className="mt-2 text-[11px] text-[#6e6e68]">{item.owner} · {item.status}</div>
            </button>
          ))}
        </div>
          {targetReviewItemId ? (
            <div className="mt-3 mb-2 rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-[11px] font-semibold text-[#2f4f7f]">
              {targetReviewItem
                ? `Focused from Dashboard: ${targetReviewItem.id}`
                : `Focused from Dashboard: ${targetReviewItemId} has not entered Review Queue yet.`}
            </div>
          ) : null}
          <label className="mt-3 mb-4 flex h-9 items-center gap-2 rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 text-xs text-[#6e6e68]">
            <Search className="h-3.5 w-3.5" />
            <input
              value={reviewQueueSearch}
              onChange={(event) => setReviewQueueSearch(event.target.value)}
              aria-label="Search review queue"
              className="min-w-0 flex-1 bg-transparent text-xs text-[#171717] outline-none placeholder:text-[#8a8a82]"
              placeholder="Search review queue..."
            />
          </label>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#171717]">Split-view editor</h2>
              <RiskBadge risk={normalizeBoardRisk(selectedReviewItem.risk)} />
            </div>
            <p className="mt-0.5 text-xs text-[#6e6e68]">
              {selectedReviewItem.id} · {selectedReviewItem.title}
            </p>
          </div>
          <button
            onClick={() => onNoopAction(`Run legal/tax compliance check for ${selectedReviewItem.id}`)}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2] sm:w-auto"
            type="button"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Check Legal/Tax Compliance
          </button>
          <button
            onClick={() => onOpenContentJob(selectedReviewItem.workflowId ?? selectedReviewItem.id)}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#171717] px-3 text-xs font-semibold text-white hover:bg-[#2f2f2b] sm:w-auto"
            type="button"
          >
            Open job detail
          </button>
        </div>

        <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Create Post package handoff</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">
                Package metadata from Create Post travels with this review item so legal/tax reviewers can verify the original intent, sources, audience, and publishing target.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {reviewPackageLanguages.map((language) => (
                <Tag key={language}>{language}</Tag>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {reviewPackageMeta.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#deded8] bg-white px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
                <div className="mt-1 truncate text-xs font-semibold text-[#171717]">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-xl border border-[#d7e1f4] bg-white p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Visual brief</div>
              <p className="mt-1 text-xs leading-relaxed text-[#4f4f49]">
                {normalizeTextValue(selectedReviewItem.visualBrief) || 'Visual brief pending. Image & Layout Agent will summarize approved text before asset generation.'}
              </p>
              {normalizeTextValue(selectedReviewItem.creativeSummary) ? (
                <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">
                  Creative summary: {normalizeTextValue(selectedReviewItem.creativeSummary)}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl border border-[#deded8] bg-white p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Selected assets</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(selectedReviewItem.selectedAssets?.length ? selectedReviewItem.selectedAssets : ['Pending asset selection']).map((asset) => {
                  const isUrl = asset.startsWith('http');
                  return isUrl ? (
                    <div key={asset} className="h-12 w-12 overflow-hidden rounded-lg border border-[#deded8] bg-[#fbfbfa]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic review asset URLs */}
                      <img src={asset} alt="Selected asset" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <Tag key={asset}>{asset}</Tag>
                  );
                })}
              </div>

              {selectedReviewItem.generatedAssets && selectedReviewItem.generatedAssets.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {selectedReviewItem.generatedAssets
                    .filter((a) =>
                      !a.isPlaceholder &&
                      (a.assetType === 'image' ||
                        a.assetType === 'thumbnail' ||
                        a.assetType === 'carousel_slide' ||
                        Boolean(a.url) ||
                        Boolean(a.storagePath))
                    )
                    .map((asset, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-lg border border-[#e8e8e4] bg-[#fbfbfa]">
                        {asset.url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- dynamic generated asset URLs
                          <img
                            src={asset.url}
                            alt={asset.altText || 'Asset'}
                            className="aspect-square w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square w-full items-center justify-center text-[10px] text-[#8a8a82]">
                            {asset.storagePath ? 'Stored' : 'No URL'}
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 p-1 text-[9px] text-white transition-transform group-hover:translate-y-0">
                          {asset.assetType}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {selectedReviewItem.generatedAssets?.some((asset) => asset.isPlaceholder || asset.availabilityStatus === 'pending') ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] leading-relaxed text-amber-800">
                  Real image output is still pending. Review stays attached to the live asset job and will use the generated image once `content_assets.url` or storage output is available.
                </div>
              ) : null}

              {normalizeTextValue(selectedReviewItem.degradedMessage) ? (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-[11px] leading-relaxed text-rose-700">
                  {normalizeTextValue(selectedReviewItem.degradedMessage)}
                </div>
              ) : null}

              <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">
                {selectedReviewItem.assetComposerStatus ?? 'Asset Composer status will appear here after Create Post packaging.'}
              </p>
              {normalizeTextValue(selectedReviewItem.approvalRecommendation) ? (
                <p className="mt-2 text-[11px] leading-relaxed text-[#4f4f49]">
                  Approval recommendation: {normalizeTextValue(selectedReviewItem.approvalRecommendation)}
                </p>
              ) : null}
              {normalizeTextValue(selectedReviewItem.requiredFix) ? (
                <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">
                  Required fix: {normalizeTextValue(selectedReviewItem.requiredFix)}
                </p>
              ) : null}
              <p className="mt-1 text-[11px] font-semibold text-[#4f4f49]">
                Selected assets attached: {selectedReviewItem.selectedAssets?.length ? selectedReviewItem.selectedAssets.join(', ') : 'none yet'}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-[#e8e8e4] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {selectedReviewDrafts.map((draft) => (
            <ReviewLanguagePanel key={draft.language} language={draft.language} title={draft.title} body={draft.body} />
          ))}
        </div>

        <div className="border-t border-[#e8e8e4] bg-[#fbfbfa] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">Referenced sources</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {selectedReviewSources.map((source) => (
              <div key={source} className="rounded-xl border border-[#deded8] bg-white p-3 text-xs font-medium text-[#4f4f49]">
                {source}
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">AI Compliance Checker</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">Checks citations, legal/tax claims, translation consistency, and prohibited guarantee wording.</p>
              <p className="mt-1 text-[11px] italic text-[#8a8a82]">Sample findings — not post-specific</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {complianceFindings.map((finding) => (
              <ComplianceFinding key={finding.label} finding={finding} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">Decision actions</h2>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-[#4f4f49]">Reviewer reason / notes</span>
            <textarea
              value={effectiveReviewReason}
              onChange={(event) => setReviewReason(event.target.value)}
              className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#deded8] bg-white p-3 text-xs leading-relaxed text-[#171717] outline-none ring-[#2f4f7f] placeholder:text-[#8a8a82] focus:ring-1"
              placeholder="Explain why this content is approved, rejected, or queued..."
            />
          </label>
          <div className="mt-3 rounded-xl border border-[#deded8] bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#171717]">Decision summary</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${decisionMeta.tone}`}>{decisionMeta.label}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#6e6e68]">{decisionMeta.detail}</p>
            {reviewDecision !== 'pending' ? (
              <div className="mt-3 rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] p-2 text-[11px] leading-relaxed text-[#4f4f49]">
                Audit trail: Managing Partner recorded “{decisionMeta.label}” with reviewer notes. This event is ready to sync into system logs.
              </div>
            ) : null}
          </div>
          {!canMoveFromReviewQueue ? (
            <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 text-[11px] leading-relaxed text-rose-800">
              Only Agent Orchestrator can move this item out of In Review.
            </div>
          ) : null}
          <div className="mt-3 space-y-2">
            <button
              onClick={() => recordReviewDecision('approved')}
              disabled={!canMoveFromReviewQueue}
              className={`flex h-10 w-full items-center justify-between rounded-lg border border-emerald-200 px-3 text-sm font-semibold ${
                canMoveFromReviewQueue ? 'bg-emerald-50 text-emerald-800 hover:bg-white' : 'cursor-not-allowed bg-emerald-100 text-emerald-700'
              }`}
              type="button"
            >
              Approve
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => recordReviewDecision('rejected')}
              disabled={!canMoveFromReviewQueue}
              className={`flex h-10 w-full items-center justify-between rounded-lg border border-rose-200 px-3 text-sm font-semibold ${
                canMoveFromReviewQueue ? 'bg-rose-50 text-rose-800 hover:bg-white' : 'cursor-not-allowed bg-rose-100 text-rose-700'
              }`}
              type="button"
            >
              Reject
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => recordReviewDecision('queued')}
              disabled={!canMoveFromReviewQueue}
              className={`flex h-10 w-full items-center justify-between rounded-lg border border-[#cfd8ea] px-3 text-sm font-semibold ${
                canMoveFromReviewQueue ? 'bg-[#f4f7fd] text-[#2f4f7f] hover:bg-white' : 'cursor-not-allowed bg-[#f7f9fd] text-[#6f7380]'
              }`}
              type="button"
            >
              Auto Queue
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}

