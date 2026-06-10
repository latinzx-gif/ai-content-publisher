import type { ReactNode } from 'react';

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#deded8] bg-[#f4f4f2] px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">
      {children}
    </span>
  );
}
