"use client"

import { Camera, ScanLine } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode"

import { Button } from "@/components/ui/button"
import {
  initInboundScanLiff,
  isLikelyLineBrowser,
  scanBarcodeWithLiff,
  type LiffContext,
} from "@/lib/line/liff-client"

const CAMERA_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.QR_CODE,
]

function formatCameraError(err: unknown): string {
  if (!(err instanceof Error)) return "เปิดกล้องไม่สำเร็จ"
  const msg = err.message
  if (/NotAllowed|Permission/i.test(msg)) {
    return "ไม่อนุญาตใช้กล้อง — เปิดสิทธิ์ใน Settings ของเบราว์เซอร์"
  }
  if (/NotFound|DevicesNotFound/i.test(msg)) {
    return "ไม่พบกล้องบนอุปกรณ์นี้"
  }
  if (/not supported|NotSupported/i.test(msg)) {
    return "เบราว์เซอร์นี้ไม่รองรับกล้อง — ใช้สแกน LINE หรือพิมพ์ barcode"
  }
  if (/element.*not found/i.test(msg)) {
    return "เปิดกล้องไม่สำเร็จ — ลองอีกครั้ง"
  }
  return msg || "เปิดกล้องไม่สำเร็จ"
}

async function waitForElement(id: string, attempts = 20): Promise<HTMLElement> {
  for (let i = 0; i < attempts; i += 1) {
    const el = document.getElementById(id)
    if (el) return el
    await new Promise((r) => requestAnimationFrame(r))
  }
  throw new Error(`HTML Element with id=${id} not found`)
}

async function resolveCameraId(): Promise<string | { facingMode: string }> {
  try {
    const cameras = await Html5Qrcode.getCameras()
    if (cameras.length === 0) {
      return { facingMode: "environment" }
    }
    const rear = cameras.find((c) =>
      /back|rear|environment|หลัง/i.test(c.label)
    )
    return rear?.id ?? cameras[cameras.length - 1].id
  } catch {
    return { facingMode: "environment" }
  }
}

export function InboundBarcodeScanner({
  onScanned,
  disabled,
}: {
  onScanned: (barcode: string) => void
  disabled?: boolean
}) {
  const readerId = useId().replace(/:/g, "")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [liffCtx, setLiffCtx] = useState<LiffContext | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  const inLine = liffCtx?.inClient ?? isLikelyLineBrowser()
  const showLineScan = inLine
  const showCamera = !inLine

  useEffect(() => {
    void initInboundScanLiff().then(setLiffCtx)
  }, [])

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current
    scannerRef.current = null
    if (!scanner) return
    try {
      if (scanner.isScanning) {
        await scanner.stop()
      }
      scanner.clear()
    } catch {
      // ignore teardown errors
    }
  }, [])

  const closeCamera = useCallback(() => {
    void stopCamera()
    setCameraOpen(false)
  }, [stopCamera])

  useEffect(() => {
    if (!cameraOpen) return

    let cancelled = false
    const elementId = `inbound-scan-${readerId}`

    void (async () => {
      await stopCamera()
      if (cancelled) return

      try {
        await waitForElement(elementId)
        if (cancelled) return

        const scanner = new Html5Qrcode(elementId, {
          formatsToSupport: CAMERA_FORMATS,
          verbose: false,
        })
        scannerRef.current = scanner

        const cameraId = await resolveCameraId()
        if (cancelled) return

        await scanner.start(
          cameraId,
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decoded) => {
            onScanned(decoded.trim())
            void stopCamera()
            setCameraOpen(false)
            setScanError(null)
          },
          () => {
            // scan attempt — no match yet
          }
        )
      } catch (err) {
        if (!cancelled) {
          setScanError(formatCameraError(err))
          setCameraOpen(false)
        }
      }
    })()

    return () => {
      cancelled = true
      void stopCamera()
    }
  }, [cameraOpen, onScanned, readerId, stopCamera])

  async function handleLiffScan() {
    setScanError(null)
    setBusy(true)
    try {
      // Re-init first — failed inits are not cached, so this retries after
      // a transient network error and clears the stale error hint
      const ctx = await initInboundScanLiff()
      setLiffCtx(ctx)

      const value = await scanBarcodeWithLiff()
      onScanned(value)
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "สแกนไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  function handleOpenCamera() {
    if (inLine) {
      setScanError(
        "ใน LINE ใช้ปุ่ม「สแกนด้วย LINE」หรือพิมพ์ barcode ด้านล่าง — กล้องเว็บใช้ไม่ได้ในแอป LINE"
      )
      return
    }
    setScanError(null)
    setCameraOpen(true)
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {showLineScan ? (
          <Button
            type="button"
            className="w-full"
            disabled={disabled || busy || cameraOpen}
            onClick={() => void handleLiffScan()}
          >
            <ScanLine className="size-4" />
            {busy ? "กำลังเปิดสแกน LINE…" : "สแกนด้วย LINE"}
          </Button>
        ) : null}
        {showCamera ? (
          <Button
            type="button"
            variant={showLineScan ? "outline" : "default"}
            className="w-full"
            disabled={disabled || busy || cameraOpen}
            onClick={handleOpenCamera}
          >
            <Camera className="size-4" />
            สแกนด้วยกล้อง
          </Button>
        ) : null}
      </div>

      {inLine && liffCtx && !liffCtx.ready && liffCtx.error ? (
        <p className="text-xs text-muted-foreground">
          {liffCtx.error} — กดสแกนเพื่อลองใหม่ หรือพิมพ์ barcode ด้านล่าง
        </p>
      ) : null}

      {inLine && !liffCtx?.scanCodeAvailable && liffCtx?.ready ? (
        <p className="text-xs text-amber-700">
          เปิด Scan QR ใน LINE Console สำหรับ LIFF app นี้
        </p>
      ) : null}

      {scanError ? (
        <p className="text-sm text-destructive">{scanError}</p>
      ) : null}

      {cameraOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4">
          <div className="mb-3 flex items-center justify-between text-white">
            <p className="text-sm font-medium">เล็ง barcode ในกรอบ</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={closeCamera}
            >
              ปิด
            </Button>
          </div>
          <div
            id={`inbound-scan-${readerId}`}
            className="mx-auto min-h-[240px] w-full max-w-sm overflow-hidden rounded-xl bg-black"
          />
        </div>
      ) : null}
    </>
  )
}
