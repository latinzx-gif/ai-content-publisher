#!/usr/bin/env node
/**
 * Register (or list) LIFF app for inbound barcode scan.
 *
 * Usage:
 *   LINE_CHANNEL_ACCESS_TOKEN=... NEXT_PUBLIC_BASE_URL=https://hr-app-two-iota.vercel.app \
 *     node scripts/register-liff-inbound-scan.mjs
 *
 * After create, set NEXT_PUBLIC_LINE_LIFF_INBOUND_SCAN_ID=<liffId> on Vercel + redeploy.
 */
const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim()
const baseUrl = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://hr-app-two-iota.vercel.app"
).replace(/\/$/, "")

const endpoint = `${baseUrl}/liff/inbound-scan`

if (!token) {
  console.error("LINE_CHANNEL_ACCESS_TOKEN is required")
  process.exit(1)
}

async function listApps() {
  const res = await fetch("https://api.line.me/liff/v1/apps", {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message || `list failed ${res.status}`)
  }
  return body.apps ?? []
}

async function createApp() {
  const res = await fetch("https://api.line.me/liff/v1/apps", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      view: {
        type: "full",
        url: endpoint,
      },
      description: "HR inbound barcode scan",
      features: {
        ble: false,
        qrCode: true,
      },
      scope: ["profile", "openid"],
      botPrompt: "normal",
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message || `create failed ${res.status}`)
  }
  return body.liffId
}

async function main() {
  console.log(`Endpoint: ${endpoint}`)
  const apps = await listApps()
  const existing = apps.find((a) => a.view?.url === endpoint)
  if (existing) {
    console.log(`LIFF app already exists: ${existing.liffId}`)
    console.log(`Set env: NEXT_PUBLIC_LINE_LIFF_INBOUND_SCAN_ID=${existing.liffId}`)
    return
  }

  const liffId = await createApp()
  console.log(`Created LIFF app: ${liffId}`)
  console.log(`Set env: NEXT_PUBLIC_LINE_LIFF_INBOUND_SCAN_ID=${liffId}`)
  console.log(
    `Scan URL example: https://liff.line.me/${liffId}?order=<uuid>`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
