"use client"

import { Camera, ImageUp, ScanLine } from "lucide-react"
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

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource | Blob) => Promise<{ rawValue: string }[]>
}

const BARCODE_DETECTOR_FORMATS = [
  "ean_13",
  "ean_8",
  "code_128",
  "code_39",
  "upc_a",
  "upc_e",
  "qr_code",
  "itf",
]

/** Native Android/Chrome decoder — far more reliable on still photos than JS */
async function decodeWithBarcodeDetector(
  file: File
): Promise<string | null> {
  const Ctor = (
    globalThis as unknown as {
      BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike
    }
  ).BarcodeDetector
  if (!Ctor) return null

  let detector: BarcodeDetectorLike
  try {
    detector = new Ctor({ formats: BARCODE_DETECTOR_FORMATS })
  } catch {
    detector = new Ctor()
  }

  const bitmap = await createImageBitmap(file)
  try {
    const results = await detector.detect(bitmap)
    return results[0]?.rawValue?.trim() || null
  } finally {
    bitmap.close?.()
  }
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
  const fileScannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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

  useEffect(() => {
    return () => {
      try {
        fileScannerRef.current?.clear()
      } catch {
        // ignore teardown errors
      }
      fileScannerRef.current = null
    }
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
        "ใน LINE ใช้ปุ่ม「สแกนด้วย LINE」หรือ「ถ่ายรูป barcode」— กล้องสดใช้ไม่ได้ในแอป LINE"
      )
      return
    }
    setScanError(null)
    setCameraOpen(true)
  }

  function openPhotoPicker() {
    setScanError(null)
    fileInputRef.current?.click()
  }

  // Decode a still photo (native camera capture) — works inside the LINE
  // WebView where live getUserMedia / scanCodeV2 are unreliable.
  async function handlePhotoSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setScanError(null)
    setBusy(true)
    try {
      // 1) Native BarcodeDetector (Android/Chrome) — best accuracy on photos
      let value: string | null = null
      try {
        value = await decodeWithBarcodeDetector(file)
      } catch {
        value = null
      }

      // 2) Fallback to html5-qrcode scanFile
      if (!value) {
        const scanner =
          fileScannerRef.current ??
          new Html5Qrcode(`inbound-file-${readerId}`, {
            formatsToSupport: CAMERA_FORMATS,
            verbose: false,
          })
        fileScannerRef.current = scanner
        try {
          const result = await scanner.scanFile(file, false)
          value = result?.trim() || null
        } catch {
          value = null
        }
      }

      if (!value) {
        setScanError(
          "อ่าน barcode จากรูปไม่ได้ — ถ่ายให้ชัด เลขเต็มกรอบ ไม่เอียง หรือพิมพ์ barcode ด้านล่าง"
        )
        return
      }
      onScanned(value)
    } finally {
      setBusy(false)
    }
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

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={disabled || busy || cameraOpen}
          onClick={openPhotoPicker}
        >
          <ImageUp className="size-4" />
          {busy ? "กำลังอ่านรูป…" : "ถ่ายรูป barcode"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handlePhotoSelected(e)}
      />
      <div id={`inbound-file-${readerId}`} className="hidden" />

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
