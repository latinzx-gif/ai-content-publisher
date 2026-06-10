import type { ComponentType } from 'react';

import type { BoardItem } from './board';

export type DashboardTone = 'blue' | 'amber' | 'emerald' | 'slate';

export type DashboardBoard = { column: string; count: number; items: BoardItem[] };

export type DashboardAgent = {
  name: string;
  state: 'Online' | 'Idle' | 'Offline';
  task: string;
  runs: number;
  load: number;
};

export type DashboardStatIcon = 'Layers3' | 'ShieldCheck' | 'Clock3' | 'Zap';

export type DashboardStatAction = 'working-posts' | 'need-review' | 'scheduled' | 'agent-runs' | 'default';

export type DashboardStatSource = {
  label: string;
  value: string;
  change: string;
  icon: DashboardStatIcon;
  tone: DashboardTone;
  action?: DashboardStatAction;
};

export type DashboardStat = Omit<DashboardStatSource, 'icon' | 'action'> & {
  icon: ComponentType<{ className?: string }>;
  action: DashboardStatAction;
};

export type DashboardActivity = {
  message: string;
  actorName?: string | null;
  createdAt?: string;
  source?: string;
  presentation?: Record<string, unknown>;
};

export type DashboardPayload = {
  stats: DashboardStatSource[];
  board: DashboardBoard[];
  agents: DashboardAgent[];
  activity: DashboardActivity[];
};

export type DashboardApiPayload = DashboardPayload & { generatedAt: string };

export type DashboardBoardTab = 'All' | 'Assigned' | 'Agents' | 'Scheduled';

export type AgentQueueJob = {
  id: string;
  agent: string;
  owner: string;
  stage: string;
  status: 'Done' | 'Running' | 'Queued' | 'Waiting review';
  detail: string;
  createdAt: string;
  updatedAt: string;
  handoffTarget?: string;
  runMode?: 'Dry-run' | 'Live';
};

export type CommandCenterCounts = {
  total: number;
  brief: number;
  rules: number;
  generate: number;
  qc: number;
  review: number;
  schedule: number;
  publish: number;
  qcFailed: number;
  failedPublish: number;
};
