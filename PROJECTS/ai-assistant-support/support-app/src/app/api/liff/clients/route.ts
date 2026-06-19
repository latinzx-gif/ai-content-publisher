import { NextResponse } from "next/server";
import { getActiveClients } from "@/lib/actions/clients";

/**
 * GET /api/liff/clients
 *
 * Returns a JSON list of active clients for the LIFF ticket intake form dropdown.
 * Response shape: { clients: ActiveClient[] }
 */
export async function GET() {
  try {
    const clients = await getActiveClients();
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("GET /api/liff/clients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
}