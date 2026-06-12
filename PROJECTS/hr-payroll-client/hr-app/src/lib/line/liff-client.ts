"use client"

type LiffContext = {
  ready: boolean
  inClient: boolean
}

let initPromise: Promise<LiffContext> | null = null

export function initLiffClient(): Promise<LiffContext> {
  if (typeof window === "undefined") {
    return Promise.resolve({ ready: false, inClient: false })
  }

  if (!initPromise) {
    initPromise = (async () => {
      const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID?.trim()
      if (!liffId) {
        return { ready: false, inClient: false }
      }

      try {
        const liff = (await import("@line/liff")).default
        await liff.init({ liffId })
        return { ready: true, inClient: liff.isInClient() }
      } catch {
        return { ready: false, inClient: false }
      }
    })()
  }

  return initPromise
}

export async function scanBarcodeWithLiff(): Promise<string> {
  const liff = (await import("@line/liff")).default
  const ctx = await initLiffClient()

  if (!ctx.ready || !ctx.inClient) {
    throw new Error("เปิดจากแอป LINE เพื่อใช้สแกน LIFF")
  }

  if (!liff.isApiAvailable("scanCodeV2")) {
    throw new Error("LINE ไม่รองรับสแกน barcode บนอุปกรณ์นี้")
  }

  const result = await liff.scanCodeV2()
  const value = result.value?.trim()
  if (!value) {
    throw new Error("ไม่พบ barcode จากการสแกน")
  }
  return value
}
