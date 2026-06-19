import type { CreateLinearIssueParams } from "@/lib/linear/client";

export interface BuildTicketLinearIssueInput {
  ticketCode: string;
  clientSlug: string;
  clientName: string;
  reporterLineUserId: string;
  type: string;
  severity: string;
  subject: string;
  body?: string | null;
  pageUrl?: string | null;
}

export function buildTicketLinearIssue(
  input: BuildTicketLinearIssueInput,
): Pick<CreateLinearIssueParams, "title" | "description" | "labels"> {
  const title = `[AAS][${input.clientSlug}] ${input.severity} · ${input.type} · ${input.subject}`;
  const description = [
    `**Ticket:** ${input.ticketCode}`,
    `**Client:** ${input.clientName}`,
    `**Reporter:** ${input.reporterLineUserId}`,
    `**Type:** ${input.type}`,
    `**Severity:** ${input.severity}`,
    `**Subject:** ${input.subject}`,
    "",
    "**Description:**",
    input.body ?? "(no description)",
    "",
    `**URL:** ${input.pageUrl ?? "(no URL)"}`,
    "",
    "---",
    `*Internal — LINE User ID: ${input.reporterLineUserId}*`,
  ].join("\n");

  const labels = [
    `client:${input.clientSlug}`,
    `type:${input.type}`,
    `severity:${input.severity}`,
  ];

  return {
    title,
    description,
    labels,
  };
}

// ---------------------------------------------------------------------------
// Incident Linear issue payload builder (operational incidents)
// ---------------------------------------------------------------------------

export interface BuildIncidentLinearIssueInput {
  clientSlug?: string | null;
  clientName?: string | null;
  source: string;
  sourceRef?: string | null;
  service: string;
  severity: string;
  subject: string;
  body?: string | null;
  fingerprint: string;
  occurrenceCount: number;
  metadata?: Record<string, unknown> | null;
}

/**
 * Build a Linear issue payload for an operational incident.
 *
 * Title pattern:
 *   [AAS][{clientSlug|"system"}] {severity} · {source} · {service} · {subject}
 *
 * Labels include `client:{slug}` (only when slug exists), `source:{source}`,
 * `service:{service}`, `severity:{severity}`.
 *
 * Description includes source ref, client info, service, severity, subject,
 * body, fingerprint, occurrence count, and optional metadata — all with
 * sensible fallbacks.
 */
export function buildIncidentLinearIssue(
  input: BuildIncidentLinearIssueInput,
): Pick<CreateLinearIssueParams, "title" | "description" | "labels"> {
  const slug = input.clientSlug?.trim() ? input.clientSlug.trim().toLowerCase() : "system";

  const title = `[AAS][${slug}] ${input.severity} · ${input.source} · ${input.service} · ${input.subject}`;

  const description = [
    `**Source Ref:** ${input.sourceRef ?? "(none)"}`,
    `**Client:** ${input.clientName ?? input.clientSlug ?? "(none)"}`,
    `**Service:** ${input.service}`,
    `**Severity:** ${input.severity}`,
    `**Subject:** ${input.subject}`,
    "",
    "**Description:**",
    input.body ?? "(no description)",
    "",
    "---",
    `**Fingerprint:** ${input.fingerprint}`,
    `**Occurrence Count:** ${input.occurrenceCount}`,
  ];

  if (input.metadata) {
    description.push(
      "",
      "**Metadata:**",
      "```json",
      JSON.stringify(input.metadata, null, 2),
      "```",
    );
  }

  description.push("", "---", "*Operational incident*");

  const labels: string[] = [];
  const trimmedSlug = input.clientSlug?.trim();
  if (trimmedSlug) {
    labels.push(`client:${trimmedSlug}`);
  }
  labels.push(`source:${input.source}`);
  labels.push(`service:${input.service}`);
  labels.push(`severity:${input.severity}`);

  return {
    title,
    description: description.join("\n"),
    labels,
  };
}
