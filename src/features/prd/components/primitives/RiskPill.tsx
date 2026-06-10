'use client';

export type RiskPillProps = {
  risk: string;
};

export function RiskPill({ risk }: RiskPillProps) {
  const className =
    risk === 'High'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : risk === 'Medium'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}>{risk}</span>;
}
