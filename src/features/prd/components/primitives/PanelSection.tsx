import type { ReactNode } from 'react';

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6e6e68]">{title}</h2>
      {children}
    </section>
  );
}
