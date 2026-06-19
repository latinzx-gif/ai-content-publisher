#!/usr/bin/env node
import process from "node:process";

export type QueueMonitorSeverity = "P0" | "P1" | "P2" | "P3";
export type QueueMonitorSource = "monitor" | "webhook" | "manual" | "line";

export interface QueueMonitorIncidentPayload {
  source: QueueMonitorSource;
  sourceRef?: string | null;
  service: string;
  severity: QueueMonitorSeverity;
  subject: string;
  clientId?: string | null;
  clientSlug?: string | null;
  clientName?: string | null;
  body?: string | null;
  fingerprint?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface QueueMonitorRelayResult {
  success: boolean;
  disposition?: "created" | "bumped";
  incidentId?: string;
  linearIssueUrl?: string | null;
}

export interface PostIncidentParams {
  endpoint: string;
  secret: string;
  payload: QueueMonitorIncidentPayload;
  fetcher?: (input: string, init?: RequestInit) => Promise<Response>;
}

export function buildSimulatedQueueMonitorAlert(
  overrides: Partial<QueueMonitorIncidentPayload> = {},
): QueueMonitorIncidentPayload {
  const now = new Date().toISOString();

  return {
    source: "monitor",
    sourceRef: `queue-monitor:${now}`,
    service: "cron:queue-monitor",
    severity: "P1",
    subject: "queue-monitor synthetic alert",
    body: "Automated watcher generated test signal for Task 5 onboarding.",
    clientId: null,
    clientSlug: "system",
    clientName: "System Monitor",
    metadata: {
      observedAt: now,
      queue: "system",
      testRun: "task-5-relay",
    },
    ...overrides,
  };
}

export function buildIngestionEndpoint(baseOrEndpoint: string): string {
  const trimmed = baseOrEndpoint.replace(/\/$/, "");

  if (trimmed.includes("/api/internal/incidents")) {
    return trimmed;
  }

  return `${trimmed}/api/internal/incidents`;
}

export async function postIncidentToIngestion({
  endpoint,
  secret,
  payload,
  fetcher = fetch,
}: PostIncidentParams): Promise<QueueMonitorRelayResult> {
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-aas-incident-secret": secret,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let responseBody: unknown;

  try {
    responseBody = raw.length > 0 ? JSON.parse(raw) : null;
  } catch {
    responseBody = raw;
  }

  if (!response.ok) {
    const message =
      typeof responseBody === "string"
        ? responseBody
        : JSON.stringify(responseBody);
    throw new Error(`Incident relay failed (${response.status}): ${message}`);
  }

  if (
    typeof responseBody !== "object" ||
    responseBody === null ||
    Array.isArray(responseBody)
  ) {
    throw new Error("Invalid response payload from incident ingestion API");
  }

  const body = responseBody as Record<string, unknown>;
  if (typeof body.success !== "boolean") {
    throw new Error("Invalid response payload from incident ingestion API");
  }

  return {
    success: body.success,
    disposition:
      body.disposition === "created" || body.disposition === "bumped"
        ? body.disposition
        : undefined,
    incidentId: typeof body.incidentId === "string" ? body.incidentId : undefined,
    linearIssueUrl:
      body.linearIssueUrl == null ? null : String(body.linearIssueUrl),
  };
}

export function resolveIngestionEndpointFromEnv(env = process.env): string {
  const configuredEndpoint = env.AAS_INCIDENT_INGEST_ENDPOINT;

  if (configuredEndpoint && configuredEndpoint.trim().length > 0) {
    return buildIngestionEndpoint(configuredEndpoint.trim());
  }

  const baseUrl =
    env.AAS_INCIDENT_INGEST_BASE_URL ?? "https://support-app-brown.vercel.app";

  return buildIngestionEndpoint(baseUrl);
}

export function resolveSecretFromEnv(env = process.env): string {
  const secret = env.AAS_INCIDENT_INGEST_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error("AAS_INCIDENT_INGEST_SECRET is required for watcher relay");
  }

  return secret;
}

export async function runQueueMonitorRelay(): Promise<QueueMonitorRelayResult> {
  const args = process.argv.slice(2);
  const dryRun =
    args.includes("--dry-run") ||
    process.env.AAS_QUEUE_MONITOR_DRY_RUN === "1";

  const endpoint = resolveIngestionEndpointFromEnv(process.env);

  const payload = buildSimulatedQueueMonitorAlert();

  if (dryRun) {
    console.log("[dry-run] Queue monitor payload:", JSON.stringify(payload, null, 2));
    console.log("[dry-run] Target endpoint:", endpoint);
    return {
      success: true,
      disposition: undefined,
      incidentId: undefined,
      linearIssueUrl: null,
    };
  }

  const secret = resolveSecretFromEnv(process.env);

  const result = await postIncidentToIngestion({
    endpoint,
    secret,
    payload,
  });

  console.log("[watcher] relay response:", JSON.stringify({ endpoint, ...result }, null, 2));

  return result;
}

if (process.argv[1]?.endsWith("queue-monitor-relay.ts")) {
  runQueueMonitorRelay().catch((error) => {
    console.error("[watcher] Queue monitor relay failed:",
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  });
}
