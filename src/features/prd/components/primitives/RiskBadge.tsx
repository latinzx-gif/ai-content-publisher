import type { BoardRisk } from '@/features/prd/types/board';

export function RiskBadge({ risk }: { risk: BoardRisk }) {
  const styles = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[risk]}`}>
      {risk}
    </span>
  );
}
