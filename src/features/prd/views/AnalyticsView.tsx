'use client';

import { Archive, FileText } from 'lucide-react';
import { MiniPageCard } from '@/features/prd/components/MiniPageCard';
import {
  analyticsSummary,
  contentPerformance,
  languagePerformance,
  topicTrends,
} from '@/features/prd/config/analytics-display';

export function AnalyticsView({ onNoopAction }: { onNoopAction: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analyticsSummary.map((item) => (
            <MiniPageCard key={item.label} label={item.label} value={item.value} detail={item.change} icon={item.icon} />
          ))}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onNoopAction('Export analytics as PDF')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-white px-3 text-xs font-semibold text-[#171717] hover:bg-[#f6f6f2]"
            type="button"
          >
            <FileText className="h-3.5 w-3.5" />
            Export report PDF
          </button>
          <button
            onClick={() => onNoopAction('Export analytics as Excel')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
            type="button"
          >
            <Archive className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Content performance</h2>
              <p className="mt-0.5 text-xs text-[#6e6e68]">Reach, engagement, and clicks by individual content item.</p>
            </div>
            <button
              onClick={() => onNoopAction('Change date range')}
              className="rounded-lg border border-[#deded8] bg-white px-3 py-1.5 text-xs font-medium text-[#4f4f49] hover:bg-[#f6f6f2]"
              type="button"
            >
              Last 30 days
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-[#e8e8e4] bg-[#fbfbfa] text-[11px] uppercase tracking-[0.14em] text-[#8a8a82]">
                <tr>
                  <th className="px-4 py-2 font-semibold">Content</th>
                  <th className="px-4 py-2 font-semibold">Language</th>
                  <th className="px-4 py-2 font-semibold">Reach</th>
                  <th className="px-4 py-2 font-semibold">Engagement</th>
                  <th className="px-4 py-2 font-semibold">Clicks</th>
                  <th className="px-4 py-2 font-semibold">Topic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e4]">
                {contentPerformance.map((item) => (
                  <tr key={item.title} className="hover:bg-[#fbfbfa]">
                    <td className="px-4 py-3 text-sm font-semibold text-[#171717]">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-[#deded8] bg-[#f6f6f2] px-2 py-0.5 text-[11px] font-semibold text-[#4f4f49]">
                        {item.language}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4f4f49]">{item.reach}</td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4f4f49]">{item.engagement}</td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4f4f49]">{item.clicks}</td>
                    <td className="px-4 py-3 text-xs text-[#6e6e68]">{item.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h2 className="text-sm font-semibold text-[#171717]">Language insights</h2>
            <div className="mt-4 space-y-3">
              {languagePerformance.map((item) => (
                <div key={item.language}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-[#171717]">{item.language}</div>
                      <div className="text-[11px] text-[#6e6e68]">{item.audience}</div>
                    </div>
                    <span className="text-xs font-semibold text-[#4f4f49]">{item.reach}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#e8e8e4]">
                    <div className="h-1.5 rounded-full bg-[#8b8b84]" style={{ width: `${item.reach}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <h2 className="text-sm font-semibold text-[#171717]">Topic trend</h2>
            <p className="mt-1 text-xs text-[#6e6e68]">Which legal/accounting categories are gaining attention.</p>
            <div className="mt-4 space-y-3">
              {topicTrends.map((item) => (
                <div key={item.topic} className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#171717]">{item.topic}</span>
                    <span className="text-[11px] font-semibold text-emerald-700">{item.trend}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#e8e8e4]">
                    <div className="h-1.5 rounded-full bg-[#8b8b84]" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
