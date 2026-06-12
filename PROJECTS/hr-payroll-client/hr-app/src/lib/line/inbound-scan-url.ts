/** Build inbound scan URL — prefers liff.line.me when inbound LIFF app is set */
export function inboundScanHref(orderId: string): string {
  const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_INBOUND_SCAN_ID?.trim()
  if (liffId) {
    const params = new URLSearchParams({ order: orderId })
    return `https://liff.line.me/${liffId}?${params.toString()}`
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")
  if (base) {
    return `${base}/liff/inbound-scan?order=${encodeURIComponent(orderId)}`
  }

  return `/liff/inbound-scan?order=${encodeURIComponent(orderId)}`
}
