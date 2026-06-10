import { getAuditLogs, insertAuditLog } from "@/lib/publisher/db";
import type { AcpAuditLog } from "@/lib/publisher/supabase/types";

export type LogType = "generation" | "image" | "publish" | "error";
export type LogStatus = "success" | "warn" | "error";
export type LogDateRange = "today" | "7d" | "30d" | "all";
export type LogAgent =
  | "Orchestrator"
  | "Content Agent"
  | "Quality Agent"
  | "Image Prompt Agent"
  | "Image Composer Agent"
  | "Publish Agent"
  | "Manual Reviewer"
  | "System";

export type LogEntry = {
  id: string;
  timestamp: string;
  type: LogType;
  action: string;
  post_id: string;
  details: string;
  status: LogStatus;
  agent?: LogAgent;
};

export type LogFilters = {
  type?: LogType | "all";
  dateRange?: LogDateRange;
  postId?: string;
  sort?: "asc" | "desc";
  agent?: LogAgent | "all";
};

export type LogUsage = {
  agent: LogAgent | "Unknown";
  total: number;
  success: number;
  warn: number;
  error: number;
  lastActivity: string;
};

type AgentUsageBucket = {
  total: number;
  success: number;
  warn: number;
  error: number;
  last: string | null;
};

const allLogsKey = "ai-content-publisher:logs";
const defaultAgentOrder: (LogAgent | "Unknown")[] = [
  "Orchestrator",
  "Content Agent",
  "Quality Agent",
  "Image Prompt Agent",
  "Image Composer Agent",
  "Publish Agent",
  "Manual Reviewer",
  "System",
  "Unknown",
];

export function addLog(
  type: LogType,
  action: string,
  post_id: string,
  details: string,
  status: LogStatus,
  agent?: LogAgent
) {
  if (typeof window === "undefined") return null;

  const entry: LogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    type,
    action,
    post_id,
    details,
    status,
    ...(agent ? { agent } : {}),
  };

  // Keep localStorage write for immediate UI reactivity in this session
  const logs = readArray<LogEntry>(allLogsKey);
  window.localStorage.setItem(allLogsKey, JSON.stringify([entry, ...logs]));

  if (type === "publish") {
    const postKey = `ai-content-publisher:publish-logs:${post_id}`;
    const postLogs = readArray<LogEntry>(postKey);
    window.localStorage.setItem(postKey, JSON.stringify([entry, ...postLogs]));
  }

  // Fire-and-forget persist to acp_audit_logs
  insertAuditLog({
    type,
    action,
    post_id,
    details,
    status,
    agent: agent ?? null,
  }).catch((err) => console.error("addLog: failed to persist to DB", err));

  return entry;
}

export async function getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
  const rows = await getAuditLogs(filters);
  return rows.map(auditLogToEntry);
}

export async function getAgentUsage(filters: LogFilters = {}): Promise<LogUsage[]> {
  const logs = await getLogs(filters);
  const buckets = new Map<LogAgent | "Unknown", AgentUsageBucket>();

  for (const item of logs) {
    const agent = (item.agent as LogAgent | undefined) || "Unknown";
    const bucket = buckets.get(agent) ?? {
      total: 0,
      success: 0,
      warn: 0,
      error: 0,
      last: item.timestamp,
    };

    bucket.total += 1;
    if (item.status === "success") bucket.success += 1;
    if (item.status === "warn") bucket.warn += 1;
    if (item.status === "error") bucket.error += 1;
    if (!bucket.last || new Date(item.timestamp) > new Date(bucket.last)) {
      bucket.last = item.timestamp;
    }
    buckets.set(agent, bucket);
  }

  return defaultAgentOrder
    .map((agent) => {
      const usage = buckets.get(agent) ?? {
        total: 0,
        success: 0,
        warn: 0,
        error: 0,
        last: null,
      };
      return {
        agent,
        total: usage.total,
        success: usage.success,
        warn: usage.warn,
        error: usage.error,
        lastActivity: usage.last || "-",
      };
    })
    .filter((usage) => usage.total > 0 || usage.lastActivity !== "-");
}

function auditLogToEntry(row: AcpAuditLog): LogEntry {
  return {
    id: row.id,
    timestamp: row.created_at,
    type: row.type as LogType,
    action: row.action,
    post_id: row.post_id ?? "unknown",
    details: row.details ?? "",
    status: row.status as LogStatus,
    ...(row.agent ? { agent: row.agent as LogAgent } : {}),
  };
}

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(key);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
