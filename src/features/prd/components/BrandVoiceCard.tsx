'use client';

import { MessageSquareText } from 'lucide-react';

export function BrandVoiceCard({ rules, title, tone }: { rules: string[]; title: string; tone: string }) {
  return (
    <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#deded8] bg-[#f6f6f2]">
          <MessageSquareText className="h-4 w-4 text-[#4f4f49]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#171717]">{title}</h2>
          <p className="mt-1 text-xs font-medium text-[#6e6e68]">{tone}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {rules.map((rule) => (
          <div key={rule} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#4f4f49]">
            {rule}
          </div>
        ))}
      </div>
    </section>
  );
}

