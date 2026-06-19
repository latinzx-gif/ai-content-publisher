import type { LineEvent } from "./verify";

/**
 * Result returned from a single LINE event handler.
 *
 * - `handled`  — whether the event was matched to a known action.
 * - `reply`    — optional JSON response body to return for this event.
 */
export type LineHandlerResult = {
  handled: boolean;
  reply?: Record<string, unknown>;
};

/**
 * Route a single LINE webhook event to the appropriate handler.
 *
 * Phase 1 supports only Rich Menu postback events:
 *   - `open_ticket`   → returns a LIFF URL for ticket intake
 *   - `track_status`  → returns a LIFF URL for ticket status lookup
 *
 * All other event types (messages, follows, etc.) are silently ignored.
 *
 * @param event  The parsed LINE webhook event object.
 * @returns      A handler result indicating whether the event was handled
 *               and (if applicable) what JSON to include in the response.
 */
export function handleLineEvent(event: LineEvent): LineHandlerResult {
  // ── Postback events (Rich Menu taps) ──────────────────────────────
  if (event.type === "postback" && event.postback?.data) {
    const data = event.postback.data;

    switch (data) {
      case "open_ticket": {
        // Return a LIFF URL that the LINE OA can open via the LIFF browser.
        return {
          handled: true,
          reply: {
            type: "liff",
            liffUrl: "/liff/ticket",
          },
        };
      }

      case "track_status": {
        return {
          handled: true,
          reply: {
            type: "liff",
            liffUrl: "/liff/ticket/status",
          },
        };
      }

      default: {
        // Unknown postback data — ignore.
        return { handled: false };
      }
    }
  }

  // ── All other events (messages, follows, join, leave, etc.) ──────
  // Phase 1 = Rich Menu + LIFF only; no free-text chat handling.
  return { handled: false };
}