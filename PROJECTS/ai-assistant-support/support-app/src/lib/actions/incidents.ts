import type { Json } from "@/lib/database.types";
import { deriveIncidentFingerprint } from "@/lib/incidents/fingerprint";
import { buildIncidentLinearIssue } from "@/lib/incidents/linear";
import type {
  IncidentInput,
  IncidentRecord,
  CreateOrBumpIncidentResult,
  IncidentSeverity,
} from "@/lib/incidents/types";
import type {
  CreateLinearIssueParams,
  CreateLinearIssueResult,
} from "@/lib/linear/client";

// ---------------------------------------------------------------------------
// Repository abstraction (for DI / testability)
// ---------------------------------------------------------------------------

/**
 * Abstract repository for `aas_incidents` DB operations.
 *
 * Production implementation uses Supabase; tests provide stubs.
 */
export interface IncidentRepository {
  findByFingerprint(
    fingerprint: string,
  ): Promise<IncidentRecord | null>;
  insert(input: IncidentRecord): Promise<IncidentRecord>;
  bump(
    id: string,
    updates: {
      occurrence_count: number;
      last_seen_at: string;
      last_payload: Json | null;
      severity?: string;
    },
  ): Promise<void>;
  updateLinearRefs(
    id: string,
    linearIssueId: string,
    linearIssueUrl: string,
  ): Promise<void>;
}

/**
 * Abstract Linear API client (for DI / testability).
 */
export interface LinearClient {
  createIssue(
    params: CreateLinearIssueParams,
  ): Promise<CreateLinearIssueResult>;
  commentOnIssue(issueId: string, body: string): Promise<void>;
  updateIssuePriority(issueId: string, priority: number): Promise<void>;
}

// ---------------------------------------------------------------------------
// Default production adapters
// ---------------------------------------------------------------------------

/**
 * Create the default production IncidentRepository backed by Supabase.
 *
 * Requires environment variables SUPABASE_SERVICE_ROLE_KEY and
 * NEXT_PUBLIC_SUPABASE_URL to be set.
 */
async function createDefaultRepository(): Promise<IncidentRepository> {
  const { createSupabaseServiceClient } = await import(
    "@/lib/supabase/server"
  );

  const supabase = await createSupabaseServiceClient();

  return {
    async findByFingerprint(fingerprint: string) {
      const { data, error } = await supabase
        .from("aas_incidents")
        .select("*")
        .eq("fingerprint", fingerprint)
        .in("status", ["open", "investigating"])
        .maybeSingle();

      if (error) {
        console.error("IncidentRepository.findByFingerprint error:", error);
        throw new Error(`Failed to query incident: ${error.message}`);
      }

      return data as IncidentRecord | null;
    },

    async insert(input: IncidentRecord) {
      const { data, error } = await supabase
        .from("aas_incidents")
        .insert(input)
        .select()
        .single();

      if (error) {
        console.error("IncidentRepository.insert error:", error);
        throw new Error(`Failed to insert incident: ${error.message}`);
      }

      return data as IncidentRecord;
    },

    async bump(
      id: string,
      updates: {
        occurrence_count: number;
        last_seen_at: string;
        last_payload: Json | null;
        severity?: string;
      },
    ) {
      const updateData: Record<string, unknown> = {
        occurrence_count: updates.occurrence_count,
        last_seen_at: updates.last_seen_at,
        last_payload: updates.last_payload,
        updated_at: new Date().toISOString(),
      };

      if (updates.severity !== undefined) {
        updateData.severity = updates.severity;
      }

      const { error } = await supabase
        .from("aas_incidents")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("IncidentRepository.bump error:", error);
        throw new Error(`Failed to bump incident: ${error.message}`);
      }
    },

    async updateLinearRefs(
      id: string,
      linearIssueId: string,
      linearIssueUrl: string,
    ) {
      const { error } = await supabase
        .from("aas_incidents")
        .update({
          linear_issue_id: linearIssueId,
          linear_issue_url: linearIssueUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error(
          "IncidentRepository.updateLinearRefs error:",
          error,
        );
        throw new Error(
          `Failed to update linear refs for incident ${id}: ${error.message}`,
        );
      }
    },
  };
}

/**
 * Create the default production LinearClient backed by the real API.
 */
async function createDefaultLinearClient(): Promise<LinearClient> {
  const {
    createLinearIssue,
    commentOnLinearIssue,
    updateLinearIssuePriority,
  } = await import("@/lib/linear/client");

  return {
    createIssue: (params) => createLinearIssue(params),
    commentOnIssue: (issueId, body) =>
      commentOnLinearIssue(issueId, body),
    updateIssuePriority: (issueId, priority) =>
      updateLinearIssuePriority(issueId, priority),
  };
}

// ---------------------------------------------------------------------------
// Active incident statuses
// ---------------------------------------------------------------------------

/**
 * Statuses considered "active" — an existing incident with one of these
 * statuses will be bumped rather than creating a new record.
 *
 * Resolved and closed incidents are considered terminal; a new report
 * for the same fingerprint creates a fresh incident record instead.
 */
export const ACTIVE_INCIDENT_STATUSES = ["open", "investigating"] as const;

// ---------------------------------------------------------------------------
// Mapping: IncidentSeverity → Linear priority
// ---------------------------------------------------------------------------

const SEVERITY_TO_PRIORITY: Record<IncidentSeverity, number> = {
  P0: 1, // urgent
  P1: 2, // high
  P2: 3, // medium
  P3: 4, // low
};

// ---------------------------------------------------------------------------
// Service function
// ---------------------------------------------------------------------------

/**
 * Create-or-bump an operational incident.
 *
 * Flow:
 * 1. Generate or resolve a stable fingerprint from the input.
 * 2. Lookup an existing active incident by fingerprint (status "open"
 *    or "investigating").
 * 3a. Found → bump: increment `occurrence_count`, update `last_seen_at`,
 *     update `last_payload`, comment on the existing Linear issue.
 * 3b. Not found → create: insert a new `aas_incidents` row, build and
 *     create a Linear issue, save the Linear refs back to the row.
 *
 * If Linear creation fails during the "create" path, the incident row
 * still exists (graceful fallback) and the result has null Linear fields.
 *
 * @param input - The incident report input.
 * @param adapters - Optional DI adapters (used in tests; production omits
 *                   to use real Supabase + Linear).
 * @returns The incident ID, disposition ("created" | "bumped"), and
 *          Linear issue info (null if Linear step failed).
 */
export async function createOrBumpIncident(
  input: IncidentInput,
  adapters?: {
    repo?: IncidentRepository;
    linear?: LinearClient;
  },
): Promise<CreateOrBumpIncidentResult> {
  // ---- Resolve adapters ------------------------------------------------
  const repo = adapters?.repo ?? (await createDefaultRepository());
  const linear = adapters?.linear ?? (await createDefaultLinearClient());

  // ---- Step 1: Derive / resolve fingerprint ----------------------------
  const fingerprint =
    input.fingerprint ??
    deriveIncidentFingerprint(
      input.clientSlug,
      input.service,
      input.severity,
      input.subject,
    );

  // ---- Step 2: Check for existing active incident ----------------------
  const existing = await repo.findByFingerprint(fingerprint);

  if (existing && ACTIVE_INCIDENT_STATUSES.includes(existing.status as typeof ACTIVE_INCIDENT_STATUSES[number])) {
    // ---- BUMP path -----------------------------------------------------
    const now = new Date().toISOString();
    const newCount = existing.occurrence_count + 1;

    await repo.bump(existing.id, {
      occurrence_count: newCount,
      last_seen_at: now,
      last_payload: input.metadata as Json | null,
      severity: input.severity,
    });

    // Comment on the existing Linear issue (non-fatal if none or fails)
    if (existing.linear_issue_id) {
      const commentLines = [
        `**Repeat occurrence (#${newCount})**`,
        "",
        `**Subject:** ${input.subject}`,
        `**Severity:** ${input.severity}`,
        "",
        input.body ?? "(no additional details)",
      ];
      if (input.metadata) {
        commentLines.push(
          "",
          "**Metadata:**",
          "```json",
          JSON.stringify(input.metadata, null, 2),
          "```",
        );
      }

      try {
        await linear.commentOnIssue(
          existing.linear_issue_id,
          commentLines.join("\n"),
        );
      } catch (commentError) {
        console.error(
          `createOrBumpIncident: Failed to comment on Linear issue ${existing.linear_issue_id}:`,
          commentError,
        );
      }

      // Optionally refresh priority based on severity
      try {
        const priority = SEVERITY_TO_PRIORITY[input.severity];
        if (priority !== undefined) {
          await linear.updateIssuePriority(
            existing.linear_issue_id,
            priority,
          );
        }
      } catch (priorityError) {
        console.error(
          `createOrBumpIncident: Failed to update Linear priority for ${existing.linear_issue_id}:`,
          priorityError,
        );
      }
    }

    return {
      incidentId: existing.id,
      disposition: "bumped",
      linearIssueId: existing.linear_issue_id,
      linearIssueUrl: existing.linear_issue_url,
    };
  }

  // ---- CREATE path -----------------------------------------------------

  // Step 3a: Insert the incident record
  const now = new Date().toISOString();
  const incidentInput: IncidentRecord = {
    id: crypto.randomUUID(),
    client_id: input.clientId ?? null,
    source: input.source,
    source_ref: input.sourceRef ?? null,
    service: input.service,
    severity: input.severity,
    status: "open",
    subject: input.subject,
    body: input.body ?? null,
    fingerprint,
    occurrence_count: 1,
    first_seen_at: now,
    last_seen_at: now,
    last_payload: input.metadata as Json | null,
    linear_issue_id: null,
    linear_issue_url: null,
    ticket_id: null,
    created_at: now,
    updated_at: now,
  };

  const record = await repo.insert(incidentInput);

  // Step 3b: Create Linear issue (graceful — failure does not roll back)
  let linearIssueId: string | null = null;
  let linearIssueUrl: string | null = null;

  try {
    const linearPayload = buildIncidentLinearIssue({
      clientSlug: input.clientSlug,
      clientName: input.clientName,
      source: input.source,
      sourceRef: input.sourceRef,
      service: input.service,
      severity: input.severity,
      subject: input.subject,
      body: input.body,
      fingerprint,
      occurrenceCount: 1,
      metadata: input.metadata,
    });

    const result = await linear.createIssue(linearPayload);
    linearIssueId = result.issue_id;
    linearIssueUrl = result.issue_url;
  } catch (linearError) {
    console.error(
      `createOrBumpIncident: Failed to create Linear issue for incident ${record.id}:`,
      linearError,
    );
    // Incident row exists — Linear issue creation is optional
  }

  // Step 3c: Save Linear refs back to the incident row.
  // Only attempt if Linear creation succeeded. If the DB write fails,
  // the error is NOT swallowed — the caller must handle it rather than
  // silently orphaning the incident from its Linear issue.
  if (linearIssueId && linearIssueUrl) {
    await repo.updateLinearRefs(record.id, linearIssueId, linearIssueUrl);
  }

  return {
    incidentId: record.id,
    disposition: "created",
    linearIssueId,
    linearIssueUrl,
  };
}