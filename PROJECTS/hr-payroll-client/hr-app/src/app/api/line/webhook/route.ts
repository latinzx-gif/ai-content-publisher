import type { webhook } from "@line/bot-sdk"

import { handleEvents } from "@/lib/line/handlers"
import { verifyLineSignature } from "@/lib/line/verify-signature"

export async function POST(request: Request) {
  // Signature must be checked against the raw body string — do not parse first.
  const signature = request.headers.get("x-line-signature")
  const rawBody = await request.text()

  if (!verifyLineSignature(rawBody, signature)) {
    return Response.json({ error: "invalid signature" }, { status: 401 })
  }

  const body = JSON.parse(rawBody) as webhook.CallbackRequest
  await handleEvents(body.events ?? [])

  return Response.json({ ok: true })
}
