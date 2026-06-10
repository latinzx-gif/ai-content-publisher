import type { BoardItem } from '@/features/prd/types/board';
import type { CommandCenterCounts, DashboardBoard } from '@/features/prd/types/dashboard';

export function getCommandCenterCounts(board: DashboardBoard[]): CommandCenterCounts {
  const items = board.flatMap((column) =>
    column.items.map((item) => ({
      item,
      text: `${column.column} ${item.stage ?? ''} ${item.title} ${item.owner} ${item.channel} ${item.due} ${item.risk} ${item.tone}`.toLowerCase(),
    })),
  );

  const countBy = (matcher: (text: string, item: BoardItem) => boolean) =>
    items.filter(({ text, item }) => matcher(text, item)).length;

  return {
    total: items.length,
    brief: countBy((text) => text.includes('brief') || text.includes('backlog') || text.includes('created')),
    rules: countBy((text) => text.includes('source') || text.includes('rag') || text.includes('rules') || text.includes('research')),
    generate: countBy((text) => text.includes('text') || text.includes('draft') || text.includes('generation') || text.includes('strategy')),
    qc: countBy((text, item) => text.includes('qc') || text.includes('compliance') || item.risk === 'High'),
    review: countBy((text) => text.includes('review') || text.includes('approval')),
    schedule: countBy((text) => text.includes('schedule') || text.includes('queued')),
    publish: countBy((text) => text.includes('publish') || text.includes('posted')),
    qcFailed: countBy((text, item) => text.includes('qc failed') || text.includes('blocked') || item.risk === 'High'),
    failedPublish: countBy((text) => text.includes('failed') || text.includes('error')),
  };
}
