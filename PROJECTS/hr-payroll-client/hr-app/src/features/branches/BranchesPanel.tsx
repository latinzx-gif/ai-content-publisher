"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { BranchRow } from "@/features/branches/data"

export function BranchesPanel({
  branches,
  readOnly = false,
}: {
  branches: BranchRow[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function createBranch(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, code: code || undefined }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string }
      if (!res.ok) throw new Error(data?.error ?? "สร้างไม่สำเร็จ")
      setName("")
      setCode("")
      setMessage("สร้างสาขาแล้ว — มอบหมาย Branch Manager ได้ภายหลัง")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      {!readOnly ? (
      <form onSubmit={createBranch} className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
        <label className="text-sm">
          ชื่อสาขา
          <input
            required
            className="mt-1 block h-9 rounded-lg border px-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="text-sm">
          รหัส (optional)
          <input
            className="mt-1 block h-9 rounded-lg border px-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <Button type="submit" size="sm" disabled={busy}>
          เพิ่มสาขา
        </Button>
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-3 py-2">ชื่อสาขา</th>
              <th className="px-3 py-2">รหัส</th>
              <th className="px-3 py-2">ที่อยู่</th>
              <th className="px-3 py-2">Manager</th>
              <th className="px-3 py-2 w-24" />
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  ยังไม่มีสาขาในระบบ
                </td>
              </tr>
            ) : (
              branches.map((b) => (
                <tr
                  key={b.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/branches/${b.id}`}
                      className="font-medium text-brand-red hover:underline"
                    >
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{b.code ?? "—"}</td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                    {b.address?.trim() || "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {b.manager_name ??
                      (b.manager_employee_id ? "มอบหมายแล้ว" : "ยังไม่มอบหมาย")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/branches/${b.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-red hover:underline"
                    >
                      เปิด
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!readOnly ? (
        <p className="text-xs text-muted-foreground">
          มอบหมาย Branch Manager ทีหลังได้ — ตั้ง role เป็น branch_manager แล้วอัปเดต
          manager_employee_id ในสาขา
        </p>
      ) : null}
    </div>
  )
}
