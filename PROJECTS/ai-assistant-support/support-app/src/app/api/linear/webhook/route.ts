import { NextRequest, NextResponse } from "next/server";
import {
  verifyLinearSignature,
  parseLinearWebhook,
  processLinearWebhook,
} from "@/lib/linear/webhook";
import type { LinearWebhookPayload } from "@/lib/linear/webhook";

/**
 * POST /api/linear/webhook
 *
 * Linear webhook endpoint for close-loop notification.
 *
 * 1. Verifies the `linear-signature` header using HMAC-SHA256.
 * 2. Parses the webhook payload.
 * 3. If the issue state changed to "Done" (or a [resolution] comment was
 *    added to a Done issue), updates the ticket and sends a LINE Flex
 *    resolution message to the reporter.
 * 4. Returns 200 for all valid webhooks (even if no action taken).
 *
 * Responses:
 *   - 200  → webhook received and processed (or ignored).
 *   - 401  → signature verification failed.
 */
export async function POST(request: NextRequest) {
  // ── 1. Read raw body ──────────────────────────────────────────────
  const rawBody = await request.text();
  const signature = request.headers.get("linear-signature") ?? "";

  // ── 2. Verify signature ──────────────────────────────────────────
  if (!verifyLinearSignature(rawBody, signature)) {
    console.warn("[linear/webhook] Invalid signature — returning 401");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 },
    );
  }

  // ── 3. Parse payload ─────────────────────────────────────────────
  let parsed: LinearWebhookPayload;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    console.error("[linear/webhook] Invalid JSON body");
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // ── 4. Process webhook (fire-and-forget) ─────────────────────────
  // We do NOT await processLinearWebhook — Linear expects a fast 200.
  // Errors are logged internally.
  const webhookInfo = parseLinearWebhook(parsed);
  processLinearWebhook(webhookInfo).catch((error) => {
    console.error(
      "[linear/webhook] processLinearWebhook error:",
      error,
    );
  });

  // ── 5. Always return 200 for valid webhooks ──────────────────────
  return NextResponse.json({ received: true });
}