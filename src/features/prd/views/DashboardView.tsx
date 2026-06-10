'use client';

import { Plus } from 'lucide-react';
import { BoardColumn } from '@/features/prd/components/BoardColumn';
import { CommandCenterHero } from '@/features/prd/components/CommandCenterHero';
import { DashboardLifecycleDetail } from '@/features/prd/components/DashboardLifecycleDetail';
import { MobileBoardStack } from '@/features/prd/components/MobileBoardStack';
import { RiskBadge } from '@/features/prd/components/primitives/RiskBadge';
import { StatCard } from '@/features/prd/components/StatCard';
import { getCommandCenterCounts } from '@/features/prd/lib/command-center';
import { formatBoardItemContextLabel } from '@/features/prd/lib/dashboard-tabs';
import type { BoardItem } from '@/features/prd/types/board';
import type {
  DashboardActivity,
  DashboardAgent,
  DashboardBoard,
  DashboardStat,
  DashboardStatAction,
} from '@/features/prd/types/dashboard';

export type DashboardViewProps = {
  data: { stats: DashboardStat[]; board: DashboardBoard[]; agents: DashboardAgent[]; activity: DashboardActivity[] };
  loading: boolean;
  error: string;
  onNewPost: () => void;
  onResetState: () => void;
  onOpenRunning: () => void;
  onViewDetails: () => void;
  onStatMoreAction: (action: DashboardStatAction) => void;
  onAddBoardItem: () => void;
  onOpenBoardItem: (item: BoardItem) => void;
  selectedBoardItem: BoardItem | null;
  onCloseBoardItem: () => void;
  onOpenBoardInReview: (item: BoardItem) => void;
  onOpenBoardInCreate: (item: BoardItem) => void;
  onOpenBoardInPublishing: (item: BoardItem) => void;
  onOpenBoardInLogs: (item: BoardItem) => void;
  onOpenContentJobDetail: (item: BoardItem) => void;
  onRunAgentQueue: () => void;
  isAgentRunning: boolean;
};

export function DashboardView({
  data,
  loading,
  error,
  onNewPost,
  onResetState,
  onOpenRunning,
  onViewDetails,
  onStatMoreAction,
  onAddBoardItem,
  onOpenBoardItem,
  selectedBoardItem,
  onCloseBoardItem,
  onOpenBoardInReview,
  onOpenBoardInCreate,
  onOpenBoardInPublishing,
  onOpenBoardInLogs,
  onOpenContentJobDetail,
  onRunAgentQueue,
  isAgentRunning,
}: DashboardViewProps) {
  const commandCounts = getCommandCenterCounts(data.board);

  return (
    <>
      {loading && <p className="mb-3 text-sm font-medium text-[#6e6e68]">Loading live dashboard data...</p>}
      {error && <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <CommandCenterHero
        counts={commandCounts}
        loading={loading}
        error={error}
        onCreate={onNewPost}
        onReview={onViewDetails}
        onDetails={onViewDetails}
        onRunAgentQueue={onRunAgentQueue}
        isAgentRunning={isAgentRunning}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} onMoreAction={() => onStatMoreAction(stat.action)} />
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#171717]">Content Pipeline</h2>
              <span className="rounded-full border border-[#deded8] bg-[#f4f4f2] px-2 py-0.5 text-[11px] font-medium text-[#6e6e68]">
                Board
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Operational board for the same workflow: Brief → Rules → Generate → QC → Review → Schedule → Publish.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewPost}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
            >
              <Plus className="h-3.5 w-3.5" />
              New post
            </button>
          </div>
        </div>

        <div className="bg-[#fbfbfa] p-3">
          {data.board.length ? (
            <>
              <MobileBoardStack
                board={data.board}
                selectedBoardItemId={selectedBoardItem?.id}
                onAddBoardItem={onAddBoardItem}
                onOpenBoardItem={onOpenBoardItem}
              />
              <div className="hidden overflow-x-auto lg:block">
                <div className="grid min-w-[1680px] grid-cols-7 gap-3">
                  {data.board.map((column) => (
                    <BoardColumn
                      key={column.column}
                      column={column.column}
                      count={column.count}
                      items={column.items}
                      selectedBoardItemId={selectedBoardItem?.id}
                      onAddBoardItem={onAddBoardItem}
                      onOpenBoardItem={onOpenBoardItem}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[#deded8] bg-white p-4 text-sm text-[#6e6e68]">
              <p>ไม่มีคอลัมน์แสดงผลในมุมมองนี้ กรุณาสร้างโพสต์ใหม่เพื่อเริ่มคิวงาน</p>
              <div className="mt-3 flex gap-2">
                <button onClick={onNewPost} className="rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 py-2 text-xs font-semibold text-[#171717]">
                  New post
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedBoardItem ? (
          <div className="mx-4 my-4 rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#171717]">Board item context</h2>
                  <RiskBadge risk={selectedBoardItem.risk} />
                </div>
                <p className="mt-1 text-xs text-[#6e6e68]">{selectedBoardItem.title}</p>
                <p className="mt-2 text-[11px] text-[#8a8a82]">{formatBoardItemContextLabel(selectedBoardItem)}</p>
              </div>
              <button
                onClick={onCloseBoardItem}
                className="inline-flex h-8 items-center rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              >
                Close
              </button>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-[#4f4f49] md:grid-cols-3">
              <div className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="font-semibold text-[#171717]">Channel</div>
                <div>{selectedBoardItem.channel}</div>
              </div>
              <div className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="font-semibold text-[#171717]">Due</div>
                <div>{selectedBoardItem.due}</div>
              </div>
              <div className="rounded-lg border border-[#deded8] bg-[#fbfbfa] p-3">
                <div className="font-semibold text-[#171717]">Owner</div>
                <div>{selectedBoardItem.owner}</div>
              </div>
            </div>
            <DashboardLifecycleDetail item={selectedBoardItem} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => onOpenContentJobDetail(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg bg-[#171717] px-3 text-xs font-semibold text-white hover:bg-[#2f2f2b]"
              >
                Open job detail
              </button>
              <button
                onClick={() => onOpenBoardInReview(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-3 text-xs font-semibold text-[#171717] hover:bg-white"
              >
                Open in Review Queue
              </button>
              <button
                onClick={() => onOpenBoardInCreate(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg border border-[#cfd8ea] bg-[#f4f7fd] px-3 text-xs font-semibold text-[#2f4f7f] hover:bg-white"
              >
                Create follow-up post
              </button>
              <button
                onClick={() => onOpenBoardInPublishing(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              >
                Open Publishing Queue
              </button>
              <button
                onClick={() => onOpenBoardInLogs(selectedBoardItem)}
                className="inline-flex h-9 items-center rounded-lg border border-[#deded8] bg-white px-3 text-xs font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
              >
                Open Logs
              </button>
            </div>
          </div>
        ) : null}
      </div>

    </>
  );
}
