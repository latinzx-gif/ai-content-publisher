import { NextResponse } from "next/server";
import {
  createTicketAndNotify,
  TICKET_TYPES,
  TICKET_SEVERITIES,
} from "@/lib/actions/tickets";
import { getContactByLineUserId } from "@/lib/actions/contacts";

/**
 * POST /api/liff/tickets
 *
 * Creates a new support ticket in aas_tickets, a corresponding Linear issue,
 * and sends a LINE confirm Flex message to the user.
 *
 * Request body (JSON):
 *   { clientId, clientSlug, clientName, lineUserId, type, severity, subject, body?, pageUrl? }
 *
 * Response (201):
 *   { success: true, ticket: { ticket_code, id, linear_issue_url, notified_at } }
 *
 * Response (400/500):
 *   { error: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { clientId, clientSlug, clientName, lineUserId, type, severity, subject, body: ticketBody, pageUrl } =
      body;

    // ── Validate required fields ─────────────────────────────────────
    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid clientId" },
        { status: 400 },
      );
    }

    if (!lineUserId || typeof lineUserId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid lineUserId" },
        { status: 400 },
      );
    }

    let resolvedClientName =
      typeof clientName === "string" ? clientName.trim() : "";

    let resolvedClientSlug =
      typeof clientSlug === "string" ? clientSlug.trim() : "";

    if (!resolvedClientSlug) {
      const contact = await getContactByLineUserId(lineUserId);
      if (!contact) {
        return NextResponse.json(
          { error: "Could not resolve client slug for this user" },
          { status: 400 },
        );
      }
      resolvedClientSlug = contact.slug.trim();
      if (!resolvedClientName) {
        resolvedClientName = contact.client_name.trim();
      }
    }

    if (!resolvedClientSlug) {
      return NextResponse.json(
        { error: "Missing or invalid clientSlug" },
        { status: 400 },
      );
    }

    if (!resolvedClientName) {
      return NextResponse.json(
        { error: "Missing or invalid clientName" },
        { status: 400 },
      );
    }

    if (!type || !(TICKET_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${TICKET_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    if (
      !severity ||
      !(TICKET_SEVERITIES as readonly string[]).includes(severity)
    ) {
      return NextResponse.json(
        {
          error: `severity must be one of: ${TICKET_SEVERITIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "subject is required" },
        { status: 400 },
      );
    }

    // ── Create ticket + Linear issue + LINE confirm ─────────────────
    const ticket = await createTicketAndNotify({
      clientId,
      clientSlug: resolvedClientSlug,
      clientName: resolvedClientName,
      reporterLineUserId: lineUserId,
      type,
      severity,
      subject,
      body: ticketBody ?? null,
      pageUrl: pageUrl ?? null,
    });

    return NextResponse.json(
      { success: true, ticket },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/liff/tickets error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}