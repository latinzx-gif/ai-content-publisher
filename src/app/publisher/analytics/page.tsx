"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { BarChart3, Bot, TrendingUp } from "lucide-react";

import { Badge } from "@/components/publisher/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/publisher/ui/card";
import { Select } from "@/components/publisher/ui/select";
import { AGENT_PIPELINE } from "@/lib/publisher/agent-roles";
import {
  getAgentUsage,
  type LogDateRange,
  type LogUsage,
} from "@/lib/publisher/log-system";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<LogDateRange>("all");
  const [usage, setUsage] = useState<LogUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      getAgentUsage({ dateRange })
        .then((rows) => {
          setUsage(rows);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [dateRange]);

  const maxUsage = useMemo(
    () => Math.max(...usage.map((item) => item.total), 1),
    [usage]
  );
  const mostUsed = usage.reduce<LogUsage | null>(
    (winner, item) => (!winner || item.total > winner.total ? item : winner),
    null
  );
  const totalEvents = usage.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--emerald)]">
            Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-black text-[var(--navy)]">
            Agent Usage Analytics
          </h1>
          <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
            Agent workload from generation, QC, image, publishing, and manual review logs.
          </p>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-bold text-[var(--text-subtle)]">Date range</span>
          <Select
            value={dateRange}
            onChange={(event) => {
              setLoading(true);
              setDateRange(event.target.value as LogDateRange);
            }}
          >
            <option value="today">Today</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="all">All</option>
          </Select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<BarChart3 className="size-5" aria-hidden />}
          label="Total agent events"
          value={String(totalEvents)}
        />
        <MetricCard
          icon={<TrendingUp className="size-5" aria-hidden />}
          label="Most used agent"
          value={mostUsed?.agent || "-"}
        />
        <MetricCard
          icon={<Bot className="size-5" aria-hidden />}
          label="Configured positions"
          value={String(AGENT_PIPELINE.length)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent workload chart</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading agent usage...</p>
          ) : usage.length ? (
            <div className="space-y-4">
              {usage.map((item) => (
                <AgentUsageBar
                  item={item}
                  key={item.agent}
                  maxUsage={maxUsage}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No agent activity yet. Run the Review Queue pipeline to start collecting usage.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent capacity recommendation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {AGENT_PIPELINE.map((agent) => {
            const found = usage.find((item) => item.agent === agent.name);
            const total = found?.total || 0;
            const isHot = mostUsed?.agent === agent.name && total > 0;

            return (
              <div
                className="rounded-[calc(var(--radius)*0.55)] border border-[var(--line)] bg-[var(--paper)] p-4"
                key={agent.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[var(--navy)]">{agent.name}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      {agent.role}
                    </p>
                  </div>
                  <Badge className={isHot ? "bg-[var(--warning-soft)] text-[var(--warning-ink)]" : "bg-[var(--emerald-soft)] text-[var(--emerald)]"}>
                    {isHot ? "High use" : `${total} use`}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-[var(--text-subtle)]">{agent.description}</p>
                <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
                  {agent.queueName}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="rounded-[calc(var(--radius)*0.45)] bg-[var(--emerald-soft)] p-3 text-[var(--emerald)]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-black text-[var(--navy)]">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentUsageBar({
  item,
  maxUsage,
}: {
  item: LogUsage;
  maxUsage: number;
}) {
  const width = Math.max((item.total / maxUsage) * 100, item.total ? 8 : 0);

  return (
    <div className="grid gap-2 md:grid-cols-[220px_1fr_96px] md:items-center">
      <div>
        <p className="font-bold text-[var(--navy)]">{item.agent}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {item.success} success · {item.warn} warn · {item.error} error
        </p>
      </div>
      <div className="h-8 overflow-hidden rounded-[calc(var(--radius)*0.45)] bg-[var(--surface-muted)]">
        <div
          className="flex h-full items-center justify-end rounded-[calc(var(--radius)*0.45)] bg-[var(--emerald)] px-3 text-xs font-black text-white"
          style={{ width: `${width}%` }}
        >
          {item.total}
        </div>
      </div>
      <p className="font-mono text-xs text-[var(--text-muted)]">
        {formatLastActivity(item.lastActivity)}
      </p>
    </div>
  );
}

function formatLastActivity(value: string) {
  if (value === "-") return "-";
  return new Date(value).toLocaleString();
}
