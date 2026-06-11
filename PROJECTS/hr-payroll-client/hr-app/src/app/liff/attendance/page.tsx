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

export default function AttendanceSubmitLiffPage() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch("/api/attendance/submit", { method: "POST" })
      const data = (await res.json().catch(() => null)) as {
        error?: string
        expiresAt?: string
      } | null
      if (!res.ok) throw new Error(data?.error ?? "ยื่นไม่สำเร็จ")
      setMessage(
        data?.expiresAt
          ? `ยื่นสรุปวันแล้ว — หมดเขตอนุมัติ ${new Date(data.expiresAt).toLocaleString("th-TH")}`
          : "ยื่นสรุปวันแล้ว"
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "ยื่นไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>ยื่นสรุปวัน</CardTitle>
          <CardDescription>
            หลังเช็คเอาท์แล้ว — ส่งให้ Branch Manager อนุมัติภายใน 48 ชม.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? "กำลังยื่น…" : "ยื่นสรุปวันนี้"}
          </Button>
          {message ? <p className="text-sm text-green-600">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
    </main>
  )
}
