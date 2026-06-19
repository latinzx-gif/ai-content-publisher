import { NextRequest, NextResponse } from "next/server";
import { getTicketByCode } from "@/lib/actions/tickets";

/**
 * GET /api/liff/tickets/{code}?lineUserId=xxx
 *
 * Retrieves a ticket by its ticket code, scoped to the owning LINE user.
 * Users can only see their own tickets.
 *
 * Response (200):
 *   { ticket: { ticket_code, client_name, type, severity, subject, body, status, created_at, resolution_summary } }
 *
 * Response (404):
 *   { error: string }
 *
 * Response (400/500):
 *   { error: string }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const lineUserId = request.nextUrl.searchParams.get("lineUserId");

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing ticket code" },
        { status: 400 },
      );
    }

    if (!lineUserId) {
      return NextResponse.json(
        { error: "Missing lineUserId query parameter" },
        { status: 400 },
      );
    }

    const ticket = await getTicketByCode(code, lineUserId);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("GET /api/liff/tickets/[code] error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}