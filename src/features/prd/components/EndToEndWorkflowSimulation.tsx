'use client';

const endToEndWorkflowSimulation = [
  {
    step: '01',
    page: 'Create Post',
    state: 'Brief accepted',
    agent: 'Content Strategy Agent',
    contract: 'POST /api/content/jobs',
    handoff: 'Creates SW-134 and queues content-generation',
    evidence: 'Topic, language, platform, source policy, post count, image count',
    status: 'Ready',
  },
  {
    step: '02',
    page: 'Generation',
    state: 'Text ready',
    agent: 'Content Strategy Agent',
    contract: 'POST /api/agents/run',
    handoff: 'Writes draft copy, citations, and source summary',
    evidence: 'Text is generated before image/layout work starts',
    status: 'Ready',
  },
  {
    step: '03',
    page: 'Asset Composer',
    state: 'Assets ready',
    agent: 'Image & Layout Agent',
    contract: 'asset-composer queue',
    handoff: 'Turns approved text into image prompts and platform layout',
    evidence: 'Selected images, crop notes, carousel/grid/single layout package',
    status: 'Ready',
  },
  {
    step: '04',
    page: 'Review Queue',
    state: 'Human review',
    agent: 'Legal Compliance Agent',
    contract: 'POST /api/review/decision',
    handoff: 'Checks citations, multilingual meaning, claims, and risk flags',
    evidence: 'Approve, reject with reason, or auto queue decision',
    status: 'Guarded',
  },
  {
    step: '05',
    page: 'Publishing',
    state: 'Queued / syncing',
    agent: 'Publishing Agent',
    contract: 'POST /api/publishing/queue',
    handoff: 'Schedules platform targets and syncs publish result',
    evidence: 'Publishing queue status remains canonical across pages',
    status: 'Ready',
  },
  {
    step: '06',
    page: 'Logs',
    state: 'Audit trail',
    agent: 'Operations Monitor Agent',
    contract: 'GET /api/logs/export',
    handoff: 'Records every decision, handoff, error, retry, and stage audit',
    evidence: 'Workflow ID links Dashboard, Review Queue, Publishing, and Logs',
    status: 'Logged',
  },
] as const;

export function EndToEndWorkflowSimulation() {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="border-b border-[#e8e8e4] bg-[#fbfbfa] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-[#171717]">End-to-end workflow simulation</h2>
              <span className="rounded-full border border-[#d8d4c8] bg-[#f6f1df] px-2 py-0.5 text-[11px] font-semibold text-[#7a5b18]">
                Stage 10
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[#6e6e68]">
              One content job should move through the same canonical workflow across Dashboard, Create Post, Review Queue, Publishing, and Logs before real backend wiring starts.
            </p>
          </div>
          <div className="rounded-xl border border-[#d9e0ef] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#2f4f7f]">
            Simulation ID: SW-134 · Review: REV-134 · Publish: PUB-134
          </div>
        </div>
      </div>

      <div className="grid gap-0">
        <div className="min-w-0 overflow-x-auto p-3">
          <div className="grid min-w-[1180px] grid-cols-6 gap-3">
            {endToEndWorkflowSimulation.map((step) => (
              <article key={step.step} className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-[#cfcfc8] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">{step.step}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      step.status === 'Guarded'
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : step.status === 'Logged'
                          ? 'border-[#d9e0ef] bg-[#f4f7fd] text-[#2f4f7f]'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#171717]">{step.page}</h3>
                <p className="mt-1 text-xs font-semibold text-[#4f4f49]">{step.state}</p>
                <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-[#6e6e68]">
                  <p>
                    <span className="font-semibold text-[#171717]">Agent:</span> {step.agent}
                  </p>
                  <p>
                    <span className="font-semibold text-[#171717]">Contract:</span> {step.contract}
                  </p>
                  <p>{step.handoff}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
