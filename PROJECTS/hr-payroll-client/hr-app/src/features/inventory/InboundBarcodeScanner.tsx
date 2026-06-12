"use client"

import { Camera, ScanLine } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode"

import { Button } from "@/components/ui/button"
import { initLiffClient, scanBarcodeWithLiff } from "@/lib/line/liff-client"

const CAMERA_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.QR_CODE,
]

export function InboundBarcodeScanner({
  onScanned,
  disabled,
}: {
  onScanned: (barcode: string) => void
  disabled?: boolean
}) {
  const readerId = useId().replace(/:/g, "")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [liffReady, setLiffReady] = useState(false)
  const [inLine, setInLine] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
    void initLiffClient().then((ctx) => {
      setLiffReady(ctx.ready)
      setInLine(ctx.inClient)
    })
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

      const scanner = new Html5Qrcode(elementId, {
        formatsToSupport: CAMERA_FORMATS,
        verbose: false,
      })
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: "environment" },
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
        setScanError(
          err instanceof Error ? err.message : "เปิดกล้องไม่สำเร็จ"
        )
        setCameraOpen(false)
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
      const value = await scanBarcodeWithLiff()
      onScanned(value)
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "สแกนไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  function handleOpenCamera() {
    setScanError(null)
    setCameraOpen(true)
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {inLine && liffReady ? (
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
        <Button
          type="button"
          variant={inLine && liffReady ? "outline" : "default"}
          className="w-full"
          disabled={disabled || busy || cameraOpen}
          onClick={handleOpenCamera}
        >
          <Camera className="size-4" />
          สแกนด้วยกล้อง
        </Button>
      </div>

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
            className="mx-auto w-full max-w-sm overflow-hidden rounded-xl bg-black"
          />
        </div>
      ) : null}
    </>
  )
}
