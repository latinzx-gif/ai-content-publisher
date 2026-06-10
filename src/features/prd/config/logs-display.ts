import { Activity, Bot, Search, ShieldCheck } from 'lucide-react';

export const logSummary = [
  { label: 'Agent runs', value: '428', detail: '+64 today', icon: Bot },
  { label: 'RAG queries', value: '1.2K', detail: '+218 this week', icon: Search },
  { label: 'Errors / bugs', value: '17', detail: '4 unresolved', icon: ShieldCheck },
  { label: 'Token usage', value: '3.8M', detail: '$42.10 estimated', icon: Activity },
];

export type StaticErrorEvent = { type: string; severity: string; status: string; message: string; source: string; time: string; item?: string };
export const errorEvents: StaticErrorEvent[] = [];
export type LogsDisplayEvent = (typeof errorEvents)[number] & {
  itemId?: string;
  relatedId?: string;
  status?: string;
};

export type AgentActivityLog = { agent: string; model: string; status: string; tokens: string; duration: string };
export type UserActivityLog = { user: string; action: string; target: string; time: string };
export const agentActivityLogs: AgentActivityLog[] = [];
export type LogExportItem = { format: string; scope: string; filter: string; user: string; time: string };
export const userActivityLogs: UserActivityLog[] = [];
export const logExports: LogExportItem[] = [];
export type FeatureUsageItem = { feature: string; count: string; trend: string; percent: number };
export const featureUsage: FeatureUsageItem[] = [];
