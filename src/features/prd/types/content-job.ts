import type { AgentQueueJob } from '@/features/prd/types/dashboard';
import type { BoardItem } from '@/features/prd/types/board';
import type { PublishingQueueRow } from '@/features/prd/types/api';
import type { LogEvent } from '@/features/prd/types/logs';
import type { ReviewQueueItem } from '@/features/prd/types/review-queue';
import type { WorkflowStatusSnapshot } from '@/features/prd/types/workflow-status';

export type ContentJobDetail = {
  workflowId: string;
  reviewId: string;
  publishingId: string;
  title: string;
  owner: string;
  createdAt: number;
  createdAtLabel: string;
  createdBy: string;
  channel: string;
  category: string;
  due: string;
  risk: BoardItem['risk'];
  stage: string;
  boardItem?: BoardItem;
  reviewItem?: ReviewQueueItem;
  publishingRow?: PublishingQueueRow;
  events: LogEvent[];
  agentJobs: AgentQueueJob[];
  statusSnapshot: WorkflowStatusSnapshot;
};
