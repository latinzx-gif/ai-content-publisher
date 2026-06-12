"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { BrandMark } from "@/components/brand/BrandMark"
import { Button } from "@/components/ui/button"

const inputClassName =
  "mt-1 h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"

type BranchOption = { id: string; name: string; code: string | null }

export function RegisterForm() {
  const router = useRouter()
  const [employeeCode, setEmployeeCode] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [branchId, setBranchId] = useState("")
  const [department, setDepartment] = useState("")
  const [position, setPosition] = useState("")
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/auth/register/branches")
        const data = (await res.json()) as { branches?: BranchOption[] }
        if (!cancelled && res.ok) {
          setBranches(data.branches ?? [])
        }
      } finally {
        if (!cancelled) setBranchesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!employeeCode.trim()) {
      setError("กรุณากรอกรหัสพนักงาน")
      return
    }
    if (!name.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล")
      return
    }
    if (!phone.trim()) {
      setError("กรุณากรอกเบอร์ติดต่อ")
      return
    }
    if (!branchId) {
      setError("กรุณาเลือกสาขา")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employee_code: employeeCode.trim(),
          name: name.trim(),
          phone: phone.trim(),
          branch_id: branchId,
          department: department.trim() || null,
          position: position.trim() || null,
        }),
      })
      const data = (await res.json().catch(() => null)) as {
        redirect?: string
        error?: string
      } | null
      if (!res.ok) {
        throw new Error(data?.error ?? "ลงทะเบียนไม่สำเร็จ")
      }
      if (data?.redirect) {
        router.push(data.redirect)
        router.refresh()
        return
      }
      router.push("/register/pending")
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลงทะเบียนไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-center text-sm text-muted-foreground">
        กรอกข้อมูลเพื่อขอเข้าใช้งาน — <strong>HR จะอนุมัติก่อน</strong>{" "}
        จึงจะใช้เมนู HR ใน LINE ได้ (ไม่มี Web Dashboard)
      </p>

      <label className="block text-sm">
        <span className="text-muted-foreground">รหัสพนักงาน *</span>
        <input
          className={inputClassName}
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          placeholder="เช่น EMP-001"
          required
          autoComplete="off"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted-foreground">ชื่อ-นามสกุล *</span>
        <input
          className={inputClassName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted-foreground">เบอร์ติดต่อ *</span>
        <input
          type="tel"
          className={inputClassName}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08x-xxx-xxxx"
          required
          autoComplete="tel"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted-foreground">สาขา *</span>
        <select
          className={inputClassName}
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          required
          disabled={branchesLoading}
        >
          <option value="">
            {branchesLoading ? "กำลังโหลดสาขา…" : "— เลือกสาขา —"}
          </option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.code ? ` (${b.code})` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="text-muted-foreground">แผนก</span>
        <input
          className={inputClassName}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="เช่น Operations"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted-foreground">ตำแหน่งงาน</span>
        <input
          className={inputClassName}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="เช่น พนักงานขาย"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={saving || branchesLoading}
        className="w-full bg-brand-red text-white hover:bg-brand-red/90"
      >
        {saving ? "กำลังส่งคำขอ…" : "ส่งคำขอลงทะเบียน"}
      </Button>
    </form>
  )
}

export function RegisterShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg">
        <div className="relative overflow-hidden bg-brand-red px-6 py-10 text-center text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, #fff 0, transparent 45%), radial-gradient(circle at 80% 80%, #fff 0, transparent 40%)",
            }}
          />
          <div className="relative">
            <BrandMark variant="login" onDark />
            <p className="mt-4 text-sm font-medium text-white/90">
              ลงทะเบียนพนักงาน
            </p>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </main>
  )
}
