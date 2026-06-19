import { NextRequest, NextResponse } from "next/server";
import { verifyLineSignature } from "@/lib/line/verify";
import { handleLineEvent } from "@/lib/line/handler";
import type { LineEvent } from "@/lib/line/verify";

/**
 * POST /api/line/webhook
 *
 * LINE Messaging API webhook endpoint.
 *
 * 1. Verifies the `x-line-signature` header using HMAC-SHA256.
 * 2. Parses the event array from the request body.
 * 3. Routes each event through `handleLineEvent`.
 * 4. Returns a 200 JSON response for matched events, or 200 empty for
 *    ignored events.
 *
 * Responses:
 *   - 200 with reply body  → one or more events matched a handler.
 *   - 200 with empty body  → all events were ignored (e.g. messages).
 *   - 401                 → signature verification failed.
 */
export async function POST(request: NextRequest) {
  // ── 1. Read raw body ──────────────────────────────────────────────
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature") ?? "";

  // ── 2. Verify signature ──────────────────────────────────────────
  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 },
    );
  }

  // ── 3. Parse events ──────────────────────────────────────────────
  let parsed: { events: LineEvent[] };
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const events = parsed.events ?? [];

  if (!Array.isArray(events) || events.length === 0) {
    // LINE platform sends a validation webhook with an empty events array
    // when the channel secret is first verified. Acknowledge with 200.
    return NextResponse.json({});
  }

  // ── 4. Route each event ──────────────────────────────────────────
  // Collect non-null replies for events that were handled.
  const replies: Record<string, unknown>[] = [];

  for (const event of events) {
    const result = handleLineEvent(event);
    if (result.handled && result.reply) {
      replies.push(result.reply);
    }
  }

  // Return 200 with replies (if any) or empty body.
  if (replies.length > 0) {
    return NextResponse.json({ replies });
  }

  return NextResponse.json({});
}