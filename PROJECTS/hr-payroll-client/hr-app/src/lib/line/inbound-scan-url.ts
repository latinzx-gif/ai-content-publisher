import { INBOUND_SCAN_LIFF_ID } from "@/lib/line/inbound-order-id"

/** Build inbound scan URL — LIFF path form survives liff.state redirect */
export function inboundScanHref(orderId: string): string {
  const id = encodeURIComponent(orderId)

  if (INBOUND_SCAN_LIFF_ID) {
    return `https://liff.line.me/${INBOUND_SCAN_LIFF_ID}/${id}`
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")
  if (base) {
    return `${base}/liff/inbound-scan/${id}`
  }

  return `/liff/inbound-scan/${id}`
}
