"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatThaiDateTime } from "@/lib/datetime/thailand"

const FIELD_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-brand-red/40 focus-visible:ring-2 focus-visible:ring-brand-red/20"

type SubmitMessageState = {
  mode: "checkin" | "checkout" | "both"
  ok: boolean
  title: string
  message: string
}

export function AttendanceManualClient({
  defaultDate,
  defaultTime,
}: {
  defaultDate: string
  defaultTime: string
}) {
  const [date, setDate] = useState(defaultDate)
  const [shiftId, setShiftId] = useState("")
  const [checkInTime, setCheckInTime] = useState(defaultTime)
  const [checkOutTime, setCheckOutTime] = useState("")
  const [busyMode, setBusyMode] = useState<"idle" | "checkin" | "checkout" | "both">(
    "idle"
  )
  const [manualMsg, setManualMsg] = useState<SubmitMessageState | null>(null)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const canCheckin = Boolean(date && checkInTime)
  const canCheckout = Boolean(date && checkOutTime)
  const canBoth = canCheckin && canCheckout

  async function submitManual(
    mode: "checkin" | "checkout" | "full"
  ) {
    setBusyMode(mode === "full" ? "both" : mode)
    setManualMsg(null)

    try {
      const payload = {
        date,
        shiftId: shiftId || null,
        mode:
          mode === "full"
            ? "full"
            : mode === "checkin"
              ? "checkin"
              : "checkout",
        ...(mode === "checkout"
          ? { checkOutTime: checkOutTime.trim() }
          : {
              checkInTime: checkInTime.trim(),
              ...(checkOutTime ? { checkOutTime: checkOutTime.trim() } : {}),
            }),
      }

      const res = await fetch("/api/attendance/manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = (await res.json().catch(() => null)) as {
        message?: string
        error?: string
      } | null
      if (!res.ok) {
        throw new Error(data?.error ?? "บันทึกไม่สำเร็จ")
      }

      const title =
        mode === "full"
          ? "บันทึกทั้งเข้า/ออกเรียบร้อย"
          : mode === "checkin"
            ? "บันทึกเข้าเรียบร้อย"
            : "บันทึกออกเรียบร้อย"

      setManualMsg({
        mode:
          mode === "full"
            ? "both"
            : mode === "checkin"
              ? "checkin"
              : "checkout",
        ok: true,
        title,
        message: data?.message ?? "สำเร็จ",
      })
    } catch (e) {
      setManualMsg({
        mode: mode === "full" ? "both" : mode,
        ok: false,
        title: "ไม่สามารถบันทึกได้",
        message: e instanceof Error ? e.message : "บันทึกไม่สำเร็จ",
      })
    } finally {
      setBusyMode("idle")
    }
  }

  async function submitDaily() {
    setSubmitMsg(null)
    setSubmitError(null)
    try {
      const res = await fetch("/api/attendance/submit", { method: "POST" })
      const data = (await res.json().catch(() => null)) as {
        error?: string
        expiresAt?: string
      } | null

      if (!res.ok) {
        throw new Error(data?.error ?? "ยื่นไม่สำเร็จ")
      }

      setSubmitMsg(
        data?.expiresAt
          ? `ยื่นสรุปวันแล้ว — หมดเขตอนุมัติ ${formatThaiDateTime(data.expiresAt)}`
          : "ยื่นสรุปวันแล้ว"
      )
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "ยื่นไม่สำเร็จ")
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>บันทึกเวลาเอง</CardTitle>
          <CardDescription>
            เลือกกะและกรอกเวลาเข้า/ออกตามจริงของคุณเอง
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">วันที่</span>
            <input
              type="date"
              className={FIELD_CLASS}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium">เวลาเข้า</span>
              <input
                type="time"
                className={FIELD_CLASS}
                value={checkInTime}
                onChange={(event) => setCheckInTime(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">เวลาออก</span>
              <input
                type="time"
                className={FIELD_CLASS}
                value={checkOutTime}
                onChange={(event) => setCheckOutTime(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-2">
            <Button
              onClick={() => submitManual("checkin")}
              disabled={busyMode !== "idle" || !canCheckin}
              className="w-full bg-[#06C755] hover:bg-[#06C755]/80"
            >
              {busyMode === "checkin" ? "กำลังบันทึกเวลาเข้า…" : "บันทึกเวลาเข้า"}
            </Button>
            <Button
              onClick={() => submitManual("checkout")}
              disabled={busyMode !== "idle" || !canCheckout}
              variant="outline"
            >
              {busyMode === "checkout" ? "กำลังบันทึกเวลาออก…" : "บันทึกเวลาออก"}
            </Button>
            <Button
              onClick={() => submitManual("full")}
              disabled={busyMode !== "idle" || !canBoth}
              variant="secondary"
            >
              {busyMode === "both"
                ? "กำลังบันทึกทั้งเข้า/ออก…"
                : "บันทึกทั้งเข้าและออก"}
            </Button>
          </div>

          {manualMsg ? (
            <p
              className={`text-sm ${manualMsg.ok ? "text-emerald-600" : "text-destructive"}`}
            >
              <span className="font-semibold">{manualMsg.title}</span>
              <br />
              {manualMsg.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ยื่นสรุปวัน</CardTitle>
          <CardDescription>
            หลังเช็คเอาท์แล้ว — ส่งให้ Branch Manager อนุมัติภายใน 48 ชม.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={submitDaily} className="w-full">
            ยื่นสรุปวันนี้
          </Button>
          {submitMsg ? <p className="text-sm text-green-600">{submitMsg}</p> : null}
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
