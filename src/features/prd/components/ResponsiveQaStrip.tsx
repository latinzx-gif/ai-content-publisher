'use client';

export function ResponsiveQaStrip() {
  const checkpoints = [
    { label: 'Mobile', value: '360-430px', detail: 'Sidebar drawer, stacked cards, scroll-safe dialogs' },
    { label: 'Tablet', value: '768px', detail: 'Stacked panels, horizontal tables inside cards' },
    { label: 'Desktop', value: '1280px+', detail: 'Kanban, right agent rail, full workflow surfaces' },
  ];

  return (
    <section className="mt-3 rounded-2xl border border-[#d9e0ef] bg-[#f8fbff] p-3 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#172033]">Responsive QA guard</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#4d6281]">
            Stage 8 keeps wide boards and tables inside controlled scroll containers while preserving mobile access to every workflow.
          </p>
        </div>
        <span className="rounded-full border border-[#cfd8ea] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#2f4f7f]">
          Viewport-safe
        </span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {checkpoints.map((item) => (
          <div key={item.label} className="rounded-xl border border-[#d9e0ef] bg-white px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6c7fa0]">{item.label}</div>
            <div className="mt-1 text-xs font-semibold text-[#172033]">{item.value}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#5d6f8a]">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
