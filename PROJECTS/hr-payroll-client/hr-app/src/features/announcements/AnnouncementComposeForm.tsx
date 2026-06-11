"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function AnnouncementComposeForm({
  departments,
}: {
  departments: string[]
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [targetType, setTargetType] = useState<"all" | "department">("all")
  const [targetValue, setTargetValue] = useState("")
  const [scheduleAt, setScheduleAt] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(mode: "send" | "draft" | "schedule") {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          targetType,
          targetValue: targetType === "department" ? targetValue : undefined,
          send: mode === "send",
          schedule: mode === "schedule",
          scheduledAt: mode === "schedule" ? scheduleAt : undefined,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? "บันทึกไม่สำเร็จ")
      }
      setTitle("")
      setBody("")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">สร้างประกาศใหม่</h3>
      <input
        className="h-9 rounded-lg border border-input px-3 text-sm"
        placeholder="หัวข้อประกาศ"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="min-h-[100px] rounded-lg border border-input px-3 py-2 text-sm"
        placeholder="เนื้อหาประกาศ"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={targetType === "all"}
            onChange={() => setTargetType("all")}
          />
          ทุกคน
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={targetType === "department"}
            onChange={() => setTargetType("department")}
          />
          ตามแผนก
        </label>
        {targetType === "department" ? (
          <select
            className="rounded-lg border border-input px-2 py-1"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          >
            <option value="">เลือกแผนก</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="text-muted-foreground">กำหนดส่ง:</label>
        <input
          type="datetime-local"
          className="rounded-lg border border-input px-2 py-1 text-sm"
          value={scheduleAt}
          onChange={(e) => setScheduleAt(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => submit("send")}>
          {busy ? "…" : "ส่งประกาศทันที"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy || !scheduleAt}
          onClick={() => submit("schedule")}
        >
          ตั้งเวลาส่ง
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => submit("draft")}>
          บันทึกแบบร่าง
        </Button>
      </div>
    </div>
  )
}
