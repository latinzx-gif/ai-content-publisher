"use client"

export type LiffContext = {
  ready: boolean
  inClient: boolean
  scanCodeAvailable: boolean
  liffId?: string
  error?: string
}

const initCache = new Map<string, Promise<LiffContext>>()

export function getInboundScanLiffId(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_LINE_LIFF_INBOUND_SCAN_ID?.trim() ||
    process.env.NEXT_PUBLIC_LINE_LIFF_ID?.trim() ||
    undefined
  )
}

/** Heuristic when LIFF init fails but user is inside LINE WebView */
export function isLikelyLineBrowser(): boolean {
  if (typeof navigator === "undefined") return false
  return /Line\//i.test(navigator.userAgent)
}

export function initLiffClient(liffId?: string): Promise<LiffContext> {
  if (typeof window === "undefined") {
    return Promise.resolve({
      ready: false,
      inClient: false,
      scanCodeAvailable: false,
    })
  }

  const id =
    liffId?.trim() ||
    process.env.NEXT_PUBLIC_LINE_LIFF_ID?.trim() ||
    undefined

  if (!id) {
    return Promise.resolve({
      ready: false,
      inClient: isLikelyLineBrowser(),
      scanCodeAvailable: false,
      error: "ไม่ได้ตั้งค่า NEXT_PUBLIC_LINE_LIFF_ID",
    })
  }

  const cached = initCache.get(id)
  if (cached) return cached

  const promise = (async (): Promise<LiffContext> => {
    try {
      const liff = (await import("@line/liff")).default
      await liff.init({ liffId: id })
      const inClient = liff.isInClient()
      const scanCodeAvailable =
        inClient && liff.isApiAvailable("scanCodeV2")
      return {
        ready: true,
        inClient,
        scanCodeAvailable,
        liffId: id,
      }
    } catch (err) {
      const inClient = isLikelyLineBrowser()
      return {
        ready: false,
        inClient,
        scanCodeAvailable: false,
        liffId: id,
        error:
          err instanceof Error
            ? err.message
            : "LIFF init ไม่สำเร็จ — ตรวจ endpoint URL ใน LINE Console",
      }
    }
  })()

  initCache.set(id, promise)
  return promise
}

export function initInboundScanLiff(): Promise<LiffContext> {
  const id = getInboundScanLiffId()
  if (!id) {
    return Promise.resolve({
      ready: false,
      inClient: isLikelyLineBrowser(),
      scanCodeAvailable: false,
      error: "ไม่ได้ตั้งค่า LIFF สำหรับ inbound scan",
    })
  }
  return initLiffClient(id)
}

export async function scanBarcodeWithLiff(liffId?: string): Promise<string> {
  const id = liffId?.trim() || getInboundScanLiffId()
  if (!id) {
    throw new Error("ไม่ได้ตั้งค่า LIFF — ติดต่อผู้ดูแลระบบ")
  }

  const liff = (await import("@line/liff")).default
  const ctx = await initLiffClient(id)

  if (!ctx.ready) {
    throw new Error(
      ctx.error ??
        "LIFF ไม่พร้อม — เปิดลิงก์ผ่าน liff.line.me หรือตั้ง endpoint เป็น /liff/inbound-scan"
    )
  }

  if (!ctx.inClient) {
    throw new Error("เปิดจากแอป LINE เพื่อใช้สแกน LIFF")
  }

  if (!liff.isApiAvailable("scanCodeV2")) {
    throw new Error(
      "เปิด Scan QR ใน LINE Console สำหรับ LIFF app นี้ (scanCodeV2)"
    )
  }

  const result = await liff.scanCodeV2()
  const value = result.value?.trim()
  if (!value) {
    throw new Error("ไม่พบ barcode จากการสแกน")
  }
  return value
}
