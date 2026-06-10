'use client';

import type { ReactNode } from 'react';

export type SectionKickerProps = {
  children: ReactNode;
  className?: string;
};

export function SectionKicker({ children, className = '' }: SectionKickerProps) {
  return <div className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#63738c] ${className}`}>{children}</div>;
}
