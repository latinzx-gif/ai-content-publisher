import { dashboardLifecycleStages } from '@/features/prd/config/dashboard-lifecycle';
import type { BoardItem } from '@/features/prd/types/board';

export function normalizeWorkflowStage(value: string | undefined, fallback: string = 'Brief Created') {
  const haystack = (value ?? '').toLowerCase();

  if (haystack.includes('failed') || haystack.includes('posted') || haystack.includes('published')) {
    return 'Posted / Failed';
  }
  if (haystack.includes('publishing') || haystack.includes('queued') || haystack.includes('syncing') || haystack.includes('agent c')) {
    return 'Publishing Queued';
  }
  if (haystack.includes('human review') || haystack.includes('in review')) {
    return 'In Review';
  }
  if (haystack.includes('approved') || haystack.includes('ready for review') || haystack.includes('text + image + layout')) {
    return 'Ready for Review';
  }
  if (haystack.includes('asset') || haystack.includes('visual') || haystack.includes('layout') || haystack.includes('agent b')) {
    return 'Assets Ready';
  }
  if (haystack.includes('text') || haystack.includes('citation') || haystack.includes('agent a')) {
    return 'Text Ready';
  }

  return (dashboardLifecycleStages as readonly string[]).includes(fallback) ? fallback : 'Brief Created';
}

export function inferDashboardLifecycleStage(item: BoardItem) {
  return normalizeWorkflowStage(`${item.stage ?? ''} ${item.due} ${item.owner} ${item.channel}`);
}
