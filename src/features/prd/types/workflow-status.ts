export type WorkflowStatusSurface = {
  surface: 'Dashboard' | 'Review Queue' | 'Publishing Queue' | 'Logs';
  id: string;
  status: string;
  canonicalStage: string;
  detail: string;
  present: boolean;
};

export type WorkflowStatusSnapshot = {
  workflowId: string;
  reviewId: string;
  publishingId: string;
  canonicalStage: string;
  syncHealth: 'Synced' | 'Partial' | 'Needs attention';
  mismatchCount: number;
  surfaces: WorkflowStatusSurface[];
};
