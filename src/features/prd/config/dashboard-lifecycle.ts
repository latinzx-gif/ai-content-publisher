export const dashboardLifecycleStages = [
  'Brief Created',
  'Text Ready',
  'Assets Ready',
  'Ready for Review',
  'In Review',
  'Publishing Queued',
  'Posted / Failed',
] as const;

export type DashboardLifecycleStage = (typeof dashboardLifecycleStages)[number];
