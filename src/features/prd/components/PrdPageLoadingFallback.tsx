'use client';

export function PrdPageLoadingFallback() {
  return (
    <main className="flex h-dvh min-h-dvh items-center justify-center bg-[#f5f5f2] px-4 text-[#171717]">
      <div className="rounded-2xl border border-[#deded8] bg-white px-4 py-3 text-sm font-medium shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        Loading PRD workspace...
      </div>
    </main>
  );
}
