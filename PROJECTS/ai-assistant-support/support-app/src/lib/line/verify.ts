import { createHmac } from "node:crypto";

/**
 * Verify a LINE webhook request signature.
 *
 * Computes HMAC-SHA256 of the raw request body using the channel secret
 * and compares it (constant-time) to the value of the `x-line-signature`
 * header sent by the LINE platform.
 *
 * @param body       Raw request body as a string (do NOT JSON.stringify an
 *                   already-stringified body — pass the raw text directly).
 * @param signature  The value of the `x-line-signature` header.
 * @returns          `true` when the signature matches, `false` otherwise.
 */
export function verifyLineSignature(
  body: string,
  signature: string,
): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    console.error(
      "[line/verify] LINE_CHANNEL_SECRET is not set — cannot verify signature",
    );
    return false;
  }

  const expected = createHmac("sha256", channelSecret)
    .update(body, "utf8")
    .digest("base64");

  // Constant-time comparison to prevent timing attacks.
  if (expected.length !== signature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

/** Shape of a single LINE webhook event object. */
export type LineEvent = {
  type: string;
  replyToken?: string;
  source?: {
    userId?: string;
    groupId?: string;
    roomId?: string;
    type: string;
  };
  timestamp?: number;
  mode?: string;
  webhookEventId?: string;
  deliveryContext?: { isRedelivery: boolean };
  postback?: {
    data: string;
    params?: Record<string, string>;
  };
  message?: {
    id: string;
    type: string;
    text?: string;
  };
};