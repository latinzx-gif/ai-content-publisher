import type { Json } from "@/lib/database.types";

export const INCIDENT_SOURCES = [
  "monitor",
  "webhook",
  "manual",
  "line",
] as const;
export type IncidentSource = (typeof INCIDENT_SOURCES)[number];

export const INCIDENT_SEVERITIES = ["P0", "P1", "P2", "P3"] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_STATUSES = [
  "open",
  "investigating",
  "resolved",
  "closed",
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface IncidentInput {
  clientId?: string | null;
  clientSlug?: string | null;
  clientName?: string | null;
  source: IncidentSource;
  sourceRef?: string | null;
  service: string;
  severity: IncidentSeverity;
  subject: string;
  body?: string | null;
  /** Optional at ingestion time — Task 3 resolves/generates this before DB insert. */
  fingerprint?: string | null;
  metadata?: Record<string, unknown> | null;
}

/** Incident input after the service layer has resolved all DB-required fields. */
export interface ResolvedIncidentInput extends Omit<IncidentInput, "fingerprint"> {
  fingerprint: string;
}

export interface IncidentRecord {
  id: string;
  client_id: string | null;
  source: IncidentSource;
  source_ref: string | null;
  service: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  subject: string;
  body: string | null;
  fingerprint: string;
  occurrence_count: number;
  first_seen_at: string;
  last_seen_at: string;
  last_payload: Json | null;
  linear_issue_id: string | null;
  linear_issue_url: string | null;
  ticket_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateOrBumpIncidentResult {
  incidentId: string;
  disposition: "created" | "bumped";
  linearIssueId: string | null;
  linearIssueUrl: string | null;
}
