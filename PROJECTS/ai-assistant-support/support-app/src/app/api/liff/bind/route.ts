import { NextResponse } from "next/server";
import { bindContact } from "@/lib/actions/contacts";

/**
 * POST /api/liff/bind
 *
 * Creates (or updates) a binding between a LINE user and a client.
 *
 * Request body (JSON):
 *   { lineUserId: string, clientId: string, displayName?: string }
 *
 * Response (200):
 *   { success: true, contact: { client_id, client_name } }
 *
 * Response (400/500):
 *   { error: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { lineUserId, clientId, displayName } = body;

    if (!lineUserId || typeof lineUserId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid lineUserId" },
        { status: 400 },
      );
    }

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid clientId" },
        { status: 400 },
      );
    }

    const contact = await bindContact(lineUserId, clientId, displayName);

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error("POST /api/liff/bind error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}