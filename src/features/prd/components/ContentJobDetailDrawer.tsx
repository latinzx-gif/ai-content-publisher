'use client';

import { X } from 'lucide-react';
import { WorkflowStatusSyncPanel } from '@/features/prd/components/WorkflowStatusSyncPanel';
import { RiskBadge } from '@/features/prd/components/primitives/RiskBadge';
import { Tag } from '@/features/prd/components/primitives/Tag';
import { dashboardLifecycleStages } from '@/features/prd/config/dashboard-lifecycle';
import { normalizeTextValue } from '@/features/prd/lib/text';
import type { ContentJobDetail } from '@/features/prd/types/content-job';

export type ContentJobDetailDrawerProps = {
  detail: ContentJobDetail;
  onClose: () => void;
  onOpenDashboard: () => void;
  onOpenReview: () => void;
  onOpenPublishing: () => void;
  onOpenLogs: () => void;
  onDelete: () => void;
  deleteLoading?: boolean;
};

export function ContentJobDetailDrawer({
  detail,
  onClose,
  onOpenDashboard,
  onOpenReview,
  onOpenPublishing,
  onOpenLogs,
  onDelete,
  deleteLoading,
}: ContentJobDetailDrawerProps) {
  const currentStage = detail.statusSnapshot.canonicalStage;
  const currentIndex = (dashboardLifecycleStages as readonly string[]).indexOf(currentStage);
  const generatedDrafts = detail.reviewItem?.generatedDrafts?.length ? detail.reviewItem.generatedDrafts : detail.boardItem?.generatedDrafts ?? [];
  const generatedDraftCount = generatedDrafts.length;
  const selectedAssets =
    detail.reviewItem?.selectedAssets?.length ? detail.reviewItem.selectedAssets : detail.boardItem?.selectedAssets ?? [];
  const generatedAssets =
    detail.reviewItem?.generatedAssets?.length ? detail.reviewItem.generatedAssets : detail.boardItem?.generatedAssets ?? [];
  const realImageAssets = generatedAssets.filter(
    (asset) =>
      !asset.isPlaceholder &&
      Boolean(asset.url || asset.storagePath) &&
      (asset.assetType === 'image' || asset.assetType === 'thumbnail' || asset.assetType === 'carousel_slide' || Boolean(asset.url)),
  );
  const pendingImageAssets = generatedAssets.filter((asset) => asset.isPlaceholder || asset.availabilityStatus === 'pending');
  const failedImageAssets = generatedAssets.filter((asset) => asset.availabilityStatus === 'failed');
  const assetLayoutPlan =
    detail.reviewItem?.assetLayoutPlan?.length ? detail.reviewItem.assetLayoutPlan : detail.boardItem?.assetLayoutPlan ?? [];
  const imageCount = detail.reviewItem?.imageCount ?? detail.boardItem?.imageCount ?? realImageAssets.length ?? selectedAssets.length;
  const visualBrief = detail.reviewItem?.visualBrief || detail.boardItem?.visualBrief;
  const creativeSummary = detail.reviewItem?.creativeSummary;
  const approvalRecommendation = detail.reviewItem?.approvalRecommendation ?? detail.reviewItem?.approvalSummary;
  const requiredFix = detail.reviewItem?.requiredFix;
  const degradedMessage = detail.reviewItem?.degradedMessage;
  const layout = detail.reviewItem?.layout || detail.boardItem?.layout;
  const wordCount = detail.reviewItem?.wordCount ?? detail.boardItem?.wordCount;
  const contentItemStatus = detail.reviewItem?.contentItemStatus || detail.boardItem?.contentItemStatus || detail.stage;
  const hasGeneratedText = generatedDraftCount > 0;
  const hasGeneratedImageEvidence = realImageAssets.length > 0;
  const metadata = [
    ['Workflow', detail.workflowId],
    ['Review', detail.reviewId],
    ['Publishing', detail.publishingId],
    ['Created by', detail.createdBy],
    ['Created at', detail.createdAtLabel],
    ['Stage', currentStage],
    ['Owner', detail.owner],
    ['Channel', detail.channel],
    ['Due', detail.due],
    ['Category', detail.category],
  ];
  const timeline = [
    ...detail.events.map((event) => ({
      time: event.time,
      title: event.type,
      detail: event.message,
      source: event.source,
      status: event.status ?? '',
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 p-0 backdrop-blur-[1px] sm:p-4">
      <aside className="flex h-full w-full max-w-3xl flex-col overflow-hidden border border-[#d7d7d0] bg-[#fbfbfa] shadow-2xl sm:rounded-2xl">
        <div className="max-h-[48dvh] overflow-y-auto border-b border-[#e3e3dd] bg-white p-3 sm:max-h-none sm:overflow-visible sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
                  Content Job Detail
                </span>
                <RiskBadge risk={detail.risk} />
                <Tag>{currentStage}</Tag>
              </div>
              <h2 className="truncate text-lg font-semibold tracking-[-0.02em] text-[#171717]">{detail.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6e6e68]">
                Single source view for {detail.workflowId}, {detail.reviewId}, and {detail.publishingId}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f6f6f2]"
              type="button"
              aria-label="Close content job detail"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {metadata.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a82]">{label}</div>
                <div className="mt-1 truncate text-xs font-semibold text-[#171717]">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <WorkflowStatusSyncPanel snapshot={detail.statusSnapshot} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onOpenDashboard} className="rounded-lg border border-[#deded8] bg-white px-3 py-2 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]" type="button">
              Open Dashboard
            </button>
            <button onClick={onOpenReview} className="rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#2f4f7f] hover:bg-white" type="button">
              Open Review
            </button>
            <button
              onClick={() => document.getElementById('content-job-generated-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-white"
              type="button"
            >
              Open Generated Content
            </button>
            <button onClick={onOpenPublishing} className="rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-white" type="button">
              Open Publishing
            </button>
            <button onClick={onOpenLogs} className="rounded-lg bg-[#171717] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2f2f2b]" type="button">
              Open Logs
            </button>
            <button
              onClick={onDelete}
              disabled={deleteLoading}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#171717]">Lifecycle</h3>
                <p className="mt-0.5 text-xs text-[#6e6e68]">The same content item across Dashboard, Review Queue, Publishing Queue, and Logs.</p>
              </div>
              <Tag>{detail.events.length} log event{detail.events.length === 1 ? '' : 's'}</Tag>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
              {dashboardLifecycleStages.map((stage, index) => {
                const done = index < currentIndex;
                const active = index === currentIndex;

                return (
                  <div
                    key={stage}
                    className={`rounded-lg border px-2 py-2 text-[11px] font-semibold ${
                      active
                        ? 'border-[#1f5eff] bg-[#f4f7fd] text-[#1f5eff]'
                        : done
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-[#deded8] bg-white text-[#8a8a82]'
                    }`}
                  >
                    <div>{stage}</div>
                    <div className="mt-1 text-[10px] font-medium opacity-75">{active ? 'Current' : done ? 'Done' : 'Pending'}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="content-job-generated-content" className="mt-4 scroll-mt-4 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#171717]">Generated content evidence</h3>
                <p className="mt-0.5 text-xs text-[#6e6e68]">
                  Shows whether this content job already has generated text and image/layout output from the live workflow.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  hasGeneratedText ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  Text {hasGeneratedText ? 'generated' : 'pending'}
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  hasGeneratedImageEvidence ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  Image {hasGeneratedImageEvidence ? 'output ready' : failedImageAssets.length ? 'failed' : pendingImageAssets.length ? 'pending generation' : 'pending'}
                </span>
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#171717]">Content text</div>
                    <p className="mt-0.5 text-[11px] text-[#8a8a82]">
                      {generatedDraftCount} generated draft{generatedDraftCount === 1 ? '' : 's'}
                      {typeof wordCount === 'number' ? ` · ${wordCount} target words` : ''}
                    </p>
                  </div>
                  <Tag>{contentItemStatus}</Tag>
                </div>
                <div className="mt-3 space-y-3">
                  {generatedDrafts.length ? (
                    generatedDrafts.map((draft) => (
                      <article key={`${draft.languageCode}-${draft.title}`} className="rounded-lg border border-[#e3e3dd] bg-white p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-[#171717]">{draft.title}</span>
                          <Tag>{draft.languageLabel}</Tag>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#4f4f49]">{normalizeTextValue(draft.body)}</p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                      Content text has not been generated for this job yet. It should stay in Todo/In Progress until the text agent writes at least one draft.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="text-xs font-semibold text-[#171717]">Image / layout evidence</div>
                  <div className="mt-2 space-y-2 text-xs text-[#4f4f49]">
                    <div className="rounded-lg border border-[#e3e3dd] bg-white p-2">
                      Image output: {realImageAssets.length ? `${realImageAssets.length} ready` : pendingImageAssets.length ? `${pendingImageAssets.length} pending generation` : failedImageAssets.length ? 'Generation failed' : 'Pending'}
                    </div>
                    <div className="rounded-lg border border-[#e3e3dd] bg-white p-2">Layout: {layout || 'Pending layout'}</div>
                    <div className="rounded-lg border border-[#e3e3dd] bg-white p-2">
                      <div className="mb-1">Selected assets:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAssets.length ? (
                          selectedAssets.map((asset, idx) => {
                            const isUrl = asset.startsWith('http');
                            return isUrl ? (
                              <img key={idx} src={asset} alt="Selected" className="h-8 w-8 rounded border border-[#deded8] object-cover" />
                            ) : (
                              <Tag key={idx}>{asset}</Tag>
                            );
                          })
                        ) : (
                          <span className="text-[#8a8a82]">Pending asset selection</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="text-xs font-semibold text-[#171717]">Generated images</div>
                  <div className="mt-3 grid gap-2">
                    {realImageAssets.length ? (
                      realImageAssets.map((asset, index) => (
                        <figure key={`${asset.url ?? asset.storagePath ?? asset.altText}-${index}`} className="overflow-hidden rounded-xl border border-[#e3e3dd] bg-white">
                          {asset.url ? (
                            <img
                              src={asset.url}
                              alt={asset.altText || `Generated image ${index + 1}`}
                              className="aspect-[4/3] w-full bg-[#f6f6f2] object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex aspect-[4/3] w-full items-center justify-center bg-amber-50 px-3 text-center text-xs font-medium text-amber-800">
                              Real asset exists, but no public image URL is available yet.
                            </div>
                          )}
                          <figcaption className="space-y-1 p-2 text-[11px] text-[#6e6e68]">
                            <div className="font-semibold text-[#171717]">{asset.altText || `Generated image ${index + 1}`}</div>
                            <div>{asset.layoutType || asset.assetType}{asset.source ? ` · ${asset.source}` : ''}</div>
                            {asset.storagePath ? <div className="truncate">Storage: {asset.storagePath}</div> : null}
                          </figcaption>
                        </figure>
                      ))
                    ) : failedImageAssets.length ? (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs leading-relaxed text-rose-700">
                        Image generation failed for this job. Review packaging should not treat placeholder assets as complete output.
                      </div>
                    ) : pendingImageAssets.length ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs leading-relaxed text-amber-800">
                        Real image output is still pending. {pendingImageAssets.length} placeholder slot{pendingImageAssets.length === 1 ? '' : 's'} exist, but they are not treated as completed visual assets.
                      </div>
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs leading-relaxed text-amber-800">
                        No real generated image records are attached yet. This tab will render images from content_assets.url once Image & Layout Agent creates them.
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="text-xs font-semibold text-[#171717]">Visual brief</div>
                  <p className="mt-2 text-xs leading-relaxed text-[#4f4f49]">{normalizeTextValue(visualBrief) || 'Pending text-to-image summary'}</p>
                  {normalizeTextValue(creativeSummary) ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">Creative summary: {normalizeTextValue(creativeSummary)}</p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="text-xs font-semibold text-[#171717]">Asset layout plan</div>
                  <div className="mt-2 space-y-1">
                    {assetLayoutPlan.length ? (
                      assetLayoutPlan.map((step, index) => (
                        <div key={`${step}-${index}`} className="rounded-lg border border-[#e3e3dd] bg-white px-2 py-1.5 text-xs text-[#4f4f49]">
                          {step}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">Pending image/layout agent output</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h3 className="text-sm font-semibold text-[#171717]">Workflow timeline</h3>
            <div className="mt-4 space-y-3">
              {timeline.length === 0 ? (
                <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] px-3 py-3 text-xs text-[#6e6e68]">
                  No runtime workflow events yet. This panel updates from live backend logs as each agent completes.
                </div>
              ) : (
                timeline.map((event, index) => (
                  <div key={`${event.time}-${event.title}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#8b8b84]" />
                      {index !== timeline.length - 1 ? <span className="mt-1 h-full w-px bg-[#deded8]" /> : null}
                    </div>
                    <div className="min-w-0 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#171717]">{event.title}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a82]">{event.time}</span>
                        {event.status ? <Tag>{event.status}</Tag> : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#4f4f49]">{event.detail}</p>
                      <p className="mt-1 text-[11px] text-[#8a8a82]">{event.source}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
                <h3 className="text-sm font-semibold text-[#171717]">Review package</h3>
                <div className="mt-3 space-y-2 text-xs text-[#4f4f49]">
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">Status: {detail.reviewItem?.status ?? 'Not in review yet'}</div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">Sources: {detail.reviewItem?.sourceConnectors?.join(', ') ?? 'Pending source handoff'}</div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">Layout: {detail.reviewItem?.layout ?? 'Pending asset composer'}</div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                    Assets: {detail.reviewItem?.selectedAssets?.length ? detail.reviewItem.selectedAssets.join(', ') : 'Pending asset selection'}
                  </div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                    Visual brief: {detail.reviewItem?.visualBrief ?? 'Pending text-to-image summary'}
                  </div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                    Approval recommendation: {approvalRecommendation ?? 'Pending compliance output'}
                  </div>
                  <div className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                    Required fix: {requiredFix ?? 'No required fix recorded'}
                  </div>
                  {degradedMessage ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
                      {degradedMessage}
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
                <h3 className="text-sm font-semibold text-[#171717]">Agent handoff</h3>
                <div className="mt-3 space-y-2">
                  {detail.agentJobs.length ? (
                    detail.agentJobs.map((job) => (
                      <div key={job.id} className="rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold text-[#171717]">{job.agent}</span>
                          <Tag>{job.status}</Tag>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{job.stage}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#6e6e68]">
                      No live agent handoff has been recorded for this content item yet.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </aside>
    </div>
  );
}
