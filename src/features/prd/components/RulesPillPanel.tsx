'use client';

export function RulesPillPanel({ items, title, tone = 'neutral' }: { items: string[]; title: string; tone?: 'neutral' | 'danger' }) {
  return (
    <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#171717]">{title}</h2>
        <button className="rounded-lg border border-[#deded8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]">
          Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              tone === 'danger' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}


