"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CheckinState =
  | { phase: "idle" }
  | { phase: "locating" }
  | { phase: "submitting" }
  | { phase: "done"; title: string; detail: string; ok: boolean }

function describeError(status: number, error?: string): string {
  if (status === 410) return "QR นี้หมดอายุแล้ว (ใช้ได้เฉพาะวันที่ออก) กรุณาขอ QR ใหม่จาก HR"
  if (status === 401) return "QR ไม่ถูกต้อง กรุณาขอ QR ใหม่จาก HR"
  if (status === 404) return "ไม่พบข้อมูลพนักงาน กรุณาติดต่อ HR"
  return error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่"
}

function CheckinForm() {
  const token = useSearchParams().get("token")
  const [state, setState] = useState<CheckinState>({ phase: "idle" })

  async function submit(latitude: number, longitude: number) {
    setState({ phase: "submitting" })
    const response = await fetch("/api/checkin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, latitude, longitude }),
    })
    const data = await response.json().catch(() => ({}))

    if (response.ok && data.status === "success") {
      setState({
        phase: "done",
        ok: true,
        title: "เช็คอินสำเร็จ",
        detail:
          data.lateMinutes > 0
            ? `${data.employeeName} — ${data.timeText} น. (สาย ${data.lateMinutes} นาที)`
            : `${data.employeeName} — ${data.timeText} น. ตรงเวลา`,
      })
    } else if (response.ok && data.status === "already_checked_in") {
      setState({
        phase: "done",
        ok: true,
        title: "เช็คอินแล้ว",
        detail: `คุณเช็คอินวันนี้แล้วเมื่อ ${data.timeText} น.`,
      })
    } else {
      setState({
        phase: "done",
        ok: false,
        title: "เช็คอินไม่สำเร็จ",
        detail: describeError(response.status, data.error),
      })
    }
  }

  function start() {
    if (!navigator.geolocation) {
      setState({
        phase: "done",
        ok: false,
        title: "เช็คอินไม่สำเร็จ",
        detail: "อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง",
      })
      return
    }
    setState({ phase: "locating" })
    navigator.geolocation.getCurrentPosition(
      (pos) => submit(pos.coords.latitude, pos.coords.longitude),
      () =>
        setState({
          phase: "done",
          ok: false,
          title: "ต้องอนุญาตการระบุตำแหน่ง",
          detail: "กรุณาอนุญาตให้เข้าถึงตำแหน่ง แล้วลองใหม่อีกครั้ง",
        }),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  if (!token) {
    return (
      <CardContent className="text-sm text-muted-foreground">
        ไม่พบ QR token — กรุณาสแกน QR จาก HR อีกครั้ง
      </CardContent>
    )
  }

  return (
    <CardContent className="flex flex-col gap-4">
      {state.phase === "done" ? (
        <p
          className={`text-sm ${state.ok ? "text-foreground" : "text-destructive"}`}
        >
          <span className="font-semibold">{state.title}</span>
          <br />
          {state.detail}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            ระบบจะขอตำแหน่งของคุณเพื่อบันทึกการเช็คอิน
          </p>
          <Button
            onClick={start}
            disabled={state.phase !== "idle"}
            className="w-full bg-[#06C755] hover:bg-[#06C755]/80"
          >
            {state.phase === "locating"
              ? "กำลังระบุตำแหน่ง..."
              : state.phase === "submitting"
                ? "กำลังเช็คอิน..."
                : "เช็คอินตอนนี้"}
          </Button>
        </>
      )}
    </CardContent>
  )
}

export default function CheckinLiffPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>เช็คอินด้วย QR</CardTitle>
          <CardDescription>สแกนจาก QR ประจำวันของคุณ</CardDescription>
        </CardHeader>
        <Suspense>
          <CheckinForm />
        </Suspense>
      </Card>
    </main>
  )
}
