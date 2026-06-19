import { timingSafeEqual, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { IncidentInput, IncidentSource, IncidentSeverity } from "@/lib/incidents/types";
import { INCIDENT_SOURCES, INCIDENT_SEVERITIES } from "@/lib/incidents/types";
import { createOrBumpIncident } from "@/lib/actions/incidents";

/**
 * Canonical secret header for incident ingestion.
 */
const INCIDENT_SECRET_HEADER = "x-aas-incident-secret";

/**
 * Compare secrets in constant-time to reduce timing-channel leakage.
 */
function isValidSecret(provided: string | null, expected: string): boolean {
  if (!provided) {
    return false;
  }

  const providedHash = createHash("sha256")
    .update(provided)
    .digest();
  const expectedHash = createHash("sha256")
    .update(expected)
    .digest();

  if (providedHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(providedHash, expectedHash);
}

/**
 * Normalize an optional string and trim whitespace.
 *
 * Empty or whitespace-only input becomes null.
 */
function normalizeOptionalString(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    return "__INVALID_STRING__";
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Validate and sanitize incident ingestion payload.
 */
function parseIncidentInput(raw: unknown): IncidentInput {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Request body must be a JSON object");
  }

  const body = raw as Record<string, unknown>;

  // Required fields
  const source = normalizeOptionalString(body.source)?.toLowerCase();
  if (!source || !INCIDENT_SOURCES.includes(source as IncidentSource)) {
    throw new Error("Invalid or missing source");
  }

  const service = normalizeOptionalString(body.service);
  if (!service) {
    throw new Error("Invalid or missing service");
  }

  const normalizedSeverity = normalizeOptionalString(body.severity)?.toUpperCase();
  if (!normalizedSeverity || !INCIDENT_SEVERITIES.includes(normalizedSeverity as IncidentSeverity)) {
    throw new Error("Invalid or missing severity");
  }

  const subject = normalizeOptionalString(body.subject);
  if (!subject) {
    throw new Error("Invalid or missing subject");
  }

  const bodyText = normalizeOptionalString(body.body);
  if (bodyText === "__INVALID_STRING__") {
    throw new Error("body must be a string when provided");
  }

  const sourceRef = normalizeOptionalString(body.sourceRef);
  if (body.sourceRef !== undefined && sourceRef === "__INVALID_STRING__") {
    throw new Error("sourceRef must be a string when provided");
  }

  const clientId = normalizeOptionalString(body.clientId);
  if (body.clientId !== undefined && clientId === "__INVALID_STRING__") {
    throw new Error("clientId must be a string when provided");
  }

  const clientSlug = normalizeOptionalString(body.clientSlug);
  if (body.clientSlug !== undefined && clientSlug === "__INVALID_STRING__") {
    throw new Error("clientSlug must be a string when provided");
  }

  const clientName = normalizeOptionalString(body.clientName);
  if (body.clientName !== undefined && clientName === "__INVALID_STRING__") {
    throw new Error("clientName must be a string when provided");
  }

  const fingerprint = normalizeOptionalString(body.fingerprint);
  if (body.fingerprint !== undefined && fingerprint === "__INVALID_STRING__") {
    throw new Error("fingerprint must be a string when provided");
  }

  const metadata = body.metadata;
  if (
    metadata !== undefined &&
    metadata !== null &&
    (typeof metadata !== "object" || Array.isArray(metadata))
  ) {
    throw new Error("metadata must be a JSON object when provided");
  }

  return {
    clientId: clientId,
    clientSlug,
    clientName,
    source: source as IncidentSource,
    sourceRef,
    service,
    severity: normalizedSeverity as IncidentSeverity,
    subject,
    body: bodyText,
    fingerprint,
    metadata: metadata as Record<string, unknown> | null | undefined,
  };
}

/**
 * POST /api/internal/incidents
 *
 * Internal ingestion endpoint used by cron jobs / webhook relay workers.
 *
 * Auth:
 * - Requires header `x-aas-incident-secret` to match AAS_INCIDENT_INGEST_SECRET.
 *
 * Body:
 * {
 *   source: 'monitor' | 'webhook' | 'manual' | 'line',
 *   service: string,
 *   severity: 'P0' | 'P1' | 'P2' | 'P3',
 *   subject: string,
 *   clientId?: string,
 *   clientSlug?: string,
 *   clientName?: string,
 *   sourceRef?: string,
 *   body?: string,
 *   fingerprint?: string,
 *   metadata?: object,
 * }
 *
 * Response:
 *  { success: true, disposition, incidentId, linearIssueUrl }
 */
export async function POST(request: Request) {
  const configuredSecret = process.env.AAS_INCIDENT_INGEST_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "AAS_INCIDENT_INGEST_SECRET is not configured" },
      { status: 500 },
    );
  }

  const providedSecret = request.headers.get(INCIDENT_SECRET_HEADER);
  if (!isValidSecret(providedSecret, configuredSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: IncidentInput;
  try {
    const rawBody = await request.json();
    input = parseIncidentInput(rawBody);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const result = await createOrBumpIncident(input);
    return NextResponse.json(
      {
        success: true,
        disposition: result.disposition,
        incidentId: result.incidentId,
        linearIssueUrl: result.linearIssueUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to ingest incident";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Exported for unit tests.
 */
export { parseIncidentInput };