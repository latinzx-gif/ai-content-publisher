import { NextRequest, NextResponse } from "next/server";
import { getContactByLineUserId } from "@/lib/actions/contacts";

/**
 * GET /api/liff/me?lineUserId=xxx
 *
 * Returns the bound contact info for a LINE user, or null if not bound.
 *
 * Response (200):
 *   { contact: { client_id, client_name, slug } | null }
 *
 * Response (400/500):
 *   { error: string }
 */
export async function GET(request: NextRequest) {
  try {
    const lineUserId = request.nextUrl.searchParams.get("lineUserId");

    if (!lineUserId) {
      return NextResponse.json(
        { error: "Missing lineUserId query parameter" },
        { status: 400 },
      );
    }

    const contact = await getContactByLineUserId(lineUserId);

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("GET /api/liff/me error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}