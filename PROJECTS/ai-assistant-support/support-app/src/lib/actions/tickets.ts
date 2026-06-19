import { buildTicketLinearIssue } from "@/lib/incidents/linear";
import { createLinearIssue } from "@/lib/linear/client";
import { sendConfirmFlex } from "@/lib/line/message";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/** Allowed ticket types. */
export const TICKET_TYPES = [
  "bug",
  "error",
  "complaint",
  "question",
  "feature",
] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

/** Allowed severity levels. */
export const TICKET_SEVERITIES = ["P0", "P1", "P2", "P3"] as const;
export type TicketSeverity = (typeof TICKET_SEVERITIES)[number];

/** Input shape for createTicket. */
export interface CreateTicketInput {
  clientId: string;
  reporterLineUserId: string;
  type: TicketType;
  severity: TicketSeverity;
  subject: string;
  body?: string | null;
  pageUrl?: string | null;
}

/** Input shape for createTicketWithLinear — extends CreateTicketInput with client metadata. */
export interface CreateTicketWithLinearInput extends CreateTicketInput {
  /** Client slug (e.g. "chinesevibe") for Linear issue title & labels. */
  clientSlug: string;
  /** Client display name for Linear issue description. */
  clientName: string;
}

/** Shape returned by createTicket on success. */
export interface CreateTicketResult {
  ticket_code: string;
  id: string;
}

/** Shape returned by createTicketWithLinear on success. */
export interface CreateTicketWithLinearResult extends CreateTicketResult {
  /** Linear issue URL, or null if Linear creation failed. */
  linear_issue_url: string | null;
}

/** Shape returned by createTicketAndNotify on success. */
export interface CreateTicketAndNotifyResult extends CreateTicketWithLinearResult {
  /** ISO timestamp of when the LINE confirm was sent, or null if it failed/skipped. */
  notified_at: string | null;
}

/** Shape of a ticket returned by getTicketByCode. */
export interface TicketStatus {
  ticket_code: string;
  client_name: string;
  type: TicketType;
  severity: TicketSeverity;
  subject: string;
  body: string | null;
  status: string;
  created_at: string;
  resolution_summary: string | null;
}

/** Max attempts to generate a unique ticket code before giving up. */
const MAX_CODE_RETRIES = 10;

/**
 * Generate a ticket code in the format AAS-XXXXXX
 * (6-digit random number, 100000–999999).
 */
function generateTicketCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `AAS-${String(num).padStart(6, "0")}`;
}

/**
 * Create a new support ticket in aas_tickets.
 *
 * Generates a unique ticket_code (AAS-XXXXXX), retrying on collision.
 *
 * @returns The generated ticket_code and row id.
 * @throws If validation fails or the insert fails after exhausting retries.
 */
export async function createTicket(
  input: CreateTicketInput,
): Promise<CreateTicketResult> {
  const { clientId, reporterLineUserId, type, severity, subject, body, pageUrl } =
    input;

  // ── Validation ────────────────────────────────────────────────────
  if (!clientId) throw new Error("clientId is required");
  if (!reporterLineUserId) throw new Error("reporterLineUserId is required");
  if (!type || !(TICKET_TYPES as readonly string[]).includes(type)) {
    throw new Error(
      `type must be one of: ${TICKET_TYPES.join(", ")}`,
    );
  }
  if (!severity || !(TICKET_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(
      `severity must be one of: ${TICKET_SEVERITIES.join(", ")}`,
    );
  }
  if (!subject || subject.trim().length === 0) {
    throw new Error("subject is required");
  }

  const supabase = await createSupabaseServiceClient();

  // ── Generate unique ticket code ───────────────────────────────────
  for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt++) {
    const ticketCode = generateTicketCode();

    const { data, error } = await supabase
      .from("aas_tickets")
      .insert({
        ticket_code: ticketCode,
        client_id: clientId,
        reporter_line_user_id: reporterLineUserId,
        type,
        severity,
        subject: subject.trim(),
        body: body?.trim() || null,
        page_url: pageUrl?.trim() || null,
        status: "open",
      })
      .select("id, ticket_code")
      .single();

    if (error) {
      // Check if collision on unique ticket_code
      if (
        error.code === "23505" &&
        error.message?.includes("ticket_code")
      ) {
        // Retry with a new code
        console.warn(
          `ticket_code collision (${ticketCode}), retrying (${attempt + 1}/${MAX_CODE_RETRIES})…`,
        );
        continue;
      }

      // Non-collision error — bail
      console.error("createTicket insert error:", error);
      throw new Error(`Failed to create ticket: ${error.message}`);
    }

    return { ticket_code: data.ticket_code, id: data.id };
  }

  throw new Error(
    "Failed to generate a unique ticket code after maximum retries. Please try again.",
  );
}

/**
 * Create a ticket and a corresponding Linear issue.
 *
 * Steps:
 * 1. Call createTicket() to save to DB.
 * 2. Call createLinearIssue() to create the Linear issue.
 * 3. Update the ticket row with linear_issue_id and linear_issue_url.
 *
 * If Linear creation fails, the ticket is still created (graceful fallback).
 *
 * @returns The ticket_code, id, and linear_issue_url (null if Linear failed).
 */
export async function createTicketWithLinear(
  input: CreateTicketWithLinearInput,
): Promise<CreateTicketWithLinearResult> {
  const { clientSlug, clientName, ...ticketInput } = input;

  // Step 1: Create ticket in DB
  const ticket = await createTicket(ticketInput);

  // Step 2: Build Linear issue title, description, and labels
  const linearPayload = buildTicketLinearIssue({
    ticketCode: ticket.ticket_code,
    clientSlug,
    clientName,
    reporterLineUserId: input.reporterLineUserId,
    type: input.type,
    severity: input.severity,
    subject: input.subject,
    body: input.body,
    pageUrl: input.pageUrl,
  });

  // Step 3: Try creating Linear issue (graceful fallback)
  let linearIssueUrl: string | null = null;
  let linearIssueId: string | null = null;

  try {
    const linearResult = await createLinearIssue(linearPayload);
    linearIssueId = linearResult.issue_id;
    linearIssueUrl = linearResult.issue_url;
  } catch (linearError) {
    console.error(
      `createTicketWithLinear: Failed to create Linear issue for ticket ${ticket.ticket_code}:`,
      linearError,
    );
    // Ticket is still created — return without linear_issue fields
    return { ...ticket, linear_issue_url: null };
  }

  // Step 4: Update ticket row with Linear issue info
  try {
    const supabase = await createSupabaseServiceClient();
    const { error: updateError } = await supabase
      .from("aas_tickets")
      .update({
        linear_issue_id: linearIssueId,
        linear_issue_url: linearIssueUrl,
      })
      .eq("id", ticket.id);

    if (updateError) {
      console.error(
        `createTicketWithLinear: Failed to update ticket ${ticket.ticket_code} with Linear info:`,
        updateError,
      );
    }
  } catch (updateError) {
    console.error(
      `createTicketWithLinear: Update error for ticket ${ticket.ticket_code}:`,
      updateError,
    );
  }

  return { ...ticket, linear_issue_url: linearIssueUrl };
}

/**
 * Create a ticket, Linear issue, and send a LINE confirm notification.
 *
 * Steps:
 * 1. Call createTicketWithLinear() to create ticket + Linear issue.
 * 2. Send LINE confirm Flex message via sendConfirmFlex().
 * 3. If LINE push succeeds, update aas_tickets.notified_at.
 * 4. If LINE push fails, log the error — ticket + Linear still created.
 *
 * @returns The ticket_code, id, linear_issue_url, and notified_at.
 */
export async function createTicketAndNotify(
  input: CreateTicketWithLinearInput,
): Promise<CreateTicketAndNotifyResult> {
  // Step 1: Create ticket + Linear issue
  const ticket = await createTicketWithLinear(input);

  // Step 2: Try sending LINE confirm (graceful fallback)
  let notifiedAt: string | null = null;

  try {
    const result = await sendConfirmFlex(
      input.reporterLineUserId,
      ticket.ticket_code,
      input.clientName,
      input.type,
      input.severity,
    );

    if (result.success) {
      notifiedAt = result.sentAt;

      // Step 3: Update notified_at in DB
      const supabase = await createSupabaseServiceClient();
      const { error: updateError } = await supabase
        .from("aas_tickets")
        .update({ notified_at: notifiedAt })
        .eq("id", ticket.id);

      if (updateError) {
        console.error(
          `createTicketAndNotify: Failed to update notified_at for ticket ${ticket.ticket_code}:`,
          updateError,
        );
      }
    }
  } catch (notifyError) {
    // Step 4: LINE push failure does not break ticket creation
    console.error(
      `createTicketAndNotify: Failed to send LINE confirm for ticket ${ticket.ticket_code}:`,
      notifyError,
    );
  }

  return { ...ticket, notified_at: notifiedAt };
}

/**
 * Retrieve a ticket by its ticket_code, scoped to the owning LINE user.
 *
 * Performs a two-step lookup (ticket → client name) to avoid relying on
 * Supabase's foreign-key join syntax.
 *
 * @param ticketCode - The ticket code (e.g. "AAS-123456").
 * @param lineUserId - The LINE user ID of the reporter (owner check).
 * @returns The ticket status data, or null if not found / not owned by this user.
 */
export async function getTicketByCode(
  ticketCode: string,
  lineUserId: string,
): Promise<TicketStatus | null> {
  const supabase = await createSupabaseServiceClient();

  // Step 1 — fetch the ticket row (scoped to owner)
  const { data: ticket, error: ticketError } = await supabase
    .from("aas_tickets")
    .select(
      "ticket_code, client_id, type, severity, subject, body, status, created_at, resolution_summary",
    )
    .eq("ticket_code", ticketCode)
    .eq("reporter_line_user_id", lineUserId)
    .maybeSingle();

  if (ticketError) {
    console.error("getTicketByCode error:", ticketError);
    throw new Error(`Failed to fetch ticket: ${ticketError.message}`);
  }

  if (!ticket) return null;

  // Step 2 — resolve client name
  const { data: client, error: clientError } = await supabase
    .from("aas_clients")
    .select("name")
    .eq("id", ticket.client_id)
    .single();

  if (clientError || !client) {
    console.error("getTicketByCode — client lookup error:", clientError);
    return null;
  }

  return {
    ticket_code: ticket.ticket_code,
    client_name: client.name,
    type: ticket.type as TicketType,
    severity: ticket.severity as TicketSeverity,
    subject: ticket.subject,
    body: ticket.body,
    status: ticket.status,
    created_at: ticket.created_at,
    resolution_summary: ticket.resolution_summary,
  };
}