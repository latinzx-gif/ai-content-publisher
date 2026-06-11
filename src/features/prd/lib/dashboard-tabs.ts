import type { BoardItem } from '@/features/prd/types/board';
import type { DashboardBoard, DashboardBoardTab } from '@/features/prd/types/dashboard';

export function normalizeDashboardTab(tab: string): DashboardBoardTab {
  const normalized = tab.toLowerCase();
  // Legacy keys kept for URL/bookmark compatibility
  if (normalized.includes('assigned')) return 'Assigned';
  if (normalized.includes('agent')) return 'Agents';
  if (normalized.includes('scheduled')) return 'Scheduled';
  // Named tabs in navigation.ts
  if (normalized === 'today') return 'All';
  if (normalized === 'pipeline') return 'Assigned';
  if (normalized.includes('needs')) return 'Agents';
  return 'All';
}

export function formatBoardItemContextLabel(item: BoardItem): string {
  return `${item.id} · ${item.owner}`;
}

export function filterDashboardBoardByTab(
  board: DashboardBoard[],
  tab: DashboardBoardTab,
  normalizeCounts: (input: DashboardBoard[]) => DashboardBoard[],
): DashboardBoard[] {
  if (tab === 'All') {
    return normalizeCounts(board);
  }

  const filtered = board.filter((column) => {
    const key = column.column.toLowerCase();

    if (tab === 'Assigned') {
      return key.includes('backlog') || key.includes('todo') || key.includes('progress') || key.includes('draft') || key.includes('ready');
    }

    if (tab === 'Agents') {
      return key.includes('review') || key.includes('agent') || key.includes('qa');
    }

    return key.includes('done') || key.includes('scheduled') || key.includes('publish') || key.includes('published');
  });

  return normalizeCounts(filtered);
}
