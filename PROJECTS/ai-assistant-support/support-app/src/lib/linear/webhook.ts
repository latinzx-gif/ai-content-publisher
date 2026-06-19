/**
 * Linear webhook handler: verify signatures, parse payloads, and process
 * issue-done events with [resolution] comments.
 *
 * Signature verification uses HMAC-SHA256 with LINEAR_WEBHOOK_SECRET.
 * The signature is sent in the `linear-signature` header (hex-encoded).
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendResolutionFlex } from "@/lib/line/message";

// ── Types ────────────────────────────────────────────────────────────────

/** Raw Linear webhook payload (as documented by Linear). */
export interface LinearWebhookPayload {
  action: "create" | "update" | "delete";
  type: "Issue" | "Comment" | string;
  data: Record<string, unknown>;
  updatedFrom?: Record<string, unknown> | null;
  webhookId?: string;
  webhookLabelId?: string;
}

/** Parsed result from a Linear webhook. */
export interface ParsedWebhook {
  /** High-level action category. */
  action: "issue_update" | "comment_create" | "unknown";
  /** Linear issue ID (present for issue_update and comment_create). */
  issueId?: string;
  /** Issue title (present for issue_update). */
  issueTitle?: string;
  /** New state name (present for issue_update with state change). */
  stateName?: string;
  /** Comment body (present for comment_create). */
  commentBody?: string;
}

// ── Signature verification ───────────────────────────────────────────────

/**
 * Verify a Linear webhook request signature.
 *
 * Linear computes HMAC-SHA256 of the raw request body using the webhook
 * signing secret and sends the hex-encoded digest in the `linear-signature`
 * header.
 *
 * @param body       Raw request body as a string.
 * @param signature  Value of the `linear-signature` header.
 * @returns          `true` when the signature matches, `false` otherwise.
 */
export function verifyLinearSignature(
  body: string,
  signature: string,
): boolean {
  const secret = process.env.LINEAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      "[linear/webhook] LINEAR_WEBHOOK_SECRET is not set — cannot verify signature",
    );
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("hex");

  // Constant-time comparison
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    // Different lengths will throw — treat as mismatch
    return false;
  }
}

// ── Payload parsing ──────────────────────────────────────────────────────

/**
 * Parse a raw Linear webhook body into a structured result.
 *
 * Detects:
 * - Issue update (type="Issue", action="update")
 * - Comment create (type="Comment", action="create")
 *
 * @param body  Parsed JSON body (already validated).
 * @returns     A ParsedWebhook with the relevant fields extracted.
 */
export function parseLinearWebhook(
  body: LinearWebhookPayload,
): ParsedWebhook {
  const { action, type, data } = body;

  // ── Issue update ────────────────────────────────────────────────────
  if (type === "Issue" && action === "update") {
    const issueId = (data.id as string) ?? undefined;
    const issueTitle = (data.title as string) ?? undefined;

    // Detect state change: the new state is in data.state.name
    let stateName: string | undefined;
    const state = data.state as
      | { name?: string; id?: string }
      | undefined;
    if (state?.name) {
      stateName = state.name;
    }

    return {
      action: "issue_update",
      issueId,
      issueTitle,
      stateName,
    };
  }

  // ── Comment create ──────────────────────────────────────────────────
  if (type === "Comment" && action === "create") {
    const issueId = (data.issueId as string) ?? undefined;
    const commentBody = (data.body as string) ?? undefined;

    return {
      action: "comment_create",
      issueId,
      commentBody,
    };
  }

  // ── Unknown ─────────────────────────────────────────────────────────
  return { action: "unknown" };
}

// ── GraphQL queries ──────────────────────────────────────────────────────

/** GraphQL query to fetch the latest comment on an issue. */
const ISSUE_COMMENTS_QUERY = `
  query IssueComments($issueId: String!) {
    issue(id: $issueId) {
      comments {
        nodes {
          id
          body
          createdAt
        }
      }
    }
  }
`;

/** GraphQL query to fetch an issue's current state. */
const ISSUE_STATE_QUERY = `
  query IssueState($issueId: String!) {
    issue(id: $issueId) {
      state {
        name
      }
    }
  }
`;

/**
 * Make a raw request to the Linear GraphQL API.
 */
async function linearRequest<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error("LINEAR_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors) {
    const messages = json.errors
      .map((e: { message: string }) => e.message)
      .join("; ");
    throw new Error(`Linear API error: ${messages}`);
  }

  return json.data as T;
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Fetch the latest comment from a Linear issue that starts with `[resolution]`.
 *
 * @param issueId  The Linear issue ID.
 * @returns        The comment body (with the `[resolution]` prefix), or null
 *                 if no such comment exists.
 */
async function findResolutionComment(
  issueId: string,
): Promise<string | null> {
  try {
    const data = await linearRequest<{
      issue: {
        comments: {
          nodes: Array<{ id: string; body: string; createdAt: string }>;
        };
      };
    }>(ISSUE_COMMENTS_QUERY, { issueId });

    const comments = data.issue?.comments?.nodes ?? [];
    if (comments.length === 0) return null;

    // Sort by createdAt descending, find the first [resolution] comment
    const sorted = [...comments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const resolutionComment = sorted.find((c) =>
      c.body.trim().toLowerCase().startsWith("[resolution]"),
    );

    return resolutionComment?.body ?? null;
  } catch (error) {
    console.error(
      `[linear/webhook] Failed to fetch comments for issue ${issueId}:`,
      error,
    );
    return null;
  }
}

/**
 * Check whether a Linear issue is currently in "Done" state.
 *
 * @param issueId  The Linear issue ID.
 * @returns        `true` if the issue state name is "Done" (case-insensitive).
 */
async function isIssueDone(issueId: string): Promise<boolean> {
  try {
    const data = await linearRequest<{
      issue: { state: { name: string } };
    }>(ISSUE_STATE_QUERY, { issueId });

    const stateName = data.issue?.state?.name ?? "";
    return stateName.toLowerCase() === "done";
  } catch (error) {
    console.error(
      `[linear/webhook] Failed to fetch state for issue ${issueId}:`,
      error,
    );
    return false;
  }
}

// ── Main handler ─────────────────────────────────────────────────────────

/**
 * Handle a Linear issue that has been moved to "Done" with a [resolution]
 * comment.
 *
 * Steps:
 * 1. Find the ticket in aas_tickets where linear_issue_id = issueId.
 * 2. Update the ticket: status = 'resolved', resolution_summary = comment.
 * 3. Push a LINE Flex resolution message to the reporter.
 *
 * If the ticket is not found, logs a warning and returns gracefully.
 *
 * @param issueId            The Linear issue ID.
 * @param resolutionComment  The [resolution] comment body.
 */
export async function handleIssueDone(
  issueId: string,
  resolutionComment: string,
): Promise<void> {
  const supabase = await createSupabaseServiceClient();

  // ── 1. Find ticket by linear_issue_id ──────────────────────────────
  const { data: ticket, error: findError } = await supabase
    .from("aas_tickets")
    .select("id, ticket_code, reporter_line_user_id, client_id")
    .eq("linear_issue_id", issueId)
    .maybeSingle();

  if (findError) {
    console.error(
      `[linear/webhook] Error finding ticket for issue ${issueId}:`,
      findError,
    );
    return;
  }

  if (!ticket) {
    console.warn(
      `[linear/webhook] No ticket found for Linear issue ${issueId} — skipping`,
    );
    return;
  }

  // ── 2. Update ticket ───────────────────────────────────────────────
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("aas_tickets")
    .update({
      status: "resolved",
      resolution_summary: resolutionComment,
      updated_at: now,
    })
    .eq("id", ticket.id);

  if (updateError) {
    console.error(
      `[linear/webhook] Failed to update ticket ${ticket.ticket_code}:`,
      updateError,
    );
    return;
  }

  console.log(
    `[linear/webhook] Ticket ${ticket.ticket_code} resolved — status=resolved`,
  );

  // ── 3. Resolve client name ─────────────────────────────────────────
  let clientName = "Client";
  try {
    const { data: client } = await supabase
      .from("aas_clients")
      .select("name")
      .eq("id", ticket.client_id)
      .single();

    if (client?.name) {
      clientName = client.name;
    }
  } catch (clientError) {
    console.error(
      `[linear/webhook] Failed to resolve client name for ticket ${ticket.ticket_code}:`,
      clientError,
    );
  }

  // ── 4. Push LINE Flex ──────────────────────────────────────────────
  if (!ticket.reporter_line_user_id) {
    console.warn(
      `[linear/webhook] Ticket ${ticket.ticket_code} has no reporter_line_user_id — skipping LINE push`,
    );
    return;
  }

  try {
    const result = await sendResolutionFlex(
      ticket.reporter_line_user_id,
      ticket.ticket_code,
      clientName,
      resolutionComment,
    );

    if (result.success) {
      // Update notified_at
      await supabase
        .from("aas_tickets")
        .update({ notified_at: result.sentAt })
        .eq("id", ticket.id);

      console.log(
        `[linear/webhook] Resolution Flex sent for ticket ${ticket.ticket_code}`,
      );
    } else {
      console.error(
        `[linear/webhook] Failed to send resolution Flex for ticket ${ticket.ticket_code}`,
      );
    }
  } catch (pushError) {
    console.error(
      `[linear/webhook] LINE push error for ticket ${ticket.ticket_code}:`,
      pushError,
    );
  }
}

/**
 * Process a Linear webhook payload — the main entry point.
 *
 * Handles two scenarios:
 * 1. Issue update → state changed to "Done" → fetch [resolution] comment
 * 2. Comment create → body starts with "[resolution]" → check if issue is Done
 *
 * @param parsed  The parsed webhook payload.
 */
export async function processLinearWebhook(
  parsed: ParsedWebhook,
): Promise<void> {
  // ── Scenario 1: Issue updated to "Done" ────────────────────────────
  if (
    parsed.action === "issue_update" &&
    parsed.stateName?.toLowerCase() === "done" &&
    parsed.issueId
  ) {
    console.log(
      `[linear/webhook] Issue ${parsed.issueId} moved to Done — looking for [resolution] comment`,
    );

    const resolutionComment = await findResolutionComment(parsed.issueId);
    if (!resolutionComment) {
      console.log(
        `[linear/webhook] No [resolution] comment found for issue ${parsed.issueId} — skipping`,
      );
      return;
    }

    await handleIssueDone(parsed.issueId, resolutionComment);
    return;
  }

  // ── Scenario 2: Comment created with [resolution] prefix ───────────
  if (
    parsed.action === "comment_create" &&
    parsed.commentBody?.trim().toLowerCase().startsWith("[resolution]") &&
    parsed.issueId
  ) {
    console.log(
      `[linear/webhook] [resolution] comment detected on issue ${parsed.issueId} — checking state`,
    );

    const done = await isIssueDone(parsed.issueId);
    if (!done) {
      console.log(
        `[linear/webhook] Issue ${parsed.issueId} is not in Done state — skipping`,
      );
      return;
    }

    await handleIssueDone(parsed.issueId, parsed.commentBody);
    return;
  }

  // ── Other events — silently ignore ─────────────────────────────────
  console.log(
    `[linear/webhook] Ignoring event: action=${parsed.action}`,
  );
}