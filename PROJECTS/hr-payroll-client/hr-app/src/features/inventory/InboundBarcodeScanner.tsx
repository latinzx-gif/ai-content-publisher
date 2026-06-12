"use client"

import { Camera, ImageUp } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode"

import { Button } from "@/components/ui/button"
import {
  initInboundScanLiff,
  isLikelyLineBrowser,
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

const IMAGE_ROTATIONS = [0, 90, 180, 270] as const

function makeCanvasFromBitmap(
  bitmap: ImageBitmap,
  rotation: (typeof IMAGE_ROTATIONS)[number],
  maxSide = 1800
): HTMLCanvasElement {
  const rotated = rotation === 90 || rotation === 270
  const sourceWidth = rotated ? bitmap.height : bitmap.width
  const sourceHeight = rotated ? bitmap.width : bitmap.height
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight))
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return canvas

  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(
    bitmap,
    (-bitmap.width * scale) / 2,
    (-bitmap.height * scale) / 2,
    bitmap.width * scale,
    bitmap.height * scale
  )
  ctx.restore()
  return canvas
}

async function makeImageCandidates(file: File): Promise<HTMLCanvasElement[]> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  })
  try {
    return IMAGE_ROTATIONS.map((rotation) =>
      makeCanvasFromBitmap(bitmap, rotation)
    )
  } finally {
    bitmap.close?.()
  }
}

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

  const candidates = await makeImageCandidates(file)
  for (const candidate of candidates) {
    const results = await detector.detect(candidate)
    const value = results[0]?.rawValue?.trim()
    if (value) return value
  }

  return null
}

async function decodeWithZxingCanvas(file: File): Promise<string | null> {
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] =
    await Promise.all([import("@zxing/browser"), import("@zxing/library")])

  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.ITF,
  ])
  hints.set(DecodeHintType.TRY_HARDER, true)

  const reader = new BrowserMultiFormatReader(hints)
  const candidates = await makeImageCandidates(file)
  for (const candidate of candidates) {
    try {
      const result = reader.decodeFromCanvas(candidate)
      const value = result.getText().trim()
      if (value) return value
    } catch {
      // try next candidate
    }
  }

  return null
}

/** ZXing fallback — strong for 1D barcodes from still photos */
async function decodeWithZxing(file: File): Promise<string | null> {
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] =
    await Promise.all([import("@zxing/browser"), import("@zxing/library")])

  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.ITF,
  ])
  hints.set(DecodeHintType.TRY_HARDER, true)

  const reader = new BrowserMultiFormatReader(hints)
  const url = URL.createObjectURL(file)
  try {
    const result = await reader.decodeFromImageUrl(url)
    return result.getText().trim() || null
  } finally {
    URL.revokeObjectURL(url)
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
  const lastScanRef = useRef<{ value: string; at: number } | null>(null)
  const [liffCtx, setLiffCtx] = useState<LiffContext | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  const inLine = liffCtx?.inClient ?? isLikelyLineBrowser()
  const showCamera = !inLine

  useEffect(() => {
    void initInboundScanLiff().then(setLiffCtx)
  }, [])

  useEffect(() => {
    if (!scanError) return
    const timeout = window.setTimeout(() => setScanError(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [scanError])

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
            const value = decoded.trim()
            if (!value) return

            const now = Date.now()
            const lastScan = lastScanRef.current
            if (
              lastScan?.value === value &&
              now - lastScan.at < 1500
            ) {
              return
            }

            lastScanRef.current = { value, at: now }
            onScanned(value)
            setScanError(null)

            window.setTimeout(() => {
              if (lastScanRef.current?.value === value) {
                lastScanRef.current = null
              }
            }, 1200)
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

  function handleOpenCamera() {
    if (inLine) {
      setScanError(
        "ใน LINE ใช้ปุ่ม「ถ่ายรูป barcode」— กล้องสดใช้ไม่ได้ในแอป LINE"
      )
      return
    }
    setScanError(null)
    setCameraOpen(true)
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

      // 2) ZXing canvas fallback — retries EXIF orientation + rotations
      if (!value) {
        try {
          value = await decodeWithZxingCanvas(file)
        } catch {
          value = null
        }
      }

      // 3) ZXing image-url fallback
      if (!value) {
        try {
          value = await decodeWithZxing(file)
        } catch {
          value = null
        }
      }

      // 4) Final fallback to html5-qrcode scanFile
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

  const photoPickerDisabled = disabled || busy || cameraOpen

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Button
            type="button"
            className="w-full"
            disabled={photoPickerDisabled}
            tabIndex={-1}
          >
            <ImageUp className="size-4" />
            {busy ? "กำลังอ่านรูป…" : "ถ่ายรูป barcode"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            aria-label="ถ่ายรูป barcode"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            disabled={photoPickerDisabled}
            onClick={() => setScanError(null)}
            onChange={(e) => void handlePhotoSelected(e)}
          />
        </div>

        {showCamera ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled || busy || cameraOpen}
            onClick={handleOpenCamera}
          >
            <Camera className="size-4" />
            สแกนด้วยกล้อง
          </Button>
        ) : null}
      </div>
      <div id={`inbound-file-${readerId}`} className="hidden" />

      {inLine && liffCtx && !liffCtx.ready && liffCtx.error ? (
        <p className="text-xs text-muted-foreground">
          ถ้าอ่านรูปไม่ได้ ให้พิมพ์เลข barcode ด้านล่าง
        </p>
      ) : null}

      {scanError ? (
        <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-[60] mx-auto max-w-sm rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {scanError}
        </div>
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
              ปิดกล้อง
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
